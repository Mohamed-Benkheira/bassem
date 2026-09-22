import { router } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';

export function LanguageSwitcher({ variant = 'ghost' }: { variant?: 'ghost' | 'outline' }) {
    const { locale } = useTranslation();

    const switchLocale = (newLocale: 'fr' | 'en') => {
        if (newLocale === locale) {
            return;
        }
        router.post('/locale', { locale: newLocale }, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size="sm" className="h-8 gap-1.5 px-2.5 text-xs font-semibold">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="uppercase font-mono">{locale}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                    onClick={() => switchLocale('fr')}
                    className={`flex items-center justify-between text-xs cursor-pointer ${locale === 'fr' ? 'font-bold bg-accent' : ''}`}
                >
                    <span>🇫🇷 Français</span>
                    {locale === 'fr' && <span className="text-blue-600 font-bold">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => switchLocale('en')}
                    className={`flex items-center justify-between text-xs cursor-pointer ${locale === 'en' ? 'font-bold bg-accent' : ''}`}
                >
                    <span>🇬🇧 English</span>
                    {locale === 'en' && <span className="text-blue-600 font-bold">✓</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
