import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Award,
    CheckCircle2,
    Clock,
    Download,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationRequest } from '@/types';

interface Props {
    calibrationRequest: CalibrationRequest;
}

export default function ClientRequestsShow({ calibrationRequest }: Props) {
    const { t, tr, formatDate, isEnglish } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('my_requests', 'Mes demandes'), href: '/client/requests' },
        { title: calibrationRequest.request_number, href: `/client/requests/${calibrationRequest.id}` },
    ];

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const acceptForm = useForm({});
    const cancelForm = useForm({
        reason: '',
    });

    const handleAcceptDate = () => {
        acceptForm.post(`/client/requests/${calibrationRequest.id}/accept-date`);
    };

    const handleCancelRequest = (e: React.FormEvent) => {
        e.preventDefault();
        cancelForm.post(`/client/requests/${calibrationRequest.id}/cancel`, {
            onSuccess: () => setIsCancelModalOpen(false),
        });
    };

    const isCancellable = [
        'SUBMITTED',
        'SENT_TO_METROLOGY',
        'DATE_PROPOSED',
        'WAITING_CLIENT_CONFIRMATION',
        'ACCEPTED',
    ].includes(calibrationRequest.status);

    const hasProposedDate =
        calibrationRequest.proposed_date &&
        ['DATE_PROPOSED', 'WAITING_CLIENT_CONFIRMATION'].includes(calibrationRequest.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${tr('Demande', 'Request')} ${calibrationRequest.request_number}`} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                {/* Header with Status & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 text-muted-foreground">
                            <Link href="/client/requests">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {tr('Retour aux demandes', 'Back to requests')}
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {tr('Demande', 'Request')} {calibrationRequest.request_number}
                            </h1>
                            <StatusBadge status={calibrationRequest.status} label={calibrationRequest.status_label} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {tr('Créée le', 'Created on')} {formatDate(calibrationRequest.created_at)} • {tr('Client', 'Client')}: {calibrationRequest.client?.company_name}
                        </p>
                    </div>

                    {isCancellable && (
                        <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {tr('Annuler la demande', 'Cancel Request')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{tr('Confirmation d\'annulation', 'Cancel Confirmation')}</DialogTitle>
                                    <DialogDescription>
                                        {tr(
                                            `Êtes-vous sûr de vouloir annuler la demande de calibration ${calibrationRequest.request_number} ? Cette action est irréversible.`,
                                            `Are you sure you want to cancel calibration request ${calibrationRequest.request_number}? This action is irreversible.`
                                        )}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCancelRequest} className="space-y-4 py-2">
                                    <div>
                                        <label htmlFor="cancel-reason" className="text-xs font-semibold">
                                            {tr('Motif de l\'annulation *', 'Reason for cancellation *')}
                                        </label>
                                        <textarea
                                            id="cancel-reason"
                                            rows={3}
                                            required
                                            value={cancelForm.data.reason}
                                            onChange={(e) => cancelForm.setData('reason', e.target.value)}
                                            placeholder={tr(
                                                'Ex: Date proposée incompatible, équipement déjà remplacé...',
                                                'e.g. Incompatible proposed date, equipment already replaced...'
                                            )}
                                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        />
                                        {cancelForm.errors.reason && (
                                            <p className="text-xs text-destructive mt-1">{cancelForm.errors.reason}</p>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCancelModalOpen(false)}
                                        >
                                            {tr('Conserver la demande', 'Keep Request')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={cancelForm.processing}
                                        >
                                            {cancelForm.processing
                                                ? tr('Annulation...', 'Cancelling...')
                                                : tr('Confirmer l\'annulation', 'Confirm Cancellation')}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Proposed Date Confirmation Banner */}
                {hasProposedDate && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/40 p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                                        {tr(
                                            'Date d\'intervention proposée par le service Métrologie',
                                            'Intervention date proposed by Metrology service'
                                        )}
                                    </h3>
                                    <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                                        {tr('Date proposée', 'Proposed date')} : <strong>{formatDate(calibrationRequest.proposed_date)}</strong> • {tr('Lieu', 'Location')} : <strong>{calibrationRequest.proposed_location === 'laboratory' ? tr('Laboratoire', 'Laboratory') : calibrationRequest.proposed_location === 'both' ? tr('Laboratoire & Sur site (Mixte)', 'Laboratory & Client site (Both)') : tr('Sur site client', 'Client site')}</strong>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleAcceptDate}
                                    disabled={acceptForm.processing}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    {tr('Accepter cette date', 'Accept This Date')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* General Information */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">
                                {tr('Détails de l\'intervention', 'Intervention Details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Lieu prévu', 'Scheduled Location')}</span>
                                <span className="font-medium">
                                    {calibrationRequest.scheduled_location === 'laboratory'
                                        ? tr('Au laboratoire de métrologie', 'At metrology laboratory')
                                        : calibrationRequest.scheduled_location === 'client_site'
                                        ? tr('Sur site client', 'At client site')
                                        : calibrationRequest.scheduled_location === 'both'
                                        ? tr('Laboratoire & Sur site (Mixte)', 'Laboratory & Client site (Both)')
                                        : calibrationRequest.preferred_location === 'laboratory'
                                        ? tr('Laboratoire (souhaité)', 'Laboratory (Preferred)')
                                        : calibrationRequest.preferred_location === 'both'
                                        ? tr('Laboratoire & Sur site (souhaité)', 'Laboratory & Client site (Preferred)')
                                        : tr('Sur site client (souhaité)', 'Client site (Preferred)')}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Date planifiée / confirmée', 'Scheduled / Confirmed Date')}</span>
                                <span className="font-medium">
                                    {calibrationRequest.scheduled_date
                                        ? formatDate(calibrationRequest.scheduled_date)
                                        : calibrationRequest.proposed_date
                                        ? `${tr('Proposée', 'Proposed')} : ${formatDate(calibrationRequest.proposed_date)}`
                                        : tr('En cours de planification', 'Scheduling in progress')}
                                </span>
                            </div>
                            {calibrationRequest.contract && (
                                <div>
                                    <span className="text-xs text-muted-foreground block">{tr('Contrat associé', 'Associated Contract')}</span>
                                    <span className="font-medium text-blue-600">
                                        {calibrationRequest.contract.contract_number}
                                    </span>
                                </div>
                            )}
                            {calibrationRequest.client_notes && (
                                <div className="sm:col-span-2 mt-2 pt-2 border-t">
                                    <span className="text-xs text-muted-foreground block">{tr('Notes du client', 'Client Notes')}</span>
                                    <p className="mt-1 text-sm bg-muted/30 p-2.5 rounded-md">
                                        {calibrationRequest.client_notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Final Certificates Box */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Award className="h-4 w-4 text-indigo-600" />
                                {tr('Certificats validés', 'Validated Certificates')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {(!calibrationRequest.certificates || calibrationRequest.certificates.length === 0) ? (
                                <p className="text-xs text-muted-foreground py-2 italic">
                                    {tr(
                                        'Les certificats seront téléchargeables ici dès validation définitive par le Responsable Métrologie.',
                                        'Certificates will be available for download here once validated by the Metrology Manager.'
                                    )}
                                </p>
                            ) : (
                                calibrationRequest.certificates.map((cert) => (
                                    <div key={cert.id} className="p-3 rounded-lg border bg-muted/20 flex flex-col gap-2">
                                        <div className="font-semibold text-xs text-foreground">
                                            {cert.certificate_number}
                                        </div>
                                        <Button size="sm" variant="outline" asChild className="w-full text-xs">
                                            <a href={`/certificates/${cert.id}/download`} target="_blank" rel="noreferrer">
                                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                                {tr('Télécharger PDF', 'Download PDF')}
                                            </a>
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Requested Equipment Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr('Équipements inclus dans la demande', 'Equipment items in request')} ({calibrationRequest.items?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-6 py-3">{tr('Prestation & Équipement', 'Service & Equipment')}</th>
                                        <th className="px-6 py-3">{tr('N° Série / Réf', 'Serial # / Ref')}</th>
                                        <th className="px-6 py-3">{tr('Étendue & Tolérance', 'Range & Tolerance')}</th>
                                        <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {calibrationRequest.items?.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/20">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {item.service?.name}
                                                </div>
                                                <div className="text-sm font-medium text-foreground mt-0.5">
                                                    {item.equipment_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {item.brand && <span>{item.brand} </span>}
                                                    {item.model && <span>({item.model}) </span>}
                                                    {item.service?.measurement_category && (
                                                        <span>• [{item.service.measurement_category}]</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono">
                                                {item.serial_number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <div>{item.measurement_range || '-'}</div>
                                                <div className="text-muted-foreground">{item.tolerance}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Status History & Audit Trail */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {tr('Historique du cycle de vie de la demande', 'Request Lifecycle History')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l border-muted-foreground/20 ml-3 space-y-6 py-2">
                            {calibrationRequest.status_histories?.map((history) => (
                                <div key={history.id} className="relative pl-6">
                                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-blue-600" />
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs">
                                        <div className="font-semibold text-foreground text-sm">
                                            {history.to_status_label}
                                        </div>
                                        <span className="text-muted-foreground mt-0.5 sm:mt-0">
                                            {new Date(history.created_at).toLocaleString(isEnglish ? 'en-US' : 'fr-FR')}
                                        </span>
                                    </div>
                                    {history.comment && (
                                        <p className="text-xs text-muted-foreground mt-1 bg-muted/30 p-2 rounded">
                                            {history.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
