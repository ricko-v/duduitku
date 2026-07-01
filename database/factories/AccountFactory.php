<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->word(),
            'type' => fake()->randomElement(['bank', 'cash', 'credit_card', 'savings']),
            'currency' => 'IDR',
            'icon' => null,
            'color' => fake()->safeColorName(),
            'is_default' => false,
            'archived_at' => null,
        ];
    }

    public function bank(): static
    {
        return $this->state(fn () => ['type' => 'bank']);
    }

    public function cash(): static
    {
        return $this->state(fn () => ['type' => 'cash']);
    }

    public function default(): static
    {
        return $this->state(fn () => ['is_default' => true]);
    }

    public function archived(): static
    {
        return $this->state(fn () => ['archived_at' => now()]);
    }
}
