import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Lock, Plus, Power, Search, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
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
import type { BreadcrumbItem, Role, User } from '@/types';

interface Props {
    users: {
        data: User[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    roles: Role[];
    filters: {
        search?: string;
        role_id?: string;
    };
}

export default function AdminUsersIndex({ users, roles, filters }: Props) {
    const { tr } = useTranslation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Utilisateurs & Rôles', 'Users & Roles'), href: '/admin/users' },
    ];

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        phone: '',
        is_active: true,
        is_delegated_manager: false,
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
        phone: '',
        is_active: true,
        is_delegated_manager: false,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/users', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role_id: user.role_id ? String(user.role_id) : '',
            phone: user.phone || '',
            is_active: Boolean(user.is_active),
            is_delegated_manager: Boolean(user.is_delegated_manager),
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.put(`/admin/users/${editingUser.id}`, {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    const handleToggleStatus = (userId: number) => {
        router.post(`/admin/users/${userId}/toggle`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search: search || undefined }, { preserveState: true });
    };

    const getRoleDisplayName = (r: Role) => {
        const roleLabels: Record<string, string> = {
            client: tr('Client', 'Client'),
            commercial: tr('Commercial', 'Commercial / Sales'),
            technicien: tr('Technicien Métrologie', 'Metrology Technician'),
            responsable_metrologie: tr('Responsable Métrologie', 'Metrology Manager'),
            administrateur: tr('Administrateur', 'Administrator'),
        };
        return roleLabels[r.name] || r.label;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Gestion des utilisateurs - Administrateur', 'User Management - Administrator')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {tr('Utilisateurs & Rôles', 'Users & Roles')}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {tr('Gestion des comptes, affectation des rôles, désactivation et délégation par intérim.', 'Account management, role assignment, deactivation, and interim delegation.')}
                        </p>
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                <Plus className="mr-2 h-4 w-4" />
                                {tr('Nouvel utilisateur', 'New user')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{tr('Créer un compte utilisateur', 'Create user account')}</DialogTitle>
                                <DialogDescription>
                                    {tr("Définissez l'identité et le rôle attribué à l'utilisateur.", 'Define the identity and role assigned to the user.')}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 py-2">
                                <div>
                                    <Label>{tr('Nom complet *', 'Full name *')}</Label>
                                    <Input
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>{tr('Adresse e-mail *', 'Email address *')}</Label>
                                    <Input
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {createForm.errors.email && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>{tr('Mot de passe initial *', 'Initial password *')}</Label>
                                    <Input
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                    {createForm.errors.password && (
                                        <p className="text-xs text-destructive mt-1">{createForm.errors.password}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Rôle *', 'Role *')}</Label>
                                        <Select
                                            value={createForm.data.role_id}
                                            onValueChange={(val) => createForm.setData('role_id', val)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder={tr('Sélectionnez un rôle', 'Select a role')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((r) => (
                                                    <SelectItem key={r.id} value={String(r.id)}>
                                                        {getRoleDisplayName(r)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {createForm.errors.role_id && (
                                            <p className="text-xs text-destructive mt-1">{createForm.errors.role_id}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>{tr('Téléphone', 'Phone')}</Label>
                                        <Input
                                            value={createForm.data.phone}
                                            onChange={(e) => createForm.setData('phone', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="delegation-create"
                                        checked={createForm.data.is_delegated_manager}
                                        onChange={(e) => createForm.setData('is_delegated_manager', e.target.checked)}
                                        className="rounded border-input text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="delegation-create" className="text-xs font-normal cursor-pointer">
                                        {tr('Délégation intérim Responsable Métrologie (Section 28)', 'Interim delegation Metrology Manager (Section 28)')}
                                    </Label>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                        {tr('Annuler', 'Cancel')}
                                    </Button>
                                    <Button type="submit" disabled={createForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {createForm.processing ? tr('Création...', 'Creating...') : tr('Créer l\'utilisateur', 'Create user')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr('Rechercher par nom, adresse e-mail ou téléphone...', 'Search by name, email or phone...')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                {tr('Rechercher', 'Search')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {tr('Tous les comptes utilisateurs', 'All user accounts')} ({users.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-6 py-3">{tr('Utilisateur', 'User')}</th>
                                        <th className="px-6 py-3">{tr('E-mail', 'Email')}</th>
                                        <th className="px-6 py-3">{tr('Rôle système', 'System role')}</th>
                                        <th className="px-6 py-3">{tr('Délégation Intérim', 'Interim Delegation')}</th>
                                        <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                        <th className="px-6 py-3 text-right">{tr('Actions', 'Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-muted/20">
                                            <td className="px-6 py-4 font-semibold text-foreground">
                                                {u.name}
                                                {u.phone && <div className="text-xs text-muted-foreground font-normal">{u.phone}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                                    {u.role_label || tr('Utilisateur', 'User')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                {u.is_delegated_manager ? (
                                                    <span className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                                                        <ShieldCheck className="h-3.5 w-3.5" />
                                                        {tr('Délégué autorisé', 'Authorized delegate')}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                                    u.is_active
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                                }`}>
                                                    {u.is_active ? tr('Actif', 'Active') : tr('Désactivé', 'Deactivated')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => openEditModal(u)}
                                                        className="h-8 px-2"
                                                        title={tr('Modifier', 'Edit')}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        <span className="sr-only">{tr('Modifier', 'Edit')}</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleToggleStatus(u.id)}
                                                        className={`h-8 px-2 ${u.is_active ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-600'}`}
                                                        title={u.is_active ? tr('Désactiver le compte', 'Deactivate account') : tr('Activer le compte', 'Activate account')}
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit User Modal */}
                {editingUser && (
                    <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{tr('Modifier le compte :', 'Edit account:')} {editingUser.name}</DialogTitle>
                                <DialogDescription>
                                    {tr('Mettez à jour les informations et permissions de cet utilisateur.', 'Update information and permissions for this user.')}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleEdit} className="space-y-4 py-2">
                                <div>
                                    <Label>{tr('Nom complet *', 'Full name *')}</Label>
                                    <Input
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>{tr('Adresse e-mail *', 'Email address *')}</Label>
                                    <Input
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label>{tr('Nouveau mot de passe (laisser vide pour ne pas changer)', 'New password (leave blank to keep current)')}</Label>
                                    <Input
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>{tr('Rôle *', 'Role *')}</Label>
                                        <Select
                                            value={editForm.data.role_id}
                                            onValueChange={(val) => editForm.setData('role_id', val)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((r) => (
                                                    <SelectItem key={r.id} value={String(r.id)}>
                                                        {getRoleDisplayName(r)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>{tr('Téléphone', 'Phone')}</Label>
                                        <Input
                                            value={editForm.data.phone}
                                            onChange={(e) => editForm.setData('phone', e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="delegation-edit"
                                        checked={editForm.data.is_delegated_manager}
                                        onChange={(e) => editForm.setData('is_delegated_manager', e.target.checked)}
                                        className="rounded border-input text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="delegation-edit" className="text-xs font-normal cursor-pointer">
                                        {tr('Délégation intérim Responsable Métrologie (Section 28)', 'Interim delegation Metrology Manager (Section 28)')}
                                    </Label>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                                        {tr('Annuler', 'Cancel')}
                                    </Button>
                                    <Button type="submit" disabled={editForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {editForm.processing ? tr('Enregistrement...', 'Saving...') : tr('Mettre à jour', 'Update')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
