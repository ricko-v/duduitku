import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import type { User } from '@/types';

export function UserMenuContent({ user }: { user: User }) {
    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5">
                    <UserInfo user={user} showEmail />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#2a2a3e]" />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild className="text-secondary-foreground focus:text-foreground focus:bg-muted">
                    <Link href="/settings/profile" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#2a2a3e]" />
            <DropdownMenuItem className="text-[#f43f5e] focus:text-[#f43f5e] focus:bg-[#f43f5e]/10" onClick={() => router.post('/logout')}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
            </DropdownMenuItem>
        </>
    );
}
