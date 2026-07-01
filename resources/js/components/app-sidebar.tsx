import { Link } from '@inertiajs/react';
import { BarChart3, CreditCard, FolderOpen, LayoutGrid, MessageCircle, PiggyBank, Receipt } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Istana Negara',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Catatan Negara',
        href: '/money/transactions',
        icon: Receipt,
    },
    {
        title: 'Kas Negara',
        href: '/money/accounts',
        icon: CreditCard,
    },
    {
        title: 'Kategori Anggaran',
        href: '/money/categories',
        icon: FolderOpen,
    },
    {
        title: 'RAPBN',
        href: '/money/budgets',
        icon: PiggyBank,
    },
    {
        title: 'Dewan Penasihat',
        href: '/money/ai/insights',
        icon: BarChart3,
    },
    {
        title: 'Sekretaris Negara',
        href: '/money/chat',
        icon: MessageCircle,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-border">
            <SidebarHeader className="border-b border-border/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-border/50">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
