<?php

namespace Database\Factories;

use App\Models\AiInsight;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AiInsight>
 */
class AiInsightFactory extends Factory
{
    protected $model = AiInsight::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => 'spending_insight',
            'content' => ['summary' => 'Test insight', 'tips' => ['Save more']],
            'period' => now()->format('Y-m'),
        ];
    }

    public function budgetAdvice(): static
    {
        return $this->state(fn () => ['type' => 'budget_advice']);
    }

    public function forecast(): static
    {
        return $this->state(fn () => ['type' => 'forecast']);
    }
}
