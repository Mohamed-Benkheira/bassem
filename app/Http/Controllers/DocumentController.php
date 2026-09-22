<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\CalibrationCertificate;
use App\Models\CalibrationReport;
use App\Models\Contract;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    /**
     * Download generic document with authorization check.
     */
    public function download(Request $request, Document $document): StreamedResponse
    {
        $user = $request->user();

        if ($user->cannot('download', $document)) {
            abort(403, 'Accès non autorisé à ce document.');
        }

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'Le fichier demandé est introuvable sur le serveur.');
        }

        AuditLog::record(
            action: 'Téléchargement de document',
            entityType: 'Document',
            entityId: $document->id,
            oldValues: null,
            newValues: ['file_name' => $document->file_name]
        );

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    /**
     * Download certificate PDF.
     */
    public function downloadCertificate(Request $request, CalibrationCertificate $certificate): StreamedResponse
    {
        $user = $request->user();

        if ($user->cannot('view', $certificate)) {
            abort(403, 'Accès non autorisé à ce certificat.');
        }

        if (! Storage::disk('local')->exists($certificate->file_path)) {
            abort(404, 'Le fichier du certificat est introuvable.');
        }

        AuditLog::record(
            action: 'Téléchargement du certificat de calibration',
            entityType: 'CalibrationCertificate',
            entityId: $certificate->id,
            oldValues: null,
            newValues: ['certificate_number' => $certificate->certificate_number]
        );

        return Storage::disk('local')->download($certificate->file_path, $certificate->file_name);
    }

    /**
     * Download calibration report.
     */
    public function downloadReport(Request $request, CalibrationReport $report): StreamedResponse
    {
        $user = $request->user();

        if ($user->cannot('view', $report)) {
            abort(403, 'Accès non autorisé à ce rapport.');
        }

        if (! Storage::disk('local')->exists($report->file_path)) {
            abort(404, 'Le fichier du rapport est introuvable.');
        }

        AuditLog::record(
            action: 'Téléchargement du rapport de calibration',
            entityType: 'CalibrationReport',
            entityId: $report->id,
            oldValues: null,
            newValues: ['report_number' => $report->report_number]
        );

        return Storage::disk('local')->download($report->file_path, $report->file_name);
    }

    /**
     * Download contract PDF.
     */
    public function downloadContract(Request $request, Contract $contract): StreamedResponse
    {
        $user = $request->user();

        if ($user->cannot('view', $contract)) {
            abort(403, 'Accès non autorisé à ce contrat.');
        }

        if (! Storage::disk('local')->exists($contract->document_path)) {
            abort(404, 'Le fichier du contrat est introuvable.');
        }

        AuditLog::record(
            action: 'Téléchargement du contrat',
            entityType: 'Contract',
            entityId: $contract->id,
            oldValues: null,
            newValues: ['contract_number' => $contract->contract_number]
        );

        return Storage::disk('local')->download($contract->document_path, $contract->document_name ?: "Contrat_{$contract->contract_number}.pdf");
    }
}
