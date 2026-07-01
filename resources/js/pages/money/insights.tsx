import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Lightbulb, RefreshCw, Sparkles, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useHideBalance } from '@/hooks/use-hide-balance';
import { formatIDR, maskIDR } from '@/lib/format-money';
import { dashboard } from '@/routes';

interface TopCategory {
    category: string;
    amount: number;
    percentage: number;
}

interface InsightsData {
    summary: string;
    top_categories: TopCategory[];
    trends: string[];
    tips: string[];
}

interface Props {
    insights: InsightsData | null;
    period: string;
    cached: boolean;
}

const categoryEmojis: Record<string, string> = {
    'Food & Dining': '🍜',
    Transportation: '🚗',
    Shopping: '🛍️',
    'Bills & Utilities': '⚡',
    Entertainment: '🎬',
    Health: '💊',
    Education: '📚',
    'Other Expense': '📦',
};

export default function Insights({ insights, period, cached }: Props) {
    const { hidden } = useHideBalance();
    const [refreshing, setRefreshing] = useState(false);

    const navigatePeriod = (direction: -1 | 1) => {
        const date = new Date(period + '-01');
        date.setMonth(date.getMonth() + direction);
        router.get('/money/ai/insights', { period: date.toISOString().slice(0, 7) });
    };

    const handleRefresh = () => {
        setRefreshing(true);
        router.get('/money/ai/insights', { period, refresh: 1 }, {
            onFinish: () => setRefreshing(false),
        });
    };

    const periodLabel = new Date(period + '-01').toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    return (
        <>
            <Head title="Dewan Penasihat" />

            <div className="p-5 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold tracking-wider text-[#a855f7] uppercase" style={{ letterSpacing: '0.1em' }}>
                            Oracle
                        </h2>
                        <p className="text-xs text-muted-foreground tracking-wide">Analisis Keuangan Negara</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-lg bg-card border border-border p-1">
                            <button onClick={() => navigatePeriod(-1)} className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-muted hover:text-[#a855f7] text-muted-foreground">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-3 text-xs font-bold tabular-nums text-foreground tracking-wider">{periodLabel}</span>
                            <button onClick={() => navigatePeriod(1)} className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-muted hover:text-[#a855f7] text-muted-foreground">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        {insights && (
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:text-[#a855f7] hover:border-[#a855f7]/30 transition-all disabled:opacity-50"
                                title="Perbarui analisis"
                            >
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                {!insights ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20">
                            <Zap className="h-8 w-8 text-[#a855f7]" />
                        </div>
                        <h3 className="mb-1 text-base font-bold text-foreground">Dewan Penasihat Tidur</h3>
                        <p className="mb-6 max-w-sm text-center text-xs text-muted-foreground">Bangunkan Dewan Penasihat untuk menerima kebijaksanaan tentang pola pengeluaranmu.</p>
                        <Button className="bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 hover:bg-[#a855f7]/30 gap-2 rounded-lg text-xs font-bold tracking-wider uppercase gaming-glow-purple" onClick={() => router.get('/money/ai/insights', { period })}>
                            <Sparkles className="h-4 w-4" /> Bangunkan Dewan Penasihat
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* AI Summary */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#a855f7]/20 to-[#0ea5e9]/10 p-5 border border-[#a855f7]/20 gaming-glow-purple">
                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#a855f7]/10" />
                            <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-[#0ea5e9]/5" />
                            <div className="relative">
                                <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-[#a855f7] uppercase">
                                    <Sparkles className="h-4 w-4" /> Dewan Penasihat Berbicara
                                    {cached && <span className="rounded-full bg-[#a855f7]/20 px-2 py-0.5 text-[10px] border border-[#a855f7]/30">TERSIMPAN</span>}
                                </div>
                                <p className="text-sm leading-relaxed text-foreground">{insights.summary}</p>
                            </div>
                        </div>

                        {/* Spending Breakdown */}
                        {insights.top_categories.length > 0 && (
                            <section>
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f43f5e]/10 border border-[#f43f5e]/20">
                                        <TrendingDown className="h-3.5 w-3.5 text-[#f43f5e]" />
                                    </div>
                                    <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">Distribusi Anggaran</h3>
                                </div>
                                <div className="grid gap-2">
                                    {insights.top_categories.map((cat, i) => {
                                        const emoji = categoryEmojis[cat.category] || '💰';

                                        return (
                                            <div key={i} className="gaming-card rounded-xl p-4 animate-[fadeSlideUp_0.4s_ease_both]" style={{ animationDelay: `${i * 60}ms` }}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border border-border text-lg">
                                                            {emoji}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-foreground">{cat.category}</p>
                                                            <p className="text-[10px] text-muted-foreground">{cat.percentage}% dari total</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-bold tabular-nums text-[#f43f5e]">{hidden ? maskIDR(cat.amount) : formatIDR(cat.amount)}</p>
                                                </div>
                                                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full rounded-full gaming-hp-bar animate-[growWidth_0.7s_ease-out_both]" style={{ width: `${cat.percentage}%`, animationDelay: `${i * 60 + 200}ms` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Trends & Tips */}
                        <div className="grid gap-5 md:grid-cols-2">
                            {insights.trends.length > 0 && (
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0ea5e9]/10 border border-[#0ea5e9]/20">
                                            <TrendingUp className="h-3.5 w-3.5 text-[#0ea5e9]" />
                                        </div>
                                        <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">Laporan Evaluasi</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {insights.trends.map((trend, i) => (
                                            <div key={i} className="flex items-start gap-3 gaming-card rounded-xl p-3.5 animate-[fadeSlideRight_0.4s_ease_both]" style={{ animationDelay: `${i * 80}ms` }}>
                                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-xs">
                                                    {i % 2 === 0 ? '📈' : '📉'}
                                                </div>
                                                <p className="text-xs leading-relaxed text-secondary-foreground">{trend}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {insights.tips.length > 0 && (
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                                            <Lightbulb className="h-3.5 w-3.5 text-[#f59e0b]" />
                                        </div>
                                        <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">Tips Efisiensi</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {insights.tips.map((tip, i) => (
                                            <div key={i} className="flex items-start gap-3 gaming-card rounded-xl p-3.5 animate-[fadeSlideLeft_0.4s_ease_both]" style={{ animationDelay: `${i * 80}ms` }}>
                                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[10px] font-bold text-[#f59e0b]">
                                                    {i + 1}
                                                </div>
                                                <p className="text-xs leading-relaxed text-secondary-foreground">{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Insights.layout = {
    breadcrumbs: [
        { title: 'Istana Negara', href: dashboard() },
        { title: 'Oracle', href: '/money/ai/insights' },
    ],
};
