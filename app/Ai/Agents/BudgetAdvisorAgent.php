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
class BudgetAdvisorAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'Kamu adalah penasihat anggaran untuk pengguna Indonesia. Berdasarkan riwayat pengeluaran 3+ bulan, sarankan anggaran bulanan yang realistis untuk setategori pengeluaran. Pertimbangkan pola pengeluaran, tingkat pendapatan, dan tujuan menabung. Semua nominal dalam Rupiah (Rp). Bersikap praktis dan spesifik. Selalu balas dalam Bahasa Indonesia.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'budgets' => $schema->array()->items(
                $schema->object(fn($s) => [
                    'category' => $s->string()->required(),
                    'suggested_amount' => $s->number()->required(),
                    'reasoning' => $s->string()->required(),
                ])
            )->required(),
            'overall_advice' => $schema->string()->required(),
        ];
    }
}
