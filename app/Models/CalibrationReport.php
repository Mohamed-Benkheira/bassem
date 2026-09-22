<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class CalibrationReport extends Model
{
    use HasFactory;

    public const STATUS_PENDING_REVIEW = 'PENDING_REVIEW';

    public const STATUS_APPROVED = 'APPROVED';

    public const STATUS_REJECTED = 'REJECTED';

    public const STATUSES_FR = [
        self::STATUS_PENDING_REVIEW => 'En attente de revue',
        self::STATUS_APPROVED => 'Validé',
        self::STATUS_REJECTED => 'À corriger',
    ];

    protected $fillable = [
        'report_number',
        'calibration_operation_id',
        'calibration_request_id',
        'calibration_request_item_id',
        'uploaded_by_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'status',
        'review_notes',
        'reviewed_by_id',
        'reviewed_at',
    ];

    protected $appends = ['status_label'];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'reviewed_at' => 'datetime',
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

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_id');
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
