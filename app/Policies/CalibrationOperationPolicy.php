<?php

namespace App\Policies;

use App\Models\CalibrationOperation;
use App\Models\User;

class CalibrationOperationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isMetrology() || $user->isCommercial();
    }

    public function view(User $user, CalibrationOperation $operation): bool
    {
        if ($user->isAdmin() || $user->isManager() || $user->isCommercial()) {
            return true;
        }

        if ($user->isMetrology()) {
            return $operation->technician_id === $user->id || $user->canPerformManagerAction();
        }

        if ($user->isClient()) {
            return $user->client && $operation->client_id === $user->client->id;
        }

        return false;
    }

    public function assign(User $user, CalibrationOperation $operation): bool
    {
        return $user->isManager() || $user->isAdmin();
    }

    public function updateStatus(User $user, CalibrationOperation $operation): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isMetrology() && $operation->technician_id === $user->id) {
            return true;
        }

        return false;
    }

    public function uploadReport(User $user, CalibrationOperation $operation): bool
    {
        if ($user->isAdmin() || $user->isManager()) {
            return true;
        }

        if ($user->isMetrology() && $operation->technician_id === $user->id) {
            return true;
        }

        return false;
    }
}
