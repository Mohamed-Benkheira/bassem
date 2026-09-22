<?php

namespace App\Policies;

use App\Models\CalibrationCertificate;
use App\Models\User;

class CalibrationCertificatePolicy
{
    public function view(User $user, CalibrationCertificate $certificate): bool
    {
        if ($user->isAdmin() || $user->isManager() || $user->isCommercial() || $user->isMetrology()) {
            return true;
        }

        // Section 27: Client can access/download certificate once validated
        if ($user->isClient()) {
            return $user->client
                && $certificate->client_id === $user->client->id
                && $certificate->is_final;
        }

        return false;
    }

    public function generate(User $user): bool
    {
        return $user->canPerformManagerAction();
    }

    public function validate(User $user, CalibrationCertificate $certificate): bool
    {
        if ($certificate->is_final) {
            return false;
        }

        return $user->canPerformManagerAction();
    }
}
