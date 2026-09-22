import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    XCircle,
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationReport } from '@/types';

interface Props {
    report: CalibrationReport;
}

export default function ManagerReportsShow({ report }: Props) {
    const { t, tr, formatDate, isEnglish } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Rapports', 'Reports'), href: '/manager/reports' },
        { title: report.report_number, href: `/manager/reports/${report.id}` },
    ];

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const reviewForm = useForm({
        decision: 'APPROVE',
        review_notes: '',
    });

    const handleApprove = () => {
        reviewForm.setData('decision', 'APPROVE');
        reviewForm.post(`/manager/reports/${report.id}/review`);
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        reviewForm.setData('decision', 'REJECT');
        reviewForm.post(`/manager/reports/${report.id}/review`, {
            onSuccess: () => setIsRejectModalOpen(false),
        });
    };

    const isPendingReview = report.status === 'PENDING_REVIEW';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${tr('Examen Rapport', 'Report Review')} ${report.report_number}`} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 text-muted-foreground">
                            <Link href="/manager/reports">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {tr('Retour aux rapports', 'Back to reports')}
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {tr('Rapport', 'Report')} {report.report_number}
                            </h1>
                            <StatusBadge status={report.status} label={report.status_label} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {tr('Déposé par', 'Uploaded by')} : <strong>{report.uploaded_by?.name}</strong> • {tr('Client', 'Client')} : {report.request?.client?.company_name}
                        </p>
                    </div>

                    {isPendingReview && (
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsRejectModalOpen(true)}
                                className="text-destructive border-destructive/30 hover:bg-destructive/10 font-medium"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                {tr('Demander correction', 'Request Correction')}
                            </Button>

                            <Button
                                onClick={handleApprove}
                                disabled={reviewForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {tr('Valider le rapport', 'Approve Report')}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">{tr('Instrument analysé', 'Analyzed Instrument')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Désignation', 'Designation')}</span>
                                <span className="font-semibold text-foreground">{report.item?.equipment_name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Marque / Modèle', 'Brand / Model')}</span>
                                    <span className="font-medium">{report.item?.brand || '-'} {report.item?.model || ''}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Numéro de série', 'Serial Number')}</span>
                                    <span className="font-mono text-xs">{report.item?.serial_number || 'N/A'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Service de calibration', 'Calibration Service')}</span>
                                <span className="font-medium text-blue-600">{report.item?.service?.name}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">{tr('Fichier & Traçabilité', 'File & Traceability')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Nom du fichier', 'File Name')}</span>
                                <span className="font-mono text-xs font-semibold">{report.file_name}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Date de téléversement', 'Upload Date')}</span>
                                <span className="font-medium">{new Date(report.created_at).toLocaleString(isEnglish ? 'en-US' : 'fr-FR')}</span>
                            </div>
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium mt-2">
                                <a href={`/reports/${report.id}/download`} target="_blank" rel="noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    {tr('Télécharger le fichier du rapport', 'Download Report File')}
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {report.review_notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">{tr('Historique des remarques de revue', 'Review Notes History')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs bg-muted/40 p-3 rounded text-muted-foreground">
                                {report.review_notes}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Reject / Request Correction Dialog */}
                <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{tr('Demander une correction sur le rapport', 'Request Correction on Report')}</DialogTitle>
                            <DialogDescription>
                                {tr(
                                    'Précisez les anomalies ou informations manquantes au technicien pour correction.',
                                    'Specify anomalies or missing information to the technician for correction.'
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleReject} className="space-y-4 py-2">
                            <div>
                                <Label>{tr('Motif de la demande de correction *', 'Reason for Correction Request *')}</Label>
                                <textarea
                                    rows={4}
                                    required
                                    value={reviewForm.data.review_notes}
                                    onChange={(e) => reviewForm.setData('review_notes', e.target.value)}
                                    placeholder={tr(
                                        'Ex: Erreur dans le calcul d\'incertitude sur le point 50 bar, ré-étalonnage du point zéro requis...',
                                        'E.g.: Error in uncertainty calculation at 50 bar, zero point recalibration required...'
                                    )}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                                    {tr('Annuler', 'Cancel')}
                                </Button>
                                <Button type="submit" variant="destructive" disabled={reviewForm.processing}>
                                    {reviewForm.processing ? tr('Envoi...', 'Sending...') : tr('Transmettre au technicien', 'Send to Technician')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

