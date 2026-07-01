import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Landmark, Wallet, CreditCard, PiggyBank, Coins, Star, X } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHideBalance } from '@/hooks/use-hide-balance';
import { formatIDR, maskIDR } from '@/lib/format-money';
import { dashboard } from '@/routes';
import { index as accountsIndex } from '@/routes/money/accounts';

interface Account { id: number; name: string; type: string; currency: string; icon: string | null; color: string | null; is_default: boolean; balance: number; }
interface Props { accounts: Account[]; }

const typeConfig: Record<string, { label: string; icon: typeof Landmark; desc: string }> = {
    bank: { label: 'Bank', icon: Landmark, desc: 'Akun bank tradisional' },
    cash: { label: 'Cash', icon: Wallet, desc: 'Uang fisik di tangan' },
    credit_card: { label: 'Credit Card', icon: CreditCard, desc: 'Fasilitas kartu kredit' },
    savings: { label: 'Savings', icon: PiggyBank, desc: 'Kas tabungan jangka panjang' },
};

const colorSwatches = [
    '#0ea5e9', '#f59e0b', '#a855f7', '#f59e0b', '#f43f5e',
    '#ff6b35', '#00cc88', '#3b82f6', '#ec4899', '#8b5cf6',
    '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6',
];

export default function Accounts({ accounts }: Props) {
    const { hidden } = useHideBalance();
    const [showForge, setShowForge] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '', type: 'bank', currency: 'IDR', color: '#0ea5e9', is_default: false as boolean,
    });

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const maxBalance = Math.max(...accounts.map((a) => Math.abs(a.balance)), 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(`/money/accounts/${editingId}`, { onSuccess: () => {
 reset(); setEditingId(null); setShowForge(false); 
} });
        } else {
            post('/money/accounts', { onSuccess: () => {
 reset(); setShowForge(false); 
} });
        }
    };

    const handleEdit = (account: Account) => {
        setEditingId(account.id);
        setData({ name: account.name, type: account.type, currency: account.currency, color: account.color ?? '#0ea5e9', is_default: account.is_default });
        setShowForge(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        reset();
        setShowForge(false);
    };

    return (
        <>
            <Head title="Kas Negara" />

            <div className="flex h-[calc(100vh-3.5rem)] flex-col">
                {/* Header */}
                <div className="shrink-0 border-b border-border/50 px-5 py-3 bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold tracking-wider text-[#0ea5e9] uppercase" style={{ letterSpacing: '0.1em' }}>Kas Negara</h2>
                            <p className="text-[10px] text-muted-foreground">{accounts.length} vault{accounts.length !== 1 ? 's' : ''} in your treasury</p>
                        </div>
                        <Button
                            onClick={() => {
 reset(); setEditingId(null); setShowForge(true); 
}}
                            className="bg-[#0ea5e9]/15 text-[#0ea5e9] border border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/25 text-[10px] font-bold tracking-wider uppercase h-8 rounded-lg gaming-glow-cyan"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Tetapkan Kas
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Total Balance */}
                    <div className="gaming-card rounded-xl p-5 gaming-glow-cyan animate-[fadeSlideUp_0.3s_ease_both]">
                        <div className="flex items-center gap-2 mb-1">
                            <Coins className="h-4 w-4 text-[#f59e0b]" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Kas Negara</span>
                        </div>
                        <p className="text-3xl font-bold tabular-nums text-[#0ea5e9]">{hidden ? maskIDR(totalBalance) : formatIDR(totalBalance)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Total dari .* brankas{accounts.length !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Vault Grid */}
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account, i) => {
                            const tc = typeConfig[account.type] || typeConfig.bank;
                            const balPct = Math.abs(account.balance) / maxBalance * 100;

                            return (
                                <div
                                    key={account.id}
                                    className="group gaming-card rounded-xl overflow-hidden transition-all hover:scale-[1.015] animate-[fadeSlideUp_0.3s_ease_both]"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    {/* Top color bar */}
                                    <div className="h-1" style={{ background: `linear-gradient(90deg, ${account.color ?? '#0ea5e9'}, transparent)` }} />

                                    <div className="p-4 space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex h-10 w-10 items-center justify-center rounded-xl border"
                                                    style={{
                                                        backgroundColor: `${account.color ?? '#0ea5e9'}15`,
                                                        borderColor: `${account.color ?? '#0ea5e9'}30`,
                                                    }}
                                                >
                                                    <tc.icon className="h-5 w-5" style={{ color: account.color ?? '#0ea5e9' }} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{account.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{tc.label}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {account.is_default && (
                                                    <Badge className="bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30 text-[9px] h-5">
                                                        <Star className="h-2.5 w-2.5 mr-0.5 fill-current" /> MAIN
                                                    </Badge>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(account)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition-colors"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => {
 if (confirm('Hapus kas ini? Tindakan ini tidak dapat dibatalkan.')) {
 destroy(`/money/accounts/${account.id}`); 
} 
}}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Balance */}
                                        <div>
                                            <p className="text-xl font-bold tabular-nums" style={{ color: account.color ?? '#0ea5e9' }}>
                                                {hidden ? maskIDR(account.balance) : formatIDR(account.balance)}
                                            </p>
                                        </div>

                                        {/* Balance Bar */}
                                        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${Math.max(balPct, 3)}%`,
                                                    background: `linear-gradient(90deg, ${account.color ?? '#0ea5e9'}, ${account.color ?? '#0ea5e9'}60)`,
                                                    boxShadow: `0 0 8px ${account.color ?? '#0ea5e9'}40`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {accounts.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-16">
                                <div className="h-16 w-16 rounded-2xl bg-[#0ea5e9]/5 border border-[#0ea5e9]/10 flex items-center justify-center mb-4">
                                    <Landmark className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-bold text-foreground mb-1">Belum Ada Kas Negara</p>
                                <p className="text-xs text-muted-foreground mb-4">Tetapkan kas negara pertamamu untuk mulai melacak keuangan</p>
                                <Button
                                    onClick={() => {
 reset(); setEditingId(null); setShowForge(true); 
}}
                                    className="bg-[#0ea5e9]/15 text-[#0ea5e9] border border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/25 text-xs font-bold tracking-wider uppercase h-9 rounded-lg"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Tetapkan Kas Pertama
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Forge Sheet Overlay */}
                {showForge && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />

                        {/* Sheet */}
                        <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl animate-[fadeSlideUp_0.3s_ease_both] max-h-[85vh] overflow-y-auto">
                            {/* Sheet Header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-5 py-3 bg-card">
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">{editingId ? 'Edit Kas' : 'Tetapkan Kas Baru'}</h3>
                                    <p className="text-[10px] text-muted-foreground">{editingId ? 'Ubah properti kas' : 'Tetapkan kas negara baru'}</p>
                                </div>
                                <button onClick={handleCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                                {/* Tipe Kas */}
                                <div>
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Tipe Kas</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(typeConfig).map(([key, cfg]) => {
                                            const selected = data.type === key;

                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setData('type', key)}
                                                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                                                        selected
                                                            ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/30 gaming-glow-cyan'
                                                            : 'bg-background border-border hover:border-[#0ea5e9]/15'
                                                    }`}
                                                >
                                                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${selected ? 'bg-[#0ea5e9]/15 border-[#0ea5e9]/25' : 'bg-muted border-border'} border`}>
                                                        <cfg.icon className={`h-4 w-4 ${selected ? 'text-[#0ea5e9]' : 'text-muted-foreground'}`} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-bold ${selected ? 'text-[#0ea5e9]' : 'text-secondary-foreground'}`}>{cfg.label}</p>
                                                        <p className="text-[10px] text-muted-foreground">{cfg.desc}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Nama Kas</Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. BCA, GoPay, Cash..."
                                        className="bg-background border-border h-10 rounded-lg focus-visible:ring-[#0ea5e9]/30"
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Color Swatches */}
                                <div>
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Warna Kas</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorSwatches.map((color) => {
                                            const selected = data.color === color;

                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setData('color', color)}
                                                    className={`h-8 w-8 rounded-lg transition-all ${selected ? 'scale-110' : 'hover:scale-105'}`}
                                            style={{
                                                backgroundColor: color,
                                                boxShadow: selected ? `0 0 0 2px ${color}, 0 0 12px ${color}60` : undefined,
                                            }}
                                                />
                                            );
                                        })}
                                        <div className="relative">
                                            <input
                                                type="color"
                                                value={data.color || '#0ea5e9'}
                                                onChange={(e) => setData('color', e.target.value)}
                                                className="absolute inset-0 h-8 w-8 opacity-0 cursor-pointer"
                                            />
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-[#0ea5e9]/30 hover:text-[#0ea5e9] transition-colors">
                                                <Plus className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Default Toggle */}
                                <div className="flex items-center justify-between rounded-lg bg-background border border-border p-3">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-[#f59e0b]" />
                                        <div>
                                            <p className="text-xs font-semibold text-foreground">Jadikan Kas Utama</p>
                                            <p className="text-[10px] text-muted-foreground">Kas default untuk transaksi baru</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('is_default', !data.is_default)}
                                        className={`relative h-6 w-11 rounded-full transition-colors ${data.is_default ? 'bg-[#f59e0b]' : 'bg-[#2a2a3e]'}`}
                                    >
                                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${data.is_default ? 'left-[22px]' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleCancel}
                                        className="flex-1 h-11 rounded-xl text-muted-foreground hover:text-foreground border border-border"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.name}
                                        className="flex-1 h-11 rounded-xl bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/30 text-xs font-bold tracking-wider uppercase gaming-glow-cyan disabled:opacity-30"
                                    >
                                        {processing ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                Forging...
                                            </span>
                                        ) : (
                                            editingId ? 'Perbarui Kas' : 'Tetapkan Kas'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Accounts.layout = {
    breadcrumbs: [
        { title: 'Istana Negara', href: dashboard() },
        { title: 'Vaults', href: accountsIndex() },
    ],
};
