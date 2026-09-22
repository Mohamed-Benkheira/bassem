<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::with(['role', 'client']);

        if ($roleId = $request->input('role_id')) {
            $query->where('role_id', $roleId);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->paginate(12)->withQueryString();
        $roles = Role::all();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'phone' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'is_delegated_manager' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'is_delegated_manager' => $validated['is_delegated_manager'] ?? false,
            'email_verified_at' => now(),
        ]);

        AuditLog::record(
            action: 'Création d\'un compte utilisateur',
            entityType: 'User',
            entityId: $user->id,
            oldValues: null,
            newValues: ['name' => $user->name, 'email' => $user->email, 'role_id' => $user->role_id]
        );

        return back()->with('success', "L'utilisateur {$user->name} a été créé avec succès.");
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'phone' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'is_delegated_manager' => 'boolean',
        ]);

        $oldValues = $user->only(['name', 'email', 'role_id', 'is_active', 'is_delegated_manager']);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role_id = $validated['role_id'];
        $user->phone = $validated['phone'] ?? null;
        $user->is_active = $validated['is_active'] ?? true;
        $user->is_delegated_manager = $validated['is_delegated_manager'] ?? false;

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        AuditLog::record(
            action: 'Modification du compte utilisateur',
            entityType: 'User',
            entityId: $user->id,
            oldValues: $oldValues,
            newValues: $user->only(['name', 'email', 'role_id', 'is_active', 'is_delegated_manager'])
        );

        return back()->with('success', "L'utilisateur {$user->name} a été mis à jour.");
    }

    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Vous ne pouvez pas désactiver votre propre compte.');
        }

        $oldStatus = $user->is_active;
        $user->is_active = ! $oldStatus;
        $user->save();

        AuditLog::record(
            action: $user->is_active ? 'Activation du compte' : 'Désactivation du compte',
            entityType: 'User',
            entityId: $user->id,
            oldValues: ['is_active' => $oldStatus],
            newValues: ['is_active' => $user->is_active]
        );

        $state = $user->is_active ? 'activé' : 'désactivé';

        return back()->with('success', "Le compte de {$user->name} a été {$state}.");
    }
}
