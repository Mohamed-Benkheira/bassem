<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AppNotification extends Notification
{
    use Queueable;

    public function __construct(
        public array $data
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->data['title'] ?? 'Notification',
            'message' => $this->data['message'] ?? '',
            'url' => $this->data['url'] ?? null,
            'type' => $this->data['type'] ?? 'info',
            'entity_type' => $this->data['entity_type'] ?? null,
            'entity_id' => $this->data['entity_id'] ?? null,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
