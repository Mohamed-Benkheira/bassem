import { Head, Link } from '@inertiajs/react';
import {
    Archive,
    Award,
    Building2,
    FileCheck,
    FileText,
    ShieldAlert,
    Users,
    Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { AuditLog, BreadcrumbItem, User } from '@/types';

interface Props {
    stats: {
        total_users: number;
        total_clients: number;
        total_requests: number;
        total_contracts: number;
        total_operations: number;
        total_certificates: number;
        total_documents: number;
        materials_expired: number;
    };
    recentLogs: AuditLog[];
    recentUsers: User[];
}

export default function AdminDashboard({ stats, recentLogs, recentUsers }: Props) {
    const { t, locale } = useTranslation();
    const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('admin_dashboard_title'), href: '/admin/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('admin_dashboard_title')} - ${t('app_subtitle')}`} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {t('admin_system_title')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {t('admin_system_desc')}
                    </p>
                </div>

                {/* Section 33: Admin KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('active_users')}
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                            <p className="text-xs text-muted-foreground mt-1">{t('registered_accounts')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('client_companies')}
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_clients}</div>
                            <p className="text-xs text-muted-foreground mt-1">{t('industrial_clients')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('requests_and_contracts')}
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_requests} <span className="text-xs text-muted-foreground font-normal">/ {stats.total_contracts} {t('contracts_count')}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{t('commercial_volume')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('validated_certificates')}
                            </CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_certificates}</div>
                            <p className="text-xs text-muted-foreground mt-1">{t('compliant_cert_emitted')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('total_operations')}
                            </CardTitle>
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_operations}</div>
                            <p className="text-xs text-muted-foreground mt-1">{t('interventions_tracked')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('total_documents')}
                            </CardTitle>
                            <Archive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_documents}</div>
                            <p className="text-xs text-muted-foreground mt-1">{t('secure_files_stored')}</p>
                        </CardContent>
                    </Card>

                    <Card className={stats.materials_expired > 0 ? 'border-destructive/50 bg-destructive/5' : ''}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t('expired_materials')}
                            </CardTitle>
                            <ShieldAlert className={`h-4 w-4 ${stats.materials_expired > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats.materials_expired > 0 ? 'text-destructive' : ''}`}>
                                {stats.materials_expired}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.materials_expired > 0 ? t('requiring_attention') : t('all_standards_valid')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Grid: Audit Logs & Users */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Audit Logs (Section 31) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">{t('recent_audit_logs')}</CardTitle>
                                <CardDescription>{t('system_traceability_desc')}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/audit-logs">{t('view_all_logs')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentLogs.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    {t('no_audit_logs')}
                                </div>
                            ) : (
                                <div className="divide-y text-xs">
                                    {recentLogs.map((log) => (
                                        <div key={log.id} className="p-3 flex items-start justify-between">
                                            <div>
                                                <div className="font-semibold text-foreground">
                                                    {log.action} • {(log.model_type || log.entity_type || '').split('\\').pop()}
                                                </div>
                                                <div className="text-muted-foreground mt-0.5">
                                                    {t('user')}: {log.user?.name || (locale === 'fr' ? 'Système' : 'System')} ({typeof log.user?.role === 'string' ? log.user.role : (log.user?.role_label || log.user?.role_name || 'SYSTEM')})
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {t('ip_address')}: {log.ip_address}
                                                </div>
                                            </div>
                                            <div className="text-muted-foreground text-[11px]">
                                                {new Date(log.created_at).toLocaleDateString(dateLocale)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Users */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">{t('recent_registered_users')}</CardTitle>
                                <CardDescription>{t('users_catalog_desc')}</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/users">{t('manage_users')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentUsers.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    {t('no_users_found')}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {recentUsers.map((u) => (
                                        <div key={u.id} className="p-3 flex items-center justify-between text-xs">
                                            <div>
                                                <div className="font-semibold text-foreground">
                                                    {u.name}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {u.email}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-foreground">
                                                    {typeof u.role === 'string' ? u.role : (u.role_label || u.role_name || 'User')}
                                                </span>
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
