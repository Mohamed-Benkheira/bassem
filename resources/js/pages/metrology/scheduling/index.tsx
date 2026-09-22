import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, CheckCircle2, Clock, MapPin, Search } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationRequest } from '@/types';

interface Props {
    requests: {
        data: CalibrationRequest[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function MetrologySchedulingIndex({ requests, filters }: Props) {
    const { t, tr, formatDate } = useTranslation();
    const [selectedRequest, setSelectedRequest] = useState<CalibrationRequest | null>(null);
    const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Planification', 'Scheduling'), href: '/metrology/scheduling' },
    ];

    const proposeForm = useForm({
        proposed_date: '',
        proposed_location: 'laboratory',
        internal_notes: '',
    });

    const openProposeModal = (req: CalibrationRequest) => {
        setSelectedRequest(req);
        proposeForm.setData({
            proposed_date: req.proposed_date || req.preferred_date || '',
            proposed_location: req.proposed_location || req.preferred_location || 'laboratory',
            internal_notes: req.internal_notes || '',
        });
        setIsProposeModalOpen(true);
    };

    const handlePropose = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;

        proposeForm.post(`/metrology/scheduling/${selectedRequest.id}/propose`, {
            onSuccess: () => {
                setIsProposeModalOpen(false);
                setSelectedRequest(null);
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/metrology/scheduling', { search: search || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Planification des calibrations - Métrologie', 'Calibration Scheduling - Metrology')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Planification des interventions', 'Intervention Scheduling')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr(
                            'Définissez et proposez les dates et lieux de calibration pour les demandes transmises par le service commercial.',
                            'Define and propose calibration dates and locations for requests transmitted by the commercial department.'
                        )}
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr('Rechercher par n° de demande ou client...', 'Search by request number or client...')}
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
                        <CardTitle className="text-base font-semibold">
                            {tr(`Demandes en cours de planification (${requests.total})`, `Requests Pending Scheduling (${requests.total})`)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {requests.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucune demande en attente de planification.', 'No requests awaiting scheduling.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Demande', 'Request')}</th>
                                            <th className="px-6 py-3">{tr('Client', 'Client')}</th>
                                            <th className="px-6 py-3">{tr('Équipements', 'Equipment')}</th>
                                            <th className="px-6 py-3">{tr('Souhait client', 'Client Preference')}</th>
                                            <th className="px-6 py-3">{tr('Proposition actuelle', 'Current Proposal')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Planifier', 'Schedule')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {requests.data.map((req) => (
                                            <tr key={req.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold font-mono">
                                                    {req.request_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{req.client?.company_name}</div>
                                                    <div className="text-xs text-muted-foreground">{req.client?.city}</div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium">
                                                    {req.items?.length || 0} {tr('instrument(s)', 'instrument(s)')}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    <div>{tr('Date :', 'Date:')} {req.preferred_date ? formatDate(req.preferred_date) : '-'}</div>
                                                    <div className="text-muted-foreground">
                                                        {req.preferred_location === 'laboratory' ? tr('Labo', 'Lab') : req.preferred_location === 'both' ? tr('Mixte (Labo & Site)', 'Both (Lab & Site)') : tr('Sur site', 'On-site')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {req.proposed_date ? (
                                                        <span className="font-medium text-purple-700 dark:text-purple-400">
                                                            {formatDate(req.proposed_date)} ({req.proposed_location === 'laboratory' ? tr('Labo', 'Lab') : req.proposed_location === 'both' ? tr('Mixte', 'Both') : tr('Site', 'Site')})
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">{tr('Non encore proposée', 'Not yet proposed')}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={req.status} label={req.status_label} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => openProposeModal(req)}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                                                    >
                                                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                                        {tr('Proposer date', 'Propose Date')}
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

                {/* Propose Date Dialog */}
                <Dialog open={isProposeModalOpen} onOpenChange={setIsProposeModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{tr('Proposer une date d\'intervention', 'Propose Intervention Date')}</DialogTitle>
                            <DialogDescription>
                                {tr('Demande', 'Request')} {selectedRequest?.request_number} {tr('pour le client', 'for client')} {selectedRequest?.client?.company_name}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePropose} className="space-y-4 py-2">
                            <div>
                                <Label>{tr('Date d\'intervention proposée *', 'Proposed Intervention Date *')}</Label>
                                <Input
                                    type="date"
                                    value={proposeForm.data.proposed_date}
                                    onChange={(e) => proposeForm.setData('proposed_date', e.target.value)}
                                    className="mt-1"
                                    required
                                />
                                {proposeForm.errors.proposed_date && (
                                    <p className="text-xs text-destructive mt-1">{proposeForm.errors.proposed_date}</p>
                                )}
                            </div>

                            <div>
                                <Label>{tr('Lieu de réalisation *', 'Execution Location *')}</Label>
                                <Select
                                    value={proposeForm.data.proposed_location}
                                    onValueChange={(val) => proposeForm.setData('proposed_location', val)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="laboratory">{tr('Laboratoire de métrologie', 'Metrology Laboratory')}</SelectItem>
                                        <SelectItem value="client_site">{tr('Sur site client', 'Client Site')}</SelectItem>
                                        <SelectItem value="both">{tr('Au laboratoire & Sur site client (Mixte)', 'At Laboratory & Client Site (Both)')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>{tr('Notes techniques / Conditions de préparation', 'Technical Notes / Prep Conditions')}</Label>
                                <textarea
                                    rows={3}
                                    value={proposeForm.data.internal_notes}
                                    onChange={(e) => proposeForm.setData('internal_notes', e.target.value)}
                                    placeholder={tr(
                                        'Ex: Équipements à stabiliser 24h avant étalonnage, banc de pression requis...',
                                        'E.g.: Instruments to stabilize 24h before calibration, pressure bench required...'
                                    )}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsProposeModalOpen(false)}>
                                    {tr('Annuler', 'Cancel')}
                                </Button>
                                <Button type="submit" disabled={proposeForm.processing} className="bg-purple-600 hover:bg-purple-700 text-white">
                                    {proposeForm.processing ? tr('Transmission...', 'Transmitting...') : tr('Soumettre la proposition', 'Submit Proposal')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

