<?php

namespace App\Http\Controllers\Commercial;

use App\Http\Controllers\Controller;
use App\Models\CalibrationRequest;
use App\Models\Contract;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommercialRequestController extends Controller
{
    public function __construct(
        protected WorkflowService $workflow
    ) {}

    public function index(Request $request): Response
    {
        $query = CalibrationRequest::with(['client', 'items.service', 'contract'])
            ->withCount('items');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"))
                    ->orWhereHas('items', fn ($iq) => $iq->where('equipment_name', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $requests = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('commercial/requests/index', [
            'requests' => $requests,
            'filters' => $request->only(['search', 'status']),
            'statuses' => CalibrationRequest::STATUSES_FR,
        ]);
    }

    public function show(Request $request, CalibrationRequest $calibrationRequest): Response
    {
        $calibrationRequest->load([
            'client.contracts',
            'contract',
            'items.service',
            'items.operations.technician',
            'quotations',
            'statusHistories.changedBy',
            'certificates',
        ]);

        $availableContracts = Contract::where('client_id', $calibrationRequest->client_id)
            ->where('status', 'ACTIVE')
            ->get();

        return Inertia::render('commercial/requests/show', [
            'calibrationRequest' => $calibrationRequest,
            'availableContracts' => $availableContracts,
        ]);
    }

    public function sendToMetrology(Request $request, CalibrationRequest $calibrationRequest): RedirectResponse
    {
        $this->authorize('sendToMetrology', $calibrationRequest);

        $notes = $request->input('internal_notes');
        $this->workflow->sendToMetrology($calibrationRequest, $request->user(), $notes);

        return back()->with('success', 'La demande a été transmise au service métrologie pour planification.');
    }

    public function contract(Request $request, CalibrationRequest $calibrationRequest): RedirectResponse
    {
        $this->authorize('contract', $calibrationRequest);

        $contractId = $request->input('contract_id');
        $this->workflow->commercialContractRequest($calibrationRequest, $contractId, $request->user());

        return back()->with('success', 'Traitement commercial finalisé. La demande est prête pour l\'affectation technique.');
    }
}
