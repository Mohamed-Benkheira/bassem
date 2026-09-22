import { Head, router, useForm } from '@inertiajs/react';
import { Archive, Download, FileCheck, Plus, Search } from 'lucide-react';
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
import type { BreadcrumbItem, Client, Contract } from '@/types';

interface Props {
    contracts: {
        data: Contract[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    clients: Client[];
    filters: {
        search?: string;
        status?: string;
    };
}

export default function CommercialContractsIndex({ contracts, clients, filters }: Props) {
    const { t, tr, formatDate, isEnglish } = useTranslation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Contrats', 'Contracts'), href: '/commercial/contracts' },
    ];

    const createForm = useForm({
        client_id: '',
        start_date: '',
        end_date: '',
        status: 'ACTIVE',
        notes: '',
        file: null as File | null,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/commercial/contracts', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleArchive = (contractId: number) => {
        if (confirm(tr('Voulez-vous vraiment archiver ce contrat ?', 'Are you sure you want to archive this contract?'))) {
            router.post(`/commercial/contracts/${contractId}/archive`);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/commercial/contracts', { search: search || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Gestion des contrats - Commercial', 'Contract Management - Commercial')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {tr('Contrats de calibration', 'Calibration Contracts')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {tr(
                                'Gestion, téléversement et archivage des conventions et accords-cadres d\'étalonnage.',
                                'Management, upload, and archiving of calibration agreements and framework contracts.'
                            )}
                        </p>
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                <Plus className="mr-2 h-4 w-4" />
                                {tr('Nouveau contrat', 'New Contract')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{tr('Nouveau contrat de calibration', 'New Calibration Contract')}</DialogTitle>
                                <DialogDescription>
                                    {tr('Enregistrez et téléversez le contrat signé avec le client.', 'Register and upload the signed contract with the client.')}
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

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Date de début *', 'Start Date *')}</Label>
                                        <Input
                                            type="date"
                                            value={createForm.data.start_date}
                                            onChange={(e) => createForm.setData('start_date', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>{tr('Date d\'échéance *', 'End Date *')}</Label>
                                        <Input
                                            type="date"
                                            value={createForm.data.end_date}
                                            onChange={(e) => createForm.setData('end_date', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{tr('Statut initial', 'Initial Status')}</Label>
                                    <Select
                                        value={createForm.data.status}
                                        onValueChange={(val) => createForm.setData('status', val)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">{tr('Actif', 'Active')}</SelectItem>
                                            <SelectItem value="DRAFT">{tr('Brouillon', 'Draft')}</SelectItem>
                                            <SelectItem value="ACCEPTED_BY_COMPANY">{tr('Accepté par l\'entreprise', 'Accepted by Company')}</SelectItem>
                                            <SelectItem value="ACCEPTED_BY_CLIENT">{tr('Accepté par le client', 'Accepted by Client')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>{tr('Document contractuel PDF *', 'Contract PDF Document *')}</Label>
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => createForm.setData('file', e.target.files?.[0] || null)}
                                        className="mt-1"
                                        required
                                    />
                                    {createForm.errors.file && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.file}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>{tr('Remarques particulières', 'Special Remarks')}</Label>
                                    <textarea
                                        rows={2}
                                        value={createForm.data.notes}
                                        onChange={(e) => createForm.setData('notes', e.target.value)}
                                        placeholder={tr(
                                            'Ex: Conditions tarifaires remisées, renouvelable par tacite reconduction...',
                                            'E.g.: Discounted pricing terms, tacit renewal...'
                                        )}
                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                        {tr('Annuler', 'Cancel')}
                                    </Button>
                                    <Button type="submit" disabled={createForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {createForm.processing ? tr('Enregistrement...', 'Saving...') : tr('Enregistrer le contrat', 'Save Contract')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr(`Tous les contrats (${contracts.total})`, `All Contracts (${contracts.total})`)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {contracts.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun contrat enregistré.', 'No contracts recorded.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Numéro', 'Number')}</th>
                                            <th className="px-6 py-3">{tr('Client', 'Client')}</th>
                                            <th className="px-6 py-3">{tr('Période', 'Period')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3">{tr('Demandes', 'Requests')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Actions', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {contracts.data.map((c) => (
                                            <tr key={c.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold font-mono text-foreground">
                                                    {c.contract_number}
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    {c.client?.company_name}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {tr('Du', 'From')} {c.start_date ? formatDate(c.start_date) : '-'} {tr('au', 'to')}{' '}
                                                    {c.end_date ? formatDate(c.end_date) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={c.status} />
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium">
                                                    {c.requests?.length || 0}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {c.document_path && (
                                                            <Button size="sm" variant="outline" asChild className="h-8 text-xs">
                                                                <a href={`/contracts/${c.id}/download`} target="_blank" rel="noreferrer">
                                                                    <Download className="mr-1 h-3.5 w-3.5" />
                                                                    PDF
                                                                </a>
                                                            </Button>
                                                        )}
                                                        {c.status !== 'ARCHIVED' && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleArchive(c.id)}
                                                                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                                            >
                                                                <Archive className="mr-1 h-3.5 w-3.5" />
                                                                {tr('Archiver', 'Archive')}
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
