<?php

namespace App\Http\Controllers\Money;

use App\Http\Controllers\Controller;
use App\Http\Requests\Money\StoreAccountRequest;
use App\Http\Requests\Money\UpdateAccountRequest;
use App\Models\Account;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $accounts = $request->user()
            ->accounts()
            ->active()
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get()
            ->map(fn (Account $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'currency' => $account->currency,
                'icon' => $account->icon,
                'color' => $account->color,
                'is_default' => $account->is_default,
                'balance' => $account->balance(),
            ]);

        return Inertia::render('money/accounts', [
            'accounts' => $accounts,
        ]);
    }

    public function store(StoreAccountRequest $request): RedirectResponse
    {
        $account = $request->user()->accounts()->create($request->validated());

        if ($request->boolean('is_default')) {
            $request->user()->accounts()->where('id', '!=', $account->id)->update(['is_default' => false]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Account created.')]);

        return to_route('money.accounts.index');
    }

    public function update(UpdateAccountRequest $request, Account $account): RedirectResponse
    {
        $account->update($request->validated());

        if ($request->boolean('is_default')) {
            $request->user()->accounts()->where('id', '!=', $account->id)->update(['is_default' => false]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Account updated.')]);

        return to_route('money.accounts.index');
    }

    public function destroy(Request $request, Account $account): RedirectResponse
    {
        $account->update(['archived_at' => now()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Account archived.')]);

        return to_route('money.accounts.index');
    }
}
