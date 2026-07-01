<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'category_id' => Category::factory()->expense(),
            'type' => 'expense',
            'amount' => fake()->randomFloat(2, 10000, 5000000),
            'description' => fake()->sentence(3),
            'notes' => null,
            'date' => fake()->dateTimeBetween('-3 months', 'now'),
            'receipt_path' => null,
            'merchant_name' => fake()->company(),
            'transfer_account_id' => null,
        ];
    }

    public function income(): static
    {
        return $this->state(fn () => [
            'type' => 'income',
            'category_id' => Category::factory()->income(),
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn () => [
            'type' => 'expense',
            'category_id' => Category::factory()->expense(),
        ]);
    }

    public function transfer(): static
    {
        return $this->state(fn () => [
            'type' => 'transfer',
            'category_id' => null,
            'transfer_account_id' => Account::factory(),
        ]);
    }
}
