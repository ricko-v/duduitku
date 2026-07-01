<?php

use App\Http\Controllers\Money\AccountController;
use App\Http\Controllers\Money\AiController;
use App\Http\Controllers\Money\BudgetController;
use App\Http\Controllers\Money\CategoryController;
use App\Http\Controllers\Money\ChatController;
use App\Http\Controllers\Money\DashboardController;
use App\Http\Controllers\Money\FiscalMonthController;
use App\Http\Controllers\Money\TransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('money')->name('money.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('accounts', AccountController::class)->except(['show', 'create', 'edit']);
    Route::resource('categories', CategoryController::class)->except(['show', 'create', 'edit']);
    Route::resource('transactions', TransactionController::class)->except(['show']);
    Route::resource('budgets', BudgetController::class)->except(['show', 'create', 'edit']);

    Route::post('/fiscal-months/close', [FiscalMonthController::class, 'close'])->name('fiscal.close');
    Route::post('/fiscal-months/open', [FiscalMonthController::class, 'open'])->name('fiscal.open');

    Route::post('/ai/categorize', [AiController::class, 'categorize'])->name('ai.categorize');
    Route::post('/ai/scan-receipt', [AiController::class, 'scanReceipt'])->name('ai.scan-receipt');
    Route::get('/ai/insights', [AiController::class, 'insights'])->name('ai.insights');
    Route::get('/ai/budget-advice', [AiController::class, 'budgetAdvice'])->name('ai.budget-advice');

    Route::get('/chat', [ChatController::class, 'index'])->name('chat');
    Route::post('/chat', [ChatController::class, 'send'])->name('chat.send');
});
