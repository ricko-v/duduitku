<?php

namespace App\Http\Controllers\Money;

use App\Http\Controllers\Controller;
use App\Http\Requests\Money\StoreBudgetRequest;
use App\Http\Requests\Money\UpdateBudgetRequest;
use App\Models\Budget;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $now = now();
        $year = (int) $request->input('year', $now->year);
        $month = (int) $request->input('month', $now->month);

        $budgets = Budget::query()
            ->where('user_id', $request->user()->id)
            ->whereYear('month', $year)
            ->whereMonth('month', $month)
            ->with('category:id,name,color,icon')
            ->get()
            ->map(fn (Budget $budget) => [
                'id' => $budget->id,
                'category_id' => $budget->category_id,
                'category' => $budget->category->name,
                'color' => $budget->category->color,
                'icon' => $budget->category->icon,
                'amount' => (float) $budget->amount,
                'spent' => $budget->spent(),
                'remaining' => $budget->remaining(),
                'percentage' => $budget->percentage(),
            ]);

        $categories = $request->user()
            ->categories()
            ->expense()
            ->orderBy('name')
            ->get(['id', 'name', 'color', 'icon']);

        return Inertia::render('money/budgets', [
            'budgets' => $budgets,
            'categories' => $categories,
            'year' => $year,
            'month' => $month,
        ]);
    }

    public function store(StoreBudgetRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['month'] = now()->parse($data['month'])->startOfMonth();

        $request->user()->budgets()->updateOrCreate(
            [
                'category_id' => $data['category_id'],
                'month' => $data['month'],
            ],
            ['amount' => $data['amount']]
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Budget saved.')]);

        return to_route('money.budgets.index');
    }

    public function update(UpdateBudgetRequest $request, Budget $budget): RedirectResponse
    {
        $budget->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Budget updated.')]);

        return to_route('money.budgets.index');
    }

    public function destroy(Request $request, Budget $budget): RedirectResponse
    {
        $budget->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Budget deleted.')]);

        return to_route('money.budgets.index');
    }
}
