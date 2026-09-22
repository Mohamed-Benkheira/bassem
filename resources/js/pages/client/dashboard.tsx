import { Head, Link } from '@inertiajs/react';
import { Award, CheckCircle2, Clock, FileText, PlusCircle } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationCertificate, CalibrationRequest, Client } from '@/types';

interface Props {
    stats: {
        total_requests: number;
        in_progress: number;
        completed: number;
        cancelled: number;
        available_certificates: number;
    };
    recentRequests: CalibrationRequest[];
    recentCertificates: CalibrationCertificate[];
    client: Client;
}

export default function ClientDashboard({ stats, recentRequests, recentCertificates, client }: Props) {
    const { t, locale } = useTranslation();
    const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('client_dashboard_title'),
            href: '/client/dashboard',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('client_dashboard_title')} - ${t('app_subtitle')}`} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Welcome & Quick Action Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t('client_welcome')}, {client.contact_name || client.company_name}
                        </h1>
                        <p className="mt-1 text-sm text-blue-100">
                            {t('client_welcome_desc')}
                        </p>
                    </div>
                    <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow">
                        <Link href="/client/requests/create">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            {t('new_calibration_request')}
                        </Link>
                    </Button>
                </div>

                {/* Section 33: Client KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('my_total_requests')}
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_requests}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('all_requests_history')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                {t('requests_in_progress')}
                            </CardTitle>
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {stats.in_progress}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('in_processing_or_calibration')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                {t('requests_completed')}
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {stats.completed}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('completed_calibrations_desc')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                {t('certificates_available')}
                            </CardTitle>
                            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {stats.available_certificates}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('certificates_available_desc')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Requests */}
                    <Card className="flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">{t('latest_requests')}</CardTitle>
                                <CardDescription>{t('recent_requests_desc')}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/client/requests">{t('view_all')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {recentRequests.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    {t('no_client_requests')}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {recentRequests.map((req) => (
                                        <div key={req.id} className="py-3 flex items-center justify-between">
                                            <div>
                                                <Link
                                                    href={`/client/requests/${req.id}`}
                                                    className="font-semibold text-sm hover:underline text-foreground"
                                                >
                                                    {req.request_number}
                                                </Link>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {req.items?.length || 0} {t('equipments_count')} • {t('created_on')} {new Date(req.created_at).toLocaleDateString(dateLocale)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <StatusBadge status={req.status} label={req.status_label} />
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/client/requests/${req.id}`}>{t('details')}</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Certificates */}
                    <Card className="flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">{t('latest_certificates')}</CardTitle>
                                <CardDescription>{t('recent_certificates_desc')}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/client/certificates">{t('view_all')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {recentCertificates.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    {t('no_client_certificates')}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {recentCertificates.map((cert) => (
                                        <div key={cert.id} className="py-3 flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-sm text-foreground">
                                                    {cert.certificate_number}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {cert.item?.equipment_name} {cert.item?.serial_number ? `(N°: ${cert.item.serial_number})` : ''}
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={`/certificates/${cert.id}/download`} target="_blank" rel="noreferrer">
                                                    {t('download_pdf')}
                                                </a>
                                            </Button>
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
