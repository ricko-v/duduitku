<?php

namespace App\Http\Controllers\Money;

use App\Http\Controllers\Controller;
use App\Http\Requests\Money\StoreTransactionRequest;
use App\Http\Requests\Money\UpdateTransactionRequest;
use App\Models\FiscalMonth;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = $request->user()
            ->transactions()
            ->with(['category:id,name,color,icon', 'account:id,name,color', 'transferAccount:id,name,color']);

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('account_id')) {
            $query->where('account_id', $request->input('account_id'));
        }

        if ($request->filled('search')) {
            $query->where('description', 'like', '%'.$request->input('search').'%');
        }

        if ($request->filled('date_from')) {
            $query->where('date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('date', '<=', $request->input('date_to'));
        }

        $transactions = $query->latest('date')->paginate(20);

        $categories = $request->user()->categories()->orderBy('name')->get(['id', 'name', 'type', 'color']);
        $accounts = $request->user()->accounts()->active()->orderBy('name')->get(['id', 'name', 'color']);

        return Inertia::render('money/transactions/index', [
            'transactions' => $transactions,
            'categories' => $categories,
            'accounts' => $accounts,
            'filters' => $request->only(['type', 'category_id', 'account_id', 'search', 'date_from', 'date_to']),
        ]);
    }

    public function create(Request $request): Response
    {
        $categories = $request->user()->categories()->orderBy('name')->get(['id', 'name', 'type', 'color']);
        $accounts = $request->user()->accounts()->active()->orderBy('name')->get(['id', 'name', 'color']);

        return Inertia::render('money/transactions/create', [
            'categories' => $categories,
            'accounts' => $accounts,
        ]);
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($data['type'] === 'transfer') {
            DB::transaction(function () use ($data, $request) {
                $request->user()->transactions()->create([
                    'account_id' => $data['account_id'],
                    'category_id' => null,
                    'type' => 'transfer',
                    'amount' => $data['amount'],
                    'description' => $data['description'],
                    'notes' => $data['notes'] ?? null,
                    'date' => $data['date'],
                    'transfer_account_id' => $data['transfer_account_id'],
                ]);
            });
        } else {
            $request->user()->transactions()->create($data);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction created.')]);

        return to_route('money.transactions.index');
    }

    public function edit(Transaction $transaction): Response
    {
        $categories = $transaction->user->categories()->orderBy('name')->get(['id', 'name', 'type', 'color']);
        $accounts = $transaction->user->accounts()->active()->orderBy('name')->get(['id', 'name', 'color']);

        return Inertia::render('money/transactions/create', [
            'transaction' => $transaction,
            'categories' => $categories,
            'accounts' => $accounts,
        ]);
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        $transaction->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction updated.')]);

        return to_route('money.transactions.index');
    }

    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        $date = $transaction->date;
        $fiscalMonth = FiscalMonth::query()
            ->where('user_id', $request->user()->id)
            ->forPeriod($date->year, $date->month)
            ->first();

        if ($fiscalMonth && $fiscalMonth->isClosed()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('This fiscal month is closed. Reopen it first to make changes.')]);

            return to_route('money.transactions.index');
        }

        $transaction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Transaction deleted.')]);

        return to_route('money.transactions.index');
    }
}
