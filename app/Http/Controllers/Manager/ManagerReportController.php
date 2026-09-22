<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\CalibrationReport;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManagerReportController extends Controller
{
    public function __construct(
        protected WorkflowService $workflow
    ) {}

    public function index(Request $request): Response
    {
        $query = CalibrationReport::with(['operation.technician', 'request.client', 'item.service', 'uploadedBy', 'reviewedBy']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('report_number', 'like', "%{$search}%")
                    ->orWhereHas('request.client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"))
                    ->orWhereHas('item', fn ($iq) => $iq->where('equipment_name', 'like', "%{$search}%"));
            });
        }

        $reports = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('manager/reports/index', [
            'reports' => $reports,
            'filters' => $request->only(['search', 'status']),
            'statuses' => CalibrationReport::STATUSES_FR,
        ]);
    }

    public function show(Request $request, CalibrationReport $report): Response
    {
        $this->authorize('view', $report);

        $report->load([
            'operation.technician',
            'operation.certificate',
            'request.client',
            'item.service',
            'uploadedBy',
            'reviewedBy',
        ]);

        return Inertia::render('manager/reports/show', [
            'report' => $report,
        ]);
    }

    public function review(Request $request, CalibrationReport $report): RedirectResponse
    {
        $this->authorize('review', $report);

        $validated = $request->validate([
            'decision' => 'required|in:APPROVE,REJECT',
            'review_notes' => 'nullable|string|max:2000',
        ], [
            'decision.required' => 'Veuillez indiquer votre décision (Approuver ou Demander correction).',
        ]);

        $this->workflow->reviewReport(
            report: $report,
            decision: $validated['decision'],
            reviewNotes: $validated['review_notes'] ?? null,
            user: $request->user()
        );

        $msg = $validated['decision'] === 'APPROVE'
            ? "Le rapport {$report->report_number} a été validé avec succès. Vous pouvez maintenant générer le certificat."
            : "La demande de correction du rapport {$report->report_number} a été transmise au technicien.";

        return back()->with('success', $msg);
    }
}
