import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f59e0b]/20 to-[#0ea5e9]/20 border border-[#f59e0b]/30">
                <AppLogoIcon className="size-5 fill-current text-[#f59e0b]" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold tracking-wider text-[#f59e0b] uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.15em' }}>
                    Duduitku
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Republik Keuangan
                </span>
            </div>
        </>
    );
}
