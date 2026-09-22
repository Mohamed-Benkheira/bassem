import { Head, Link, router, useForm } from '@inertiajs/react';
import { Building2, Mail, Phone, Plus, Search } from 'lucide-react';
import { useState } from 'react';
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
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Client } from '@/types';

interface Props {
    clients: {
        data: Client[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function CommercialClientsIndex({ clients, filters }: Props) {
    const { t, tr } = useTranslation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Clients', 'Clients'), href: '/commercial/clients' },
    ];

    const createForm = useForm({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        tax_number: '',
        notes: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/commercial/clients', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/commercial/clients', { search: search || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Portefeuille Clients', 'Client Portfolio')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {tr('Portefeuille Clients', 'Client Portfolio')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {tr('Gestion des entreprises clientes et historique des relations métrologiques.', 'Management of client companies and metrology relationship history.')}
                        </p>
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                <Plus className="mr-2 h-4 w-4" />
                                {tr('Nouveau client', 'New Client')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{tr('Nouveau compte client', 'New Client Account')}</DialogTitle>
                                <DialogDescription>
                                    {tr('Enregistrez une entreprise cliente dans le système.', 'Register a client company in the system.')}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 py-2">
                                <div>
                                    <Label>{tr('Raison sociale / Entreprise *', 'Company Name *')}</Label>
                                    <Input
                                        value={createForm.data.company_name}
                                        onChange={(e) => createForm.setData('company_name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {createForm.errors.company_name && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.company_name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Nom du contact *', 'Contact Name *')}</Label>
                                        <Input
                                            value={createForm.data.contact_name}
                                            onChange={(e) => createForm.setData('contact_name', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>{tr('Téléphone', 'Phone')}</Label>
                                        <Input
                                            value={createForm.data.phone}
                                            onChange={(e) => createForm.setData('phone', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{tr('E-mail professionnel *', 'Business Email *')}</Label>
                                    <Input
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {createForm.errors.email && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>{tr('Adresse', 'Address')}</Label>
                                    <Input
                                        value={createForm.data.address}
                                        onChange={(e) => createForm.setData('address', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Ville', 'City')}</Label>
                                        <Input
                                            value={createForm.data.city}
                                            onChange={(e) => createForm.setData('city', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>{tr('Code postal', 'Postal Code')}</Label>
                                        <Input
                                            value={createForm.data.postal_code}
                                            onChange={(e) => createForm.setData('postal_code', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{tr('N° SIRET / TVA intracommunautaire', 'Tax ID / VAT Number')}</Label>
                                    <Input
                                        value={createForm.data.tax_number}
                                        onChange={(e) => createForm.setData('tax_number', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                        {tr('Annuler', 'Cancel')}
                                    </Button>
                                    <Button type="submit" disabled={createForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {createForm.processing ? tr('Création...', 'Creating...') : tr('Créer le client', 'Create Client')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr(`Clients enregistrés (${clients.total})`, `Registered Clients (${clients.total})`)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {clients.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun client trouvé.', 'No clients found.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Entreprise', 'Company')}</th>
                                            <th className="px-6 py-3">{tr('Contact', 'Contact')}</th>
                                            <th className="px-6 py-3">{tr('Coordonnées', 'Contact Details')}</th>
                                            <th className="px-6 py-3">{tr('Localisation', 'Location')}</th>
                                            <th className="px-6 py-3">{tr('Demandes', 'Requests')}</th>
                                            <th className="px-6 py-3">{tr('Contrats', 'Contracts')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Actions', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {clients.data.map((c) => (
                                            <tr key={c.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    <Link href={`/commercial/clients/${c.id}`} className="hover:underline text-blue-600">
                                                        {c.company_name}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">{c.contact_name}</td>
                                                <td className="px-6 py-4 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        {c.email}
                                                    </div>
                                                    {c.phone && (
                                                        <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                                            {c.phone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {c.city ? `${c.city} (${c.postal_code || '-'})` : '-'}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-xs">
                                                    {c.requests_count || 0} {tr('demande(s)', 'request(s)')}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-xs">
                                                    {c.contracts_count || 0} {tr('contrat(s)', 'contract(s)')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/commercial/clients/${c.id}`}>
                                                            {tr('Fiche', 'View')}
                                                        </Link>
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
