import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, FileCheck, FileText } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Contract } from '@/types';

interface Props {
    contract: Contract;
}

export default function ClientContractsShow({ contract }: Props) {
    const { tr, formatDate } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Mes contrats', 'My contracts'), href: '/client/contracts' },
        { title: contract.contract_number, href: `/client/contracts/${contract.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${tr('Contrat', 'Contract')} ${contract.contract_number}`} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 text-muted-foreground">
                        <Link href="/client/contracts">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {tr('Retour aux contrats', 'Back to contracts')}
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {tr('Contrat', 'Contract')} {contract.contract_number}
                        </h1>
                        <StatusBadge status={contract.status} />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">{tr('Validité & Conditions', 'Validity & Conditions')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Période de validité', 'Validity period')}</span>
                                <span className="font-medium">
                                    {tr('Du', 'From')} {contract.start_date ? formatDate(contract.start_date) : '-'} {tr('au', 'to')}{' '}
                                    {contract.end_date ? formatDate(contract.end_date) : '-'}
                                </span>
                            </div>
                            {contract.notes && (
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Notes', 'Notes')}</span>
                                    <p className="text-xs mt-1 bg-muted/40 p-2 rounded">{contract.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">{tr('Document signé', 'Signed document')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {contract.document_path ? (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        {tr('Fichier :', 'File:')} <strong>{contract.document_name || tr('Contrat.pdf', 'Contract.pdf')}</strong>
                                    </p>
                                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        <a href={`/contracts/${contract.id}/download`} target="_blank" rel="noreferrer">
                                            <Download className="mr-2 h-4 w-4" />
                                            {tr('Télécharger l\'exemplaire PDF', 'Download PDF copy')}
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic">{tr('Aucun document numérique associé.', 'No digital document attached.')}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr('Demandes de calibration couvertes', 'Covered calibration requests')} ({contract.requests?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {(!contract.requests || contract.requests.length === 0) ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                {tr('Aucune demande n\'a encore été rattachée à ce contrat.', 'No request has been linked to this contract yet.')}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {contract.requests.map((req) => (
                                    <div key={req.id} className="p-4 flex items-center justify-between">
                                        <div>
                                            <Link href={`/client/requests/${req.id}`} className="font-semibold text-sm hover:underline text-blue-600">
                                                {req.request_number}
                                            </Link>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {req.items?.length || 0} {tr('instrument(s)', 'instrument(s)')} • {tr('Créée le', 'Created on')} {formatDate(req.created_at)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={req.status} label={req.status_label} />
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={`/client/requests/${req.id}`}>{tr('Voir', 'View')}</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
