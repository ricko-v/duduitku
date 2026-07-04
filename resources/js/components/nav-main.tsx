import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-1">
                Kabinet
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={`
                                    relative transition-all duration-200
                                    ${active
                                        ? 'bg-[#f59e0b]/10 text-[#f59e0b] shadow-[inset_0_0_12px_rgba(245,158,11,0.1)] border border-[#f59e0b]/20'
                                        : 'text-secondary-foreground hover:text-foreground hover:bg-muted border border-transparent'
                                    }
                                `}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon className={active ? 'text-[#f59e0b]' : ''} />}
                                    <span className={active ? 'font-semibold' : ''}>{item.title}</span>
                                    {active && (
                                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
