<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class MoneySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();

        if (! $user) {
            return;
        }

        $expenseCategories = [
            ['name' => 'Food & Dining', 'icon' => 'utensils', 'color' => '#ef4444', 'sort_order' => 1],
            ['name' => 'Transportation', 'icon' => 'car', 'color' => '#f97316', 'sort_order' => 2],
            ['name' => 'Shopping', 'icon' => 'shopping-bag', 'color' => '#eab308', 'sort_order' => 3],
            ['name' => 'Bills & Utilities', 'icon' => 'zap', 'color' => '#22c55e', 'sort_order' => 4],
            ['name' => 'Entertainment', 'icon' => 'film', 'color' => '#3b82f6', 'sort_order' => 5],
            ['name' => 'Health', 'icon' => 'heart', 'color' => '#ec4899', 'sort_order' => 6],
            ['name' => 'Education', 'icon' => 'book-open', 'color' => '#8b5cf6', 'sort_order' => 7],
            ['name' => 'Other Expense', 'icon' => 'more-horizontal', 'color' => '#6b7280', 'sort_order' => 8],
        ];

        $incomeCategories = [
            ['name' => 'Salary', 'icon' => 'briefcase', 'color' => '#22c55e', 'sort_order' => 1],
            ['name' => 'Freelance', 'icon' => 'laptop', 'color' => '#3b82f6', 'sort_order' => 2],
            ['name' => 'Investment', 'icon' => 'trending-up', 'color' => '#8b5cf6', 'sort_order' => 3],
            ['name' => 'Other Income', 'icon' => 'plus-circle', 'color' => '#6b7280', 'sort_order' => 4],
        ];

        foreach ($expenseCategories as $category) {
            Category::create([...$category, 'user_id' => $user->id, 'type' => 'expense']);
        }

        foreach ($incomeCategories as $category) {
            Category::create([...$category, 'user_id' => $user->id, 'type' => 'income']);
        }
    }
}
