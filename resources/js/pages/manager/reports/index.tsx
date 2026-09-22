import { Head, Link, router } from '@inertiajs/react';
import { Download, FileSpreadsheet, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationReport } from '@/types';

interface Props {
    reports: {
        data: CalibrationReport[];
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

export default function ManagerReportsIndex({ reports, filters, statuses }: Props) {
    const { t, tr, formatDate, isEnglish } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Rapports de calibration', 'Calibration Reports'), href: '/manager/reports' },
    ];

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/manager/reports',
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Contrôle des rapports - Responsable Métrologie', 'Report Review - Metrology Manager')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Revue des rapports de calibration', 'Calibration Reports Review')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr(
                            'Examinez les rapports téléversés par les techniciens avant émission des certificats officiels.',
                            'Review reports uploaded by technicians prior to official certificate issuance.'
                        )}
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr('Rechercher par n° de rapport, client, équipement...', 'Search by report number, client, equipment...')}
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
                                            '/manager/reports',
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
                                                {isEnglish ? key.replace('_', ' ') : label}
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
                            {tr(`Tous les rapports (${reports.total})`, `All Reports (${reports.total})`)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {reports.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun rapport technique trouvé.', 'No technical reports found.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('N° Rapport', 'Report No.')}</th>
                                            <th className="px-6 py-3">{tr('Équipement', 'Equipment')}</th>
                                            <th className="px-6 py-3">{tr('Client', 'Client')}</th>
                                            <th className="px-6 py-3">{tr('Technicien', 'Technician')}</th>
                                            <th className="px-6 py-3">{tr('Date de dépôt', 'Upload Date')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Actions', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {reports.data.map((rep) => (
                                            <tr key={rep.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold font-mono text-foreground">
                                                    <Link href={`/manager/reports/${rep.id}`} className="hover:underline text-blue-600">
                                                        {rep.report_number}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{rep.item?.equipment_name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        SN: {rep.item?.serial_number || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium">
                                                    {rep.request?.client?.company_name}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {rep.uploaded_by?.name}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {formatDate(rep.created_at)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={rep.status} label={rep.status_label} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm" variant="outline" asChild className="h-8">
                                                            <a href={`/reports/${rep.id}/download`} target="_blank" rel="noreferrer">
                                                                <Download className="mr-1 h-3.5 w-3.5" />
                                                                {tr('Fichier', 'File')}
                                                            </a>
                                                        </Button>
                                                        <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white h-8">
                                                            <Link href={`/manager/reports/${rep.id}`}>
                                                                {tr('Examiner', 'Review')}
                                                            </Link>
                                                        </Button>
                                                    </div>
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
