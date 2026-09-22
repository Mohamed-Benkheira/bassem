<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\CalibrationRequest;
use App\Models\CalibrationService;
use App\Models\Client;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientRequestController extends Controller
{
    public function __construct(
        protected WorkflowService $workflow
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            $client = Client::firstOrCreate([
                'user_id' => $user->id,
            ], [
                'company_name' => $user->name,
                'contact_name' => $user->name,
                'email' => $user->email,
            ]);
        }

        $query = CalibrationRequest::where('client_id', $client->id)
            ->with(['items.service', 'contract'])
            ->withCount('items');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhereHas('items', function ($iq) use ($search) {
                        $iq->where('equipment_name', 'like', "%{$search}%")
                            ->orWhere('serial_number', 'like', "%{$search}%");
                    });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $requests = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('client/requests/index', [
            'requests' => $requests,
            'filters' => $request->only(['search', 'status']),
            'statuses' => CalibrationRequest::STATUSES_FR,
        ]);
    }

    public function create(): Response
    {
        $services = CalibrationService::where('is_active', true)->orderBy('measurement_category')->get();

        return Inertia::render('client/requests/create', [
            'services' => $services,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validator = validator($request->all(), [
            'preferred_date' => 'nullable|date',
            'preferred_location' => 'required|in:laboratory,client_site,both',
            'client_notes' => 'nullable|string|max:2000',
            'items' => 'required|array|min:1',
            'items.*.calibration_service_id' => 'required|exists:calibration_services,id',
            'items.*.equipment_name' => 'required|string|max:255',
            'items.*.serial_number' => 'nullable|string|max:255',
            'items.*.brand' => 'nullable|string|max:255',
            'items.*.model' => 'nullable|string|max:255',
            'items.*.measurement_range' => 'nullable|string|max:255',
            'items.*.tolerance' => 'nullable|string|max:255',
            'items.*.quantity' => 'nullable|integer|min:1|max:100',
            'items.*.specific_notes' => 'nullable|string|max:1000',
        ], [
            'items.required' => 'Vous devez ajouter au moins un équipement à la demande.',
            'items.min' => 'Vous devez ajouter au moins un équipement à la demande.',
            'preferred_location.required' => 'Veuillez sélectionner le lieu d\'intervention souhaité.',
            'preferred_location.in' => 'Le lieu d\'intervention doit être au laboratoire, sur site client, ou les deux.',
        ]);

        $validator->after(function ($validator) use ($request) {
            $items = $request->input('items', []);
            $seenSerials = [];
            foreach ($items as $index => $item) {
                $serial = trim($item['serial_number'] ?? '');
                if ($serial !== '') {
                    $normalized = strtolower($serial);
                    if (isset($seenSerials[$normalized])) {
                        $duplicateEquipmentNum = $seenSerials[$normalized] + 1;
                        $validator->errors()->add(
                            "items.{$index}.serial_number",
                            "Le numéro de série '{$serial}' ne peut pas être identique pour plus d'un équipement (déjà utilisé pour l'équipement #{$duplicateEquipmentNum})."
                        );
                    } else {
                        $seenSerials[$normalized] = $index;
                    }

                    $quantity = (int) ($item['quantity'] ?? 1);
                    if ($quantity > 1) {
                        $validator->errors()->add(
                            "items.{$index}.quantity",
                            "Un équipement doté d'un numéro de série unique doit avoir une quantité égale à 1."
                        );
                    }
                }
            }
        });

        $validated = $validator->validate();

        foreach ($validated['items'] as &$item) {
            $item['quantity'] = $item['quantity'] ?? 1;
        }
        unset($item);

        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            $client = Client::create([
                'user_id' => $user->id,
                'company_name' => $user->name,
                'contact_name' => $user->name,
                'email' => $user->email,
            ]);
        }

        $calibrationRequest = $this->workflow->createRequest(
            client: $client,
            data: $validated,
            items: $validated['items'],
            user: $user
        );

        return redirect()->route('client.requests.show', $calibrationRequest->id)
            ->with('success', 'Votre demande de calibration a été soumise avec succès.');
    }

    public function show(Request $request, CalibrationRequest $calibrationRequest): Response
    {
        $this->authorize('view', $calibrationRequest);

        $calibrationRequest->load([
            'client',
            'contract',
            'items.service',
            'items.operations.report',
            'items.operations.certificate',
            'statusHistories.changedBy',
            'certificates' => fn ($q) => $q->where('is_final', true),
        ]);

        return Inertia::render('client/requests/show', [
            'calibrationRequest' => $calibrationRequest,
        ]);
    }

    public function acceptDate(Request $request, CalibrationRequest $calibrationRequest): RedirectResponse
    {
        $this->authorize('confirmDate', $calibrationRequest);

        $this->workflow->clientConfirmDate($calibrationRequest, $request->user());

        return back()->with('success', 'Vous avez accepté la date proposée pour la calibration.');
    }

    public function cancel(Request $request, CalibrationRequest $calibrationRequest): RedirectResponse
    {
        $this->authorize('cancel', $calibrationRequest);

        $request->validate([
            'reason' => 'required|string|min:5|max:1000',
        ], [
            'reason.required' => 'Veuillez préciser le motif de l\'annulation.',
            'reason.min' => 'Le motif doit comporter au moins 5 caractères.',
        ]);

        $this->workflow->clientCancelRequest($calibrationRequest, $request->user(), $request->input('reason'));

        return back()->with('success', 'La demande de calibration a été annulée.');
    }
}
