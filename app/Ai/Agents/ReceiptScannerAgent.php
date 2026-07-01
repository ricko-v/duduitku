<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

#[Provider(Lab::Gemini)]
#[Model('gemini-3.1-flash-lite')]
class ReceiptScannerAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'Extract structured data from receipt images. Return the merchant name, total amount in Indonesian Rupiah (IDR, as a number without currency symbols), the date in YYYY-MM-DD format, a list of line items, and a suggested expense category. If you cannot read something clearly, use your best estimate.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'merchant' => $schema->string()->required(),
            'amount' => $schema->number()->required(),
            'date' => $schema->string()->required(),
            'items' => $schema->array()->items($schema->string())->required(),
            'suggested_category' => $schema->string()->required(),
        ];
    }
}
