<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\CalibrationOperation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ManagerHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CalibrationOperation::with(['client', 'item.service', 'technician', 'report', 'certificate', 'request']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('operation_number', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('company_name', 'like', "%{$search}%"))
                    ->orWhereHas('item', fn ($iq) => $iq->where('equipment_name', 'like', "%{$search}%")->orWhere('serial_number', 'like', "%{$search}%"));
            });
        }

        $operations = $query->latest('created_at')->paginate(15)->withQueryString();

        return Inertia::render('manager/history/index', [
            'operations' => $operations,
            'filters' => $request->only('search'),
        ]);
    }
}
