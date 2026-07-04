<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property array $content
 * @property string $period
 */
class AiInsight extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'content',
        'period',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForPeriod($query, string $period)
    {
        return $query->where('period', $period);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
