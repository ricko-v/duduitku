<?php

namespace App\Ai\Tools;

use App\Ai\UserContext;
use App\Models\Budget;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetBudgetStatus implements Tool
{
    public function __construct(protected UserContext $context) {}

    public function description(): Stringable|string
    {
        return 'Dapatkan status anggaran bulan ini. Mengembalikan setiap kategori anggaran dengan jumlah yang dianggarkan, jumlah yang dibelanjakan, sisa, dan apakah melebihi anggaran.';
    }

    public function handle(Request $request): Stringable|string
    {
        $user = $this->context->getUser() ?? auth()->user();

        if (! $user) {
            return 'Tidak ada pengguna terotentikasi.';
        }

        $now = now();

        $budgets = Budget::query()
            ->where('user_id', $user->id)
            ->whereYear('month', $now->year)
            ->whereMonth('month', $now->month)
            ->with('category:id,name')
            ->get()
            ->map(fn (Budget $budget) => [
                'kategori' => $budget->category->name,
                'dianggarkan' => (float) $budget->amount,
                'dibelanjakan' => $budget->spent(),
                'sisa' => $budget->remaining(),
                'persentase' => round($budget->percentage(), 1),
                'melebihi_anggaran' => $budget->percentage() > 100,
            ]);

        if ($budgets->isEmpty()) {
            return 'Belum ada anggaran untuk bulan ini.';
        }

        return $budgets->toJson();
    }

    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}
