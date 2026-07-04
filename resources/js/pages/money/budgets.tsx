import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Shield, Trash2, ChevronLeft, ChevronRight, Coins, Target, AlertTriangle, CheckCircle2, X, Flame } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useHideBalance } from '@/hooks/use-hide-balance';
import { formatIDR, maskIDR } from '@/lib/format-money';
import { dashboard } from '@/routes';
import { index as budgetIndex } from '@/routes/money/budgets';

interface Budget { id: number; category_id: number; category: string; color: string; icon: string | null; amount: number; spent: number; remaining: number; percentage: number; }
interface Category { id: number; name: string; color: string; icon: string | null; }
interface Props { budgets: Budget[]; categories: Category[]; year: number; month: number; }

export default function Budgets({ budgets, categories, year, month }: Props) {
    const { hidden } = useHideBalance();
    const [showForge, setShowForge] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        category_id: '',
        amount: '',
        month: `${year}-${String(month).padStart(2, '0')}-01`,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(`/money/budgets/${editingId}`, { onSuccess: () => {
 reset(); setEditingId(null); setShowForge(false); 
} });
        } else {
            post('/money/budgets', { onSuccess: () => {
 reset(); setShowForge(false); 
} });
        }
    };

    const handleEdit = (budget: Budget) => {
        setEditingId(budget.id);
        setData({ category_id: String(budget.category_id), amount: String(budget.amount), month: `${year}-${String(month).padStart(2, '0')}-01` });
        setShowForge(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        reset();
        setShowForge(false);
    };

    const navigateMonth = (direction: -1 | 1) => {
        const newDate = new Date(year, month - 1 + direction, 1);
        router.get('/money/budgets', { year: newDate.getFullYear(), month: newDate.getMonth() + 1 });
    };

    const usedCategoryIds = budgets.map((b) => b.category_id);
    const availableCategories = categories.filter((c) => !usedCategoryIds.includes(c.id) || editingId);
    const periodLabel = new Date(year, month - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const questsHealthy = budgets.filter((b) => b.percentage <= 80).length;
    const questsDanger = budgets.filter((b) => b.percentage > 80 && b.percentage <= 100).length;
    const questsCritical = budgets.filter((b) => b.percentage > 100).length;

    return (
        <>
            <Head title="RAPBN" />

            <div className="flex h-[calc(100vh-3.5rem)] flex-col">
                {/* Header */}
                <div className="shrink-0 border-b border-border/50 px-5 py-3 bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="text-sm font-bold tracking-wider text-[#f59e0b] uppercase" style={{ letterSpacing: '0.1em' }}>RAPBN</h2>
                                <p className="text-[10px] text-muted-foreground">{periodLabel} · {budgets.length} quest{budgets.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-lg bg-card border border-border p-1">
                                <button onClick={() => navigateMonth(-1)} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:bg-muted hover:text-[#f59e0b] text-muted-foreground">
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <span className="px-2 text-[10px] font-bold tabular-nums text-foreground tracking-wider uppercase">
                                    {new Date(year, month - 1).toLocaleString('id-ID', { month: 'short' })}
                                </span>
                                <button onClick={() => navigateMonth(1)} className="flex h-7 w-7 items-center justify-center rounded-md transition-all hover:bg-muted hover:text-[#f59e0b] text-muted-foreground">
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <Button
                                onClick={() => {
 reset(); setEditingId(null); setShowForge(true); 
}}
                                className="bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/25 text-[10px] font-bold tracking-wider uppercase h-8 rounded-lg gaming-glow-gold"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Program
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Overall Progress */}
                    {budgets.length > 0 && (
                        <div className="gaming-card rounded-xl p-5 gaming-glow-gold animate-[fadeSlideUp_0.3s_ease_both]">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Target className="h-4 w-4 text-[#f59e0b]" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kemajuan Program</span>
                                </div>
                                <span className="text-lg font-bold tabular-nums text-[#f59e0b]">{overallPct}%</span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-muted overflow-hidden mb-3">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${overallPct > 100 ? 'gaming-hp-bar' : overallPct > 80 ? 'gaming-gold-bar' : 'gaming-xp-bar'}`}
                                    style={{ width: `${Math.min(overallPct, 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{hidden ? maskIDR(totalSpent) : formatIDR(totalSpent)} digunakan</span>
                                <span className="font-bold text-[#f59e0b]">{hidden ? maskIDR(totalBudget) : formatIDR(totalBudget)} budget</span>
                            </div>
                            {/* Status Summary */}
                            <div className="flex gap-3 mt-4 pt-3 border-t border-border/50">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#f59e0b]" />
                                    <span className="text-[10px] font-bold text-[#f59e0b]">{questsHealthy}</span>
                                    <span className="text-[10px] text-muted-foreground">Sehat</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <AlertTriangle className="h-3.5 w-3.5 text-[#f59e0b]" />
                                    <span className="text-[10px] font-bold text-[#f59e0b]">{questsDanger}</span>
                                    <span className="text-[10px] text-muted-foreground">Bahaya</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Flame className="h-3.5 w-3.5 text-[#f43f5e]" />
                                    <span className="text-[10px] font-bold text-[#f43f5e]">{questsCritical}</span>
                                    <span className="text-[10px] text-muted-foreground">Kritis</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Budget Cards */}
                    <div className="space-y-3">
                        {budgets.map((budget, i) => {
                            const barClass = budget.percentage > 100 ? 'gaming-hp-bar' : budget.percentage > 80 ? 'gaming-gold-bar' : 'gaming-xp-bar';
                            const isKritis = budget.percentage > 100;
                            const isBahaya = budget.percentage > 80 && budget.percentage <= 100;
                            const isSehat = budget.percentage <= 80;

                            return (
                                <div
                                    key={budget.id}
                                    className={`group gaming-card rounded-xl overflow-hidden transition-all hover:scale-[1.005] animate-[fadeSlideUp_0.3s_ease_both] ${isKritis ? 'border-[#f43f5e]/20' : ''}`}
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    {/* Top accent */}
                                    <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${budget.color}, transparent)` }} />

                                    <div className="p-4 space-y-3">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border"
                                                    style={{
                                                        backgroundColor: `${budget.color}15`,
                                                        borderColor: `${budget.color}30`,
                                                    }}
                                                >
                                                    <span className="text-sm font-bold" style={{ color: budget.color }}>
                                                        {budget.category.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{budget.category}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        {isSehat && <CheckCircle2 className="h-3 w-3 text-[#f59e0b]" />}
                                                        {isBahaya && <AlertTriangle className="h-3 w-3 text-[#f59e0b]" />}
                                                        {isKritis && <Flame className="h-3 w-3 text-[#f43f5e]" />}
                                                        <span className={`text-[10px] font-bold tracking-wider ${isSehat ? 'text-[#f59e0b]' : isBahaya ? 'text-[#f59e0b]' : 'text-[#f43f5e]'}`}>
                                                            {isSehat ? 'SEHAT' : isBahaya ? 'BAHAYA' : 'KRITIS'}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">· {budget.percentage}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(budget)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-colors"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => {
 if (confirm('Hapus quest ini?')) {
 destroy(`/money/budgets/${budget.id}`); 
} 
}}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${barClass} transition-all duration-700`}
                                                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                            />
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <Coins className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground tabular-nums">{hidden ? maskIDR(budget.spent) : formatIDR(budget.spent)}</span>
                                                <span className="text-[10px] text-muted-foreground">of</span>
                                                <span className="text-xs font-bold text-[#f59e0b] tabular-nums">{hidden ? maskIDR(budget.amount) : formatIDR(budget.amount)}</span>
                                            </div>
                                            {isKritis ? (
                                                <span className="text-[10px] font-bold text-[#f43f5e]">-{hidden ? maskIDR(Math.abs(budget.remaining)) : formatIDR(Math.abs(budget.remaining))}</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-[#f59e0b]">{hidden ? maskIDR(budget.remaining) : formatIDR(budget.remaining)} tersisa</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {budgets.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 gaming-card rounded-xl">
                                <div className="h-16 w-16 rounded-2xl bg-[#f59e0b]/5 border border-[#f59e0b]/10 flex items-center justify-center mb-4">
                                    <Shield className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-bold text-foreground mb-1">Belum Ada Anggaran Bulan Ini</p>
                                <p className="text-xs text-muted-foreground mb-4">Set quest budgets to track your spending limits</p>
                                <Button
                                    onClick={() => {
 reset(); setEditingId(null); setShowForge(true); 
}}
                                    className="bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/25 text-xs font-bold tracking-wider uppercase h-9 rounded-lg"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Atur Anggaran Pertama
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Forge Sheet */}
                {showForge && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />

                        <div className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl animate-[fadeSlideUp_0.3s_ease_both]">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">{editingId ? 'Edit Anggaran' : 'Atur RAPBN'}</h3>
                                    <p className="text-[10px] text-muted-foreground">{editingId ? 'Ubah parameter quest' : 'Pilih kategori dan atur batas'}</p>
                                </div>
                                <button onClick={handleCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                                {/* Category Pills */}
                                <div>
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Category</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableCategories.map((cat) => {
                                            const selected = String(cat.id) === data.category_id;

                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setData('category_id', String(cat.id))}
                                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                                                        selected
                                                            ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b] gaming-glow-gold'
                                                            : 'bg-background border-border text-secondary-foreground hover:border-[#f59e0b]/15'
                                                    }`}
                                                >
                                                    <div className="h-2.5 w-2.5 rounded-full shadow-[0_0_4px_currentColor]" style={{ backgroundColor: cat.color, color: cat.color }} />
                                                    {cat.name}
                                                </button>
                                            );
                                        })}
                                        {availableCategories.length === 0 && (
                                            <p className="text-xs text-muted-foreground">Semua kategori sudah punya quest</p>
                                        )}
                                    </div>
                                    <InputError message={errors.category_id} />
                                </div>

                                {/* Amount */}
                                <div className="gaming-card rounded-xl p-5">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-3">Batas RAPBN</Label>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-bold text-muted-foreground">Rp</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-transparent text-3xl font-bold tabular-nums text-[#f59e0b] outline-none placeholder:text-muted-foreground"
                                            autoFocus
                                        />
                                    </div>
                                    {parseFloat(data.amount) > 0 && (
                                        <p className="mt-2 text-xs text-muted-foreground">{hidden ? maskIDR(parseFloat(data.amount)) : formatIDR(parseFloat(data.amount))}</p>
                                    )}
                                    <InputError message={errors.amount} />
                                </div>

                                {/* Preview */}
                                {data.category_id && data.amount && (
                                    <div className="gaming-card rounded-xl p-3 animate-[fadeSlideUp_0.2s_ease_both]">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {(() => {
                                                    const cat = categories.find((c) => String(c.id) === data.category_id);

                                                    return cat ? (
                                                        <>
                                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}60` }} />
                                                            <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                                                        </>
                                                    ) : null;
                                                })()}
                                            </div>
                                            <span className="text-sm font-bold tabular-nums text-[#f59e0b]">{hidden ? maskIDR(parseFloat(data.amount)) : formatIDR(parseFloat(data.amount))}</span>
                                        </div>
                                    </div>
                                )}

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
                                        disabled={processing || !data.category_id || !data.amount}
                                        className="flex-1 h-11 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/30 text-xs font-bold tracking-wider uppercase gaming-glow-gold disabled:opacity-30"
                                    >
                                        {processing ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                {editingId ? 'Memperbarui...' : 'Mengatur...'}
                                            </span>
                                        ) : (
                                            editingId ? 'Perbarui Anggaran' : 'Atur Anggaran'
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

Budgets.layout = {
    breadcrumbs: [
        { title: 'Istana Negara', href: dashboard() },
        { title: 'Program Budgets', href: budgetIndex() },
    ],
};
