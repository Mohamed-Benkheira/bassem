<?php

namespace Database\Seeders;

use App\Models\CalibrationService;
use Illuminate\Database\Seeder;

class CalibrationCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Étalonnage de Manomètre et Transmetteur de Pression',
                'code' => 'CAL-PRS-001',
                'equipment_type' => 'Manomètre / Capteur de pression',
                'description' => 'Étalonnage de manomètres à tube de Bourdon, manomètres numériques et transmetteurs de pression relative ou absolue (0 à 250 bar). Raccordement métrologique COFRAC.',
                'measurement_category' => 'Pression',
                'calibration_type' => 'Laboratoire & Sur site',
                'method' => 'Guide EURAMET cg-17 / NF EN 837-1',
                'required_info' => 'Étendue d\'échelle, classe de précision, type de raccord, fluide compatible.',
                'is_active' => true,
            ],
            [
                'name' => 'Étalonnage de Sonde de Température et Chaîne Thermométrique',
                'code' => 'CAL-TMP-002',
                'equipment_type' => 'Sonde PT100 / Thermocouple / Thermomètre',
                'description' => 'Étalonnage en comparaison dans bain thermostaté ou four d\'étalonnage sec de -40°C à +650°C. Analyse de dérive et incertitudes.',
                'measurement_category' => 'Température',
                'calibration_type' => 'Laboratoire',
                'method' => 'NF EN 60751 / ITS-90',
                'required_info' => 'Longueur de sonde, diamètre du plongeur, type d\'élément sensible (PT100, TC K/J/T).',
                'is_active' => true,
            ],
            [
                'name' => 'Étalonnage de Multimètre Numérique de Laboratoire',
                'code' => 'CAL-ELE-003',
                'equipment_type' => 'Multimètre numérique 5.5 à 8.5 digits',
                'description' => 'Vérification métrologique et étalonnage des fonctions Tension continue/alternative (DCV/ACV), Courant (DCI/ACI) et Résistance (Ohmmètre).',
                'measurement_category' => 'Électricité',
                'calibration_type' => 'Laboratoire',
                'method' => 'Guide EURAMET cg-15',
                'required_info' => 'Modèle exact, connectique arrière/avant, options installées.',
                'is_active' => true,
            ],
            [
                'name' => 'Étalonnage d\'Instruments Dimensionnels (Pied à coulisse, Micromètre)',
                'code' => 'CAL-DIM-004',
                'equipment_type' => 'Pied à coulisse / Micromètre / Comparateur',
                'description' => 'Contrôle métrologique à l\'aide de cales étalons classe 0 pour étendue 0-500mm. Mesure de parallélisme, planéité et justesse.',
                'measurement_category' => 'Dimensionnel',
                'calibration_type' => 'Laboratoire & Sur site',
                'method' => 'ISO 13385-1 / ISO 3611',
                'required_info' => 'Capacité max, résolution d\'affichage (vernier ou digital).',
                'is_active' => true,
            ],
            [
                'name' => 'Étalonnage et Vérification d\'Instrument de Pesage (IPFNA)',
                'code' => 'CAL-PES-005',
                'equipment_type' => 'Balance d\'analyse / Balance industrielle',
                'description' => 'Vérification et étalonnage des balances non automatiques de 1mg à 1500kg. Essais d\'excentration, de justesse et de répétabilité.',
                'measurement_category' => 'Masse & Pesage',
                'calibration_type' => 'Sur site',
                'method' => 'EURAMET Calibration Guide No. 18 / NF EN 45501',
                'required_info' => 'Portée Max, échelon de vérification e, emplacement géographique de la balance.',
                'is_active' => true,
            ],
            [
                'name' => 'Étalonnage d\'Outils Dynamométriques (Clé dynamométrique)',
                'code' => 'CAL-TOR-006',
                'equipment_type' => 'Clé dynamométrique à déclenchement ou lecture directe',
                'description' => 'Étalonnage sur banc de couple de précision de 1 N.m à 1000 N.m selon la norme ISO 6789. Sens horaire et anti-horaire.',
                'measurement_category' => 'Couple & Force',
                'calibration_type' => 'Laboratoire',
                'method' => 'ISO 6789-2:2017',
                'required_info' => 'Capacité min/max, type de carré d\'entraînement, sens d\'utilisation.',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            CalibrationService::firstOrCreate(['code' => $service['code']], $service);
        }
    }
}
