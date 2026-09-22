<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestStatusHistory extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'calibration_request_id',
        'from_status',
        'to_status',
        'changed_by_id',
        'comment',
        'created_at',
    ];

    protected $appends = ['from_status_label', 'to_status_label'];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function getFromStatusLabelAttribute(): ?string
    {
        return $this->from_status ? (CalibrationRequest::STATUSES_FR[$this->from_status] ?? $this->from_status) : null;
    }

    public function getToStatusLabelAttribute(): string
    {
        return CalibrationRequest::STATUSES_FR[$this->to_status] ?? $this->to_status;
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(CalibrationRequest::class, 'calibration_request_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_id');
    }
}
