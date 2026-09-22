<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Quotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'quotation_number',
        'client_id',
        'calibration_request_id',
        'amount',
        'currency',
        'status',
        'document_path',
        'document_name',
        'validity_date',
        'notes',
        'created_by_id',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'validity_date' => 'date',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(CalibrationRequest::class, 'calibration_request_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
