<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\User;

class ContractPolicy
{
    public function view(User $user, Contract $contract): bool
    {
        if ($user->isAdmin() || $user->isCommercial() || $user->isManager()) {
            return true;
        }

        if ($user->isClient()) {
            return $user->client && $contract->client_id === $user->client->id;
        }

        return false;
    }

    public function manage(User $user): bool
    {
        return $user->isCommercial() || $user->isAdmin();
    }
}
