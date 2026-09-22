<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class CalibrationOperation extends Model
{
    use HasFactory;

    public const STATUS_SCHEDULED = 'SCHEDULED';

    public const STATUS_ASSIGNED = 'ASSIGNED';

    public const STATUS_IN_PROGRESS = 'IN_PROGRESS';

    public const STATUS_REPORT_UPLOADED = 'REPORT_UPLOADED';

    public const STATUS_REPORT_REJECTED = 'REPORT_REJECTED';

    public const STATUS_CERTIFICATE_GENERATED = 'CERTIFICATE_GENERATED';

    public const STATUS_COMPLETED = 'COMPLETED';

    public const STATUS_CANCELLED = 'CANCELLED';

    public const STATUSES_FR = [
        self::STATUS_SCHEDULED => 'Planifiée',
        self::STATUS_ASSIGNED => 'Affectée',
        self::STATUS_IN_PROGRESS => 'En cours',
        self::STATUS_REPORT_UPLOADED => 'Rapport téléversé',
        self::STATUS_REPORT_REJECTED => 'Rapport à corriger',
        self::STATUS_CERTIFICATE_GENERATED => 'Certificat généré',
        self::STATUS_COMPLETED => 'Terminée',
        self::STATUS_CANCELLED => 'Annulée',
    ];

    protected $fillable = [
        'operation_number',
        'calibration_request_id',
        'calibration_request_item_id',
        'client_id',
        'technician_id',
        'supervisor_id',
        'scheduled_date',
        'actual_date',
        'location',
        'status',
        'notes',
    ];

    protected $appends = ['status_label'];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'actual_date' => 'date',
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

    public function request(): BelongsTo
    {
        return $this->belongsTo(CalibrationRequest::class, 'calibration_request_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(CalibrationRequestItem::class, 'calibration_request_item_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function report(): HasOne
    {
        return $this->hasOne(CalibrationReport::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(CalibrationReport::class);
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(CalibrationCertificate::class);
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
