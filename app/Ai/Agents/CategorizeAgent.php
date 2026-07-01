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
class CategorizeAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are a transaction categorizer for a personal finance app. Given a transaction description and a list of valid categories, return the best matching category with a confidence score between 0 and 1. Only use categories from the provided list. If no category fits well, pick the closest one with low confidence.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'category' => $schema->string()->required(),
            'confidence' => $schema->number()->required(),
        ];
    }
}
