<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class CalibrationRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'calibration_request_id',
        'calibration_service_id',
        'equipment_name',
        'serial_number',
        'brand',
        'model',
        'measurement_range',
        'tolerance',
        'quantity',
        'specific_notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(CalibrationRequest::class, 'calibration_request_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(CalibrationService::class, 'calibration_service_id');
    }

    public function operations(): HasMany
    {
        return $this->hasMany(CalibrationOperation::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(CalibrationReport::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(CalibrationCertificate::class);
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
