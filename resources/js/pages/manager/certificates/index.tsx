import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Award, CheckCircle2, Download, Plus, Search, ShieldCheck, Upload } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationCertificate, CalibrationOperation } from '@/types';

interface Props {
    certificates: {
        data: CalibrationCertificate[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    readyOperations: CalibrationOperation[];
    filters: {
        search?: string;
        status?: string;
    };
    statuses: Record<string, string>;
}

export default function ManagerCertificatesIndex({ certificates, readyOperations, filters, statuses }: Props) {
    const { t, tr, formatDate, isEnglish } = useTranslation();
    const { auth } = usePage<{ auth: { user: { is_delegated_manager?: boolean; can_manage_certificates?: boolean } } }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Certificats de calibration', 'Calibration Certificates'), href: '/manager/certificates' },
    ];

    const [selectedOperation, setSelectedOperation] = useState<CalibrationOperation | null>(null);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const generateForm = useForm({
        file: null as File | null,
    });

    const openGenerateModal = (op: CalibrationOperation) => {
        setSelectedOperation(op);
        setIsGenerateModalOpen(true);
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOperation) return;

        generateForm.post(`/manager/operations/${selectedOperation.id}/certificate`, {
            onSuccess: () => {
                setIsGenerateModalOpen(false);
                setSelectedOperation(null);
                generateForm.reset();
            },
        });
    };

    const handleValidate = (certId: number) => {
        if (confirm(tr(
            'Voulez-vous valider définitivement ce certificat de calibration ? Une fois validé, il devient définitif et sera immédiatement accessible au client.',
            'Do you want to permanently validate this calibration certificate? Once validated, it becomes final and immediately accessible to the client.'
        ))) {
            router.post(`/manager/certificates/${certId}/validate`);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/manager/certificates', { search: search || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Gestion des certificats - Responsable Métrologie', 'Certificate Management - Metrology Manager')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {tr('Certificats de calibration', 'Calibration Certificates')}
                        </h1>
                        {auth.user?.is_delegated_manager && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                                {tr('Délégation de validation active (Section 28)', 'Active Validation Delegation (Section 28)')}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr(
                            'Génération et validation définitive des certificats d\'étalonnage officiels.',
                            'Generation and permanent validation of official calibration certificates.'
                        )}
                    </p>
                </div>

                {/* Operations Ready for Certificate Generation */}
                {readyOperations.length > 0 && (
                    <Card className="border-l-4 border-l-purple-600 bg-purple-50/30 dark:bg-purple-950/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                                <Award className="h-4 w-4 text-purple-600" />
                                {tr(
                                    `Calibrations approuvées prêtes pour émission du certificat (${readyOperations.length})`,
                                    `Approved Calibrations Ready for Certificate Issuance (${readyOperations.length})`
                                )}
                            </CardTitle>
                            <CardDescription>
                                {tr(
                                    'Le rapport technique a été validé. Téléversez le certificat officiel pour ces instruments.',
                                    'The technical report has been validated. Upload the official certificate for these instruments.'
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {readyOperations.map((op) => {
                                    const hasContract = Boolean(op.request?.contract_id || (op as any).request?.contract);
                                    const contractNumber = op.request?.contract?.contract_number;
                                    return (
                                        <div key={op.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div>
                                                <div className="font-semibold text-sm text-foreground">
                                                    {op.operation_number} • {op.item?.equipment_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {tr('Client', 'Client')} : {op.client?.company_name} • {tr('Rapport approuvé', 'Approved report')} : {op.report?.report_number}
                                                </div>
                                                <div className="text-xs mt-1">
                                                    {hasContract ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                            ✓ {tr('Contrat rattaché', 'Contract linked')} : {contractNumber || `#${op.request?.contract_id}`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-destructive font-medium">
                                                            ⚠ {tr('Contrat requis avant émission de certificat', 'Contract required before certificate issuance')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => openGenerateModal(op)}
                                                disabled={!hasContract}
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs disabled:opacity-50"
                                                title={!hasContract ? tr('Un contrat validé doit obligatoirement être rattaché à la demande', 'A validated contract must be linked to the request') : undefined}
                                            >
                                                <Upload className="mr-1.5 h-3.5 w-3.5" />
                                                {tr('Générer le certificat', 'Generate Certificate')}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Search and Table */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr(
                                        'Rechercher par n° de certificat, client, équipement...',
                                        'Search by certificate number, client, equipment...'
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
                            {tr(`Tous les certificats (${certificates.total})`, `All Certificates (${certificates.total})`)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {certificates.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun certificat trouvé.', 'No certificates found.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('N° Certificat', 'Certificate No.')}</th>
                                            <th className="px-6 py-3">{tr('Équipement', 'Equipment')}</th>
                                            <th className="px-6 py-3">{tr('Client', 'Client')}</th>
                                            <th className="px-6 py-3">{tr('Généré par', 'Generated by')}</th>
                                            <th className="px-6 py-3">{tr('Validation', 'Validation')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Actions', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {certificates.data.map((cert) => (
                                            <tr key={cert.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold font-mono text-foreground">
                                                    {cert.certificate_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{cert.item?.equipment_name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        SN: {cert.item?.serial_number || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium">
                                                    {cert.client?.company_name}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {cert.generated_by?.name}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {cert.validated_at ? (
                                                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                                            {tr('Le', 'On')} {formatDate(cert.validated_at)} {tr('par', 'by')} {cert.validated_by?.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-600 italic">{tr('En attente de validation', 'Awaiting validation')}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={cert.status} label={cert.status_label} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!cert.is_final && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleValidate(cert.id)}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold"
                                                            >
                                                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                                                {tr('Valider', 'Validate')}
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="outline" asChild className="h-8 text-xs">
                                                            <a href={`/certificates/${cert.id}/download`} target="_blank" rel="noreferrer">
                                                                <Download className="mr-1 h-3.5 w-3.5" />
                                                                PDF
                                                            </a>
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

                {/* Generate Certificate Dialog */}
                <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{tr('Génération du certificat de calibration', 'Calibration Certificate Generation')}</DialogTitle>
                            <DialogDescription>
                                {tr('Téléversez le certificat officiel pour', 'Upload official certificate for')} {selectedOperation?.item?.equipment_name} ({tr('Opération', 'Operation')} {selectedOperation?.operation_number}).
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleGenerate} className="space-y-4 py-2">
                            <div>
                                <Label>{tr('Fichier officiel du certificat (PDF) *', 'Official Certificate File (PDF) *')}</Label>
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => generateForm.setData('file', e.target.files?.[0] || null)}
                                    className="mt-1"
                                    required
                                />
                                {generateForm.errors.file && (
                                    <p className="text-xs text-destructive mt-1">{generateForm.errors.file}</p>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded">
                                {tr(
                                    'Le certificat sera initialement enregistré sous le statut Brouillon. Vous pourrez ensuite le valider pour le rendre définitif et accessible au client.',
                                    'The certificate will initially be recorded as Draft. You can then validate it to make it final and accessible to the client.'
                                )}
                            </p>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
                                    {tr('Annuler', 'Cancel')}
                                </Button>
                                <Button type="submit" disabled={generateForm.processing} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                                    {generateForm.processing ? tr('Génération...', 'Generating...') : tr('Créer le certificat', 'Create Certificate')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

