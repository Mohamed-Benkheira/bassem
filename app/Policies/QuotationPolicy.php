<?php

namespace App\Policies;

use App\Models\Quotation;
use App\Models\User;

class QuotationPolicy
{
    public function view(User $user, Quotation $quotation): bool
    {
        if ($user->isAdmin() || $user->isCommercial() || $user->isManager()) {
            return true;
        }

        if ($user->isClient()) {
            return $user->client && $quotation->client_id === $user->client->id;
        }

        return false;
    }

    public function manage(User $user): bool
    {
        return $user->isCommercial() || $user->isAdmin();
    }
}
