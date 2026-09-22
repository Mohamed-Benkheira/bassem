<?php

namespace App\Http\Controllers\Metrology;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\MetrologyMaterial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MetrologyMaterialController extends Controller
{
    public function index(Request $request): Response
    {
        $query = MetrologyMaterial::query();

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('reference_code', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('manufacturer', 'like', "%{$search}%");
            });
        }

        $materials = $query->orderBy('expiration_date', 'asc')->paginate(10)->withQueryString();
        $categories = MetrologyMaterial::distinct()->pluck('category');

        return Inertia::render('metrology/materials/index', [
            'materials' => $materials,
            'categories' => $categories,
            'statuses' => MetrologyMaterial::STATUSES_FR,
            'filters' => $request->only(['search', 'status', 'category']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'reference_code' => 'required|string|max:100|unique:metrology_materials,reference_code',
            'serial_number' => 'nullable|string|max:100',
            'manufacturer' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'category' => 'required|string|max:100',
            'calibration_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'status' => 'required|in:VALID,EXPIRED,UNDER_MAINTENANCE',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $material = MetrologyMaterial::create($validated);

        AuditLog::record(
            action: 'Ajout d\'un étalon / matériel de métrologie',
            entityType: 'MetrologyMaterial',
            entityId: $material->id,
            oldValues: null,
            newValues: ['name' => $material->name, 'reference_code' => $material->reference_code]
        );

        return back()->with('success', "L'étalon {$material->name} a été enregistré avec succès.");
    }

    public function update(Request $request, MetrologyMaterial $material): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'reference_code' => 'required|string|max:100|unique:metrology_materials,reference_code,'.$material->id,
            'serial_number' => 'nullable|string|max:100',
            'manufacturer' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'category' => 'required|string|max:100',
            'calibration_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'status' => 'required|in:VALID,EXPIRED,UNDER_MAINTENANCE',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $oldValues = $material->toArray();
        $material->update($validated);

        AuditLog::record(
            action: 'Mise à jour d\'un étalon de métrologie',
            entityType: 'MetrologyMaterial',
            entityId: $material->id,
            oldValues: $oldValues,
            newValues: $material->toArray()
        );

        return back()->with('success', "L'étalon {$material->reference_code} a été mis à jour.");
    }
}
