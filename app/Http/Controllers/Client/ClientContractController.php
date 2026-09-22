<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientContractController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        $contracts = Contract::where('client_id', $client?->id)
            ->with(['requests'])
            ->latest()
            ->paginate(10);

        return Inertia::render('client/contracts/index', [
            'contracts' => $contracts,
        ]);
    }

    public function show(Request $request, Contract $contract): Response
    {
        $this->authorize('view', $contract);

        $contract->load(['client', 'requests.items.service']);

        return Inertia::render('client/contracts/show', [
            'contract' => $contract,
        ]);
    }
}
