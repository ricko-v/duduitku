<?php

namespace App\Http\Controllers\Money;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\FiscalMonth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FiscalMonthController extends Controller
{
    public function close(Request $request): RedirectResponse
    {
        $request->validate([
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year = $request->input('year');
        $month = $request->input('month');

        $fiscalMonth = FiscalMonth::query()
            ->where('user_id', $request->user()->id)
            ->forPeriod($year, $month)
            ->first();

        if ($fiscalMonth && $fiscalMonth->isClosed()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('This fiscal month is already closed.')]);

            return to_route('money.dashboard');
        }

        $accounts = $request->user()->accounts()->active()->get();
        $balancesSnapshot = [
            'accounts' => $accounts->map(fn (Account $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'balance' => $account->balance(),
            ])->toArray(),
            'total' => $accounts->sum(fn (Account $account) => $account->balance()),
        ];

        FiscalMonth::updateOrCreate(
            ['user_id' => $request->user()->id, 'year' => $year, 'month' => $month],
            [
                'status' => 'closed',
                'closed_at' => now(),
                'balances_snapshot' => $balancesSnapshot,
                'opened_at' => $fiscalMonth?->opened_at ?? now(),
            ]
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Fiscal month closed. Transactions are now locked.')]);

        return to_route('money.dashboard', ['year' => $year, 'month' => $month]);
    }

    public function open(Request $request): RedirectResponse
    {
        $request->validate([
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year = $request->input('year');
        $month = $request->input('month');

        $fiscalMonth = FiscalMonth::query()
            ->where('user_id', $request->user()->id)
            ->forPeriod($year, $month)
            ->first();

        if (! $fiscalMonth || $fiscalMonth->isOpen()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('This fiscal month is not closed.')]);

            return to_route('money.dashboard');
        }

        $fiscalMonth->update([
            'status' => 'open',
            'closed_at' => null,
            'balances_snapshot' => null,
            'opened_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'warning', 'message' => __('Fiscal month reopened. Transactions can now be modified.')]);

        return to_route('money.dashboard', ['year' => $year, 'month' => $month]);
    }
}
