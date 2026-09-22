import { Head, router, useForm } from '@inertiajs/react';
import { Download, FileText, Plus, Receipt, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationRequest, Client, Quotation } from '@/types';

interface Props {
    quotations: {
        data: Quotation[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    clients: Client[];
    requests: CalibrationRequest[];
    filters: {
        search?: string;
        status?: string;
    };
}

export default function CommercialQuotationsIndex({ quotations, clients, requests, filters }: Props) {
    const { t, tr, formatDate, isEnglish } = useTranslation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Devis', 'Quotations'), href: '/commercial/quotations' },
    ];

    const createForm = useForm({
        client_id: '',
        calibration_request_id: '',
        amount: '',
        currency: 'EUR',
        validity_date: '',
        notes: '',
        file: null as File | null,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/commercial/quotations', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleUpdateStatus = (quotationId: number, status: string) => {
        router.patch(`/commercial/quotations/${quotationId}/status`, { status });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/commercial/quotations', { search: search || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Gestion des devis - Commercial', 'Quotation Management - Commercial')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {tr('Devis de calibration', 'Calibration Quotations')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {tr('Établissement et suivi des propositions tarifaires clients.', 'Preparation and monitoring of client pricing proposals.')}
                        </p>
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                <Plus className="mr-2 h-4 w-4" />
                                {tr('Nouveau devis', 'New Quotation')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{tr('Créer un devis de calibration', 'Create a Calibration Quotation')}</DialogTitle>
                                <DialogDescription>
                                    {tr('Définissez le montant et associez un client ou une demande.', 'Define the amount and link a client or request.')}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 py-2">
                                <div>
                                    <Label>{tr('Client *', 'Client *')}</Label>
                                    <Select
                                        value={createForm.data.client_id}
                                        onValueChange={(val) => createForm.setData('client_id', val)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder={tr('Sélectionnez le client', 'Select a client')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.company_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.client_id && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.client_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>{tr('Demande liée (facultatif)', 'Linked Request (optional)')}</Label>
                                    <Select
                                        value={createForm.data.calibration_request_id}
                                        onValueChange={(val) => createForm.setData('calibration_request_id', val)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder={tr('Sélectionnez une demande', 'Select a request')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">{tr('Aucune demande associée', 'No linked request')}</SelectItem>
                                            {requests.map((r) => (
                                                <SelectItem key={r.id} value={String(r.id)}>
                                                    {r.request_number}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Montant HT *', 'Amount (excl. VAT) *')}</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Ex: 1250.00"
                                            value={createForm.data.amount}
                                            onChange={(e) => createForm.setData('amount', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                        {createForm.errors.amount && (
                                            <p className="text-xs text-destructive mt-1">{createForm.errors.amount}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>{tr('Devise', 'Currency')}</Label>
                                        <Input
                                            value={createForm.data.currency}
                                            onChange={(e) => createForm.setData('currency', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{tr('Date limite de validité', 'Validity Expiration Date')}</Label>
                                    <Input
                                        type="date"
                                        value={createForm.data.validity_date}
                                        onChange={(e) => createForm.setData('validity_date', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>{tr('Fichier devis (PDF, optionnel)', 'Quotation File (PDF, optional)')}</Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => createForm.setData('file', e.target.files?.[0] || null)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>{tr('Notes / Conditions commerciales', 'Notes / Commercial Terms')}</Label>
                                    <textarea
                                        rows={2}
                                        value={createForm.data.notes}
                                        onChange={(e) => createForm.setData('notes', e.target.value)}
                                        placeholder={tr('Ex: Frais de déplacement inclus, délai 5 jours ouvrés...', 'E.g.: Travel expenses included, 5 business days lead time...')}
                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                        {tr('Annuler', 'Cancel')}
                                    </Button>
                                    <Button type="submit" disabled={createForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {createForm.processing ? tr('Création...', 'Creating...') : tr('Créer le devis', 'Create Quotation')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr(`Tous les devis (${quotations.total})`, `All Quotations (${quotations.total})`)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {quotations.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun devis créé pour le moment.', 'No quotations created yet.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Numéro', 'Number')}</th>
                                            <th className="px-6 py-3">{tr('Client', 'Client')}</th>
                                            <th className="px-6 py-3">{tr('Demande', 'Request')}</th>
                                            <th className="px-6 py-3">{tr('Montant', 'Amount')}</th>
                                            <th className="px-6 py-3">{tr('Validité', 'Validity')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Actions', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {quotations.data.map((q) => (
                                            <tr key={q.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold font-mono text-foreground">
                                                    {q.quotation_number}
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    {q.client?.company_name}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-blue-600">
                                                    {q.request?.request_number || '-'}
                                                </td>
                                                <td className="px-6 py-4 font-semibold">
                                                    {Number(q.amount).toLocaleString(isEnglish ? 'en-US' : 'fr-FR', { style: 'currency', currency: q.currency || 'EUR' })}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {q.validity_date ? formatDate(q.validity_date) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={q.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {q.status === 'SENT' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleUpdateStatus(q.id, 'ACCEPTED')}
                                                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs h-8"
                                                            >
                                                                {tr('Accepté', 'Accepted')}
                                                            </Button>
                                                        )}
                                                        {q.document_path && (
                                                            <Button size="sm" variant="ghost" asChild className="h-8 px-2">
                                                                <a href={`/storage/${q.document_path}`} target="_blank" rel="noreferrer">
                                                                    <Download className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        )}
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
            </div>
        </AppLayout>
    );
}
