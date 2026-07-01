<?php

namespace App\Http\Requests\Money;

use App\Models\FiscalMonth;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => 'sometimes|required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'sometimes|required|in:income,expense,transfer',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'description' => 'sometimes|required|string|max:255',
            'notes' => 'nullable|string',
            'date' => 'sometimes|required|date',
            'receipt_path' => 'nullable|string',
            'merchant_name' => 'nullable|string|max:255',
            'transfer_account_id' => 'nullable|exists:accounts,id',
        ];
    }

    public function after(): array
    {
        return [
            function ($validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $date = $this->input('date') ? now()->parse($this->input('date')) : $this->route('transaction')->date;
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
