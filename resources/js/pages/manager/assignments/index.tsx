import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, CheckCircle, Search, UserCheck, Wrench } from 'lucide-react';
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
import type { BreadcrumbItem, CalibrationOperation, User } from '@/types';

interface Props {
    operations: {
        data: CalibrationOperation[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    technicians: (User & { active_calibrations_count: number })[];
    statuses: Record<string, string>;
    filters: {
        search?: string;
        status?: string;
        unassigned?: boolean;
    };
}

export default function ManagerAssignmentsIndex({ operations, technicians, statuses, filters }: Props) {
    const { t, tr, formatDate } = useTranslation();
    const [selectedOperation, setSelectedOperation] = useState<CalibrationOperation | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Affectations des techniciens', 'Technician Assignments'), href: '/manager/assignments' },
    ];

    const assignForm = useForm({
        technician_id: '',
        scheduled_date: '',
        notes: '',
    });

    const openAssignModal = (op: CalibrationOperation) => {
        setSelectedOperation(op);
        assignForm.setData({
            technician_id: op.technician_id ? String(op.technician_id) : '',
            scheduled_date: op.scheduled_date || '',
            notes: op.notes || '',
        });
        setIsAssignModalOpen(true);
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOperation) return;

        assignForm.post(`/manager/assignments/${selectedOperation.id}`, {
            onSuccess: () => {
                setIsAssignModalOpen(false);
                setSelectedOperation(null);
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/manager/assignments', { search: search || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Affectations des techniciens - Responsable', 'Technician Assignments - Manager')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Affectation des travaux de calibration', 'Calibration Work Assignment')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr(
                            'Déléguez les opérations de calibration et les équipements individuels aux techniciens métrologues qualifiés.',
                            'Delegate calibration operations and individual equipment to qualified metrology technicians.'
                        )}
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr(
                                        'Rechercher par opération, demande, équipement ou client...',
                                        'Search by operation, request, equipment, or client...'
                                    )}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                {tr('Filtrer', 'Filter')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr(`Toutes les opérations (${operations.total})`, `All Operations (${operations.total})`)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {operations.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucune opération à affecter.', 'No operations to assign.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Opération', 'Operation')}</th>
                                            <th className="px-6 py-3">{tr('Équipement / Item', 'Equipment / Item')}</th>
                                            <th className="px-6 py-3">{tr('Client', 'Client')}</th>
                                            <th className="px-6 py-3">{tr('Technicien affecté', 'Assigned Technician')}</th>
                                            <th className="px-6 py-3">{tr('Date programmée', 'Scheduled Date')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Affecter', 'Assign')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {operations.data.map((op) => (
                                            <tr key={op.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold font-mono">
                                                    {op.operation_number}
                                                    <div className="text-xs text-muted-foreground font-normal">
                                                        {tr('Demande :', 'Request:')} {op.request?.request_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">{op.item?.equipment_name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {op.item?.service?.name} (SN: {op.item?.serial_number || 'N/A'})
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium">
                                                    {op.client?.company_name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {op.technician ? (
                                                        <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                                                            <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                            {op.technician.name}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                            {tr('Non affecté', 'Unassigned')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {op.scheduled_date ? formatDate(op.scheduled_date) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={op.status} label={op.status_label} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => openAssignModal(op)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs"
                                                    >
                                                        {op.technician ? tr('Réaffecter', 'Reassign') : tr('Affecter', 'Assign')}
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

                {/* Assignment Dialog */}
                <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{tr('Affectation du technicien métrologue', 'Assign Metrology Technician')}</DialogTitle>
                            <DialogDescription>
                                {tr('Opération', 'Operation')} {selectedOperation?.operation_number} • {selectedOperation?.item?.equipment_name}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAssign} className="space-y-4 py-2">
                            <div>
                                <Label>{tr('Technicien en charge *', 'Technician in Charge *')}</Label>
                                <Select
                                    value={assignForm.data.technician_id}
                                    onValueChange={(val) => assignForm.setData('technician_id', val)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder={tr('Sélectionnez un technicien', 'Select a technician')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {technicians.map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                {t.name} ({t.active_calibrations_count} {tr('calibrations en cours', 'active calibrations')})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {assignForm.errors.technician_id && (
                                    <p className="text-xs text-destructive mt-1">{assignForm.errors.technician_id}</p>
                                )}
                            </div>

                            <div>
                                <Label>{tr('Date d\'intervention prévue', 'Planned Intervention Date')}</Label>
                                <Input
                                    type="date"
                                    value={assignForm.data.scheduled_date}
                                    onChange={(e) => assignForm.setData('scheduled_date', e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label>{tr('Consignes ou équipement étalon suggéré', 'Instructions or Suggested Standard Equipment')}</Label>
                                <textarea
                                    rows={3}
                                    value={assignForm.data.notes}
                                    onChange={(e) => assignForm.setData('notes', e.target.value)}
                                    placeholder={tr(
                                        'Ex: Utiliser l\'étalon ET-PRS-001. Vérifier particulièrement l\'hystérésis à mi-échelle...',
                                        'E.g.: Use standard ET-PRS-001. Check mid-scale hysteresis...'
                                    )}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                                    {tr('Annuler', 'Cancel')}
                                </Button>
                                <Button type="submit" disabled={assignForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {assignForm.processing ? tr('Enregistrement...', 'Saving...') : tr('Confirmer l\'affectation', 'Confirm Assignment')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

