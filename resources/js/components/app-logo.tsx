import AppLogoIcon from '@/components/app-logo-icon';
import { useTranslation } from '@/hooks/use-translation';

export default function AppLogo() {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-bold tracking-tight text-foreground text-sm">
                    Calibration Pro
                </span>
                <span className="truncate text-muted-foreground text-[10px] font-medium">
                    {t('app_subtitle', 'Gestion Métrologique')}
                </span>
            </div>
        </div>
    );
}
