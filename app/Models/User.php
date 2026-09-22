<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property int|null $role_id
 * @property bool $is_active
 * @property bool $is_delegated_manager
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role_id',
        'is_active',
        'is_delegated_manager',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected $appends = [
        'role_name',
        'role_label',
        'can_manage_certificates',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
            'is_delegated_manager' => 'boolean',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function client(): HasOne
    {
        return $this->hasOne(Client::class);
    }

    public function assignedOperations(): HasMany
    {
        return $this->hasMany(CalibrationOperation::class, 'technician_id');
    }

    public function uploadedReports(): HasMany
    {
        return $this->hasMany(CalibrationReport::class, 'uploaded_by_id');
    }

    public function generatedCertificates(): HasMany
    {
        return $this->hasMany(CalibrationCertificate::class, 'generated_by_id');
    }

    public function validatedCertificates(): HasMany
    {
        return $this->hasMany(CalibrationCertificate::class, 'validated_by_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function getRoleNameAttribute(): ?string
    {
        return $this->role?->name;
    }

    public function getRoleLabelAttribute(): ?string
    {
        if (app()->getLocale() === 'en') {
            return match ($this->role?->name) {
                'admin' => 'Administrator',
                'manager' => 'Metrology Manager',
                'metrology' => 'Metrology Technician',
                'commercial' => 'Commercial Agent',
                'client' => 'Client',
                default => 'User',
            };
        }

        return $this->role?->label ?? 'Utilisateur';
    }

    public function getCanManageCertificatesAttribute(): bool
    {
        return $this->canPerformManagerAction();
    }

    public function assignRole(string|Role $role): static
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->role_id = $role->id;
        $this->save();
        $this->load('role');

        return $this;
    }

    public function hasRole(string|array $roles): bool
    {
        if (! $this->role) {
            return false;
        }

        if (is_array($roles)) {
            return in_array($this->role->name, $roles);
        }

        return $this->role->name === $roles;
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        if (! $this->role) {
            return false;
        }

        return $this->role->permissions->contains('name', $permission);
    }

    public function isClient(): bool
    {
        return $this->hasRole('client');
    }

    public function isCommercial(): bool
    {
        return $this->hasRole('commercial');
    }

    public function isMetrology(): bool
    {
        return $this->hasRole('metrology');
    }

    public function isManager(): bool
    {
        return $this->hasRole('manager');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function canPerformManagerAction(): bool
    {
        if ($this->isAdmin() || $this->isManager()) {
            return true;
        }

        // Section 28: Manager Absence / Delegation: Authorized Metrology personnel
        if ($this->isMetrology() && $this->is_delegated_manager) {
            return true;
        }

        return false;
    }
}
