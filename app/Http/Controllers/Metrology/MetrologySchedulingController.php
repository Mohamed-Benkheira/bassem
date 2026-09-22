<?php

namespace App\Http\Controllers\Metrology;

use App\Http\Controllers\Controller;
use App\Models\CalibrationRequest;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MetrologySchedulingController extends Controller
{
    public function __construct(
        protected WorkflowService $workflow
    ) {}

    public function index(Request $request): Response
    {
        $query = CalibrationRequest::with(['client', 'items.service'])
            ->whereIn('status', [
                CalibrationRequest::STATUS_SENT_TO_METROLOGY,
                CalibrationRequest::STATUS_DATE_PROPOSED,
                CalibrationRequest::STATUS_WAITING_CLIENT_CONFIRMATION,
                CalibrationRequest::STATUS_ACCEPTED,
                CalibrationRequest::STATUS_SCHEDULED,
            ]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"));
            });
        }

        $requests = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('metrology/scheduling/index', [
            'requests' => $requests,
            'filters' => $request->only('search'),
        ]);
    }

    public function propose(Request $request, CalibrationRequest $calibrationRequest): RedirectResponse
    {
        $this->authorize('schedule', $calibrationRequest);

        $validated = $request->validate([
            'proposed_date' => 'required|date|after_or_equal:today',
            'proposed_location' => 'required|in:laboratory,client_site,both',
            'internal_notes' => 'nullable|string|max:1000',
        ], [
            'proposed_date.required' => 'Veuillez renseigner la date d\'intervention proposée.',
            'proposed_location.required' => 'Veuillez sélectionner le lieu d\'intervention.',
        ]);

        $this->workflow->proposeSchedule(
            request: $calibrationRequest,
            date: $validated['proposed_date'],
            location: $validated['proposed_location'],
            user: $request->user(),
            notes: $validated['internal_notes'] ?? null
        );

        return back()->with('success', 'La date et le lieu ont été proposés avec succès. Le client en a été notifié.');
    }
}
