<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\CalibrationOperation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        $operations = CalibrationOperation::where('client_id', $client?->id)
            ->with(['item.service', 'report', 'certificate', 'request'])
            ->whereIn('status', [
                CalibrationOperation::STATUS_COMPLETED,
                CalibrationOperation::STATUS_CERTIFICATE_GENERATED,
                CalibrationOperation::STATUS_REPORT_UPLOADED,
                CalibrationOperation::STATUS_IN_PROGRESS,
            ])
            ->latest('created_at')
            ->get();

        // Group by serial number / equipment name
        $groupedHistory = $operations->groupBy(function ($op) {
            return ($op->item?->equipment_name ?? 'Équipement').' - N° Série: '.($op->item?->serial_number ?: 'N/A');
        });

        return Inertia::render('client/history/index', [
            'history' => $groupedHistory,
        ]);
    }
}
