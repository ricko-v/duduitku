<?php

namespace App\Ai\Tools;

use App\Ai\UserContext;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetTransactions implements Tool
{
    public function __construct(protected UserContext $context) {}

    public function description(): Stringable|string
    {
        return 'Ambil transaksi terbaru pengguna dengan filter opsional: bulan (format YYYY-MM), nama kategori, dan tipe transaksi (income/expense/transfer). Maksimal 20 transaksi.';
    }

    public function handle(Request $request): Stringable|string
    {
        $user = $this->context->getUser() ?? auth()->user();

        if (! $user) {
            return 'Tidak ada pengguna terotentikasi.';
        }

        $query = $user->transactions()->with('category:id,name', 'account:id,name')->latest('date')->limit(20);

        if (! empty($request['month'])) {
            $date = now()->parse($request['month'].'-01');
            $query->forPeriod($date->year, $date->month);
        }

        if (! empty($request['category'])) {
            $query->whereHas('category', fn ($q) => $q->where('name', 'like', '%'.$request['category'].'%'));
        }

        if (! empty($request['type'])) {
            $query->where('type', $request['type']);
        }

        $transactions = $query->get()->map(fn ($t) => [
            'date' => $t->date->format('Y-m-d'),
            'description' => $t->description,
            'amount' => (float) $t->amount,
            'type' => $t->type,
            'category' => $t->category?->name,
            'account' => $t->account->name,
        ]);

        return $transactions->isEmpty() ? 'Tidak ada transaksi ditemukan.' : $transactions->toJson();
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'month' => $schema->string()->description('Filter berdasarkan bulan dalam format YYYY-MM, contoh: '.now()->format('Y-m')),
            'category' => $schema->string()->description('Filter berdasarkan nama kategori, contoh: Makanan'),
            'type' => $schema->string()->description('Filter berdasarkan tipe: income, expense, atau transfer'),
        ];
    }
}
