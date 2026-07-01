<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $category_id
 * @property float $amount
 * @property Carbon $month
 */
class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'amount',
        'month',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'month' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function spent(): float
    {
        return (float) $this->category
            ->transactions()
            ->expense()
            ->whereYear('date', $this->month->year)
            ->whereMonth('date', $this->month->month)
            ->sum('amount');
    }

    public function remaining(): float
    {
        return (float) $this->amount - $this->spent();
    }

    public function percentage(): float
    {
        if ((float) $this->amount <= 0) {
            return 0;
        }

        return ($this->spent() / (float) $this->amount) * 100;
    }
}
