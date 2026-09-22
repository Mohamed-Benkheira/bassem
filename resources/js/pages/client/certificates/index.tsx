import { Head, router } from '@inertiajs/react';
import { Award, Download, Search } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationCertificate } from '@/types';

interface Props {
    certificates: {
        data: CalibrationCertificate[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function ClientCertificatesIndex({ certificates, filters }: Props) {
    const { t, tr, formatDate } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('my_certificates', 'Mes certificats'), href: '/client/certificates' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/client/certificates', { search: search || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Mes certificats de calibration', 'My Calibration Certificates')} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Mes certificats de calibration', 'My Calibration Certificates')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr(
                            'Consultez et téléchargez les certificats d\'étalonnage officiels validés par le laboratoire.',
                            'View and download official calibration certificates validated by the laboratory.'
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
                                        'Rechercher par numéro de certificat, désignation équipement, n° de série...',
                                        'Search by certificate number, equipment name, serial number...'
                                    )}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                {tr('Rechercher', 'Search')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Award className="h-4 w-4 text-indigo-600" />
                            {tr('Certificats validés', 'Validated Certificates')} ({certificates.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {certificates.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr(
                                    'Aucun certificat validé ne correspond à votre recherche.',
                                    'No validated certificates match your search.'
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('N° Certificat', 'Certificate #')}</th>
                                            <th className="px-6 py-3">{tr('Équipement', 'Equipment')}</th>
                                            <th className="px-6 py-3">{tr('N° Série', 'Serial #')}</th>
                                            <th className="px-6 py-3">{tr('Date de validation', 'Validation Date')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Téléchargement', 'Download')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {certificates.data.map((cert) => (
                                            <tr key={cert.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold text-foreground font-mono">
                                                    {cert.certificate_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">
                                                        {cert.item?.equipment_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {cert.item?.service?.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono">
                                                    {cert.item?.serial_number || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {formatDate(cert.validated_at || cert.created_at)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={cert.status} label={cert.status_label} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" variant="outline" asChild className="text-blue-600 hover:text-blue-700">
                                                        <a href={`/certificates/${cert.id}/download`} target="_blank" rel="noreferrer">
                                                            <Download className="mr-1.5 h-3.5 w-3.5" />
                                                            {tr('PDF Officiel', 'Official PDF')}
                                                        </a>
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
