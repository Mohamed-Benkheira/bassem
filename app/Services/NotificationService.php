<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use App\Notifications\AppNotification;

class NotificationService
{
    /**
     * Send in-app notification to all users with a specific role.
     */
    public static function notifyRole(
        string $roleName,
        string $title,
        string $message,
        ?string $url = null,
        string $type = 'info',
        ?string $entityType = null,
        ?int $entityId = null
    ): void {
        $role = Role::where('name', $roleName)->first();
        if (! $role) {
            return;
        }

        $users = User::where('role_id', $role->id)->where('is_active', true)->get();
        foreach ($users as $user) {
            $user->notify(new AppNotification([
                'title' => $title,
                'message' => $message,
                'url' => $url,
                'type' => $type,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
            ]));
        }
    }

    /**
     * Send in-app notification to a specific user.
     */
    public static function notifyUser(
        User $user,
        string $title,
        string $message,
        ?string $url = null,
        string $type = 'info',
        ?string $entityType = null,
        ?int $entityId = null
    ): void {
        $user->notify(new AppNotification([
            'title' => $title,
            'message' => $message,
            'url' => $url,
            'type' => $type,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
        ]));
    }
}
