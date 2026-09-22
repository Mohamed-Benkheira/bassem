<?php

namespace App\Policies;

use App\Models\CalibrationReport;
use App\Models\User;

class CalibrationReportPolicy
{
    public function view(User $user, CalibrationReport $report): bool
    {
        if ($user->isAdmin() || $user->isManager() || $user->isCommercial()) {
            return true;
        }

        if ($user->isMetrology()) {
            return $report->uploaded_by_id === $user->id || $user->canPerformManagerAction();
        }

        // Section 3.1: Clients do NOT have access to internal reports unless explicitly made available
        return false;
    }

    public function review(User $user, CalibrationReport $report): bool
    {
        return $user->canPerformManagerAction();
    }
}
