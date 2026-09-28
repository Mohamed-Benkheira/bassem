import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    Calendar,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Play,
    Upload,
    Wrench,
} from 'lucide-react';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNamespace } from '@/hooks/use-namespace';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationOperation } from '@/types';

interface Props {
    operation: CalibrationOperation;
}

export default function MetrologyOperationsShow({ operation }: Props) {
    const { t, tr, formatDate, isEnglish } = useTranslation();
    const basePath = `/${useNamespace()}`;
    const isManagerSection = basePath === '/manager';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Opérations', 'Operations'), href: `${basePath}/operations` },
        { title: operation.operation_number, href: `${basePath}/operations/${operation.id}` },
    ];

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const startForm = useForm({});
    const uploadForm = useForm({
        file: null as File | null,
        notes: '',
    });

    const handleStart = () => {
        startForm.post(`${basePath}/operations/${operation.id}/start`);
    };

    const handleUploadReport = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post(`${basePath}/operations/${operation.id}/report`, {
            onSuccess: () => {
                setIsUploadModalOpen(false);
                uploadForm.reset();
            },
        });
    };

    const canStart = !isManagerSection && ['SCHEDULED', 'ASSIGNED'].includes(operation.status);
    const canUploadReport = !isManagerSection && ['IN_PROGRESS', 'REPORT_REJECTED', 'ASSIGNED'].includes(operation.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${tr('Opération', 'Operation')} ${operation.operation_number} - ${tr('Métrologie', 'Metrology')}`} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 text-muted-foreground">
                            <Link href={`${basePath}/operations`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {tr('Retour aux opérations', 'Back to operations')}
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {tr('Opération', 'Operation')} {operation.operation_number}
                            </h1>
                            <StatusBadge status={operation.status} label={operation.status_label} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {tr('Demande parente', 'Parent request')} : <strong>{operation.request?.request_number}</strong> • {tr('Client', 'Client')} : {operation.client?.company_name}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {canStart && (
                            <Button
                                onClick={handleStart}
                                disabled={startForm.processing}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                            >
                                <Play className="mr-2 h-4 w-4" />
                                {tr('Démarrer la calibration', 'Start Calibration')}
                            </Button>
                        )}

                        {canUploadReport && (
                            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                        <Upload className="mr-2 h-4 w-4" />
                                        {tr('Téléverser le rapport technique', 'Upload Technical Report')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{tr('Téléversement du rapport de calibration', 'Upload Calibration Report')}</DialogTitle>
                                        <DialogDescription>
                                            {tr(
                                                'Téléversez le rapport contenant les mesures brutes, calculs d\'incertitudes et résultats conformes (PDF, DOC, DOCX).',
                                                'Upload the report containing raw measurements, uncertainty calculations, and compliance results (PDF, DOC, DOCX).'
                                            )}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleUploadReport} className="space-y-4 py-2">
                                        <div>
                                            <Label>{tr('Fichier de rapport technique (PDF, DOC, DOCX) *', 'Technical Report File (PDF, DOC, DOCX) *')}</Label>
                                            <Input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => uploadForm.setData('file', e.target.files?.[0] || null)}
                                                className="mt-1"
                                                required
                                            />
                                            {uploadForm.errors.file && (
                                                <p className="text-xs text-destructive mt-1">{uploadForm.errors.file}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label>{tr('Observations ou résumé métrologique', 'Observations or Metrological Summary')}</Label>
                                            <textarea
                                                rows={3}
                                                value={uploadForm.data.notes}
                                                onChange={(e) => uploadForm.setData('notes', e.target.value)}
                                                placeholder={tr(
                                                    'Ex: Étalonnage conforme, dérive nulle constatée sur le zéro...',
                                                    'E.g.: Calibration compliant, zero drift observed on zero point...'
                                                )}
                                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                                                {tr('Annuler', 'Cancel')}
                                            </Button>
                                            <Button type="submit" disabled={uploadForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                                {uploadForm.processing ? tr('Téléversement...', 'Uploading...') : tr('Déposer le rapport', 'Submit Report')}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Correction Warning Banner */}
                {operation.status === 'REPORT_REJECTED' && operation.report?.review_notes && (
                    <div className="rounded-xl border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-200">
                                    {tr('Correction demandée par le Responsable Métrologie', 'Correction Requested by Metrology Manager')}
                                </h3>
                                <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                                    {operation.report.review_notes}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Equipment & Intervention Details */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">{tr('Instrument & Prestation', 'Instrument & Service')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Désignation de l\'équipement', 'Equipment Designation')}</span>
                                <span className="font-semibold text-base text-foreground">{operation.item?.equipment_name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Marque / Modèle', 'Brand / Model')}</span>
                                    <span className="font-medium">{operation.item?.brand || '-'} {operation.item?.model || ''}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Numéro de série', 'Serial Number')}</span>
                                    <span className="font-mono text-xs">{operation.item?.serial_number || 'N/A'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Service de calibration associé', 'Associated Calibration Service')}</span>
                                <span className="font-medium text-blue-600">{operation.item?.service?.name}</span>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {tr('Méthode / Norme', 'Method / Standard')} : {operation.item?.service?.method || tr('Procédure standard', 'Standard procedure')}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Étendue de mesure', 'Measurement Range')}</span>
                                    <span className="font-medium">{operation.item?.measurement_range || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Tolérance', 'Tolerance')}</span>
                                    <span className="font-medium">{operation.item?.tolerance || '-'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">{tr('Intervention technique', 'Technical Intervention')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Technicien affecté', 'Assigned Technician')}</span>
                                    <span className="font-medium">{operation.technician?.name || tr('Non affecté', 'Unassigned')}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Superviseur', 'Supervisor')}</span>
                                    <span className="font-medium">{operation.supervisor?.name || tr('Responsable Métrologie', 'Metrology Manager')}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Lieu', 'Location')}</span>
                                    <span className="font-medium">
                                        {operation.location === 'laboratory' ? tr('Laboratoire', 'Laboratory') : tr('Sur site client', 'On-site')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Date programmée', 'Scheduled Date')}</span>
                                    <span className="font-medium">
                                        {operation.scheduled_date ? formatDate(operation.scheduled_date) : '-'}
                                    </span>
                                </div>
                            </div>
                            {operation.notes && (
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Instructions d\'affectation', 'Assignment Instructions')}</span>
                                    <p className="text-xs mt-1 bg-muted/40 p-2 rounded">{operation.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Report Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                            {tr('Rapport technique de calibration', 'Technical Calibration Report')}
                        </CardTitle>
                        <CardDescription>
                            {tr('Document source faisant foi pour l\'établissement du certificat', 'Official source document used for certificate generation')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!operation.report ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                {tr('Aucun rapport n\'a encore été déposé pour cette opération.', 'No report has been uploaded for this operation yet.')}
                            </div>
                        ) : (
                            <div className="p-4 rounded-lg border bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm text-foreground font-mono">
                                            {operation.report.report_number}
                                        </span>
                                        <StatusBadge status={operation.report.status} label={operation.report.status_label} />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {tr('Fichier', 'File')} : {operation.report.file_name} • {tr('Déposé le', 'Uploaded on')} {new Date(operation.report.created_at).toLocaleString(isEnglish ? 'en-US' : 'fr-FR')} {tr('par', 'by')} {operation.report.uploaded_by?.name}
                                    </div>
                                    {operation.report.review_notes && (
                                        <div className="text-xs text-muted-foreground mt-2 bg-background p-2 rounded border">
                                            <strong>{tr('Note de revue :', 'Review note:')}</strong> {operation.report.review_notes}
                                        </div>
                                    )}
                                </div>

                                <Button size="sm" variant="outline" asChild>
                                    <a href={`/reports/${operation.report.id}/download`} target="_blank" rel="noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        {tr('Télécharger le rapport', 'Download Report')}
                                    </a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

