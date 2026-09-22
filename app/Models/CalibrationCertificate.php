<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class CalibrationCertificate extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'DRAFT';

    public const STATUS_VALIDATED = 'VALIDATED';

    public const STATUSES_FR = [
        self::STATUS_DRAFT => 'Brouillon',
        self::STATUS_VALIDATED => 'Validé',
    ];

    protected $fillable = [
        'certificate_number',
        'calibration_operation_id',
        'calibration_request_id',
        'calibration_request_item_id',
        'client_id',
        'calibration_report_id',
        'generated_by_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'status',
        'validated_by_id',
        'validated_at',
        'is_final',
    ];

    protected $appends = ['status_label'];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'validated_at' => 'datetime',
            'is_final' => 'boolean',
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

    public function operation(): BelongsTo
    {
        return $this->belongsTo(CalibrationOperation::class, 'calibration_operation_id');
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

    public function report(): BelongsTo
    {
        return $this->belongsTo(CalibrationReport::class, 'calibration_report_id');
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by_id');
    }

    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by_id');
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
