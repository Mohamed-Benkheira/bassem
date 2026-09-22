<?php

namespace App\Http\Controllers\Commercial;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommercialClientController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Client::withCount(['requests', 'contracts', 'quotations']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        $clients = $query->orderBy('company_name')->paginate(10)->withQueryString();

        return Inertia::render('commercial/clients/index', [
            'clients' => $clients,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'tax_number' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
        ]);

        $client = Client::create($validated);

        AuditLog::record(
            action: 'Création d\'un client',
            entityType: 'Client',
            entityId: $client->id,
            oldValues: null,
            newValues: ['company_name' => $client->company_name]
        );

        return back()->with('success', "Le client {$client->company_name} a été créé avec succès.");
    }

    public function show(Request $request, Client $client): Response
    {
        $client->load([
            'requests.items.service',
            'contracts',
            'quotations',
            'certificates',
        ]);

        return Inertia::render('commercial/clients/show', [
            'client' => $client,
        ]);
    }
}
