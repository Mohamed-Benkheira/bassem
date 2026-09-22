import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Clock,
    FileCheck,
    Send,
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationRequest, Contract } from '@/types';

interface Props {
    calibrationRequest: CalibrationRequest;
    availableContracts: Contract[];
}

export default function CommercialRequestsShow({ calibrationRequest, availableContracts }: Props) {
    const { t, tr, formatDate, isEnglish } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('requests', 'Demandes'), href: '/commercial/requests' },
        { title: calibrationRequest.request_number, href: `/commercial/requests/${calibrationRequest.id}` },
    ];

    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);

    const sendForm = useForm({
        internal_notes: '',
    });

    const contractForm = useForm({
        contract_id: calibrationRequest.contract_id ? String(calibrationRequest.contract_id) : '',
    });

    const handleSendToMetrology = (e: React.FormEvent) => {
        e.preventDefault();
        sendForm.post(`/commercial/requests/${calibrationRequest.id}/send-to-metrology`, {
            onSuccess: () => setIsSendModalOpen(false),
        });
    };

    const handleContract = (e: React.FormEvent) => {
        e.preventDefault();
        contractForm.post(`/commercial/requests/${calibrationRequest.id}/contract`, {
            onSuccess: () => setIsContractModalOpen(false),
        });
    };

    const canSendToMetrology = ['SUBMITTED', 'WAITING_CLIENT_CONFIRMATION'].includes(calibrationRequest.status);
    const canContract = ['ACCEPTED', 'DATE_PROPOSED', 'SUBMITTED', 'SENT_TO_METROLOGY'].includes(calibrationRequest.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${tr('Demande', 'Request')} ${calibrationRequest.request_number} - Commercial`} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 text-muted-foreground">
                            <Link href="/commercial/requests">
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
                            {tr('Client', 'Client')} : <strong>{calibrationRequest.client?.company_name}</strong> • {tr('Créée le', 'Created on')} {formatDate(calibrationRequest.created_at)}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {canSendToMetrology && (
                            <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                                        <Send className="mr-2 h-4 w-4" />
                                        {tr('Transmettre à la métrologie', 'Send to Metrology')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{tr('Transmettre au service Métrologie', 'Send to Metrology Department')}</DialogTitle>
                                        <DialogDescription>
                                            {tr(
                                                'Cette action notifie le département technique pour étudier la faisabilité et définir les dates d\'intervention.',
                                                'This action notifies the technical department to study feasibility and set intervention dates.'
                                            )}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSendToMetrology} className="space-y-4 py-2">
                                        <div>
                                            <Label htmlFor="notes">
                                                {tr('Instructions commerciales ou priorité (facultatif)', 'Commercial instructions or priority (optional)')}
                                            </Label>
                                            <textarea
                                                id="notes"
                                                rows={3}
                                                value={sendForm.data.internal_notes}
                                                onChange={(e) => sendForm.setData('internal_notes', e.target.value)}
                                                placeholder={tr(
                                                    'Ex: Client grand compte, étalonnage à réaliser en urgence avant audit...',
                                                    'e.g. Major client account, urgent calibration needed before audit...'
                                                )}
                                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsSendModalOpen(false)}>
                                                {tr('Annuler', 'Cancel')}
                                            </Button>
                                            <Button type="submit" disabled={sendForm.processing} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                {sendForm.processing
                                                    ? tr('Transmission...', 'Transmitting...')
                                                    : tr('Confirmer la transmission', 'Confirm Transmission')}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}

                        {canContract && (
                            <Dialog open={isContractModalOpen} onOpenChange={setIsContractModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="font-semibold text-blue-600 border-blue-200 hover:bg-blue-50">
                                        <FileCheck className="mr-2 h-4 w-4" />
                                        {tr('Associer contrat / Valider', 'Attach Contract / Validate')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{tr('Validation commerciale & Contractualisation', 'Commercial Validation & Contracting')}</DialogTitle>
                                        <DialogDescription>
                                            {tr(
                                                'Rattachez un contrat existant et validez commercialement la demande pour permettre l\'affectation aux techniciens.',
                                                'Attach an existing contract and commercially validate the request to enable technician assignment.'
                                            )}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleContract} className="space-y-4 py-2">
                                        <div>
                                            <Label>{tr('Contrat client applicable', 'Applicable Client Contract')}</Label>
                                            <Select
                                                value={contractForm.data.contract_id}
                                                onValueChange={(val) => contractForm.setData('contract_id', val)}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder={tr('Sélectionnez un contrat (ou sans contrat)', 'Select a contract (or none)')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">{tr('Sans contrat spécifique', 'No specific contract')}</SelectItem>
                                                    {availableContracts.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>
                                                            {c.contract_number} ({tr('Valable jusqu\'au', 'Valid until')} {c.end_date ? formatDate(c.end_date) : 'N/A'})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsContractModalOpen(false)}>
                                                {tr('Annuler', 'Cancel')}
                                            </Button>
                                            <Button type="submit" disabled={contractForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                                {contractForm.processing
                                                    ? tr('Enregistrement...', 'Saving...')
                                                    : tr('Valider commercialement', 'Validate Commercially')}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Client & Intervention Summary Cards */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {tr('Coordonnées Client', 'Client Contact Information')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="font-semibold text-foreground">{calibrationRequest.client?.company_name}</div>
                            <div className="text-muted-foreground">{tr('Contact', 'Contact')} : {calibrationRequest.client?.contact_name}</div>
                            <div className="text-muted-foreground">{tr('E-mail', 'Email')} : {calibrationRequest.client?.email}</div>
                            <div className="text-muted-foreground">{tr('Tél', 'Phone')} : {calibrationRequest.client?.phone || tr('Non renseigné', 'Not provided')}</div>
                            <div className="text-muted-foreground">{tr('Adresse', 'Address')} : {calibrationRequest.client?.address || '-'}, {calibrationRequest.client?.city || ''}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {tr('Planification & Contrat', 'Scheduling & Contract')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Lieu', 'Location')}</span>
                                <span className="font-medium">
                                    {calibrationRequest.scheduled_location === 'laboratory'
                                        ? tr('Au laboratoire', 'At laboratory')
                                        : calibrationRequest.scheduled_location === 'client_site'
                                        ? tr('Sur site client', 'At client site')
                                        : calibrationRequest.scheduled_location === 'both'
                                        ? tr('Laboratoire & Sur site (Mixte)', 'Laboratory & Client site (Both)')
                                        : calibrationRequest.preferred_location === 'laboratory'
                                        ? tr('Au laboratoire (souhaité)', 'At laboratory (Preferred)')
                                        : calibrationRequest.preferred_location === 'both'
                                        ? tr('Laboratoire & Sur site (souhaité)', 'Laboratory & Client site (Preferred)')
                                        : tr('Sur site client (souhaité)', 'At client site (Preferred)')}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Date proposée / confirmée', 'Proposed / Confirmed Date')}</span>
                                <span className="font-medium">
                                    {calibrationRequest.scheduled_date
                                        ? `${tr('Confirmée', 'Confirmed')} : ${formatDate(calibrationRequest.scheduled_date)}`
                                        : calibrationRequest.proposed_date
                                        ? `${tr('Proposée', 'Proposed')} : ${formatDate(calibrationRequest.proposed_date)}`
                                        : `${tr('Souhaitée', 'Desired')} : ${calibrationRequest.preferred_date ? formatDate(calibrationRequest.preferred_date) : tr('Non spécifiée', 'Not specified')}`}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">{tr('Contrat', 'Contract')}</span>
                                <span className="font-medium text-blue-600">
                                    {calibrationRequest.contract ? calibrationRequest.contract.contract_number : tr('Aucun contrat lié', 'No linked contract')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Equipment Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr('Équipements à étalonner', 'Equipment to calibrate')} ({calibrationRequest.items?.length || 0})
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
                                        <tr key={item.id}>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {item.service?.name}
                                                </div>
                                                <div className="text-sm font-medium text-foreground mt-0.5">
                                                    {item.equipment_name}
                                                </div>
                                                {item.brand && <div className="text-xs text-muted-foreground mt-0.5">{item.brand} {item.model}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono">{item.serial_number || 'N/A'}</td>
                                            <td className="px-6 py-4 text-xs">{item.measurement_range || '-'} {item.tolerance ? `(${item.tolerance})` : ''}</td>
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

                {/* Audit Trail & History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {tr('Historique des transitions', 'Transition History')}
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
                                            {new Date(history.created_at).toLocaleString(isEnglish ? 'en-US' : 'fr-FR')} • {history.changed_by?.name || 'Système'}
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
