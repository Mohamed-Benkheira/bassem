<?php

namespace App\Policies;

use App\Models\CalibrationRequest;
use App\Models\User;

class CalibrationRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CalibrationRequest $request): bool
    {
        if ($user->isAdmin() || $user->isCommercial() || $user->isManager() || $user->isMetrology()) {
            return true;
        }

        if ($user->isClient()) {
            return $user->client && $request->client_id === $user->client->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->isClient() || $user->isAdmin();
    }

    public function sendToMetrology(User $user, CalibrationRequest $request): bool
    {
        return ($user->isCommercial() || $user->isAdmin())
            && in_array($request->status, [CalibrationRequest::STATUS_SUBMITTED, CalibrationRequest::STATUS_WAITING_CLIENT_CONFIRMATION]);
    }

    public function schedule(User $user, CalibrationRequest $request): bool
    {
        return $user->isMetrology() || $user->isManager() || $user->isAdmin();
    }

    public function confirmDate(User $user, CalibrationRequest $request): bool
    {
        return ($user->isClient() && $user->client && $request->client_id === $user->client->id)
            || $user->isAdmin();
    }

    public function cancel(User $user, CalibrationRequest $request): bool
    {
        if (! $request->isCancellable()) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isClient()) {
            return $user->client && $request->client_id === $user->client->id;
        }

        return false;
    }

    public function contract(User $user, CalibrationRequest $request): bool
    {
        return $user->isCommercial() || $user->isAdmin();
    }
}
