import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Coins, Shield, Swords, Wallet } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHideBalance } from '@/hooks/use-hide-balance';
import { formatIDR, maskIDR, formatDate } from '@/lib/format-money';
import { dashboard } from '@/routes';

interface Account {
    id: number;
    name: string;
    type: string;
    color: string;
    balance: number;
}

interface CategoryBreakdown {
    category: string;
    color: string;
    amount: number;
}

interface Transaction {
    id: number;
    type: string;
    amount: number;
    description: string;
    date: string;
    category: { name: string; color: string } | null;
    account: { name: string; color: string };
}

interface Budget {
    id: number;
    category: string;
    color: string;
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
}

interface FiscalMonthData {
    year: number;
    month: number;
    status: string;
    closed_at: string | null;
    balances_snapshot: { accounts: { id: number; name: string; balance: number }[]; total: number } | null;
}

export default function Dashboard() {
    const { hidden } = useHideBalance();
    const page = usePage();
    const props = page.props as Record<string, unknown>;

    const accounts = (props.accounts ?? []) as Account[];
    const totalBalance = (props.totalBalance ?? 0) as number;
    const monthlyIncome = (props.monthlyIncome ?? 0) as number;
    const monthlyExpense = (props.monthlyExpense ?? 0) as number;
    const net = (props.net ?? 0) as number;
    const categoryBreakdown = (props.categoryBreakdown ?? []) as CategoryBreakdown[];
    const recentTransactions = (props.recentTransactions ?? []) as Transaction[];
    const budgets = (props.budgets ?? []) as Budget[];
    const fiscalMonth = (props.fiscalMonth ?? null) as FiscalMonthData | null;
    const year = (props.year ?? new Date().getFullYear()) as number;
    const month = (props.month ?? new Date().getMonth() + 1) as number;

    const isClosed = fiscalMonth?.status === 'closed';
    const periodLabel = new Date(year, month - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const navigateMonth = (direction: -1 | 1) => {
        const newDate = new Date(year, month - 1 + direction, 1);
        router.get('/dashboard', { year: newDate.getFullYear(), month: newDate.getMonth() + 1 });
    };

    return (
        <>
            <Head title="Istana Negara" />

            <div className="flex h-full flex-1 flex-col gap-5 overflow-x-auto p-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold tracking-wider text-primary uppercase" style={{ letterSpacing: '0.1em' }}>
                            Istana Negara
                        </h2>
                        <p className="text-xs text-muted-foreground tracking-wide">{periodLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-lg bg-card border border-border p-1">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-muted hover:text-[#f59e0b] text-muted-foreground"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-2 text-xs font-bold tabular-nums text-foreground tracking-wider uppercase">
                                {new Date(year, month - 1).toLocaleString('id-ID', { month: 'short' })}
                            </span>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-muted hover:text-[#f59e0b] text-muted-foreground"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        {isClosed ? (
                            <Badge className="bg-[#f43f5e]/20 text-[#f43f5e] border-[#f43f5e]/30 text-xs">DITUTUP</Badge>
                        ) : (
                            <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30 text-xs">AKTIF</Badge>
                        )}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard
                        icon={<Wallet className="h-4 w-4" />}
                        label="Total Rupiah"
                        value={hidden ? maskIDR(totalBalance) : formatIDR(totalBalance)}
                        color="cyan"
                        glowClass="gaming-glow-cyan"
                    />
                    <StatCard
                        icon={<ArrowDownLeft className="h-4 w-4" />}
                        label="Pendapatan"
                        value={hidden ? maskIDR(monthlyIncome) : formatIDR(monthlyIncome)}
                        color="green"
                        glowClass="gaming-glow"
                    />
                    <StatCard
                        icon={<ArrowUpRight className="h-4 w-4" />}
                        label="Pengeluaran"
                        value={hidden ? maskIDR(monthlyExpense) : formatIDR(monthlyExpense)}
                        color="magenta"
                        glowClass="gaming-glow-magenta"
                    />
                    <StatCard
                        icon={<Coins className="h-4 w-4" />}
                        label="Saldo Bersih"
                        value={hidden ? maskIDR(net) : formatIDR(net)}
                        color={net >= 0 ? 'green' : 'magenta'}
                        glowClass={net >= 0 ? 'gaming-glow' : 'gaming-glow-magenta'}
                    />
                </div>

                {/* Charts & Accounts */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Spending Pie */}
                    <div className="gaming-card rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Swords className="h-4 w-4 text-[#a855f7]" />
                            <h3 className="text-sm font-bold tracking-wider text-foreground uppercase">Peta Pembangunan</h3>
                        </div>
                        {categoryBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={categoryBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
                                        {categoryBreakdown.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Shield className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground">Belum ada data pembangunan bulan ini</p>
                            </div>
                        )}
                    </div>

                    {/* Accounts */}
                    <div className="gaming-card rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Wallet className="h-4 w-4 text-[#0ea5e9]" />
                            <h3 className="text-sm font-bold tracking-wider text-foreground uppercase">Inventaris Kas Negara</h3>
                        </div>
                        <div className="space-y-3">
                            {accounts.map((account) => (
                                <div key={account.id} className="flex items-center justify-between rounded-lg bg-background/50 border border-border/50 p-3 transition-all hover:border-[#f59e0b]/20">
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: account.color, color: account.color }} />
                                        <div>
                                            <span className="text-sm font-semibold text-foreground">{account.name}</span>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{account.type}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold tabular-nums text-[#0ea5e9]">{hidden ? maskIDR(account.balance) : formatIDR(account.balance)}</span>
                                </div>
                            ))}
                            {accounts.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4">Belum ada kas negara dibuat</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Budget HP Bars */}
                {budgets.length > 0 && (
                    <div className="gaming-card rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-4 w-4 text-[#f59e0b]" />
                            <h3 className="text-sm font-bold tracking-wider text-foreground uppercase">Kemajuan Program</h3>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            {budgets.map((budget) => {
                                const barClass = budget.percentage > 100 ? 'gaming-hp-bar' : budget.percentage > 80 ? 'gaming-gold-bar' : 'gaming-xp-bar';
                                const statusText = budget.percentage > 100 ? 'MELEBIHI ANGGARAN' : budget.percentage > 80 ? 'PERINGATAN' : 'AMAN';
                                const statusColor = budget.percentage > 100 ? 'text-[#f43f5e]' : budget.percentage > 80 ? 'text-[#f59e0b]' : 'text-[#f59e0b]';

                                return (
                                    <div key={budget.id} className="rounded-lg bg-background/50 border border-border/50 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-foreground">{budget.category}</span>
                                            <span className={`text-[10px] font-bold tracking-wider ${statusColor}`}>{statusText}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${barClass} transition-all duration-700`}
                                                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-[10px] text-muted-foreground tabular-nums">{hidden ? maskIDR(budget.spent) : formatIDR(budget.spent)}</span>
                                            <span className="text-[10px] text-muted-foreground tabular-nums">{hidden ? maskIDR(budget.amount) : formatIDR(budget.amount)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Transactions */}
                <div className="gaming-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Swords className="h-4 w-4 text-[#f59e0b]" />
                        <h3 className="text-sm font-bold tracking-wider text-foreground uppercase">Transaksi Negara Terakhir</h3>
                    </div>
                    <div className="space-y-1">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between rounded-lg p-3 transition-all hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${tx.type === 'income' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20' : 'bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20'}`}>
                                        {tx.type === 'income' ? '↓' : '↑'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{tx.description}</p>
                                        <p className="text-[10px] text-muted-foreground">{tx.category?.name ?? 'Transfer'} · {tx.account.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold tabular-nums ${tx.type === 'income' ? 'text-[#f59e0b]' : 'text-[#f43f5e]'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{hidden ? maskIDR(tx.amount) : formatIDR(tx.amount)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">{formatDate(tx.date)}</p>
                                </div>
                            </div>
                        ))}
                        {recentTransactions.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-8">Belum ada transaksi negara tercatat</p>
                        )}
                    </div>
                </div>

                {/* Month Actions */}
                <div className="flex gap-2">
                    {!isClosed ? (
                        <Button
                            className="bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/30 hover:bg-[#f43f5e]/30 text-xs font-bold tracking-wider uppercase"
                            size="sm"
                            onClick={() => {
                                if (confirm(`Tutup buku periode ini? Semua transaksi akan dikunci.`)) {
                                    router.post('/money/fiscal-months/close', { year, month });
                                }
                            }}
                        >
                            Tutup Buku
                        </Button>
                    ) : (
                        <Button
                            className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 hover:bg-[#f59e0b]/20 text-xs font-bold tracking-wider uppercase"
                            size="sm"
                            onClick={() => {
                                if (confirm('Buka kembali buku ini? Transaksi dapat diubah lagi.')) {
                                    router.post('/money/fiscal-months/open', { year, month });
                                }
                            }}
                        >
                            Buka Buku
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}

function StatCard({ icon, label, value, color, glowClass }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    glowClass: string;
}) {
    const colorMap: Record<string, { text: string; border: string; bg: string; iconBg: string }> = {
        cyan: { text: 'text-[#0ea5e9]', border: 'border-[#0ea5e9]/20', bg: 'bg-[#0ea5e9]/5', iconBg: 'bg-[#0ea5e9]/10' },
        green: { text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/20', bg: 'bg-[#f59e0b]/5', iconBg: 'bg-[#f59e0b]/10' },
        magenta: { text: 'text-[#f43f5e]', border: 'border-[#f43f5e]/20', bg: 'bg-[#f43f5e]/5', iconBg: 'bg-[#f43f5e]/10' },
    };
    const c = colorMap[color] || colorMap.cyan;

    return (
        <div className={`${c.bg} ${c.border} border rounded-xl p-4 ${glowClass} transition-all hover:scale-[1.02]`}>
            <div className="flex items-center gap-2 mb-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${c.iconBg} ${c.text}`}>
                    {icon}
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">{label}</span>
            </div>
            <div className={`text-xl font-bold tabular-nums ${c.text}`}>{value}</div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Istana Negara',
            href: dashboard(),
        },
    ],
};
