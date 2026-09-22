import { usePage } from '@inertiajs/react';
import { translations, type Locale } from '@/lib/translations';

export function useTranslation() {
    const { locale = 'fr' } = usePage<{ locale?: string }>().props;
    const currentLocale = (locale === 'en' ? 'en' : 'fr') as Locale;
    const isEnglish = currentLocale === 'en';
    const isFrench = currentLocale === 'fr';

    const t = (key: string, fallback?: string): string => {
        if (translations[currentLocale]?.[key]) {
            return translations[currentLocale][key];
        }
        if (isEnglish && fallback && translations.en[fallback]) {
            return translations.en[fallback];
        }
        return fallback || key;
    };

    const tr = (fr: string, en: string): string => {
        return isEnglish ? en : fr;
    };

    const formatDate = (dateString?: string | null): string => {
        if (!dateString) return isEnglish ? 'Not specified' : 'Non renseignée';
        try {
            return new Date(dateString).toLocaleDateString(isEnglish ? 'en-US' : 'fr-FR');
        } catch {
            return dateString;
        }
    };

    return {
        t,
        tr,
        formatDate,
        locale: currentLocale,
        isEnglish,
        isFrench,
    };
}
