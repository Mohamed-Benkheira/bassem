import { Head } from '@inertiajs/react';
import { Award, Download, History } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationOperation } from '@/types';

interface Props {
    history: Record<string, CalibrationOperation[]>;
}

export default function ClientHistoryIndex({ history }: Props) {
    const { t, tr } = useTranslation();
    const equipmentGroups = Object.entries(history);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('history', 'Historique'), href: '/client/history' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Historique de calibration des équipements', 'Equipment Calibration History')} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Historique des calibrations', 'Calibration History')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr(
                            'Traçabilité métrologique par équipement et numéro de série au fil des années.',
                            'Metrological traceability by equipment and serial number over time.'
                        )}
                    </p>
                </div>

                {equipmentGroups.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground text-sm">
                            {tr('Aucun historique de calibration disponible pour le moment.', 'No calibration history available yet.')}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {equipmentGroups.map(([equipmentKey, operations]) => (
                            <Card key={equipmentKey} className="overflow-hidden border-t-4 border-t-indigo-600">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <History className="h-4 w-4 text-indigo-600" />
                                            {equipmentKey}
                                        </CardTitle>
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {operations.length} {tr('intervention(s) répertoriée(s)', 'recorded operation(s)')}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {operations.map((op) => (
                                            <div key={op.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/10">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-sm text-foreground">
                                                            {op.actual_date ? new Date(op.actual_date).getFullYear() : new Date(op.created_at).getFullYear()} — {tr('Opération', 'Operation')} {op.operation_number}
                                                        </span>
                                                        <StatusBadge status={op.status} label={op.status_label} />
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {tr('Demande', 'Request')} : <strong>{op.request?.request_number}</strong> • {tr('Lieu', 'Location')} : {op.location === 'laboratory' ? tr('Laboratoire', 'Laboratory') : tr('Sur site', 'On site')}
                                                    </div>
                                                    {op.certificate && (
                                                        <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                                                            <Award className="h-3.5 w-3.5" />
                                                            {tr('Certificat', 'Certificate')} : {op.certificate.certificate_number}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {op.certificate?.is_final && (
                                                        <Button size="sm" variant="outline" asChild className="text-indigo-600 hover:text-indigo-700">
                                                            <a href={`/certificates/${op.certificate.id}/download`} target="_blank" rel="noreferrer">
                                                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                                                {tr('Certificat', 'Certificate')}
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
