import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Power, Search, Settings2, Wrench } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationService } from '@/types';

interface Props {
    services: {
        data: CalibrationService[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: string[];
    filters: {
        search?: string;
        measurement_category?: string;
    };
}

export default function AdminServicesIndex({ services, categories, filters }: Props) {
    const { tr } = useTranslation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<CalibrationService | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Catalogue des services', 'Services Catalog'), href: '/admin/services' },
    ];

    const createForm = useForm({
        name: '',
        code: '',
        equipment_type: '',
        measurement_category: '',
        calibration_type: 'Laboratoire & Sur site',
        method: '',
        required_info: '',
        description: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        code: '',
        equipment_type: '',
        measurement_category: '',
        calibration_type: 'Laboratoire & Sur site',
        method: '',
        required_info: '',
        description: '',
        is_active: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/services', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (service: CalibrationService) => {
        setEditingService(service);
        editForm.setData({
            name: service.name,
            code: service.code,
            equipment_type: service.equipment_type,
            measurement_category: service.measurement_category,
            calibration_type: service.calibration_type,
            method: service.method || '',
            required_info: service.required_info || '',
            description: service.description || '',
            is_active: Boolean(service.is_active),
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;

        editForm.put(`/admin/services/${editingService.id}`, {
            onSuccess: () => {
                setEditingService(null);
                editForm.reset();
            },
        });
    };

    const handleToggle = (serviceId: number) => {
        router.post(`/admin/services/${serviceId}/toggle`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/services', { search: search || undefined }, { preserveState: true });
    };

    const getCalibrationTypeLabel = (type: string) => {
        if (type === 'Laboratoire') return tr('Laboratoire', 'Laboratory');
        if (type === 'Sur site') return tr('Sur site', 'On-site');
        return tr('Laboratoire & Sur site', 'Laboratory & On-site');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Catalogue de Calibration - Admin', 'Calibration Catalog - Admin')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {tr('Catalogue des Prestations de Calibration', 'Calibration Services Catalog')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {tr('Définissez les domaines de compétences métrologiques et les services proposés aux clients.', 'Define metrological scope of competence and services offered to clients.')}
                        </p>
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                <Plus className="mr-2 h-4 w-4" />
                                {tr('Nouveau service', 'New service')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{tr('Ajouter un service de calibration', 'Add calibration service')}</DialogTitle>
                                <DialogDescription>
                                    {tr('Définissez une prestation sélectionnable par les clients.', 'Define a service selectable by clients.')}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 py-2">
                                <div>
                                    <Label>{tr('Intitulé de la prestation *', 'Service title *')}</Label>
                                    <Input
                                        placeholder={tr('Ex: Étalonnage de Manomètre de Pression', 'e.g., Pressure Gauge Calibration')}
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Code Référence *', 'Reference Code *')}</Label>
                                        <Input
                                            placeholder={tr('Ex: CAL-PRS-002', 'e.g., CAL-PRS-002')}
                                            value={createForm.data.code}
                                            onChange={(e) => createForm.setData('code', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>{tr('Domaine / Grandeur *', 'Domain / Quantity *')}</Label>
                                        <Input
                                            placeholder={tr('Ex: Pression, Température...', 'e.g., Pressure, Temperature...')}
                                            value={createForm.data.measurement_category}
                                            onChange={(e) => createForm.setData('measurement_category', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{tr('Type d\'équipement concerné *', 'Equipment type *')}</Label>
                                    <Input
                                        placeholder={tr('Ex: Manomètre Bourdon, Transmetteur', 'e.g., Bourdon Pressure Gauge, Transmitter')}
                                        value={createForm.data.equipment_type}
                                        onChange={(e) => createForm.setData('equipment_type', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>{tr('Modalité d\'intervention *', 'Intervention method *')}</Label>
                                    <Select
                                        value={createForm.data.calibration_type}
                                        onValueChange={(val) => createForm.setData('calibration_type', val)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Laboratoire">{tr('Laboratoire uniquement', 'Laboratory only')}</SelectItem>
                                            <SelectItem value="Sur site">{tr('Sur site uniquement', 'On-site only')}</SelectItem>
                                            <SelectItem value="Laboratoire & Sur site">{tr('Laboratoire & Sur site', 'Laboratory & On-site')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>{tr('Norme / Procédure de référence', 'Standard / Reference procedure')}</Label>
                                    <Input
                                        placeholder={tr('Ex: Guide EURAMET cg-17 / NF EN 837', 'e.g., EURAMET cg-17 / NF EN 837')}
                                        value={createForm.data.method}
                                        onChange={(e) => createForm.setData('method', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>{tr('Description détaillée', 'Detailed description')}</Label>
                                    <textarea
                                        rows={2}
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        placeholder={tr('Précisez les étendues couvertes, raccordements...', 'Specify measurement ranges, connections...')}
                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                        {tr('Annuler', 'Cancel')}
                                    </Button>
                                    <Button type="submit" disabled={createForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {createForm.processing ? tr('Création...', 'Creating...') : tr('Créer le service', 'Create service')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr('Rechercher par code, nom de prestation ou équipement...', 'Search by code, service name, or equipment...')}
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
                            {tr('Prestations au catalogue', 'Catalog services')} ({services.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {services.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun service dans le catalogue.', 'No services in catalog.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Code', 'Code')}</th>
                                            <th className="px-6 py-3">{tr('Prestation', 'Service')}</th>
                                            <th className="px-6 py-3">{tr('Grandeur', 'Domain / Quantity')}</th>
                                            <th className="px-6 py-3">{tr('Type', 'Type')}</th>
                                            <th className="px-6 py-3">{tr('Norme / Méthode', 'Standard / Method')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Actions', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {services.data.map((svc) => (
                                            <tr key={svc.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold font-mono text-foreground">
                                                    {svc.code}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{svc.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {tr('Équipement :', 'Equipment:')} {svc.equipment_type}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium">
                                                    {svc.measurement_category}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                                    {getCalibrationTypeLabel(svc.calibration_type)}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                                                    {svc.method || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                                        svc.is_active
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}>
                                                        {svc.is_active ? tr('Actif', 'Active') : tr('Inactif', 'Inactive')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => openEditModal(svc)}
                                                            className="h-8 px-2"
                                                            title={tr('Modifier', 'Edit')}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleToggle(svc.id)}
                                                            className={`h-8 px-2 ${svc.is_active ? 'text-destructive' : 'text-emerald-600'}`}
                                                            title={svc.is_active ? tr('Désactiver', 'Deactivate') : tr('Activer', 'Activate')}
                                                        >
                                                            <Power className="h-4 w-4" />
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

                {/* Edit Service Modal */}
                {editingService && (
                    <Dialog open={Boolean(editingService)} onOpenChange={(open) => !open && setEditingService(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{tr('Modifier la prestation :', 'Edit service:')} {editingService.code}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEdit} className="space-y-4 py-2">
                                <div>
                                    <Label>{tr('Intitulé *', 'Title *')}</Label>
                                    <Input
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Code *', 'Code *')}</Label>
                                        <Input
                                            value={editForm.data.code}
                                            onChange={(e) => editForm.setData('code', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>{tr('Domaine / Grandeur *', 'Domain / Quantity *')}</Label>
                                        <Input
                                            value={editForm.data.measurement_category}
                                            onChange={(e) => editForm.setData('measurement_category', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{tr('Type d\'équipement *', 'Equipment type *')}</Label>
                                    <Input
                                        value={editForm.data.equipment_type}
                                        onChange={(e) => editForm.setData('equipment_type', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>{tr('Modalité *', 'Method *')}</Label>
                                    <Select
                                        value={editForm.data.calibration_type}
                                        onValueChange={(val) => editForm.setData('calibration_type', val)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Laboratoire">{tr('Laboratoire uniquement', 'Laboratory only')}</SelectItem>
                                            <SelectItem value="Sur site">{tr('Sur site uniquement', 'On-site only')}</SelectItem>
                                            <SelectItem value="Laboratoire & Sur site">{tr('Laboratoire & Sur site', 'Laboratory & On-site')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>{tr('Norme / Procédure', 'Standard / Procedure')}</Label>
                                    <Input
                                        value={editForm.data.method}
                                        onChange={(e) => editForm.setData('method', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setEditingService(null)}>
                                        {tr('Annuler', 'Cancel')}
                                    </Button>
                                    <Button type="submit" disabled={editForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {editForm.processing ? tr('Enregistrement...', 'Saving...') : tr('Mettre à jour', 'Update')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
