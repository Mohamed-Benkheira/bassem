import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Cpu, Edit, Plus, Search } from 'lucide-react';
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
import type { BreadcrumbItem, MetrologyMaterial } from '@/types';

interface Props {
    materials: {
        data: MetrologyMaterial[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: string[];
    statuses: Record<string, string>;
    filters: {
        search?: string;
        status?: string;
        category?: string;
    };
}

export default function MetrologyMaterialsIndex({ materials, categories, statuses, filters }: Props) {
    const { t, tr, formatDate, isEnglish } = useTranslation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Matériel & Étalons', 'Equipment & Standards'), href: '/metrology/materials' },
    ];

    const createForm = useForm({
        name: '',
        reference_code: '',
        serial_number: '',
        manufacturer: '',
        model: '',
        category: '',
        calibration_date: '',
        expiration_date: '',
        status: 'VALID',
        location: '',
        notes: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/metrology/materials', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/metrology/materials', { search: search || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Étalons & Matériel de référence', 'Standards & Reference Equipment')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {tr('Étalons & Instruments de Référence', 'Standards & Reference Equipment')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {tr(
                                'Gestion du parc d\'étalons de travail, raccordement métrologique et suivi des dates de validité.',
                                'Management of working standards, metrological traceability, and validity date tracking.'
                            )}
                        </p>
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                <Plus className="mr-2 h-4 w-4" />
                                {tr('Nouvel étalon', 'New Standard')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{tr('Enregistrer un étalon de référence', 'Register Reference Standard')}</DialogTitle>
                                <DialogDescription>
                                    {tr('Ajoutez un équipement de mesure ou étalon utilisé pour les calibrations.', 'Add measuring equipment or standard used for calibrations.')}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 py-2">
                                <div>
                                    <Label>{tr('Désignation de l\'étalon *', 'Standard Designation *')}</Label>
                                    <Input
                                        placeholder={tr('Ex: Balance manométrique hydraulique', 'E.g.: Hydraulic deadweight tester')}
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Code Référence interne *', 'Internal Reference Code *')}</Label>
                                        <Input
                                            placeholder="Ex: ET-PRS-005"
                                            value={createForm.data.reference_code}
                                            onChange={(e) => createForm.setData('reference_code', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                        {createForm.errors.reference_code && (
                                            <p className="text-xs text-destructive mt-1">{createForm.errors.reference_code}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>{tr('Catégorie de grandeur *', 'Measurement Category *')}</Label>
                                        <Input
                                            placeholder={tr('Ex: Pression, Température...', 'E.g.: Pressure, Temperature...')}
                                            value={createForm.data.category}
                                            onChange={(e) => createForm.setData('category', e.target.value)}
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label className="text-xs">{tr('N° de série', 'Serial No.')}</Label>
                                        <Input
                                            value={createForm.data.serial_number}
                                            onChange={(e) => createForm.setData('serial_number', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">{tr('Fabricant', 'Manufacturer')}</Label>
                                        <Input
                                            value={createForm.data.manufacturer}
                                            onChange={(e) => createForm.setData('manufacturer', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">{tr('Modèle', 'Model')}</Label>
                                        <Input
                                            value={createForm.data.model}
                                            onChange={(e) => createForm.setData('model', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Date d\'étalonnage', 'Calibration Date')}</Label>
                                        <Input
                                            type="date"
                                            value={createForm.data.calibration_date}
                                            onChange={(e) => createForm.setData('calibration_date', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>{tr('Date d\'expiration *', 'Expiration Date *')}</Label>
                                        <Input
                                            type="date"
                                            value={createForm.data.expiration_date}
                                            onChange={(e) => createForm.setData('expiration_date', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Statut', 'Status')}</Label>
                                        <Select
                                            value={createForm.data.status}
                                            onValueChange={(val) => createForm.setData('status', val)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="VALID">{tr('Valide / Conforme', 'Valid / Compliant')}</SelectItem>
                                                <SelectItem value="EXPIRED">{tr('Expiré', 'Expired')}</SelectItem>
                                                <SelectItem value="UNDER_MAINTENANCE">{tr('En maintenance', 'In Maintenance')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>{tr('Emplacement / Salle', 'Location / Room')}</Label>
                                        <Input
                                            placeholder={tr('Ex: Salle Blanche B1', 'E.g.: Cleanroom B1')}
                                            value={createForm.data.location}
                                            onChange={(e) => createForm.setData('location', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{tr('Notes métrologiques', 'Metrological Notes')}</Label>
                                    <textarea
                                        rows={2}
                                        value={createForm.data.notes}
                                        onChange={(e) => createForm.setData('notes', e.target.value)}
                                        placeholder={tr('Incertitude d\'étalonnage, raccordement COFRAC / LNE...', 'Calibration uncertainty, traceability...')}
                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                        {tr('Annuler', 'Cancel')}
                                    </Button>
                                    <Button type="submit" disabled={createForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {createForm.processing ? tr('Enregistrement...', 'Saving...') : tr('Enregistrer', 'Save')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr(`Parc des étalons (${materials.total})`, `Reference Standards Fleet (${materials.total})`)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {materials.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun étalon enregistré.', 'No reference standard recorded.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Référence', 'Reference')}</th>
                                            <th className="px-6 py-3">{tr('Désignation', 'Designation')}</th>
                                            <th className="px-6 py-3">{tr('Domaine', 'Domain')}</th>
                                            <th className="px-6 py-3">{tr('Dernier étalonnage', 'Last Calibration')}</th>
                                            <th className="px-6 py-3">{tr('Date limite de validité', 'Validity Expiration Date')}</th>
                                            <th className="px-6 py-3">{tr('Emplacement', 'Location')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Statut', 'Status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {materials.data.map((mat) => {
                                            const isExpired = mat.is_expired || (mat.expiration_date && new Date(mat.expiration_date) < new Date());
                                            return (
                                                <tr key={mat.id} className="hover:bg-muted/20">
                                                    <td className="px-6 py-4 font-semibold font-mono text-foreground">
                                                        {mat.reference_code}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-foreground">{mat.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {mat.manufacturer} {mat.model} {mat.serial_number ? `(SN: ${mat.serial_number})` : ''}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium">
                                                        {mat.category}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">
                                                        {mat.calibration_date ? formatDate(mat.calibration_date) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <span className={isExpired ? 'font-bold text-destructive flex items-center gap-1' : 'font-medium'}>
                                                            {isExpired && <AlertTriangle className="h-3 w-3" />}
                                                            {mat.expiration_date ? formatDate(mat.expiration_date) : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-muted-foreground">
                                                        {mat.location || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <StatusBadge status={isExpired ? 'EXPIRED' : mat.status} label={isExpired ? (isEnglish ? 'Expired' : 'Expiré') : mat.status_label} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
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

