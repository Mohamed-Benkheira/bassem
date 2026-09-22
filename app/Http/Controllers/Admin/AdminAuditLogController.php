<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::with('user');

        if ($action = $request->input('action')) {
            $query->where('action', 'like', "%{$action}%");
        }

        if ($entityType = $request->input('entity_type')) {
            $query->where('entity_type', $entityType);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('entity_type', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $logs = $query->latest('created_at')->paginate(20)->withQueryString();
        $entityTypes = AuditLog::distinct()->pluck('entity_type');

        return Inertia::render('admin/audit-logs/index', [
            'logs' => $logs,
            'entityTypes' => $entityTypes,
            'filters' => $request->only(['search', 'action', 'entity_type']),
        ]);
    }
}
