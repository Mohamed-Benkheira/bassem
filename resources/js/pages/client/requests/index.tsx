import { Head, Link, router } from '@inertiajs/react';
import { Filter, PlusCircle, Search } from 'lucide-react';
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

export default function ClientRequestsIndex({ requests, filters, statuses }: Props) {
    const { t, tr, formatDate, isEnglish } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('my_requests', 'Mes demandes'), href: '/client/requests' },
    ];

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/client/requests',
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Mes demandes de calibration', 'My Calibration Requests')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {tr('Mes demandes de calibration', 'My Calibration Requests')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {tr(
                                'Gérez et suivez l\'évolution de vos demandes d\'étalonnage.',
                                'Manage and track the progress of your calibration requests.'
                            )}
                        </p>
                    </div>

                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <Link href="/client/requests/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {tr('Créer une demande', 'Create Request')}
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr(
                                        'Rechercher par numéro de demande, équipement, n° de série...',
                                        'Search by request number, equipment, serial number...'
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
                                            '/client/requests',
                                            {
                                                search: search || undefined,
                                                status: val === 'all' ? undefined : val,
                                            },
                                            { preserveState: true }
                                        );
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={tr('Filtrer par statut', 'Filter by status')} />
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

                {/* Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr('Liste des demandes', 'Requests List')} ({requests.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {requests.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr(
                                    'Aucune demande ne correspond à vos critères de recherche.',
                                    'No requests match your search criteria.'
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Numéro', 'Number')}</th>
                                            <th className="px-6 py-3">{tr('Équipements', 'Equipment')}</th>
                                            <th className="px-6 py-3">{tr('Date d\'intervention', 'Intervention Date')}</th>
                                            <th className="px-6 py-3">{tr('Lieu', 'Location')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Actions', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {requests.data.map((req) => (
                                            <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    <Link href={`/client/requests/${req.id}`} className="hover:underline text-blue-600">
                                                        {req.request_number}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatDate(req.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">
                                                        {req.items?.[0]?.equipment_name || tr('Aucun équipement', 'No equipment')}
                                                    </div>
                                                    {(req.items?.length || 0) > 1 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            + {(req.items?.length || 0) - 1} {tr('autre(s)', 'other(s)')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {req.scheduled_date ? (
                                                        <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                                            {tr('Confirmée', 'Confirmed')} : {formatDate(req.scheduled_date)}
                                                        </span>
                                                    ) : req.proposed_date ? (
                                                        <span className="font-medium text-amber-700 dark:text-amber-400">
                                                            {tr('Proposée', 'Proposed')} : {formatDate(req.proposed_date)}
                                                        </span>
                                                    ) : req.preferred_date ? (
                                                        <span className="text-muted-foreground">
                                                            {tr('Souhaitée', 'Requested')} : {formatDate(req.preferred_date)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">
                                                            {tr('Non définie', 'Not defined')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {req.preferred_location === 'laboratory'
                                                        ? tr('Laboratoire', 'Laboratory')
                                                        : req.preferred_location === 'both'
                                                        ? tr('Labo & Sur site (Mixte)', 'Lab & Client site (Both)')
                                                        : tr('Sur site client', 'Client Site')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={req.status} label={req.status_label} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={`/client/requests/${req.id}`}>
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
