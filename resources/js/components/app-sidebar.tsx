import { Link, usePage } from '@inertiajs/react';
import {
    Archive,
    Award,
    Bell,
    Building2,
    Calendar,
    Cpu,
    FileCheck,
    FileSpreadsheet,
    FileText,
    History,
    LayoutGrid,
    PlusCircle,
    Receipt,
    Settings2,
    ShieldAlert,
    UserCheck,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/hooks/use-translation';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth, unread_notifications_count } = usePage<{
        auth: { user?: { role_name?: string; role_label?: string; name: string } };
        unread_notifications_count?: number;
    }>().props;
    const { t } = useTranslation();

    const role = auth?.user?.role_name || 'client';

    const getNavItems = (): NavItem[] => {
        switch (role) {
            case 'client':
                return [
                    { title: t('dashboard', 'Tableau de bord'), href: '/client/dashboard', icon: LayoutGrid },
                    { title: t('my_requests', 'Mes demandes'), href: '/client/requests', icon: FileText },
                    { title: t('new_request', 'Nouvelle demande'), href: '/client/requests/create', icon: PlusCircle },
                    { title: t('my_contracts', 'Mes contrats'), href: '/client/contracts', icon: FileCheck },
                    { title: t('my_certificates', 'Mes certificats'), href: '/client/certificates', icon: Award },
                    { title: t('history', 'Historique'), href: '/client/history', icon: History },
                ];
            case 'commercial':
                return [
                    { title: t('dashboard', 'Tableau de bord'), href: '/commercial/dashboard', icon: LayoutGrid },
                    { title: t('requests', 'Demandes'), href: '/commercial/requests', icon: FileText },
                    { title: t('quotations', 'Devis'), href: '/commercial/quotations', icon: Receipt },
                    { title: t('contracts', 'Contrats'), href: '/commercial/contracts', icon: FileCheck },
                    { title: t('clients', 'Clients'), href: '/commercial/clients', icon: Building2 },
                ];
            case 'metrology':
                return [
                    { title: t('dashboard', 'Tableau de bord'), href: '/metrology/dashboard', icon: LayoutGrid },
                    { title: t('my_calibrations', 'Mes calibrations'), href: '/metrology/operations', icon: Wrench },
                    { title: t('scheduling', 'Planification'), href: '/metrology/scheduling', icon: Calendar },
                    { title: t('materials_standards', 'Matériel & Étalons'), href: '/metrology/materials', icon: Cpu },
                ];
            case 'manager':
                return [
                    { title: t('dashboard', 'Tableau de bord'), href: '/manager/dashboard', icon: LayoutGrid },
                    { title: t('my_calibrations', 'Calibrations'), href: '/manager/operations', icon: Wrench },
                    { title: t('scheduling', 'Planification'), href: '/manager/scheduling', icon: Calendar },
                    { title: t('assignments', 'Affectations'), href: '/manager/assignments', icon: UserCheck },
                    { title: t('reports', 'Rapports'), href: '/manager/reports', icon: FileSpreadsheet },
                    { title: t('certificates', 'Certificats'), href: '/manager/certificates', icon: Award },
                    { title: t('materials_standards', 'Matériel & Étalons'), href: '/manager/materials', icon: Cpu },
                    { title: t('history', 'Historique'), href: '/manager/history', icon: History },
                ];
            case 'admin':
                return [
                    { title: t('dashboard', 'Tableau de bord'), href: '/admin/dashboard', icon: LayoutGrid },
                    { title: t('users', 'Utilisateurs'), href: '/admin/users', icon: Users },
                    { title: t('clients', 'Clients'), href: '/admin/clients', icon: Building2 },
                    { title: t('service_catalog', 'Catalogue des services'), href: '/admin/services', icon: Settings2 },
                    { title: t('materials_standards', 'Matériel & Étalons'), href: '/metrology/materials', icon: Cpu },
                    { title: t('archives', 'Archives'), href: '/admin/archives', icon: Archive },
                    { title: t('audit_logs', 'Journaux d\'audit'), href: '/admin/audit-logs', icon: ShieldAlert },
                ];
            default:
                return [
                    { title: t('dashboard', 'Tableau de bord'), href: '/dashboard', icon: LayoutGrid },
                ];
        }
    };

    const footerNavItems: NavItem[] = [
        {
            title: unread_notifications_count && unread_notifications_count > 0
                ? `${t('notifications', 'Notifications')} (${unread_notifications_count})`
                : t('notifications', 'Notifications'),
            href: '/notifications',
            icon: Bell,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={getNavItems()} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
