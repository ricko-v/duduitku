import { Head, useForm, router } from '@inertiajs/react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Coins, Calendar, FileText, StickyNote, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useHideBalance } from '@/hooks/use-hide-balance';
import { formatIDR, maskIDR } from '@/lib/format-money';
import { dashboard } from '@/routes';
import { index as transactionIndex } from '@/routes/money/transactions';

interface Category { id: number; name: string; type: string; color: string; }
interface Account { id: number; name: string; color: string; type: string; }
interface Transaction { id: number; account_id: number; category_id: number | null; type: string; amount: number; description: string; notes: string | null; date: string; transfer_account_id: number | null; }

interface Props { transaction?: Transaction; categories: Category[]; accounts: Account[]; }

const typeConfig = {
    expense: { label: 'Expense', icon: ArrowUpRight, color: '#f43f5e', glow: 'gaming-glow-magenta', bg: 'bg-[#f43f5e]/10', border: 'border-[#f43f5e]/30', text: 'text-[#f43f5e]' },
    income: { label: 'Income', icon: ArrowDownLeft, color: '#f59e0b', glow: 'gaming-glow', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/30', text: 'text-[#f59e0b]' },
    transfer: { label: 'Transfer', icon: ArrowLeftRight, color: '#0ea5e9', glow: 'gaming-glow-cyan', bg: 'bg-[#0ea5e9]/10', border: 'border-[#0ea5e9]/30', text: 'text-[#0ea5e9]' },
};

export default function TransactionCreate({ transaction, categories, accounts }: Props) {
    const { hidden } = useHideBalance();
    const isEditing = !!transaction;

    const { data, setData, post, put, processing, errors } = useForm({
        account_id: String(transaction?.account_id ?? accounts[0]?.id ?? ''),
        category_id: String(transaction?.category_id ?? ''),
        type: transaction?.type ?? 'expense',
        amount: String(transaction?.amount ?? ''),
        description: transaction?.description ?? '',
        notes: transaction?.notes ?? '',
        date: transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
        transfer_account_id: String(transaction?.transfer_account_id ?? ''),
    });

    const [step, setStep] = useState<'type' | 'details'>(transaction ? 'details' : 'type');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(`/money/transactions/${transaction.id}`);
        } else {
            post('/money/transactions');
        }
    };

    const filteredCategories = categories.filter((c) => c.type === data.type);
    const tc = typeConfig[data.type as keyof typeof typeConfig];
    const selectedAccount = accounts.find((a) => String(a.id) === data.account_id);
    const selectedCategory = categories.find((c) => String(c.id) === data.category_id);
    const selectedTransfer = accounts.find((a) => String(a.id) === data.transfer_account_id);
    const amountNum = parseFloat(data.amount) || 0;

    return (
        <>
            <Head title={isEditing ? 'Edit Transaksi' : 'Transaksi Baru'} />

            <div className="flex h-[calc(100vh-3.5rem)] flex-col">
                {/* Header */}
                <div className="shrink-0 border-b border-border/50 px-5 py-3 bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.get(transactionIndex())}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-[#f59e0b]/30 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div>
                            <h2 className="text-sm font-bold tracking-wider text-[#f59e0b] uppercase" style={{ letterSpacing: '0.1em' }}>
                                {isEditing ? 'Edit Transaksi' : step === 'type' ? 'Transaksi Baru' : `Catat ${tc.label}`}
                            </h2>
                            <p className="text-[10px] text-muted-foreground">
                                {step === 'type' ? 'Pilih jenis transaksi' : 'Isi detailnya'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Step 1: Type Selection */}
                    {step === 'type' && !isEditing && (
                        <div className="p-5 space-y-4 animate-[fadeSlideUp_0.3s_ease_both]">
                            <p className="text-xs text-muted-foreground">Jenis transaksi apa ini?</p>
                            <div className="grid gap-3">
                                {(Object.keys(typeConfig) as Array<keyof typeof typeConfig>).map((type) => {
                                    const cfg = typeConfig[type];

                                    return (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setData('type', type);
                                                setStep('details');
                                            }}
                                            className={`group flex items-center gap-4 rounded-xl border p-5 text-left transition-all hover:scale-[1.01] ${cfg.bg} ${cfg.border} ${cfg.glow}`}
                                        >
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.bg} border ${cfg.border}`}>
                                                <cfg.icon className="h-6 w-6" style={{ color: cfg.color }} />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {type === 'expense' ? 'Catat pengeluaran dari kas negara' : type === 'income' ? 'Catat pemasukan ke kas negara' : 'Pindahkan dana antar kas'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details Form */}
                    {(step === 'details' || isEditing) && (
                        <form onSubmit={handleSubmit} className="p-5 space-y-5 animate-[fadeSlideUp_0.3s_ease_both]">
                            {/* Type Badge */}
                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setStep('type')}
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold tracking-wider uppercase border transition-all hover:scale-105 ${tc.bg} ${tc.border} ${tc.text}`}
                                >
                                    <tc.icon className="h-3.5 w-3.5" />
                                    {tc.label}
                                </button>
                            )}

                            {/* Amount - Hero Input */}
                            <div className="gaming-card rounded-xl p-6">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-3">Jumlah Rupiah</Label>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-muted-foreground">Rp</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-transparent text-4xl font-bold tabular-nums outline-none placeholder:text-muted-foreground"
                                        style={{ color: tc.color }}
                                        autoFocus
                                    />
                                </div>
                                {amountNum > 0 && (
                                    <p className="mt-2 text-xs text-muted-foreground">{hidden ? maskIDR(amountNum) : formatIDR(amountNum)}</p>
                                )}
                                <InputError message={errors.amount} />
                            </div>

                            {/* Vault Selection */}
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                                    {data.type === 'transfer' ? 'Dari Kas' : 'Brankas'}
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {accounts.map((acc) => {
                                        const selected = String(acc.id) === data.account_id;

                                        return (
                                            <button
                                                key={acc.id}
                                                type="button"
                                                onClick={() => setData('account_id', String(acc.id))}
                                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                                                    selected
                                                        ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/30 text-[#0ea5e9] gaming-glow-cyan'
                                                        : 'bg-card border-border text-secondary-foreground hover:border-[#0ea5e9]/20'
                                                }`}
                                            >
                                                <div className="h-2.5 w-2.5 rounded-full shadow-[0_0_4px_currentColor]" style={{ backgroundColor: acc.color, color: acc.color }} />
                                                {acc.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.account_id} />
                            </div>

                            {/* Transfer Destination */}
                            {data.type === 'transfer' && (
                                <div>
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Ke Kas</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {accounts.filter((a) => String(a.id) !== data.account_id).map((acc) => {
                                            const selected = String(acc.id) === data.transfer_account_id;

                                            return (
                                                <button
                                                    key={acc.id}
                                                    type="button"
                                                    onClick={() => setData('transfer_account_id', String(acc.id))}
                                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                                                        selected
                                                            ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/30 text-[#0ea5e9] gaming-glow-cyan'
                                                            : 'bg-card border-border text-secondary-foreground hover:border-[#0ea5e9]/20'
                                                    }`}
                                                >
                                                    <div className="h-2.5 w-2.5 rounded-full shadow-[0_0_4px_currentColor]" style={{ backgroundColor: acc.color, color: acc.color }} />
                                                    {acc.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.transfer_account_id} />
                                </div>
                            )}

                            {/* Category Selection */}
                            {data.type !== 'transfer' && (
                                <div>
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Category</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {filteredCategories.map((cat) => {
                                            const selected = String(cat.id) === data.category_id;

                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setData('category_id', String(cat.id))}
                                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                                                        selected
                                                            ? `border-[${cat.color}]/30 text-foreground`
                                                            : 'bg-card border-border text-secondary-foreground hover:border-border/80'
                                                    }`}
                                                    style={selected ? { backgroundColor: `${cat.color}15`, borderColor: `${cat.color}40`, color: cat.color } : {}}
                                                >
                                                    <div className="h-2.5 w-2.5 rounded-full shadow-[0_0_4px_currentColor]" style={{ backgroundColor: cat.color, color: cat.color }} />
                                                    {cat.name}
                                                </button>
                                            );
                                        })}
                                        {filteredCategories.length === 0 && (
                                            <p className="text-xs text-muted-foreground">Belum ada kategori untuk {data.type}</p>
                                        )}
                                    </div>
                                    <InputError message={errors.category_id} />
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                    <FileText className="h-3 w-3" /> Description
                                </Label>
                                <Input
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Apa yang terjadi?"
                                    className="bg-card border-border h-10 rounded-lg focus-visible:ring-[#f59e0b]/30"
                                />
                                <InputError message={errors.description} />
                            </div>

                            {/* Date */}
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                    <Calendar className="h-3 w-3" /> Date
                                </Label>
                                <Input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="bg-card border-border h-10 rounded-lg focus-visible:ring-[#f59e0b]/30"
                                />
                                <InputError message={errors.date} />
                            </div>

                            {/* Notes */}
                            <div>
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                    <StickyNote className="h-3 w-3" /> Notes
                                </Label>
                                <Textarea
                                    value={data.notes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                                    rows={2}
                                    placeholder="Catatan opsional..."
                                    className="bg-card border-border resize-none rounded-lg focus-visible:ring-[#f59e0b]/30"
                                />
                            </div>

                            {/* Preview Card */}
                            {amountNum > 0 && data.description && (
                                <div className="gaming-card rounded-xl p-4 animate-[fadeSlideUp_0.3s_ease_both]">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border" style={{ backgroundColor: `${tc.color}15`, borderColor: `${tc.color}30` }}>
                                                {data.type === 'transfer' ? (
                                                    <ArrowLeftRight className="h-4 w-4" style={{ color: tc.color }} />
                                                ) : (
                                                    <Coins className="h-4 w-4" style={{ color: tc.color }} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{data.description}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {data.type === 'transfer'
                                                        ? `${selectedAccount?.name ?? '?'} → ${selectedTransfer?.name ?? '?'}`
                                                        : `${selectedCategory?.name ?? 'Uncategorized'} · ${selectedAccount?.name ?? '?'}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold tabular-nums" style={{ color: tc.color }}>
                                            {data.type === 'expense' ? '-' : data.type === 'income' ? '+' : ''}{hidden ? maskIDR(amountNum) : formatIDR(amountNum)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="sticky bottom-0 pt-2 pb-1">
                                <Button
                                    type="submit"
                                    disabled={processing || !data.amount || !data.description}
                                    className={`w-full h-12 rounded-xl text-xs font-bold tracking-wider uppercase border transition-all ${tc.bg} ${tc.border} ${tc.text} ${tc.glow} hover:scale-[1.01] disabled:opacity-30 disabled:hover:scale-100`}
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                            Memproses...
                                        </span>
                                    ) : (
                                        isEditing ? 'Perbarui Entri' : `Catat ${tc.label}`
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}

TransactionCreate.layout = {
    breadcrumbs: [
        { title: 'Istana Negara', href: dashboard() },
        { title: 'Loot Log', href: transactionIndex() },
        { title: 'New', href: '/money/transactions/create' },
    ],
};
