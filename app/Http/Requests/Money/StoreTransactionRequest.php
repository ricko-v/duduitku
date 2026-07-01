<?php

namespace App\Http\Requests\Money;

use App\Models\FiscalMonth;
use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'required_if:type,income,expense|nullable|exists:categories,id',
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'date' => 'required|date',
            'receipt_path' => 'nullable|string',
            'merchant_name' => 'nullable|string|max:255',
            'transfer_account_id' => 'required_if:type,transfer|nullable|exists:accounts,id|different:account_id',
        ];
    }

    public function after(): array
    {
        return [
            function ($validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $date = $this->input('date') ? now()->parse($this->input('date')) : now();
                $fiscalMonth = FiscalMonth::query()
                    ->where('user_id', $this->user()->id)
                    ->forPeriod($date->year, $date->month)
                    ->first();

                if ($fiscalMonth && $fiscalMonth->isClosed()) {
                    $validator->errors()->add('date', 'This fiscal month is closed. Reopen it first to make changes.');
                }
            },
        ];
    }
}
