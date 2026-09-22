import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Calendar,
    CheckCircle2,
    FileSpreadsheet,
    UserCheck,
    Users,
    Wrench,
} from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationCertificate, CalibrationOperation, CalibrationReport, User } from '@/types';

interface Props {
    stats: {
        calibrations_in_progress: number;
        calibrations_assigned: number;
        unassigned_operations: number;
        reports_pending_review: number;
        certificates_to_generate: number;
        certificates_to_validate: number;
    };
    techniciansWorkload: (User & {
        active_calibrations_count: number;
        completed_calibrations_count: number;
    })[];
    pendingReports: CalibrationReport[];
    draftCertificates: CalibrationCertificate[];
    unassignedOperations?: CalibrationOperation[];
    recentAssignments?: CalibrationOperation[];
}

export default function ManagerDashboard({
    stats,
    techniciansWorkload,
    pendingReports,
    draftCertificates,
    unassignedOperations = [],
    recentAssignments = [],
}: Props) {
    const { t, tr, locale } = useTranslation();
    const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('manager_dashboard_title'), href: '/manager/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('manager_dashboard_title')} - ${t('app_subtitle')}`} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t('manager_supervision_title')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {t('manager_supervision_desc')}
                    </p>
                </div>

                {/* Section 33: Manager KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-amber-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                {t('to_assign')}
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                {stats.unassigned_operations}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('operations_unassigned_desc')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                {t('in_execution')}
                            </CardTitle>
                            <Wrench className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                {stats.calibrations_in_progress}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('calibrations_with_techs')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                                {t('pending_reports_card')}
                            </CardTitle>
                            <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                                {stats.reports_pending_review}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('require_review_desc')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                {t('certificates_to_validate_card')}
                            </CardTitle>
                            <Award className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                {stats.certificates_to_validate}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('drafts_ready_for_validation')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Section: Opérations en attente d'affectation */}
                <Card className={unassignedOperations.length > 0 ? 'border-amber-300 dark:border-amber-800 shadow-sm' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-amber-600" />
                                {tr("Opérations en attente d'affectation", "Operations Pending Assignment")}
                                {unassignedOperations.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                        {unassignedOperations.length}
                                    </span>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {tr(
                                    "Opérations de calibration validées nécessitant l'attribution d'un technicien métrologue",
                                    'Validated calibration operations requiring assignment to a metrology technician'
                                )}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/manager/assignments">
                                {tr('Toutes les affectations', 'All Assignments')}
                                <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {unassignedOperations.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                {tr("Aucune opération en attente d'affectation.", 'No operations pending assignment.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Opération', 'Operation')}</th>
                                            <th className="px-6 py-3">{tr('Équipement', 'Equipment')}</th>
                                            <th className="px-6 py-3">{tr('Client & Demande', 'Client & Request')}</th>
                                            <th className="px-6 py-3">{tr('Lieu & Date', 'Location & Date')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Action', 'Action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {unassignedOperations.map((op) => (
                                            <tr key={op.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    <span className="font-mono text-amber-700 dark:text-amber-400">{op.operation_number}</span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-foreground">
                                                    {op.item?.equipment_name}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                                    <div className="font-medium text-foreground">{op.client?.company_name}</div>
                                                    <div>{op.request?.request_number}</div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                                    <div>{op.location === 'laboratory' ? tr('Laboratoire', 'Laboratory') : tr('Sur site', 'On site')}</div>
                                                    {op.scheduled_date && (
                                                        <div className="text-foreground font-medium flex items-center gap-1 mt-0.5">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(op.scheduled_date).toLocaleDateString(dateLocale)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-medium" asChild>
                                                        <Link href={`/manager/assignments?search=${op.operation_number}`}>
                                                            {tr('Affecter', 'Assign')}
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

                {/* Technicians Workload Table (Section 33) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                {t('technicians_workload')}
                            </CardTitle>
                            <CardDescription>{t('workload_distribution_desc')}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/manager/assignments">{t('manage_assignments')}</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-6 py-3">{t('technician')}</th>
                                        <th className="px-6 py-3">{t('role_status')}</th>
                                        <th className="px-6 py-3">{t('active_calibrations')}</th>
                                        <th className="px-6 py-3">{t('closed_calibrations')}</th>
                                        <th className="px-6 py-3 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {techniciansWorkload.map((tech) => (
                                        <tr key={tech.id} className="hover:bg-muted/20">
                                            <td className="px-6 py-4 font-semibold text-foreground">
                                                {tech.name}
                                                <div className="text-xs text-muted-foreground font-normal">{tech.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                {tech.is_delegated_manager ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                                        {t('interim_delegate')}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">{t('metrology_technician')}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                    {tech.active_calibrations_count} {t('in_progress').toLowerCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                                                {tech.completed_calibrations_count} {t('completed').toLowerCase()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/manager/assignments?technician_id=${tech.id}`}>
                                                        {t('assign')}
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Assignments Table */}
                {recentAssignments.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    {tr('Affectations récentes', 'Recent Assignments')}
                                </CardTitle>
                                <CardDescription>
                                    {tr('Dernières opérations assignées aux techniciens métrologues', 'Latest operations assigned to metrology technicians')}
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/manager/assignments">
                                    {tr('Gérer', 'Manage')}
                                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Opération', 'Operation')}</th>
                                            <th className="px-6 py-3">{tr('Équipement', 'Equipment')}</th>
                                            <th className="px-6 py-3">{tr('Technicien assigné', 'Assigned Technician')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Action', 'Action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {recentAssignments.map((op) => (
                                            <tr key={op.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    <span className="font-mono">{op.operation_number}</span>
                                                    <div className="text-xs text-muted-foreground font-normal">{op.client?.company_name}</div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-foreground">
                                                    {op.item?.equipment_name}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-foreground">
                                                    {op.technician?.name || tr('Non assigné', 'Unassigned')}
                                                    <div className="text-xs text-muted-foreground">{op.technician?.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={op.status} label={op.status_label} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/manager/assignments?search=${op.operation_number}`}>
                                                            {tr('Modifier', 'Edit')}
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Grid for Reports to Review & Certificates to Validate */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Pending Reports */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">{t('reports_pending_review_title')}</CardTitle>
                                <CardDescription>{t('review_decision_desc')}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/manager/reports">{t('view_all_reports')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pendingReports.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    {t('no_reports_pending_review')}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {pendingReports.map((report) => (
                                        <div key={report.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                                            <div>
                                                <div className="font-semibold text-sm text-foreground">
                                                    {report.report_number}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {report.operation?.operation_number} • {report.technician?.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {t('submitted_on')} {new Date(report.created_at).toLocaleDateString(dateLocale)}
                                                </div>
                                            </div>
                                            <Button size="sm" variant="default" asChild>
                                                <Link href={`/manager/reports/${report.id}`}>
                                                    {t('review')}
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Certificates to Approve */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">{t('draft_certificates_title')}</CardTitle>
                                <CardDescription>{t('digital_signature_desc')}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/manager/certificates">{t('view_all_certificates')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {draftCertificates.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    {t('no_draft_certificates')}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {draftCertificates.map((cert) => (
                                        <div key={cert.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                                            <div>
                                                <div className="font-semibold text-sm text-foreground">
                                                    {cert.certificate_number}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {cert.client?.company_name} • {cert.item?.equipment_name}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={cert.status} label={cert.status_label} />
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href="/manager/certificates">
                                                        {t('validate')}
                                                    </Link>
                                                </Button>
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
