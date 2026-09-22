import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, FileCheck, FileText, Mail, Phone } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Client } from '@/types';

interface Props {
    client: Client;
}

export default function CommercialClientsShow({ client }: Props) {
    const { t, tr, formatDate } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Clients', 'Clients'), href: '/commercial/clients' },
        { title: client.company_name, href: `/commercial/clients/${client.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${tr('Client', 'Client')} ${client.company_name}`} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 text-muted-foreground">
                        <Link href="/commercial/clients">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {tr('Retour aux clients', 'Back to clients')}
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {client.company_name}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr('Fiche client, contrats et historique des demandes de calibration.', 'Client record, contracts, and calibration request history.')}
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                    <Card className="sm:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">{tr('Coordonnées de l\'entreprise', 'Company Details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Contact principal', 'Primary Contact')}</span>
                                <span className="font-medium">{client.contact_name}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('E-mail', 'Email')}</span>
                                <span className="font-medium">{client.email}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Téléphone', 'Phone')}</span>
                                <span className="font-medium">{client.phone || '-'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Adresse', 'Address')}</span>
                                <span className="font-medium">{client.address || '-'}</span>
                                <div className="text-xs text-muted-foreground">{client.postal_code} {client.city}</div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('N° SIRET / TVA', 'Tax ID / VAT Number')}</span>
                                <span className="font-mono text-xs">{client.tax_number || '-'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="sm:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-semibold">
                                    {tr(`Demandes de calibration (${client.requests?.length || 0})`, `Calibration Requests (${client.requests?.length || 0})`)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {(!client.requests || client.requests.length === 0) ? (
                                    <div className="py-6 text-center text-muted-foreground text-sm">
                                        {tr('Aucune demande passée par ce client.', 'No requests made by this client.')}
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {client.requests.map((r) => (
                                            <div key={r.id} className="p-3 flex items-center justify-between text-sm">
                                                <div>
                                                    <Link href={`/commercial/requests/${r.id}`} className="font-semibold hover:underline text-blue-600">
                                                        {r.request_number}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatDate(r.created_at)} • {r.items?.length || 0} {tr('équipement(s)', 'equipment item(s)')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={r.status} label={r.status_label} />
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/commercial/requests/${r.id}`}>{tr('Voir', 'View')}</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">
                                    {tr(`Contrats (${client.contracts?.length || 0})`, `Contracts (${client.contracts?.length || 0})`)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {(!client.contracts || client.contracts.length === 0) ? (
                                    <div className="py-6 text-center text-muted-foreground text-sm">
                                        {tr('Aucun contrat enregistré.', 'No contracts recorded.')}
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {client.contracts.map((c) => (
                                            <div key={c.id} className="p-3 flex items-center justify-between text-sm">
                                                <div>
                                                    <div className="font-semibold font-mono">{c.contract_number}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {tr('Du', 'From')} {c.start_date ? formatDate(c.start_date) : '-'} {tr('au', 'to')}{' '}
                                                        {c.end_date ? formatDate(c.end_date) : '-'}
                                                    </div>
                                                </div>
                                                <StatusBadge status={c.status} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

