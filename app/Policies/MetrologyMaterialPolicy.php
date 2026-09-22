<?php

namespace App\Policies;

use App\Models\User;

class MetrologyMaterialPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isMetrology();
    }

    public function manage(User $user): bool
    {
        return $user->isAdmin() || $user->isManager();
    }
}
