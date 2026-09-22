<?php

namespace Database\Seeders;

use App\Models\MetrologyMaterial;
use Illuminate\Database\Seeder;

class MetrologyMaterialSeeder extends Seeder
{
    public function run(): void
    {
        $materials = [
            [
                'name' => 'Balance Manométrique Étalon Primaire Hydraulique',
                'reference_code' => 'ET-PRS-001',
                'serial_number' => 'BMP-7845-FR',
                'manufacturer' => 'Desgranges & Huot',
                'model' => '5300 Series',
                'category' => 'Pression',
                'calibration_date' => now()->subMonths(6)->toDateString(),
                'expiration_date' => now()->addMonths(18)->toDateString(),
                'status' => MetrologyMaterial::STATUS_VALID,
                'location' => 'Laboratoire Pression - Salle Blanche B1',
                'notes' => 'Étalon de référence raccordé LNE. Incertitude 0.005%.',
            ],
            [
                'name' => 'Bain Thermostaté de Précision avec Sonde SPRT',
                'reference_code' => 'ET-TMP-002',
                'serial_number' => 'BTP-9921-DE',
                'manufacturer' => 'Fluke Calibration',
                'model' => '7381 Deep-Well Bath',
                'category' => 'Température',
                'calibration_date' => now()->subMonths(4)->toDateString(),
                'expiration_date' => now()->addMonths(8)->toDateString(),
                'status' => MetrologyMaterial::STATUS_VALID,
                'location' => 'Laboratoire Température - Poste 2',
                'notes' => 'Stabilité thermique ± 0.002 °C. Sonde étalon de platine 25.5 ohms.',
            ],
            [
                'name' => 'Calibrateur Multifonction Haute Précision',
                'reference_code' => 'ET-ELE-003',
                'serial_number' => 'MF-5730A-01',
                'manufacturer' => 'Fluke Corporation',
                'model' => '5730A High Performance',
                'category' => 'Électricité',
                'calibration_date' => now()->subMonths(11)->toDateString(),
                'expiration_date' => now()->addDays(20)->toDateString(), // Approaching expiration!
                'status' => MetrologyMaterial::STATUS_VALID,
                'location' => 'Laboratoire Électricité - Banc Principal',
                'notes' => 'Attention : ré-étalonnage COFRAC à planifier sous 30 jours.',
            ],
            [
                'name' => 'Jeu de Masses Étalons Inoxydables Classe E2 (1mg - 10kg)',
                'reference_code' => 'ET-MAS-004',
                'serial_number' => 'JME-E2-0045',
                'manufacturer' => 'Mettler Toledo',
                'model' => 'Class E2 Stainless Steel Box',
                'category' => 'Masse & Pesage',
                'calibration_date' => now()->subMonths(26)->toDateString(),
                'expiration_date' => now()->subMonths(2)->toDateString(), // Expired!
                'status' => MetrologyMaterial::STATUS_EXPIRED,
                'location' => 'Armoire sécurisée Pesage A3',
                'notes' => 'Matériel hors étalonnage. En attente de réexpédition vers laboratoire accrédité.',
            ],
        ];

        foreach ($materials as $material) {
            MetrologyMaterial::firstOrCreate(['reference_code' => $material['reference_code']], $material);
        }
    }
}
