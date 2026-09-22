<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Document extends Model
{
    use HasFactory;

    public const TYPE_QUOTATION = 'quotation';

    public const TYPE_CONTRACT = 'contract';

    public const TYPE_REPORT = 'calibration_report';

    public const TYPE_CERTIFICATE = 'calibration_certificate';

    public const TYPE_SUPPORTING = 'supporting_document';

    public const TYPES_FR = [
        self::TYPE_QUOTATION => 'Devis',
        self::TYPE_CONTRACT => 'Contrat',
        self::TYPE_REPORT => 'Rapport de calibration',
        self::TYPE_CERTIFICATE => 'Certificat de calibration',
        self::TYPE_SUPPORTING => 'Document justificatif',
    ];

    protected $fillable = [
        'document_type',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'uploaded_by_id',
        'uploaded_at',
        'documentable_type',
        'documentable_id',
        'status',
        'archived_at',
    ];

    protected $appends = ['document_type_label', 'formatted_file_size'];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'uploaded_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function getDocumentTypeLabelAttribute(): string
    {
        return self::TYPES_FR[$this->document_type] ?? $this->document_type;
    }

    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2).' Mo';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2).' Ko';
        }

        return $bytes.' o';
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_id');
    }

    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }
}
