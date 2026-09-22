<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\CalibrationCertificate;
use App\Models\CalibrationOperation;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManagerCertificateController extends Controller
{
    public function __construct(
        protected WorkflowService $workflow
    ) {}

    public function index(Request $request): Response
    {
        $query = CalibrationCertificate::with(['operation', 'client', 'item.service', 'generatedBy', 'validatedBy']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('certificate_number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"))
                    ->orWhereHas('item', fn ($iq) => $iq->where('equipment_name', 'like', "%{$search}%"));
            });
        }

        $certificates = $query->latest()->paginate(10)->withQueryString();

        // Operations that are approved and ready for certificate generation (with active contract)
        $readyOperations = CalibrationOperation::with(['client', 'item.service', 'report', 'request.contract'])
            ->whereHas('report', fn ($q) => $q->where('status', 'APPROVED'))
            ->whereDoesntHave('certificate')
            ->get();

        return Inertia::render('manager/certificates/index', [
            'certificates' => $certificates,
            'readyOperations' => $readyOperations,
            'filters' => $request->only(['search', 'status']),
            'statuses' => CalibrationCertificate::STATUSES_FR,
        ]);
    }

    public function generate(Request $request, CalibrationOperation $calibrationOperation): RedirectResponse
    {
        $user = $request->user();
        if (! $user->canPerformManagerAction()) {
            abort(403, 'Vous n\'êtes pas autorisé à générer des certificats de calibration.');
        }

        $calibrationOperation->loadMissing('request');
        if (! $calibrationOperation->request?->contract_id) {
            return back()->withErrors([
                'contract' => 'Impossible de générer un certificat sans contrat validé rattaché à la demande de calibration.',
            ]);
        }

        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf|max:20480',
        ], [
            'file.required' => 'Le fichier PDF du certificat est obligatoire.',
            'file.mimes' => 'Le certificat doit être obligatoirement au format PDF.',
        ]);

        try {
            $certificate = $this->workflow->generateCertificate(
                operation: $calibrationOperation,
                file: $validated['file'],
                user: $user
            );
        } catch (\DomainException $e) {
            return back()->withErrors(['contract' => $e->getMessage()]);
        }

        return back()->with('success', "Le certificat {$certificate->certificate_number} a été généré en mode brouillon. Veuillez le valider pour le rendre définitif.");
    }

    public function validateCertificate(Request $request, CalibrationCertificate $certificate): RedirectResponse
    {
        $user = $request->user();
        if (! $user->canPerformManagerAction()) {
            abort(403, 'Vous n\'êtes pas autorisé à valider des certificats.');
        }

        $this->workflow->validateCertificate($certificate, $user);

        return back()->with('success', "Le certificat {$certificate->certificate_number} a été validé et rendu définitif. Il est désormais accessible au client.");
    }
}
