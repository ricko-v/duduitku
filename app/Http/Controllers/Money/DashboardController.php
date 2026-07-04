<?php

namespace App\Http\Controllers\Money;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Budget;
use App\Models\FiscalMonth;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $now = now();
        $year = (int) $request->input('year', $now->year);
        $month = (int) $request->input('month', $now->month);

        $accounts = $user->accounts()->active()->get();

        $totalBalance = $accounts->sum(fn (Account $account) => $account->balance());

        $monthlyIncome = (float) $user->transactions()
            ->income()
            ->forPeriod($year, $month)
            ->sum('amount');

        $monthlyExpense = (float) $user->transactions()
            ->expense()
            ->forPeriod($year, $month)
            ->sum('amount');

        $categoryBreakdown = $user->transactions()
            ->expense()
            ->forPeriod($year, $month)
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name,color,icon')
            ->get()
            ->map(fn ($item) => [
                'category' => $item->category?->name ?? 'Uncategorized',
                'color' => $item->category?->color ?? '#6b7280',
                'amount' => (float) $item->total,
            ]);

        $recentTransactions = $user->transactions()
            ->with(['category:id,name,color,icon', 'account:id,name,color'])
            ->latest('date')
            ->limit(10)
            ->get();

        $budgets = Budget::query()
            ->where('user_id', $user->id)
            ->whereYear('month', $year)
            ->whereMonth('month', $month)
            ->with('category:id,name,color,icon')
            ->get()
            ->map(fn (Budget $budget) => [
                'id' => $budget->id,
                'category' => $budget->category->name,
                'color' => $budget->category->color,
                'amount' => (float) $budget->amount,
                'spent' => $budget->spent(),
                'remaining' => $budget->remaining(),
                'percentage' => $budget->percentage(),
            ]);

        $fiscalMonth = FiscalMonth::query()
            ->where('user_id', $user->id)
            ->forPeriod($year, $month)
            ->first();

        return Inertia::render('dashboard', [
            'accounts' => $accounts->map(fn (Account $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'color' => $account->color,
                'balance' => $account->balance(),
            ]),
            'totalBalance' => $totalBalance,
            'monthlyIncome' => $monthlyIncome,
            'monthlyExpense' => $monthlyExpense,
            'net' => $monthlyIncome - $monthlyExpense,
            'categoryBreakdown' => $categoryBreakdown,
            'recentTransactions' => $recentTransactions,
            'budgets' => $budgets,
            'fiscalMonth' => $fiscalMonth ? [
                'year' => $fiscalMonth->year,
                'month' => $fiscalMonth->month,
                'status' => $fiscalMonth->status,
                'closed_at' => $fiscalMonth->closed_at?->toIso8601String(),
                'balances_snapshot' => $fiscalMonth->balances_snapshot,
            ] : null,
            'year' => $year,
            'month' => $month,
        ]);
    }
}
