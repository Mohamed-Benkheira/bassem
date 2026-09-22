import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Clock, MapPin, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationService } from '@/types';

interface Props {
    services: CalibrationService[];
}

export default function ClientRequestsCreate({ services }: Props) {
    const { t, tr } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('my_requests', 'Mes demandes'), href: '/client/requests' },
        { title: tr('Nouvelle demande', 'New Request'), href: '/client/requests/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        preferred_date: '',
        preferred_location: 'laboratory',
        client_notes: '',
        items: [
            {
                calibration_service_id: '' as number | '',
                equipment_name: '',
                serial_number: '',
                brand: '',
                model: '',
                measurement_range: '',
                tolerance: '',
                specific_notes: '',
            },
        ],
    });

    const duplicateSerialIndices = useMemo(() => {
        const duplicates = new Set<number>();
        const seen = new Map<string, number>();
        data.items.forEach((item, index) => {
            const serial = item.serial_number?.trim().toLowerCase();
            if (serial) {
                if (seen.has(serial)) {
                    duplicates.add(index);
                    duplicates.add(seen.get(serial)!);
                } else {
                    seen.set(serial, index);
                }
            }
        });
        return duplicates;
    }, [data.items]);

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                calibration_service_id: '',
                equipment_name: '',
                serial_number: '',
                brand: '',
                model: '',
                measurement_range: '',
                tolerance: '',
                specific_notes: '',
            },
        ]);
    };

    const removeItem = (index: number) => {
        if (data.items.length <= 1) return;
        setData(
            'items',
            data.items.filter((_, i) => i !== index)
        );
    };

    const updateItem = (index: number, field: string, value: unknown) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (duplicateSerialIndices.size > 0) {
            return;
        }
        post('/client/requests');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Créer une demande de calibration', 'Create Calibration Request')} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3 text-muted-foreground">
                            <Link href="/client/requests">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {tr('Retour aux demandes', 'Back to requests')}
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {tr('Créer une demande de calibration', 'Create Calibration Request')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {tr(
                                'Renseignez les détails de l\'intervention et la liste des instruments à calibrer.',
                                'Provide intervention details and the list of instruments to calibrate.'
                            )}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Request Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {tr('Paramètres de la demande', 'Request Parameters')}
                            </CardTitle>
                            <CardDescription>
                                {tr(
                                    'Définissez votre lieu d\'intervention souhaité. La date sera proposée par l\'équipe de métrologie.',
                                    'Define your desired intervention location. The date will be proposed by the metrology team.'
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Scheduling Notice */}
                            <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300 flex items-start gap-3">
                                <Clock className="h-5 w-5 mt-0.5 text-blue-600 shrink-0" />
                                <div>
                                    <h4 className="font-semibold">{tr('Planification de la date d\'intervention', 'Intervention Date Scheduling')}</h4>
                                    <p className="mt-0.5 text-xs leading-relaxed text-blue-700 dark:text-blue-400">
                                        {tr(
                                            'La date d\'intervention sera proposée par notre équipe technique de métrologie après étude de faisabilité de votre demande. Vous pourrez ensuite la confirmer ou demander un ajustement.',
                                            'The intervention date will be proposed by our metrology technical team after reviewing your request. You will then be able to confirm it or request an adjustment.'
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="preferred_location" className="flex items-center gap-2 font-medium">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {tr('Lieu de calibration souhaité *', 'Desired Calibration Location *')}
                                </Label>
                                <Select
                                    value={data.preferred_location}
                                    onValueChange={(val) => setData('preferred_location', val)}
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder={tr('Sélectionnez le lieu', 'Select location')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="laboratory">
                                            {tr('Au laboratoire de métrologie', 'At Metrology Laboratory')}
                                        </SelectItem>
                                        <SelectItem value="client_site">
                                            {tr('Sur site client (intervention sur place)', 'At Client Site (On-site intervention)')}
                                        </SelectItem>
                                        <SelectItem value="both">
                                            {tr('Au laboratoire & Sur site client (Mixte)', 'At Laboratory & Client Site (Both)')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.preferred_location && (
                                    <p className="text-xs text-destructive mt-1">{errors.preferred_location}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="client_notes">
                                    {tr('Instructions ou exigences particulières', 'Special Instructions or Requirements')}
                                </Label>
                                <textarea
                                    id="client_notes"
                                    rows={3}
                                    value={data.client_notes}
                                    onChange={(e) => setData('client_notes', e.target.value)}
                                    placeholder={tr(
                                        'Précisez toute contrainte d\'accès, normes applicables, délais prioritaires, etc.',
                                        'Specify access constraints, applicable standards, priority deadlines, etc.'
                                    )}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                                {errors.client_notes && (
                                    <p className="text-xs text-destructive mt-1">{errors.client_notes}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Equipment Items Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    {tr('Équipements à calibrer', 'Equipment to Calibrate')} ({data.items.length})
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {tr(
                                        'Vous pouvez ajouter plusieurs instruments dans une même demande.',
                                        'You can add multiple instruments within a single request.'
                                    )}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                                className="font-medium text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                {tr('Ajouter un équipement', 'Add Equipment')}
                            </Button>
                        </div>

                        {errors.items && typeof errors.items === 'string' && (
                            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                {errors.items}
                            </div>
                        )}

                        {data.items.map((item, index) => (
                            <Card key={index} className="relative border-l-4 border-l-blue-600">
                                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">
                                        {tr('Équipement', 'Equipment')} #{index + 1}
                                    </CardTitle>
                                    {data.items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                            className="text-destructive hover:bg-destructive/10 h-8 px-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">{tr('Supprimer', 'Delete')}</span>
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Calibration Service and Equipment Name: Service on top, Equipment Name directly underneath */}
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-xs font-semibold">
                                                {tr('Prestation de calibration (Catalogue) *', 'Calibration Service (Catalog) *')}
                                            </Label>
                                            <Select
                                                value={item.calibration_service_id ? String(item.calibration_service_id) : ''}
                                                onValueChange={(val) => updateItem(index, 'calibration_service_id', Number(val))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder={tr('Choisir dans le catalogue', 'Choose from catalog')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {services.map((svc) => (
                                                        <SelectItem key={svc.id} value={String(svc.id)}>
                                                            [{svc.measurement_category}] {svc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors[`items.${index}.calibration_service_id` as keyof typeof errors] && (
                                                <p className="text-xs text-destructive mt-1">
                                                    {errors[`items.${index}.calibration_service_id` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>

                                        {/* Equipment Name placed directly UNDER the Calibration Service */}
                                        <div>
                                            <Label className="text-xs font-semibold">
                                                {tr('Désignation de l\'équipement (Nom de l\'instrument) *', 'Equipment Name *')}
                                            </Label>
                                            <Input
                                                placeholder={tr('Ex: Manomètre numérique 0-100 bar, Clé dynamométrique...', 'e.g. Digital Pressure Gauge 0-100 bar, Torque Wrench...')}
                                                value={item.equipment_name}
                                                onChange={(e) => updateItem(index, 'equipment_name', e.target.value)}
                                                className="mt-1"
                                            />
                                            {errors[`items.${index}.equipment_name` as keyof typeof errors] && (
                                                <p className="text-xs text-destructive mt-1">
                                                    {errors[`items.${index}.equipment_name` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <Label className="text-xs font-semibold">
                                                {tr('Numéro de série / Identification', 'Serial Number / ID')}
                                            </Label>
                                            <Input
                                                placeholder="Ex: SN-789456"
                                                value={item.serial_number}
                                                onChange={(e) => updateItem(index, 'serial_number', e.target.value)}
                                                className={`mt-1 ${duplicateSerialIndices.has(index) ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                            />
                                            {duplicateSerialIndices.has(index) && (
                                                <p className="text-xs text-destructive mt-1 font-medium">
                                                    {tr(
                                                        'Ce numéro de série est déjà utilisé pour un autre équipement.',
                                                        'This serial number is already used for another equipment.'
                                                    )}
                                                </p>
                                            )}
                                            {errors[`items.${index}.serial_number` as keyof typeof errors] && (
                                                <p className="text-xs text-destructive mt-1">
                                                    {errors[`items.${index}.serial_number` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold">
                                                {tr('Marque / Fabricant', 'Brand / Manufacturer')}
                                            </Label>
                                            <Input
                                                placeholder="Ex: WIKA, Fluke..."
                                                value={item.brand}
                                                onChange={(e) => updateItem(index, 'brand', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold">
                                                {tr('Modèle / Référence', 'Model / Reference')}
                                            </Label>
                                            <Input
                                                placeholder="Ex: 232.50"
                                                value={item.model}
                                                onChange={(e) => updateItem(index, 'model', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label className="text-xs">
                                                {tr('Étendue de mesure', 'Measurement Range')}
                                            </Label>
                                            <Input
                                                placeholder={tr('Ex: 0 à 100 bar, -50 à +250 °C', 'e.g., 0 to 100 bar, -50 to +250 °C')}
                                                value={item.measurement_range}
                                                onChange={(e) => updateItem(index, 'measurement_range', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">
                                                {tr('Tolérance / Classe de précision', 'Tolerance / Accuracy Class')}
                                            </Label>
                                            <Input
                                                placeholder={tr('Ex: Classe 1.0, ± 0.05 %', 'e.g., Class 1.0, ± 0.05 %')}
                                                value={item.tolerance}
                                                onChange={(e) => updateItem(index, 'tolerance', e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs">
                                            {tr('Remarques ou accessoires fournis', 'Remarks or Supplied Accessories')}
                                        </Label>
                                        <Input
                                            placeholder={tr('Ex: Câbles de mesure fournis, raccord 1/2 G', 'e.g. Cables supplied, 1/2 G connector')}
                                            value={item.specific_notes}
                                            onChange={(e) => updateItem(index, 'specific_notes', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Duplicate serial error banner */}
                    {duplicateSerialIndices.size > 0 && (
                        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>
                                {tr(
                                    'Des numéros de série en double ont été saisis. Le numéro de série ne peut pas être identique pour plus d\'un équipement.',
                                    'Duplicate serial numbers detected. Serial number cannot be the same for more than one equipment.'
                                )}
                            </span>
                        </div>
                    )}

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/client/requests">{tr('Annuler', 'Cancel')}</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || duplicateSerialIndices.size > 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        >
                            {processing
                                ? tr('Envoi en cours...', 'Submitting...')
                                : tr('Soumettre la demande de calibration', 'Submit Calibration Request')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
