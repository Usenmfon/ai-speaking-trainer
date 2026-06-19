import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <AppLogoIcon className="size-9 rounded-xl" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold text-sidebar-foreground">
                    TWAC
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                    Speaking trainer
                </span>
            </div>
        </>
    );
}
