<?php

namespace Database\Factories;

use App\Models\FiscalMonth;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FiscalMonth>
 */
class FiscalMonthFactory extends Factory
{
    protected $model = FiscalMonth::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'year' => now()->year,
            'month' => now()->month,
            'status' => 'open',
            'closed_at' => null,
            'balances_snapshot' => null,
            'opened_at' => now(),
        ];
    }

    public function closed(): static
    {
        return $this->state(fn () => [
            'status' => 'closed',
            'closed_at' => now(),
            'balances_snapshot' => ['accounts' => [], 'total' => 0],
        ]);
    }
}
