<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $account_id
 * @property int|null $category_id
 * @property string $type
 * @property float $amount
 * @property string $description
 * @property string|null $notes
 * @property Carbon $date
 * @property string|null $receipt_path
 * @property string|null $merchant_name
 * @property int|null $transfer_account_id
 */
class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'category_id',
        'type',
        'amount',
        'description',
        'notes',
        'date',
        'receipt_path',
        'merchant_name',
        'transfer_account_id',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transferAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'transfer_account_id');
    }

    public function scopeForPeriod($query, int $year, int $month)
    {
        return $query->whereYear('date', $year)->whereMonth('date', $month);
    }

    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }

    public function scopeTransfer($query)
    {
        return $query->where('type', 'transfer');
    }
}
