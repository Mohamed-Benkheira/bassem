import { Head, Link, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, InAppNotification } from '@/types';

interface Props {
    notifications: {
        data: InAppNotification[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function NotificationsIndex({ notifications }: Props) {
    const { tr, formatDate } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Centre de notifications', 'Notification Center'), href: '/notifications' },
    ];

    const handleMarkAsRead = (id: string) => {
        router.post(`/notifications/${id}/read`);
    };

    const handleMarkAllAsRead = () => {
        router.post('/notifications/read-all');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Centre de notifications', 'Notification Center')} />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Bell className="h-6 w-6 text-blue-600" />
                            {tr('Centre de notifications', 'Notification Center')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {tr('Suivi en temps réel des évolutions sur vos demandes, validations et interventions.', 'Real-time monitoring of updates on your requests, validations, and operations.')}
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-medium"
                    >
                        <CheckCheck className="mr-1.5 h-4 w-4" />
                        {tr('Tout marquer comme lu', 'Mark all as read')}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr('Toutes les alertes', 'All alerts')} ({notifications.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {notifications.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucune notification pour le moment.', 'No notifications for now.')}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.data.map((n) => {
                                    const isUnread = !n.read_at;
                                    return (
                                        <div
                                            key={n.id}
                                            className={`p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors ${
                                                isUnread ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-muted/10'
                                            }`}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    {isUnread && (
                                                        <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                                                    )}
                                                    <span className="font-semibold text-sm text-foreground">
                                                        {n.data?.title || tr('Notification', 'Notification')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {n.data?.message}
                                                </p>
                                                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(n.created_at)}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                {n.data?.url && (
                                                    <Button size="sm" variant="outline" asChild className="h-8 text-xs">
                                                        <Link
                                                            href={n.data.url}
                                                            onClick={() => {
                                                                if (isUnread) {
                                                                    handleMarkAsRead(n.id);
                                                                }
                                                            }}
                                                        >
                                                            <ExternalLink className="mr-1 h-3.5 w-3.5" />
                                                            {tr('Voir', 'View')}
                                                        </Link>
                                                    </Button>
                                                )}
                                                {isUnread && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleMarkAsRead(n.id)}
                                                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                                        title={tr('Marquer comme lu', 'Mark as read')}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
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
            </div>
        </AppLayout>
    );
}
