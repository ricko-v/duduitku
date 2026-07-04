<?php

namespace App\Ai\Tools;

use App\Ai\UserContext;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetSpendingSummary implements Tool
{
    public function __construct(protected UserContext $context) {}

    public function description(): Stringable|string
    {
        return 'Dapatkan ringkasan pengeluaran untuk bulan tertentu, dipecah berdasarkan kategori. Mengembalikan total pemasukan, total pengeluaran, bersih, dan rincian per kategori.';
    }

    public function handle(Request $request): Stringable|string
    {
        $user = $this->context->getUser() ?? auth()->user();

        if (! $user) {
            return 'Tidak ada pengguna terotentikasi.';
        }

        $month = ! empty($request['month']) ? now()->parse($request['month'].'-01') : now();

        $income = (float) $user->transactions()
            ->income()
            ->forPeriod($month->year, $month->month)
            ->sum('amount');

        $expense = (float) $user->transactions()
            ->expense()
            ->forPeriod($month->year, $month->month)
            ->sum('amount');

        $breakdown = $user->transactions()
            ->expense()
            ->forPeriod($month->year, $month->month)
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->with('category:id,name')
            ->get()
            ->map(fn ($item) => [
                'category' => $item->category?->name ?? 'Tanpa Kategori',
                'amount' => (float) $item->total,
            ])
            ->sortByDesc('amount')
            ->values();

        return json_encode([
            'periode' => $month->format('Y-m'),
            'total_pemasukan' => $income,
            'total_pengeluaran' => $expense,
            'bersih' => $income - $expense,
            'kategori' => $breakdown->toArray(),
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'month' => $schema->string()->description('Bulan dalam format YYYY-MM, contoh: '.now()->format('Y-m')),
        ];
    }
}
