import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHideBalance } from '@/hooks/use-hide-balance';
import { formatIDR, maskIDR, formatDate } from '@/lib/format-money';
import { dashboard } from '@/routes';
import { index as transactionIndex, create as transactionCreate } from '@/routes/money/transactions';

interface Transaction {
    id: number;
    type: string;
    amount: number;
    description: string;
    date: string;
    category: { name: string; color: string } | null;
    account: { name: string; color: string };
    transferAccount: { name: string } | null;
}

interface Category { id: number; name: string; type: string; color: string; }
interface Account { id: number; name: string; color: string; }
interface Paginated<T> { data: T[]; current_page: number; last_page: number; per_page: number; total: number; }

interface Props {
    transactions: Paginated<Transaction>;
    categories: Category[];
    accounts: Account[];
    filters: { type?: string; category_id?: string; account_id?: string; search?: string; };
}

export default function TransactionIndex({ transactions, categories, accounts, filters }: Props) {
    const { hidden } = useHideBalance();
    const setFilter = (key: string, value: string) => {
        router.get('/money/transactions', { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    return (
        <>
            <Head title="Catatan Transaksi" />

            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold tracking-wider text-[#f59e0b] uppercase" style={{ letterSpacing: '0.1em' }}>Catatan Transaksi</h2>
                        <p className="text-xs text-muted-foreground">{transactions.total} data keuangan negara</p>
                    </div>
                    <Button asChild className="bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/30 text-xs font-bold tracking-wider uppercase">
                        <Link href={transactionCreate()}><Plus className="h-4 w-4 mr-1" /> Transaksi Baru</Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Cari transaksi negara..." defaultValue={filters.search} onChange={(e) => setFilter('search', e.target.value)} className="w-48 pl-9 bg-card border-border text-sm h-9 focus-visible:ring-[#f59e0b]/30" />
                    </div>
                    <Select value={filters.type ?? ''} onValueChange={(v) => setFilter('type', v)}>
                        <SelectTrigger className="w-32 bg-card border-border h-9 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            <SelectItem value="">Semua Tipe</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.category_id ?? ''} onValueChange={(v) => setFilter('category_id', v)}>
                        <SelectTrigger className="w-40 bg-card border-border h-9 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            <SelectItem value="">Semua Kategori</SelectItem>
                            {categories.map((cat) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filters.account_id ?? ''} onValueChange={(v) => setFilter('account_id', v)}>
                        <SelectTrigger className="w-40 bg-card border-border h-9 text-xs"><SelectValue placeholder="Vault" /></SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                            <SelectItem value="">Semua Kas</SelectItem>
                            {accounts.map((acc) => <SelectItem key={acc.id} value={String(acc.id)}>{acc.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="gaming-card rounded-xl overflow-hidden">
                    <div className="divide-y divide-[#2a2a3e]/50">
                        {transactions.data.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${tx.type === 'income' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20' : tx.type === 'expense' ? 'bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20' : 'bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20'}`}>
                                        {tx.type === 'income' ? '↓' : tx.type === 'expense' ? '↑' : '↔'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{tx.description}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {tx.type === 'transfer' ? `→ ${tx.transferAccount?.name ?? ''}` : tx.category?.name ?? 'Tidak Berkategori'} · {tx.account.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className={`text-sm font-bold tabular-nums ${tx.type === 'income' ? 'text-[#f59e0b]' : 'text-[#f43f5e]'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{hidden ? maskIDR(tx.amount) : formatIDR(tx.amount)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">{formatDate(tx.date)}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-[#f43f5e] hover:bg-[#f43f5e]/10" onClick={() => {
 if (confirm('Hapus transaksi ini?')) {
router.delete(`/money/transactions/${tx.id}`);
} 
}}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {transactions.data.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-xs text-muted-foreground">Belum ada transaksi negara tercatat</p>
                            </div>
                        )}
                    </div>
                </div>

                {transactions.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {Array.from({ length: transactions.last_page }, (_, i) => i + 1).map((page) => (
                            <Button key={page} size="sm" className={`h-8 w-8 text-xs font-bold ${page === transactions.current_page ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30' : 'bg-card text-muted-foreground border border-border hover:text-[#f59e0b]'}`} onClick={() => router.get('/money/transactions', { ...filters, page })}>
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

TransactionIndex.layout = {
    breadcrumbs: [
        { title: 'Istana Negara', href: dashboard() },
        { title: 'Catatan Negara', href: transactionIndex() },
    ],
};
