<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CalibrationService extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'equipment_type',
        'description',
        'measurement_category',
        'calibration_type',
        'method',
        'required_info',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function requestItems(): HasMany
    {
        return $this->hasMany(CalibrationRequestItem::class);
    }
}
