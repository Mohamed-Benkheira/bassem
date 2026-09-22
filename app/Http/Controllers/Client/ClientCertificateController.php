<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\CalibrationCertificate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientCertificateController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        $query = CalibrationCertificate::where('client_id', $client?->id)
            ->where('is_final', true)
            ->with(['item.service', 'request', 'validatedBy']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('certificate_number', 'like', "%{$search}%")
                    ->orWhereHas('item', function ($iq) use ($search) {
                        $iq->where('equipment_name', 'like', "%{$search}%")
                            ->orWhere('serial_number', 'like', "%{$search}%");
                    });
            });
        }

        $certificates = $query->latest('validated_at')->paginate(10)->withQueryString();

        return Inertia::render('client/certificates/index', [
            'certificates' => $certificates,
            'filters' => $request->only('search'),
        ]);
    }
}
