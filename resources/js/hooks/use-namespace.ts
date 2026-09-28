import { useCurrentUrl } from '@/hooks/use-current-url';

export function useNamespace(): string {
    const { currentUrl } = useCurrentUrl();
    const section = currentUrl.split('/').filter(Boolean)[0];

    return section ?? 'dashboard';
}
