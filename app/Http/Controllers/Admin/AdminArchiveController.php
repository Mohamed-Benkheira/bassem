<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CalibrationCertificate;
use App\Models\Contract;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminArchiveController extends Controller
{
    public function index(Request $request): Response
    {
        $documentType = $request->input('document_type');
        $search = $request->input('search');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = Document::with(['uploadedBy', 'documentable']);

        if ($documentType) {
            $query->where('document_type', $documentType);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                    ->orWhereHasMorph('documentable', [Contract::class, CalibrationCertificate::class], function ($mq, $type) use ($search) {
                        if ($type === Contract::class) {
                            $mq->where('contract_number', 'like', "%{$search}%")
                                ->orWhereHas('client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"));
                        } elseif ($type === CalibrationCertificate::class) {
                            $mq->where('certificate_number', 'like', "%{$search}%")
                                ->orWhereHas('client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"))
                                ->orWhereHas('item', fn ($iq) => $iq->where('equipment_name', 'like', "%{$search}%")->orWhere('serial_number', 'like', "%{$search}%"));
                        }
                    });
            });
        }

        if ($dateFrom) {
            $query->whereDate('uploaded_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('uploaded_at', '<=', $dateTo);
        }

        $documents = $query->latest('uploaded_at')->paginate(12)->withQueryString();

        return Inertia::render('admin/archives/index', [
            'documents' => $documents,
            'filters' => $request->only(['document_type', 'search', 'date_from', 'date_to']),
            'documentTypes' => Document::TYPES_FR,
        ]);
    }
}
