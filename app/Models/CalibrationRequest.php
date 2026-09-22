<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class CalibrationRequest extends Model
{
    use HasFactory;

    public const STATUS_SUBMITTED = 'SUBMITTED';

    public const STATUS_SENT_TO_METROLOGY = 'SENT_TO_METROLOGY';

    public const STATUS_DATE_PROPOSED = 'DATE_PROPOSED';

    public const STATUS_WAITING_CLIENT_CONFIRMATION = 'WAITING_CLIENT_CONFIRMATION';

    public const STATUS_ACCEPTED = 'ACCEPTED';

    public const STATUS_CONTRACTED = 'CONTRACTED';

    public const STATUS_SCHEDULED = 'SCHEDULED';

    public const STATUS_ASSIGNED = 'ASSIGNED';

    public const STATUS_IN_CALIBRATION = 'IN_CALIBRATION';

    public const STATUS_REPORT_UPLOADED = 'REPORT_UPLOADED';

    public const STATUS_WAITING_CERTIFICATE = 'WAITING_CERTIFICATE';

    public const STATUS_CERTIFICATE_GENERATED = 'CERTIFICATE_GENERATED';

    public const STATUS_CERTIFICATE_VALIDATED = 'CERTIFICATE_VALIDATED';

    public const STATUS_COMPLETED = 'COMPLETED';

    public const STATUS_CANCELLED = 'CANCELLED';

    public const STATUS_REJECTED = 'REJECTED';

    public const STATUSES_FR = [
        self::STATUS_SUBMITTED => 'Soumise',
        self::STATUS_SENT_TO_METROLOGY => 'Transmise à la métrologie',
        self::STATUS_DATE_PROPOSED => 'Date proposée',
        self::STATUS_WAITING_CLIENT_CONFIRMATION => 'En attente de confirmation du client',
        self::STATUS_ACCEPTED => 'Acceptée',
        self::STATUS_CONTRACTED => 'Sous contrat',
        self::STATUS_SCHEDULED => 'Planifiée',
        self::STATUS_ASSIGNED => 'Affectée',
        self::STATUS_IN_CALIBRATION => 'En cours de calibration',
        self::STATUS_REPORT_UPLOADED => 'Rapport téléversé',
        self::STATUS_WAITING_CERTIFICATE => 'En attente de certificat',
        self::STATUS_CERTIFICATE_GENERATED => 'Certificat généré',
        self::STATUS_CERTIFICATE_VALIDATED => 'Certificat validé',
        self::STATUS_COMPLETED => 'Terminée',
        self::STATUS_CANCELLED => 'Annulée',
        self::STATUS_REJECTED => 'Rejetée',
    ];

    protected $fillable = [
        'request_number',
        'client_id',
        'status',
        'preferred_date',
        'preferred_location',
        'client_notes',
        'internal_notes',
        'proposed_date',
        'proposed_location',
        'scheduled_date',
        'scheduled_location',
        'cancellation_reason',
        'contract_id',
        'created_by_id',
    ];

    protected $appends = ['status_label'];

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'proposed_date' => 'date',
            'scheduled_date' => 'date',
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

    public function isCancellable(): bool
    {
        return in_array($this->status, [
            self::STATUS_SUBMITTED,
            self::STATUS_SENT_TO_METROLOGY,
            self::STATUS_DATE_PROPOSED,
            self::STATUS_WAITING_CLIENT_CONFIRMATION,
            self::STATUS_ACCEPTED,
        ]);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(CalibrationRequestItem::class);
    }

    public function operations(): HasMany
    {
        return $this->hasMany(CalibrationOperation::class);
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(RequestStatusHistory::class)->orderBy('created_at', 'desc');
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(CalibrationReport::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(CalibrationCertificate::class);
    }
}
