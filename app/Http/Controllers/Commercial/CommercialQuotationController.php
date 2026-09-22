<?php

namespace App\Http\Controllers\Commercial;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CalibrationRequest;
use App\Models\Client;
use App\Models\Document;
use App\Models\Quotation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommercialQuotationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Quotation::with(['client', 'request', 'createdBy']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('quotation_number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"));
            });
        }

        $quotations = $query->latest()->paginate(10)->withQueryString();
        $clients = Client::orderBy('company_name')->get(['id', 'company_name']);
        $requests = CalibrationRequest::latest()->take(50)->get(['id', 'request_number', 'client_id']);

        return Inertia::render('commercial/quotations/index', [
            'quotations' => $quotations,
            'clients' => $clients,
            'requests' => $requests,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'calibration_request_id' => 'nullable|exists:calibration_requests,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|max:5',
            'validity_date' => 'nullable|date|after_or_equal:today',
            'notes' => 'nullable|string|max:1000',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $year = date('Y');
        $count = Quotation::whereYear('created_at', $year)->count() + 1;
        $quotationNumber = sprintf('DEV-%s-%04d', $year, $count);

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store('quotations', 'local');
            $fileName = $file->getClientOriginalName();
        }

        $quotation = Quotation::create([
            'quotation_number' => $quotationNumber,
            'client_id' => $validated['client_id'],
            'calibration_request_id' => $validated['calibration_request_id'] ?? null,
            'amount' => $validated['amount'],
            'currency' => $validated['currency'],
            'status' => 'SENT',
            'validity_date' => $validated['validity_date'] ?? now()->addDays(30)->toDateString(),
            'notes' => $validated['notes'] ?? null,
            'document_path' => $filePath,
            'document_name' => $fileName,
            'created_by_id' => $request->user()->id,
        ]);

        if ($filePath) {
            Document::create([
                'document_type' => Document::TYPE_QUOTATION,
                'file_name' => $fileName,
                'file_path' => $filePath,
                'mime_type' => $request->file('file')->getClientMimeType() ?: 'application/pdf',
                'file_size' => $request->file('file')->getSize(),
                'uploaded_by_id' => $request->user()->id,
                'uploaded_at' => now(),
                'documentable_type' => Quotation::class,
                'documentable_id' => $quotation->id,
                'status' => 'ACTIVE',
            ]);
        }

        AuditLog::record(
            action: 'Création d\'un devis',
            entityType: 'Quotation',
            entityId: $quotation->id,
            oldValues: null,
            newValues: ['quotation_number' => $quotationNumber, 'amount' => $validated['amount']]
        );

        return back()->with('success', "Le devis {$quotationNumber} a été créé avec succès.");
    }

    public function updateStatus(Request $request, Quotation $quotation): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:DRAFT,SENT,ACCEPTED,REJECTED',
        ]);

        $oldStatus = $quotation->status;
        $quotation->update(['status' => $validated['status']]);

        AuditLog::record(
            action: 'Mise à jour du statut du devis',
            entityType: 'Quotation',
            entityId: $quotation->id,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $validated['status']]
        );

        return back()->with('success', 'Statut du devis mis à jour.');
    }
}
