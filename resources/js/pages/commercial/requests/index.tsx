import { Head, Link, router } from '@inertiajs/react';
import { Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationRequest } from '@/types';

interface Props {
    requests: {
        data: CalibrationRequest[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    statuses: Record<string, string>;
}

export default function CommercialRequestsIndex({ requests, filters, statuses }: Props) {
    const { t, tr, formatDate } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('requests', 'Demandes'), href: '/commercial/requests' },
    ];

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/commercial/requests',
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Gestion des demandes - Commercial', 'Requests Management - Commercial')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Demandes de calibration', 'Calibration Requests')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr('Consultez et traitez l\'ensemble des demandes clients.', 'Review and process all client requests.')}
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr(
                                        'Rechercher par n° de demande, client, équipement...',
                                        'Search by request #, client, equipment...'
                                    )}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="w-full sm:w-64">
                                <Select
                                    value={status}
                                    onValueChange={(val) => {
                                        setStatus(val);
                                        router.get(
                                            '/commercial/requests',
                                            {
                                                search: search || undefined,
                                                status: val === 'all' ? undefined : val,
                                            },
                                            { preserveState: true }
                                        );
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={tr('Tous les statuts', 'All statuses')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{tr('Tous les statuts', 'All statuses')}</SelectItem>
                                        {Object.entries(statuses).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
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
                        <CardTitle className="text-base font-semibold">
                            {tr('Toutes les demandes', 'All Requests')} ({requests.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {requests.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucune demande trouvée.', 'No requests found.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Numéro', 'Number')}</th>
                                            <th className="px-6 py-3">{tr('Client', 'Client')}</th>
                                            <th className="px-6 py-3">{tr('Équipements', 'Equipment')}</th>
                                            <th className="px-6 py-3">{tr('Dates', 'Dates')}</th>
                                            <th className="px-6 py-3">{tr('Lieu', 'Location')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Actions', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {requests.data.map((req) => (
                                            <tr key={req.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold">
                                                    <Link href={`/commercial/requests/${req.id}`} className="hover:underline text-blue-600">
                                                        {req.request_number}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground font-normal">
                                                        {formatDate(req.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">
                                                        {req.client?.company_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {req.client?.contact_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {req.items_count || req.items?.length || 0} {tr('instrument(s)', 'instrument(s)')}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {req.scheduled_date ? (
                                                        <span className="font-semibold text-emerald-600">
                                                            {formatDate(req.scheduled_date)}
                                                        </span>
                                                    ) : req.proposed_date ? (
                                                        <span className="text-amber-600">
                                                            {tr('Prop', 'Prop')}: {formatDate(req.proposed_date)}
                                                        </span>
                                                    ) : req.preferred_date ? (
                                                        <span className="text-muted-foreground">
                                                            {tr('Souhait', 'Req')}: {formatDate(req.preferred_date)}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {req.scheduled_location === 'both' || (!req.scheduled_location && req.preferred_location === 'both')
                                                        ? tr('Labo & Sur site (Mixte)', 'Lab & Client site (Both)')
                                                        : req.scheduled_location === 'client_site' || (!req.scheduled_location && req.preferred_location === 'client_site')
                                                        ? tr('Sur site client', 'Client site')
                                                        : tr('Laboratoire', 'Laboratory')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={req.status} label={req.status_label} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={`/commercial/requests/${req.id}`}>
                                                            {tr('Consulter', 'View')}
                                                        </Link>
                                                    </Button>
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
