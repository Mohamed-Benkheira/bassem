<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class MetrologyMaterial extends Model
{
    use HasFactory;

    public const STATUS_VALID = 'VALID';

    public const STATUS_EXPIRED = 'EXPIRED';

    public const STATUS_UNDER_MAINTENANCE = 'UNDER_MAINTENANCE';

    public const STATUSES_FR = [
        self::STATUS_VALID => 'Valide / Conforme',
        self::STATUS_EXPIRED => 'Expiré / Hors étalonnage',
        self::STATUS_UNDER_MAINTENANCE => 'En maintenance',
    ];

    protected $fillable = [
        'name',
        'reference_code',
        'serial_number',
        'manufacturer',
        'model',
        'category',
        'calibration_date',
        'expiration_date',
        'status',
        'location',
        'supporting_document_path',
        'supporting_document_name',
        'notes',
    ];

    protected $appends = ['status_label', 'is_expired'];

    protected function casts(): array
    {
        return [
            'calibration_date' => 'date',
            'expiration_date' => 'date',
        ];
    }

    public function getStatusLabelAttribute(): string
    {
        $status = $this->status ?? null;
        if (! $status) {
            return '';
        }

        $key = 'app.statuses.'.$status;
        $trans = __($key);

        if (is_string($trans) && $trans !== $key) {
            return $trans;
        }

        return (string) (self::STATUSES_FR[$status] ?? $status);
    }

    public function getIsExpiredAttribute(): bool
    {
        if ($this->status === self::STATUS_EXPIRED) {
            return true;
        }

        if ($this->expiration_date && $this->expiration_date->isPast()) {
            return true;
        }

        return false;
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
