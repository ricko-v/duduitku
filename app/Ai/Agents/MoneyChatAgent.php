<?php

namespace App\Ai\Agents;

use App\Ai\Tools\GetBudgetStatus;
use App\Ai\Tools\GetSpendingSummary;
use App\Ai\Tools\GetTransactions;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

#[Provider(Lab::Gemini)]
#[Model('gemini-3.1-flash-lite')]
#[Timeout(120)]
class MoneyChatAgent implements Agent, Conversational, HasTools
{
    use Promptable, RemembersConversations;

    public function instructions(): string
    {
        return 'Kamu adalah asisten keuangan pribadi untuk pengguna Indonesia. Bantu mereka memahami pengeluaran, anggaran, dan pola keuangan mereka. Gunakan tools untuk query data keuangan saat dibutuhkan. Selalu balas dalam Bahasa Indonesia yang natural dan santai. Semua nominal dalam Rupiah (Rp). Format angka besar dengan pemisah ribuan (contoh: Rp 1.250.000).';
    }

    public function tools(): iterable
    {
        return [
            app(GetTransactions::class),
            app(GetSpendingSummary::class),
            app(GetBudgetStatus::class),
        ];
    }
}
