import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Clock,
    FileCheck,
    FileText,
    Send,
} from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, CalibrationRequest, Contract } from '@/types';

interface Props {
    stats: {
        new_requests: number;
        in_processing: number;
        sent_to_metrology: number;
        waiting_client: number;
        active_contracts: number;
        expiring_contracts: number;
    };
    pendingRequests: CalibrationRequest[];
    activeContracts: Contract[];
}

export default function CommercialDashboard({ stats, pendingRequests, activeContracts }: Props) {
    const { t, locale } = useTranslation();
    const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('commercial_dashboard_title'), href: '/commercial/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('commercial_dashboard_title')} - ${t('app_subtitle')}`} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t('commercial_dashboard_title')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {t('commercial_dashboard_desc')}
                    </p>
                </div>

                {/* Section 33: Commercial KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-blue-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                {t('new_requests')}
                            </CardTitle>
                            <FileText className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                {stats.new_requests}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('awaiting_commercial_analysis')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-indigo-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                                {t('transmitted_metrology')}
                            </CardTitle>
                            <Send className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                                {stats.sent_to_metrology}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('awaiting_date_proposal')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                {t('awaiting_client')}
                            </CardTitle>
                            <Clock className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                {stats.waiting_client}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('date_proposed_desc')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-600">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                {t('active_contracts')}
                            </CardTitle>
                            <FileCheck className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                {stats.active_contracts}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.expiring_contracts > 0 ? (
                                    <span className="text-amber-600 font-medium">
                                        {stats.expiring_contracts} {t('expiring_contracts_count')}
                                    </span>
                                ) : (
                                    t('active_framework_agreements')
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Tables */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Pending Requests Column */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">{t('priority_requests')}</CardTitle>
                                <CardDescription>{t('priority_requests_desc')}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/commercial/requests">{t('view_all_requests')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pendingRequests.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    {t('no_pending_requests')}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {pendingRequests.map((req) => (
                                        <div key={req.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/commercial/requests/${req.id}`}
                                                        className="font-semibold text-sm hover:underline text-blue-600"
                                                    >
                                                        {req.request_number}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        • {req.client?.company_name}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {req.items?.length || 0} {t('equipments_count')} • {t('submitted_on')} {new Date(req.created_at).toLocaleDateString(dateLocale)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <StatusBadge status={req.status} label={req.status_label} />
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/commercial/requests/${req.id}`}>
                                                        {t('process')}
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Active Contracts Column */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">{t('active_contracts')}</CardTitle>
                                <CardDescription>{t('recent_framework_agreements')}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/commercial/contracts">{t('manage')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {activeContracts.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    {t('no_active_contracts')}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {activeContracts.map((ctr) => (
                                        <div key={ctr.id} className="p-3 text-xs">
                                            <div className="font-semibold text-foreground">
                                                {ctr.contract_number}
                                            </div>
                                            <div className="text-muted-foreground">
                                                {ctr.client?.company_name}
                                            </div>
                                            <div className="text-muted-foreground mt-0.5">
                                                {t('due_date')} : {ctr.end_date ? new Date(ctr.end_date).toLocaleDateString(dateLocale) : t('undetermined')}
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
