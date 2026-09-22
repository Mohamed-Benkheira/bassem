<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $managerRole = Role::where('name', 'manager')->first();
        $metrologyRole = Role::where('name', 'metrology')->first();
        $commercialRole = Role::where('name', 'commercial')->first();
        $clientRole = Role::where('name', 'client')->first();

        // 1. Admin
        User::firstOrCreate(
            ['email' => 'admin@calibration.test'],
            [
                'name' => 'Directeur Technique Admin',
                'password' => Hash::make('password'),
                'role_id' => $adminRole?->id,
                'phone' => '+33 1 23 45 67 89',
                'is_active' => true,
                'is_delegated_manager' => false,
                'email_verified_at' => now(),
            ]
        );

        // 2. Manager
        User::firstOrCreate(
            ['email' => 'manager@calibration.test'],
            [
                'name' => 'Jean-Luc Dubois (Responsable Métrologie)',
                'password' => Hash::make('password'),
                'role_id' => $managerRole?->id,
                'phone' => '+33 1 45 67 89 10',
                'is_active' => true,
                'is_delegated_manager' => false,
                'email_verified_at' => now(),
            ]
        );

        // 3. Metrology Technicians
        User::firstOrCreate(
            ['email' => 'metrologie@calibration.test'],
            [
                'name' => 'Ahmed Mansour (Technicien)',
                'password' => Hash::make('password'),
                'role_id' => $metrologyRole?->id,
                'phone' => '+33 1 56 78 90 12',
                'is_active' => true,
                'is_delegated_manager' => false,
                'email_verified_at' => now(),
            ]
        );

        // 4. Delegated Metrology Technician (Section 28)
        User::firstOrCreate(
            ['email' => 'metrologie.adjoint@calibration.test'],
            [
                'name' => 'Karim Benali (Technicien Délégué)',
                'password' => Hash::make('password'),
                'role_id' => $metrologyRole?->id,
                'phone' => '+33 1 56 78 90 13',
                'is_active' => true,
                'is_delegated_manager' => true, // Delegated fallback
                'email_verified_at' => now(),
            ]
        );

        // 5. Commercial
        User::firstOrCreate(
            ['email' => 'commercial@calibration.test'],
            [
                'name' => 'Sophie Laurent (Commerciale)',
                'password' => Hash::make('password'),
                'role_id' => $commercialRole?->id,
                'phone' => '+33 1 67 89 01 23',
                'is_active' => true,
                'is_delegated_manager' => false,
                'email_verified_at' => now(),
            ]
        );

        // 6. Client User
        $clientUser = User::firstOrCreate(
            ['email' => 'client@client-industriel.test'],
            [
                'name' => 'Marc Lefebvre (Resp. Qualité)',
                'password' => Hash::make('password'),
                'role_id' => $clientRole?->id,
                'phone' => '+33 3 20 12 34 56',
                'is_active' => true,
                'is_delegated_manager' => false,
                'email_verified_at' => now(),
            ]
        );

        // Associated Client record
        Client::firstOrCreate(
            ['email' => 'contact@precision-mecanique.fr'],
            [
                'user_id' => $clientUser->id,
                'company_name' => 'Précision Mécanique Industrielle SA',
                'contact_name' => 'Marc Lefebvre',
                'phone' => '+33 3 20 12 34 56',
                'address' => '15 Rue des Usines, Zone Industrielle Nord',
                'city' => 'Lille',
                'postal_code' => '59000',
                'tax_number' => 'FR89456789123',
                'notes' => 'Client industriel certifié ISO 9001 - Calibration annuelle de parcs d\'instruments.',
            ]
        );
    }
}
