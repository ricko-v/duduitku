<?php

namespace App\Http\Requests\Money;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'sometimes|required|exists:categories,id',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'month' => 'sometimes|required|date',
        ];
    }
}
