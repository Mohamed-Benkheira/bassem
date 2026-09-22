<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CalibrationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CalibrationService::query();

        if ($category = $request->input('measurement_category')) {
            $query->where('measurement_category', $category);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('equipment_type', 'like', "%{$search}%");
            });
        }

        $services = $query->orderBy('name')->paginate(10)->withQueryString();
        $categories = CalibrationService::distinct()->pluck('measurement_category');

        return Inertia::render('admin/services/index', [
            'services' => $services,
            'categories' => $categories,
            'filters' => $request->only(['search', 'measurement_category']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:calibration_services,code',
            'equipment_type' => 'required|string|max:255',
            'measurement_category' => 'required|string|max:100',
            'calibration_type' => 'required|string|max:100',
            'method' => 'nullable|string|max:255',
            'required_info' => 'nullable|string|max:1000',
            'description' => 'nullable|string|max:2000',
            'is_active' => 'boolean',
        ]);

        $service = CalibrationService::create($validated);

        AuditLog::record(
            action: 'Ajout d\'un service au catalogue de calibration',
            entityType: 'CalibrationService',
            entityId: $service->id,
            oldValues: null,
            newValues: ['name' => $service->name, 'code' => $service->code]
        );

        return back()->with('success', "Le service {$service->name} a été ajouté au catalogue.");
    }

    public function update(Request $request, CalibrationService $service): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:calibration_services,code,'.$service->id,
            'equipment_type' => 'required|string|max:255',
            'measurement_category' => 'required|string|max:100',
            'calibration_type' => 'required|string|max:100',
            'method' => 'nullable|string|max:255',
            'required_info' => 'nullable|string|max:1000',
            'description' => 'nullable|string|max:2000',
            'is_active' => 'boolean',
        ]);

        $oldValues = $service->toArray();
        $service->update($validated);

        AuditLog::record(
            action: 'Modification d\'un service du catalogue',
            entityType: 'CalibrationService',
            entityId: $service->id,
            oldValues: $oldValues,
            newValues: $service->toArray()
        );

        return back()->with('success', "Le service {$service->code} a été mis à jour.");
    }

    public function destroy(Request $request, CalibrationService $service): RedirectResponse
    {
        $service->is_active = ! $service->is_active;
        $service->save();

        $state = $service->is_active ? 'activé' : 'désactivé';

        return back()->with('success', "Le service {$service->code} a été {$state}.");
    }
}
