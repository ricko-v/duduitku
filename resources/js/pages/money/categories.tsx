import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, ArrowUpRight, ArrowDownLeft, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { index as categoriesIndex } from '@/routes/money/categories';

interface Category { id: number; name: string; type: string; icon: string | null; color: string | null; parent_id: number | null; sort_order: number; parent: Category | null; }
interface Props { categories: Category[]; }

const colorSwatches = [
    '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#f59e0b', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#ec4899', '#a855f7', '#6b7280',
];

export default function Categories({ categories }: Props) {
    const [showForge, setShowForge] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '', type: 'expense', color: '#f43f5e',
    });

    const expenseCategories = categories.filter((c) => c.type === 'expense');
    const incomeCategories = categories.filter((c) => c.type === 'income');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(`/money/categories/${editingId}`, { onSuccess: () => {
 reset(); setEditingId(null); setShowForge(false); 
} });
        } else {
            post('/money/categories', { onSuccess: () => {
 reset(); setShowForge(false); 
} });
        }
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setData({ name: cat.name, type: cat.type, color: cat.color ?? '#f43f5e' });
        setShowForge(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        reset();
        setShowForge(false);
    };

    return (
        <>
            <Head title="Kategori Anggaran" />

            <div className="flex h-[calc(100vh-3.5rem)] flex-col">
                {/* Header */}
                <div className="shrink-0 border-b border-border/50 px-5 py-3 bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold tracking-wider text-[#f59e0b] uppercase" style={{ letterSpacing: '0.1em' }}>Kategori Anggaran</h2>
                            <p className="text-[10px] text-muted-foreground">{categories.length} type{categories.length !== 1 ? 's' : ''} across both realms</p>
                        </div>
                        <Button
                            onClick={() => {
 reset(); setEditingId(null); setShowForge(true); 
}}
                            className="bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/25 text-[10px] font-bold tracking-wider uppercase h-8 rounded-lg gaming-glow-gold"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Buat Kategori
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-3 animate-[fadeSlideUp_0.3s_ease_both]">
                        <div className="gaming-card rounded-xl p-4 gaming-glow-magenta">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f43f5e]/10 border border-[#f43f5e]/20">
                                    <ArrowUpRight className="h-3.5 w-3.5 text-[#f43f5e]" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expense</span>
                            </div>
                            <p className="text-2xl font-bold tabular-nums text-[#f43f5e]">{expenseCategories.length}</p>
                            <p className="text-[10px] text-muted-foreground">kategori terdefinisi</p>
                        </div>
                        <div className="gaming-card rounded-xl p-4 gaming-glow">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                                    <ArrowDownLeft className="h-3.5 w-3.5 text-[#f59e0b]" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Income</span>
                            </div>
                            <p className="text-2xl font-bold tabular-nums text-[#f59e0b]">{incomeCategories.length}</p>
                            <p className="text-[10px] text-muted-foreground">kategori terdefinisi</p>
                        </div>
                    </div>

                    {/* Pengeluaran */}
                    <section className="animate-[fadeSlideUp_0.3s_ease_both]" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-2 w-2 rounded-full bg-[#f43f5e] shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                            <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">Pengeluaran</h3>
                            <span className="text-[10px] font-bold text-[#f43f5e] tabular-nums">{expenseCategories.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {expenseCategories.map((cat, i) => (
                                <div
                                    key={cat.id}
                                    className="group flex items-center gap-2.5 rounded-xl bg-card border border-border pl-3 pr-1.5 py-1.5 transition-all hover:border-[#f43f5e]/25 hover:bg-[#f43f5e]/5 animate-[fadeSlideUp_0.3s_ease_both]"
                                    style={{ animationDelay: `${i * 30}ms` }}
                                >
                                    <div
                                        className="h-3 w-3 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: cat.color ?? '#6b7280',
                                            boxShadow: `0 0 6px ${cat.color ?? '#6b7280'}60`,
                                        }}
                                    />
                                    <span className="text-sm font-medium text-foreground">{cat.name}</span>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition-colors"
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => {
 if (confirm('Hapus kategori ini?')) {
 destroy(`/money/categories/${cat.id}`); 
} 
}}
                                            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {expenseCategories.length === 0 && (
                                <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3">
                                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Belum ada kategori pengeluaran</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Pemasukan */}
                    <section className="animate-[fadeSlideUp_0.3s_ease_both]" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-2 w-2 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                            <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">Pemasukan</h3>
                            <span className="text-[10px] font-bold text-[#f59e0b] tabular-nums">{incomeCategories.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {incomeCategories.map((cat, i) => (
                                <div
                                    key={cat.id}
                                    className="group flex items-center gap-2.5 rounded-xl bg-card border border-border pl-3 pr-1.5 py-1.5 transition-all hover:border-[#f59e0b]/25 hover:bg-[#f59e0b]/5 animate-[fadeSlideUp_0.3s_ease_both]"
                                    style={{ animationDelay: `${i * 30}ms` }}
                                >
                                    <div
                                        className="h-3 w-3 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: cat.color ?? '#6b7280',
                                            boxShadow: `0 0 6px ${cat.color ?? '#6b7280'}60`,
                                        }}
                                    />
                                    <span className="text-sm font-medium text-foreground">{cat.name}</span>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-[#0ea5e9] hover:bg-[#0ea5e9]/10 transition-colors"
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => {
 if (confirm('Hapus kategori ini?')) {
 destroy(`/money/categories/${cat.id}`); 
} 
}}
                                            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {incomeCategories.length === 0 && (
                                <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3">
                                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Belum ada kategori pemasukan</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Forge Sheet */}
                {showForge && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />

                        <div className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl animate-[fadeSlideUp_0.3s_ease_both]">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">{editingId ? 'Edit Kategori' : 'Buat Kategori'}</h3>
                                    <p className="text-[10px] text-muted-foreground">{editingId ? 'Ubah properti kategori' : 'Tambah kategori baru'}</p>
                                </div>
                                <button onClick={handleCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                                {/* Type Selector */}
                                <div>
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Realm</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('type', 'expense')}
                                            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                                                data.type === 'expense'
                                                    ? 'bg-[#f43f5e]/10 border-[#f43f5e]/30 gaming-glow-magenta'
                                                    : 'bg-background border-border hover:border-[#f43f5e]/15'
                                            }`}
                                        >
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${data.type === 'expense' ? 'bg-[#f43f5e]/15 border-[#f43f5e]/25' : 'bg-muted border-border'} border`}>
                                                <ArrowUpRight className={`h-4 w-4 ${data.type === 'expense' ? 'text-[#f43f5e]' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${data.type === 'expense' ? 'text-[#f43f5e]' : 'text-secondary-foreground'}`}>Expense</p>
                                                <p className="text-[10px] text-muted-foreground">Pengeluaran</p>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('type', 'income')}
                                            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                                                data.type === 'income'
                                                    ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 gaming-glow'
                                                    : 'bg-background border-border hover:border-[#f59e0b]/15'
                                            }`}
                                        >
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${data.type === 'income' ? 'bg-[#f59e0b]/15 border-[#f59e0b]/25' : 'bg-muted border-border'} border`}>
                                                <ArrowDownLeft className={`h-4 w-4 ${data.type === 'income' ? 'text-[#f59e0b]' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${data.type === 'income' ? 'text-[#f59e0b]' : 'text-secondary-foreground'}`}>Income</p>
                                                <p className="text-[10px] text-muted-foreground">Pemasukan</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Nama Kategori</Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="contoh: Makanan, Gaji, Transport..."
                                        className="bg-background border-border h-10 rounded-lg focus-visible:ring-[#f59e0b]/30"
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Color Swatches */}
                                <div>
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Color</Label>
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
                                                value={data.color}
                                                onChange={(e) => setData('color', e.target.value)}
                                                className="absolute inset-0 h-8 w-8 opacity-0 cursor-pointer"
                                            />
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-[#f59e0b]/30 hover:text-[#f59e0b] transition-colors">
                                                <Plus className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                {data.name && (
                                    <div className="gaming-card rounded-xl p-3 animate-[fadeSlideUp_0.2s_ease_both]">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="h-4 w-4 rounded-full"
                                                style={{
                                                    backgroundColor: data.color,
                                                    boxShadow: `0 0 8px ${data.color}60`,
                                                }}
                                            />
                                            <span className="text-sm font-semibold text-foreground">{data.name}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${data.type === 'expense' ? 'bg-[#f43f5e]/15 text-[#f43f5e]' : 'bg-[#f59e0b]/15 text-[#f59e0b]'}`}>
                                                {data.type}
                                            </span>
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
                                        disabled={processing || !data.name}
                                        className="flex-1 h-11 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/30 text-xs font-bold tracking-wider uppercase gaming-glow-gold disabled:opacity-30"
                                    >
                                        {processing ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                {editingId ? 'Memperbarui...' : 'Membuat...'}
                                            </span>
                                        ) : (
                                            editingId ? 'Perbarui Kategori' : 'Buat Kategori'
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

Categories.layout = {
    breadcrumbs: [
        { title: 'Istana Negara', href: dashboard() },
        { title: 'Item Types', href: categoriesIndex() },
    ],
};
