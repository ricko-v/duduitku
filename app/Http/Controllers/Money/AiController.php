<?php

namespace App\Http\Controllers\Money;

use App\Ai\Agents\BudgetAdvisorAgent;
use App\Ai\Agents\CategorizeAgent;
use App\Ai\Agents\InsightsAgent;
use App\Ai\Agents\MoneyChatAgent;
use App\Ai\Agents\ReceiptScannerAgent;
use App\Http\Controllers\Controller;
use App\Models\AiInsight;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiController extends Controller
{
    public function categorize(Request $request): JsonResponse
    {
        $request->validate(['description' => 'required|string|max:255']);

        $categories = $request->user()
            ->categories()
            ->expense()
            ->pluck('name')
            ->implode(', ');

        if (empty($categories)) {
            return response()->json(['category' => null, 'confidence' => 0]);
        }

        $response = CategorizeAgent::make()->prompt(
            "Transaction description: \"{$request->description}\"\nValid categories: {$categories}"
        );

        return response()->json([
            'category' => $response['category'],
            'confidence' => $response['confidence'],
        ]);
    }

    public function scanReceipt(Request $request): JsonResponse
    {
        $request->validate(['receipt' => 'required|image|max:10240']);

        $categories = $request->user()
            ->categories()
            ->expense()
            ->pluck('name')
            ->implode(', ');

        $response = ReceiptScannerAgent::make()->prompt(
            "Extract all data from this receipt. Suggest a category from: {$categories}",
            attachments: [$request->file('receipt')]
        );

        return response()->json([
            'merchant' => $response['merchant'],
            'amount' => $response['amount'],
            'date' => $response['date'],
            'items' => $response['items'],
            'suggested_category' => $response['suggested_category'],
        ]);
    }

    public function insights(Request $request): Response
    {
        $user = $request->user();
        $now = now();
        $period = $request->input('period', $now->format('Y-m'));
        $refresh = $request->boolean('refresh');

        if (! $refresh) {
            $cached = AiInsight::query()
                ->where('user_id', $user->id)
                ->ofType('spending_insight')
                ->forPeriod($period)
                ->first();

            if ($cached) {
                return Inertia::render('money/insights', [
                    'insights' => $cached->content,
                    'period' => $period,
                    'cached' => true,
                ]);
            }
        }

        $date = now()->parse($period.'-01');

        $income = (float) $user->transactions()->income()->forPeriod($date->year, $date->month)->sum('amount');
        $expense = (float) $user->transactions()->expense()->forPeriod($date->year, $date->month)->sum('amount');

        $breakdown = $user->transactions()
            ->expense()
            ->forPeriod($date->year, $date->month)
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(fn ($item) => [
                'category' => $item->category?->name ?? 'Uncategorized',
                'amount' => (float) $item->total,
            ])
            ->sortByDesc('amount')
            ->values();

        $prompt = "Spending data for {$period}:\n";
        $prompt .= "Total Income: Rp ".number_format($income, 0, ',', '.')."\n";
        $prompt .= "Total Expense: Rp ".number_format($expense, 0, ',', '.')."\n";
        $prompt .= "Net: Rp ".number_format($income - $expense, 0, ',', '.')."\n\n";
        $prompt .= "Expense breakdown by category:\n";

        foreach ($breakdown as $item) {
            $pct = $expense > 0 ? round(($item['amount'] / $expense) * 100, 1) : 0;
            $prompt .= "- {$item['category']}: Rp ".number_format($item['amount'], 0, ',', '.')." ({$pct}%)\n";
        }

        $response = InsightsAgent::make()->prompt($prompt);

        $insights = [
            'summary' => $response['summary'],
            'top_categories' => $response['top_categories'],
            'trends' => $response['trends'],
            'tips' => $response['tips'],
        ];

        AiInsight::updateOrCreate(
            ['user_id' => $user->id, 'type' => 'spending_insight', 'period' => $period],
            ['content' => $insights]
        );

        return Inertia::render('money/insights', [
            'insights' => $insights,
            'period' => $period,
            'cached' => false,
        ]);
    }

    public function budgetAdvice(Request $request): JsonResponse
    {
        $user = $request->user();

        $months = collect();
        for ($i = 2; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months->push([
                'period' => $date->format('Y-m'),
                'income' => (float) $user->transactions()->income()->forPeriod($date->year, $date->month)->sum('amount'),
                'expense' => (float) $user->transactions()->expense()->forPeriod($date->year, $date->month)->sum('amount'),
                'categories' => $user->transactions()
                    ->expense()
                    ->forPeriod($date->year, $date->month)
                    ->selectRaw('category_id, SUM(amount) as total')
                    ->groupBy('category_id')
                    ->with('category:id,name')
                    ->get()
                    ->map(fn ($item) => [
                        'category' => $item->category?->name ?? 'Uncategorized',
                        'amount' => (float) $item->total,
                    ])
                    ->toArray(),
            ]);
        }

        $prompt = "Spending history for the last 3 months:\n\n";
        foreach ($months as $month) {
            $prompt .= "{$month['period']}:\n";
            $prompt .= "  Income: Rp ".number_format($month['income'], 0, ',', '.')."\n";
            $prompt .= "  Expense: Rp ".number_format($month['expense'], 0, ',', '.')."\n";
            $prompt .= "  Categories:\n";
            foreach ($month['categories'] as $cat) {
                $prompt .= "    - {$cat['category']}: Rp ".number_format($cat['amount'], 0, ',', '.')."\n";
            }
            $prompt .= "\n";
        }

        $prompt .= "Suggest realistic monthly budgets for each expense category. Consider the spending patterns and suggest amounts that are practical.";

        $response = BudgetAdvisorAgent::make()->prompt($prompt);

        return response()->json([
            'budgets' => $response['budgets'],
            'overall_advice' => $response['overall_advice'],
        ]);
    }
}
