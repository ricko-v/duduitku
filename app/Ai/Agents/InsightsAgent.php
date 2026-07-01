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
class InsightsAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'Kamu adalah penasihat keuangan pribadi untuk pengguna Indonesia. Analisis data pengeluaran yang diberikan dan berikan insight yang dapat ditindaklanjuti. Fokus pada pola pengeluaran, pengeluaran tidak biasa, dan tips praktis untuk menghemat uang. Gunakan Bahasa Indonesia yang natural dan santai. Semua nominal dalam Rupiah (Rp). Selalu balas dalam Bahasa Indonesia.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'summary' => $schema->string()->required(),
            'top_categories' => $schema->array()->items(
                $schema->object(fn($s) => [
                    'category' => $s->string()->required(),
                    'amount' => $s->number()->required(),
                    'percentage' => $s->number()->required(),
                ])
            )->required(),
            'trends' => $schema->array()->items($schema->string())->required(),
            'tips' => $schema->array()->items($schema->string())->required(),
        ];
    }
}
