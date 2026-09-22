<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\CalibrationOperation;
use App\Models\User;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManagerAssignmentController extends Controller
{
    public function __construct(
        protected WorkflowService $workflow
    ) {}

    public function index(Request $request): Response
    {
        $query = CalibrationOperation::with(['client', 'item.service', 'technician', 'request']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($request->boolean('unassigned')) {
            $query->whereNull('technician_id');
        }

        if ($requestId = $request->input('request_id')) {
            $query->where('calibration_request_id', $requestId);
        }

        if ($operationId = $request->input('operation_id')) {
            $query->where('id', $operationId);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('operation_number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"))
                    ->orWhereHas('item', fn ($iq) => $iq->where('equipment_name', 'like', "%{$search}%"))
                    ->orWhereHas('request', fn ($rq) => $rq->where('request_number', 'like', "%{$search}%"));
            });
        }

        $operations = $query->orderByRaw('technician_id IS NULL DESC')
            ->orderBy('scheduled_date', 'asc')
            ->paginate(12)
            ->withQueryString();

        $technicians = User::whereHas('role', fn ($q) => $q->where('name', 'metrology'))
            ->where('is_active', true)
            ->withCount([
                'assignedOperations as active_calibrations_count' => fn ($q) => $q->whereIn('status', [
                    CalibrationOperation::STATUS_ASSIGNED,
                    CalibrationOperation::STATUS_IN_PROGRESS,
                ]),
            ])
            ->get();

        return Inertia::render('manager/assignments/index', [
            'operations' => $operations,
            'technicians' => $technicians,
            'statuses' => CalibrationOperation::STATUSES_FR,
            'filters' => $request->only(['search', 'status', 'unassigned', 'request_id', 'operation_id']),
        ]);
    }

    public function assign(Request $request, CalibrationOperation $calibrationOperation): RedirectResponse
    {
        $validated = $request->validate([
            'technician_id' => 'required|exists:users,id',
            'scheduled_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ], [
            'technician_id.required' => 'Veuillez sélectionner un technicien métrologue.',
        ]);

        $this->workflow->assignTechnician(
            operation: $calibrationOperation,
            technicianId: $validated['technician_id'],
            user: $request->user(),
            scheduledDate: $validated['scheduled_date'] ?? null,
            notes: $validated['notes'] ?? null
        );

        return back()->with('success', "L'opération {$calibrationOperation->operation_number} a été affectée au technicien avec succès.");
    }
}
