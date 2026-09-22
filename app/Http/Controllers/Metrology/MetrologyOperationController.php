<?php

namespace App\Http\Controllers\Metrology;

use App\Http\Controllers\Controller;
use App\Models\CalibrationOperation;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MetrologyOperationController extends Controller
{
    public function __construct(
        protected WorkflowService $workflow
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = CalibrationOperation::with(['client', 'item.service', 'technician', 'report', 'certificate']);

        // Technicians see their own unless manager/admin
        if ($user->isMetrology() && ! $user->canPerformManagerAction()) {
            $query->where('technician_id', $user->id);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('operation_number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"))
                    ->orWhereHas('item', fn ($iq) => $iq->where('equipment_name', 'like', "%{$search}%")->orWhere('serial_number', 'like', "%{$search}%"));
            });
        }

        $operations = $query->orderBy('scheduled_date', 'asc')->paginate(12)->withQueryString();

        return Inertia::render('metrology/operations/index', [
            'operations' => $operations,
            'filters' => $request->only(['search', 'status']),
            'statuses' => CalibrationOperation::STATUSES_FR,
        ]);
    }

    public function show(Request $request, CalibrationOperation $calibrationOperation): Response
    {
        $this->authorize('view', $calibrationOperation);

        $calibrationOperation->load([
            'client',
            'item.service',
            'request.statusHistories.changedBy',
            'technician',
            'supervisor',
            'report.uploadedBy',
            'certificate.validatedBy',
        ]);

        return Inertia::render('metrology/operations/show', [
            'operation' => $calibrationOperation,
        ]);
    }

    public function start(Request $request, CalibrationOperation $calibrationOperation): RedirectResponse
    {
        $this->authorize('updateStatus', $calibrationOperation);

        $this->workflow->startCalibration($calibrationOperation, $request->user());

        return back()->with('success', 'L\'opération de calibration est maintenant en cours d\'exécution.');
    }

    public function uploadReport(Request $request, CalibrationOperation $calibrationOperation): RedirectResponse
    {
        $this->authorize('uploadReport', $calibrationOperation);

        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx|max:20480',
            'notes' => 'nullable|string|max:2000',
        ], [
            'file.required' => 'Le fichier de rapport est obligatoire.',
            'file.mimes' => 'Le rapport doit être au format PDF, DOC ou DOCX.',
            'file.max' => 'La taille maximale autorisée pour le rapport est de 20 Mo.',
        ]);

        $this->workflow->uploadReport(
            operation: $calibrationOperation,
            file: $validated['file'],
            user: $request->user(),
            notes: $validated['notes'] ?? null
        );

        return back()->with('success', 'Le rapport de calibration a été téléversé avec succès et transmis au responsable pour revue.');
    }
}
