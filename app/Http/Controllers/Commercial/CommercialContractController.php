<?php

namespace App\Http\Controllers\Commercial;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommercialContractController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Contract::with(['client', 'uploadedBy', 'requests']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('contract_number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"));
            });
        }

        $contracts = $query->latest()->paginate(10)->withQueryString();
        $clients = Client::orderBy('company_name')->get(['id', 'company_name']);

        return Inertia::render('commercial/contracts/index', [
            'contracts' => $contracts,
            'clients' => $clients,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:DRAFT,ACCEPTED_BY_COMPANY,ACCEPTED_BY_CLIENT,ACTIVE',
            'notes' => 'nullable|string|max:1000',
            'file' => 'required|file|mimes:pdf|max:10240',
        ], [
            'file.required' => 'Le document contractuel (PDF) est obligatoire.',
            'file.mimes' => 'Le fichier doit être au format PDF.',
        ]);

        $year = date('Y');
        $count = Contract::whereYear('created_at', $year)->count() + 1;
        $contractNumber = sprintf('CTR-%s-%04d', $year, $count);

        $file = $request->file('file');
        $path = $file->store('contracts', 'local');

        $contract = Contract::create([
            'contract_number' => $contractNumber,
            'client_id' => $validated['client_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'document_path' => $path,
            'document_name' => $file->getClientOriginalName(),
            'uploaded_by_id' => $request->user()->id,
        ]);

        Document::create([
            'document_type' => Document::TYPE_CONTRACT,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType() ?: 'application/pdf',
            'file_size' => $file->getSize(),
            'uploaded_by_id' => $request->user()->id,
            'uploaded_at' => now(),
            'documentable_type' => Contract::class,
            'documentable_id' => $contract->id,
            'status' => 'ACTIVE',
        ]);

        AuditLog::record(
            action: 'Création et téléversement d\'un contrat',
            entityType: 'Contract',
            entityId: $contract->id,
            oldValues: null,
            newValues: ['contract_number' => $contractNumber, 'client_id' => $validated['client_id']]
        );

        return back()->with('success', "Le contrat {$contractNumber} a été créé avec succès.");
    }

    public function archive(Request $request, Contract $contract): RedirectResponse
    {
        $oldStatus = $contract->status;
        $contract->update([
            'status' => 'ARCHIVED',
            'archived_at' => now(),
        ]);

        // Update document status
        Document::where('documentable_type', Contract::class)
            ->where('documentable_id', $contract->id)
            ->update([
                'status' => 'ARCHIVED',
                'archived_at' => now(),
            ]);

        AuditLog::record(
            action: 'Archivage du contrat',
            entityType: 'Contract',
            entityId: $contract->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => 'ARCHIVED', 'archived_at' => now()]
        );

        return back()->with('success', "Le contrat {$contract->contract_number} a été archivé.");
    }
}
