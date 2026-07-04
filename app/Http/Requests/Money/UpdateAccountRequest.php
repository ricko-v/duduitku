<?php

namespace App\Http\Requests\Money;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:bank,cash,credit_card,savings',
            'currency' => 'nullable|string|size:3',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'is_default' => 'nullable|boolean',
        ];
    }
}
