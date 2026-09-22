import { Head, Link } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Contract } from '@/types';

interface Props {
    contracts: {
        data: Contract[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function ClientContractsIndex({ contracts }: Props) {
    const { t, tr, formatDate } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('my_contracts', 'Mes contrats'), href: '/client/contracts' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Mes contrats de calibration', 'My Calibration Contracts')} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Mes contrats de calibration', 'My Calibration Contracts')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr(
                            'Consultez vos contrats-cadres et accords de service en cours ou archivés.',
                            'View your active and archived framework agreements and service contracts.'
                        )}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr('Liste des contrats', 'Contracts List')} ({contracts.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {contracts.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun contrat enregistré pour le moment.', 'No contracts registered yet.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Numéro de contrat', 'Contract Number')}</th>
                                            <th className="px-6 py-3">{tr('Période de validité', 'Validity Period')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3">{tr('Demandes liées', 'Linked Requests')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Document', 'Document')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {contracts.data.map((contract) => (
                                            <tr key={contract.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    <Link href={`/client/contracts/${contract.id}`} className="hover:underline text-blue-600">
                                                        {contract.contract_number}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {contract.start_date ? formatDate(contract.start_date) : '-'} →{' '}
                                                    {contract.end_date ? formatDate(contract.end_date) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={contract.status} />
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium">
                                                    {contract.requests?.length || 0} {tr('demande(s)', 'request(s)')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {contract.document_path ? (
                                                        <Button size="sm" variant="outline" asChild>
                                                            <a href={`/contracts/${contract.id}/download`} target="_blank" rel="noreferrer">
                                                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                                                PDF
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            {tr('Aucun fichier', 'No file')}
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
