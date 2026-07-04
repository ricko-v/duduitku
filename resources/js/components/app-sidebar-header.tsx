import { Eye, EyeOff, Monitor, Moon, Sun } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { useHideBalance } from '@/hooks/use-hide-balance';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { hidden, toggle } = useHideBalance();
    const { appearance, updateAppearance } = useAppearance();

    const cycleTheme = () => {
        const next = appearance === 'light' ? 'dark' : appearance === 'dark' ? 'system' : 'light';
        updateAppearance(next);
    };

    const ThemeIcon = appearance === 'light' ? Sun : appearance === 'dark' ? Moon : Monitor;

    return (
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-[#f59e0b] transition-colors" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={cycleTheme}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-[#f59e0b] hover:bg-muted transition-all"
                    title={`Tema: ${appearance}`}
                >
                    <ThemeIcon className="h-4 w-4" />
                </button>
                <button
                    onClick={toggle}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-[#f59e0b] hover:bg-muted transition-all"
                    title={hidden ? 'Tampilkan jumlah' : 'Sembunyikan jumlah'}
                >
                    {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </header>
    );
}
