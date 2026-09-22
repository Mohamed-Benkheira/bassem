import { Head, router } from '@inertiajs/react';
import { Filter, Search, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { AuditLog, BreadcrumbItem } from '@/types';

interface Props {
    logs: {
        data: AuditLog[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    entityTypes: string[];
    filters: {
        search?: string;
        entity_type?: string;
    };
}

export default function AdminAuditLogsIndex({ logs, entityTypes, filters }: Props) {
    const { tr, formatDate } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [entityType, setEntityType] = useState(filters.entity_type || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Journaux d\'audit', 'Audit Logs'), href: '/admin/audit-logs' },
    ];

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/audit-logs',
            {
                search: search || undefined,
                entity_type: entityType === 'all' ? undefined : entityType,
            },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Journaux d\'audit - Admin', 'Audit Logs - Admin')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Journaux d\'Audit & Traçabilité', 'Audit Logs & Traceability')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr('Section 35 : Registre inaltérable de toutes les opérations critiques effectuées dans l\'application.', 'Section 35: Immutable record of all critical operations performed in the application.')}
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr('Rechercher par action, utilisateur, adresse IP...', 'Search by action, user, IP address...')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="w-full sm:w-64">
                                <Select value={entityType} onValueChange={setEntityType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={tr('Toutes les entités', 'All entities')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{tr('Toutes les entités', 'All entities')}</SelectItem>
                                        {entityTypes.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" variant="secondary">
                                <Filter className="mr-2 h-4 w-4" />
                                {tr('Filtrer', 'Filter')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-blue-600" />
                            {tr('Historique des événements', 'Events history')} ({logs.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {logs.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun événement trouvé.', 'No events found.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Horodatage', 'Timestamp')}</th>
                                            <th className="px-6 py-3">{tr('Utilisateur', 'User')}</th>
                                            <th className="px-6 py-3">{tr('Action', 'Action')}</th>
                                            <th className="px-6 py-3">{tr('Entité & Réf', 'Entity & Ref')}</th>
                                            <th className="px-6 py-3">{tr('Adresse IP', 'IP Address')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Détails', 'Details')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                                                    {formatDate(log.created_at)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{log.user?.name || tr('Système', 'System')}</div>
                                                    <div className="text-xs text-muted-foreground">{log.user?.email || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-xs text-foreground">
                                                    {log.action}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    <span className="font-mono font-medium">{log.entity_type}</span>
                                                    {log.entity_id && <span className="text-muted-foreground"> #{log.entity_id}</span>}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                                                    {log.ip_address || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs">
                                                    {log.new_values && (
                                                        <span className="font-mono text-[11px] text-muted-foreground max-w-xs truncate inline-block">
                                                            {JSON.stringify(log.new_values)}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
