import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Cpu,
    FileSpreadsheet,
    Play,
    UserCheck,
    Wrench,
} from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationOperation, MetrologyMaterial } from '@/types';

interface Props {
    stats: {
        my_calibrations: number;
        upcoming: number;
        in_progress: number;
        pending_reports: number;
        completed: number;
    };
    assignedOperations: CalibrationOperation[];
    expiringMaterials: MetrologyMaterial[];
}

export default function MetrologyDashboard({ stats, assignedOperations, expiringMaterials }: Props) {
    const { t, tr, locale } = useTranslation();
    const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('metrology_dashboard_title'), href: '/metrology/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('metrology_dashboard_title')} - ${t('app_subtitle')}`} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t('metrology_dashboard_title')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {t('metrology_dashboard_desc')}
                    </p>
                </div>

                {/* Section 33: Metrology KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-l-4 border-l-blue-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                {t('my_total_calibrations')}
                            </CardTitle>
                            <Wrench className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                {stats.my_calibrations}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('operations_assigned_to_you')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-indigo-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                                {tr('Nouvelles affectations', 'New Assignments')}
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                                {stats.upcoming}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {tr('À réaliser en priorité', 'To perform with priority')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                {t('in_calibration_process')}
                            </CardTitle>
                            <Clock className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                {stats.in_progress}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('technical_calibrations_desc')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                                {t('reports_to_upload')}
                            </CardTitle>
                            <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                                {stats.pending_reports}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('awaiting_writing_or_correction')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                {t('completed_calibrations')}
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                {stats.completed}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('validated_reports_certificates')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Operations & Standards Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Assigned Operations */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">{t('calibrations_to_perform')}</CardTitle>
                                <CardDescription>{t('scheduled_operations_desc')}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/metrology/operations">{t('view_all_my_calibrations')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {assignedOperations.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    {t('no_pending_calibrations')}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {assignedOperations.map((op) => {
                                        const isAssigned = op.status === 'ASSIGNED';
                                        return (
                                            <div
                                                key={op.id}
                                                className={`p-4 flex items-center justify-between transition-colors ${
                                                    isAssigned
                                                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30'
                                                        : 'hover:bg-muted/10'
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/metrology/operations/${op.id}`}
                                                            className="font-semibold text-sm hover:underline text-blue-600"
                                                        >
                                                            {op.operation_number}
                                                        </Link>
                                                        <span className="font-medium text-foreground text-sm">
                                                            • {op.item?.equipment_name}
                                                        </span>
                                                        {isAssigned && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                                                {tr('Nouveau', 'New')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {t('client')} : {op.client?.company_name} • {t('date')} : {op.scheduled_date ? new Date(op.scheduled_date).toLocaleDateString(dateLocale) : t('not_specified')} ({op.location === 'laboratory' ? t('laboratory') : t('on_site')})
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <StatusBadge status={op.status} label={op.status_label} />
                                                    {isAssigned ? (
                                                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-medium h-8 text-xs" asChild>
                                                            <Link href={`/metrology/operations/${op.id}`}>
                                                                <Play className="mr-1 h-3.5 w-3.5" />
                                                                {tr('Démarrer', 'Start')}
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                                                            <Link href={`/metrology/operations/${op.id}`}>
                                                                {t('open')}
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Expiring Standards Warnings (Section 24) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-muted-foreground" />
                                    {t('standards_alerts')}
                                </CardTitle>
                                <CardDescription>{t('validity_and_recalibration')}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/metrology/materials">{t('all')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {expiringMaterials.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    {t('standards_compliant')}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {expiringMaterials.map((mat) => (
                                        <div key={mat.id} className="p-3 text-xs flex flex-col gap-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-foreground font-mono">
                                                    {mat.reference_code}
                                                </span>
                                                <StatusBadge status={mat.status} label={mat.status_label} />
                                            </div>
                                            <div className="text-muted-foreground font-medium truncate">
                                                {mat.name}
                                            </div>
                                            <div className="text-destructive font-medium flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                {t('due_date')} : {mat.expiration_date ? new Date(mat.expiration_date).toLocaleDateString(dateLocale) : t('not_specified')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
