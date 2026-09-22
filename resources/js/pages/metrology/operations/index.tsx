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
import type { BreadcrumbItem, CalibrationOperation } from '@/types';

interface Props {
    operations: {
        data: CalibrationOperation[];
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

export default function MetrologyOperationsIndex({ operations, filters, statuses }: Props) {
    const { t, tr, formatDate } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('my_calibrations', 'Mes calibrations'), href: '/metrology/operations' },
    ];

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/metrology/operations',
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Opérations de calibration - Métrologie', 'Calibration Operations - Metrology')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Opérations de calibration', 'Calibration Operations')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr(
                            'Exécution technique des étalonnages et gestion des rapports de mesure.',
                            'Technical calibration execution and measurement report management.'
                        )}
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr(
                                        'Rechercher par n° d\'opération, client, équipement, n° série...',
                                        'Search by operation #, client, equipment, serial #...'
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
                                            '/metrology/operations',
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
                            {tr('Liste des opérations', 'Operations List')} ({operations.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {operations.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucune opération trouvée.', 'No operations found.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('N° Opération', 'Operation #')}</th>
                                            <th className="px-6 py-3">{tr('Équipement', 'Equipment')}</th>
                                            <th className="px-6 py-3">{tr('Client', 'Client')}</th>
                                            <th className="px-6 py-3">{tr('Technicien', 'Technician')}</th>
                                            <th className="px-6 py-3">{tr('Date prévue', 'Scheduled Date')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Actions', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {operations.data.map((op) => (
                                            <tr key={op.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold font-mono text-foreground">
                                                    <Link href={`/metrology/operations/${op.id}`} className="hover:underline text-blue-600">
                                                        {op.operation_number}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">
                                                        {op.item?.equipment_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {tr('N° Série', 'Serial #')} : {op.item?.serial_number || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {op.client?.company_name}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium">
                                                    {op.technician?.name || (
                                                        <span className="text-amber-600 italic">
                                                            {tr('Non affecté', 'Unassigned')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {op.scheduled_date ? formatDate(op.scheduled_date) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={op.status} label={op.status_label} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button asChild size="sm" variant="outline">
                                                        <Link href={`/metrology/operations/${op.id}`}>
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
