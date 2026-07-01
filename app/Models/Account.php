<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $type
 * @property string $currency
 * @property string|null $icon
 * @property string|null $color
 * @property bool $is_default
 * @property Carbon|null $archived_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'currency',
        'icon',
        'color',
        'is_default',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'archived_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function balance(): float
    {
        $income = $this->transactions()->where('type', 'income')->sum('amount');
        $expense = $this->transactions()->where('type', 'expense')->sum('amount');

        $transfersIn = $this->transactions()
            ->where('type', 'transfer')
            ->where('transfer_account_id', '!=', $this->id)
            ->sum('amount');

        $transfersOut = Transaction::where('transfer_account_id', $this->id)
            ->where('type', 'transfer')
            ->sum('amount');

        return (float) $income - (float) $expense + (float) $transfersIn - (float) $transfersOut;
    }

    public function scopeActive($query)
    {
        return $query->whereNull('archived_at');
    }
}
