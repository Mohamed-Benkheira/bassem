<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $roles = [
            'client' => [
                'label' => 'Client',
                'description' => 'Client externe passant des demandes de calibration d\'équipements.',
            ],
            'commercial' => [
                'label' => 'Commercial',
                'description' => 'Service commercial assurant le traitement, devis et contractualisation.',
            ],
            'metrology' => [
                'label' => 'Métrologie',
                'description' => 'Technicien métrologue réalisant les opérations de calibration et rapports.',
            ],
            'manager' => [
                'label' => 'Responsable Métrologie',
                'description' => 'Responsable de laboratoire métrologique supervisant et validant les certificats.',
            ],
            'admin' => [
                'label' => 'Administrateur',
                'description' => 'Administrateur informatique ayant un accès complet au système.',
            ],
        ];

        $roleModels = [];
        foreach ($roles as $name => $data) {
            $roleModels[$name] = Role::firstOrCreate(['name' => $name], $data);
        }

        // 2. Permissions
        $permissions = [
            'requests.view' => 'Voir les demandes',
            'requests.create' => 'Créer une demande',
            'requests.update' => 'Mettre à jour une demande',
            'requests.cancel' => 'Annuler une demande',
            'requests.send_to_metrology' => 'Transmettre la demande à la métrologie',

            'quotations.view' => 'Consulter les devis',
            'quotations.create' => 'Créer un devis',
            'quotations.update' => 'Mettre à jour un devis',

            'contracts.view' => 'Consulter les contrats',
            'contracts.create' => 'Créer un contrat',
            'contracts.upload' => 'Téléverser un contrat',
            'contracts.archive' => 'Archiver un contrat',

            'calibrations.view' => 'Consulter les opérations de calibration',
            'calibrations.assign' => 'Affecter un technicien',
            'calibrations.schedule' => 'Planifier une calibration',
            'calibrations.update' => 'Mettre à jour une opération',

            'reports.view' => 'Consulter les rapports de calibration',
            'reports.upload' => 'Téléverser un rapport de calibration',
            'reports.review' => 'Réviser et valider un rapport',

            'certificates.view' => 'Consulter les certificats',
            'certificates.generate' => 'Générer un certificat',
            'certificates.upload' => 'Téléverser un certificat',
            'certificates.validate' => 'Valider un certificat',

            'materials.view' => 'Consulter les étalons et matériels',
            'materials.create' => 'Créer un étalon de référence',
            'materials.update' => 'Modifier un étalon de référence',

            'users.view' => 'Consulter les utilisateurs',
            'users.create' => 'Créer un utilisateur',
            'users.update' => 'Modifier un utilisateur',
            'users.disable' => 'Activer ou désactiver un utilisateur',

            'services.view' => 'Consulter le catalogue de calibration',
            'services.create' => 'Ajouter un service au catalogue',
            'services.update' => 'Modifier un service du catalogue',
            'services.delete' => 'Supprimer un service du catalogue',

            'audit.view' => 'Consulter les journaux d\'audit',
            'archive.view' => 'Consulter les archives documentaires',
        ];

        $permissionModels = [];
        foreach ($permissions as $name => $label) {
            $permissionModels[$name] = Permission::firstOrCreate(['name' => $name], ['label' => $label]);
        }

        // 3. Assign permissions to roles based on Section 37 matrix
        // Client
        $roleModels['client']->permissions()->sync(collect([
            'requests.view',
            'requests.create',
            'requests.cancel',
            'contracts.view',
            'certificates.view',
        ])->map(fn ($p) => $permissionModels[$p]->id));

        // Commercial
        $roleModels['commercial']->permissions()->sync(collect([
            'requests.view',
            'requests.send_to_metrology',
            'quotations.view',
            'quotations.create',
            'quotations.update',
            'contracts.view',
            'contracts.create',
            'contracts.upload',
            'contracts.archive',
            'calibrations.view',
            'certificates.view',
            'services.view',
            'archive.view',
        ])->map(fn ($p) => $permissionModels[$p]->id));

        // Metrology
        $roleModels['metrology']->permissions()->sync(collect([
            'requests.view',
            'calibrations.view',
            'calibrations.schedule',
            'calibrations.update',
            'reports.view',
            'reports.upload',
            'materials.view',
            'services.view',
        ])->map(fn ($p) => $permissionModels[$p]->id));

        // Manager
        $roleModels['manager']->permissions()->sync(collect([
            'requests.view',
            'calibrations.view',
            'calibrations.schedule',
            'calibrations.assign',
            'calibrations.update',
            'reports.view',
            'reports.upload',
            'reports.review',
            'certificates.view',
            'certificates.generate',
            'certificates.upload',
            'certificates.validate',
            'materials.view',
            'materials.create',
            'materials.update',
            'services.view',
            'archive.view',
        ])->map(fn ($p) => $permissionModels[$p]->id));

        // Admin has all permissions
        $roleModels['admin']->permissions()->sync(collect($permissionModels)->pluck('id'));
    }
}
