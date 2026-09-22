<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if (! $user->is_active) {
            auth()->logout();

            return redirect()->route('login')->withErrors(['email' => 'Votre compte a été désactivé par l\'administrateur.']);
        }

        // Admin has access to all internal areas
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Section 28: Delegated technician can act as manager
        if (in_array('manager', $roles) && $user->canPerformManagerAction()) {
            return $next($request);
        }

        // Check if user has any of the required roles
        if (! empty($roles) && ! $user->hasRole($roles)) {
            abort(403, 'Accès non autorisé pour votre profil utilisateur.');
        }

        return $next($request);
    }
}
