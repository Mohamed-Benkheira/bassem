import { Head, router } from '@inertiajs/react';
import { Award, Download, History, Search } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    };
}

export default function ManagerHistoryIndex({ operations, filters }: Props) {
    const { t, tr, formatDate } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Historique des calibrations', 'Calibration History'), href: '/manager/history' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/manager/history', { search: search || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Historique général des calibrations', 'General Calibration History')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Historique général des calibrations', 'General Calibration History')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr(
                            'Registre historique complet des interventions métrologiques, rapports et certificats émis.',
                            'Complete historical register of metrological interventions, reports, and issued certificates.'
                        )}
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr(
                                        'Rechercher par équipement, numéro de série, client, numéro d\'opération...',
                                        'Search by equipment, serial number, client, operation number...'
                                    )}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                {tr('Filtrer', 'Filter')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr(`Enregistrements d'interventions (${operations.total})`, `Intervention Records (${operations.total})`)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {operations.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun historique trouvé.', 'No history found.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Année / Opération', 'Year / Operation')}</th>
                                            <th className="px-6 py-3">{tr('Équipement', 'Equipment')}</th>
                                            <th className="px-6 py-3">{tr('Client', 'Client')}</th>
                                            <th className="px-6 py-3">{tr('Technicien', 'Technician')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3">{tr('Certificat', 'Certificate')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Documents', 'Documents')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {operations.data.map((op) => (
                                            <tr key={op.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold font-mono">
                                                    <div>{op.operation_number}</div>
                                                    <div className="text-xs text-muted-foreground font-normal">
                                                        {op.actual_date ? formatDate(op.actual_date) : formatDate(op.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{op.item?.equipment_name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        SN: {op.item?.serial_number || 'N/A'} • {op.item?.brand}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium">
                                                    {op.client?.company_name}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {op.technician?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={op.status} label={op.status_label} />
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono font-medium">
                                                    {op.certificate ? (
                                                        <span className="text-emerald-700 dark:text-emerald-400">
                                                            {op.certificate.certificate_number}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {op.report && (
                                                            <Button size="sm" variant="ghost" asChild className="h-8 text-xs">
                                                                <a href={`/reports/${op.report.id}/download`} target="_blank" rel="noreferrer" title={tr('Rapport', 'Report')}>
                                                                    {tr('Rapport', 'Report')}
                                                                </a>
                                                            </Button>
                                                        )}
                                                        {op.certificate && (
                                                            <Button size="sm" variant="outline" asChild className="h-8 text-xs text-blue-600">
                                                                <a href={`/certificates/${op.certificate.id}/download`} target="_blank" rel="noreferrer" title={tr('Certificat', 'Certificate')}>
                                                                    <Download className="mr-1 h-3.5 w-3.5" />
                                                                    {tr('Certificat', 'Certificate')}
                                                                </a>
                                                            </Button>
                                                        )}
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

