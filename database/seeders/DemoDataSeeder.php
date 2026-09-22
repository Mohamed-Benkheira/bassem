<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\CalibrationCertificate;
use App\Models\CalibrationOperation;
use App\Models\CalibrationReport;
use App\Models\CalibrationRequest;
use App\Models\CalibrationRequestItem;
use App\Models\CalibrationService;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Document;
use App\Models\Quotation;
use App\Models\RequestStatusHistory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $client = Client::first();
        if (! $client) {
            return;
        }

        $admin = User::where('email', 'admin@calibration.test')->first();
        $manager = User::where('email', 'manager@calibration.test')->first();
        $technician = User::where('email', 'metrologie@calibration.test')->first();
        $commercial = User::where('email', 'commercial@calibration.test')->first();
        $clientUser = User::where('email', 'client@client-industriel.test')->first();

        $servicePressure = CalibrationService::where('code', 'CAL-PRS-001')->first();
        $serviceTemp = CalibrationService::where('code', 'CAL-TMP-002')->first();
        $serviceElec = CalibrationService::where('code', 'CAL-ELE-003')->first();
        $serviceDim = CalibrationService::where('code', 'CAL-DIM-004')->first();

        // Ensure directories exist
        Storage::disk('local')->makeDirectory('contracts');
        Storage::disk('local')->makeDirectory('reports');
        Storage::disk('local')->makeDirectory('certificates');
        Storage::disk('local')->makeDirectory('quotations');

        // Create sample dummy PDF files
        $contractFilePath = 'contracts/contrat_cadre_2026.pdf';
        Storage::disk('local')->put($contractFilePath, "%PDF-1.4\n%Demo Contract Document\n%%EOF");

        $reportFilePath = 'reports/rapport_cal_001.pdf';
        Storage::disk('local')->put($reportFilePath, "%PDF-1.4\n%Demo Calibration Report Data\n%%EOF");

        $certFilePath = 'certificates/certificat_cal_001.pdf';
        Storage::disk('local')->put($certFilePath, "%PDF-1.4\n%Demo Calibration Certificate Document\n%%EOF");

        // 1. Contract
        $contract = Contract::firstOrCreate(
            ['contract_number' => 'CTR-2026-0001'],
            [
                'client_id' => $client->id,
                'start_date' => now()->startOfYear()->toDateString(),
                'end_date' => now()->endOfYear()->toDateString(),
                'status' => 'ACTIVE',
                'document_path' => $contractFilePath,
                'document_name' => 'Contrat_Cadre_Etalonnage_2026.pdf',
                'notes' => 'Contrat cadre d\'étalonnage et vérification annuel avec tarification préférentielle.',
                'uploaded_by_id' => $commercial?->id,
            ]
        );

        // Document for contract
        Document::firstOrCreate(
            ['file_path' => $contractFilePath],
            [
                'document_type' => Document::TYPE_CONTRACT,
                'file_name' => 'Contrat_Cadre_Etalonnage_2026.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 1024,
                'uploaded_by_id' => $commercial?->id,
                'uploaded_at' => now()->subMonths(2),
                'documentable_type' => Contract::class,
                'documentable_id' => $contract->id,
                'status' => 'ACTIVE',
            ]
        );

        // 2. Completed Request REQ-2026-0001
        $req1 = CalibrationRequest::firstOrCreate(
            ['request_number' => 'REQ-2026-0001'],
            [
                'client_id' => $client->id,
                'status' => CalibrationRequest::STATUS_COMPLETED,
                'preferred_date' => now()->subDays(20)->toDateString(),
                'preferred_location' => 'laboratory',
                'scheduled_date' => now()->subDays(15)->toDateString(),
                'scheduled_location' => 'laboratory',
                'contract_id' => $contract->id,
                'client_notes' => 'Étalonnage prioritaire pour audit qualité ISO 9001.',
                'created_by_id' => $clientUser?->id,
                'created_at' => now()->subDays(25),
            ]
        );

        // Request Item 1: Manometer
        $item1 = CalibrationRequestItem::firstOrCreate(
            [
                'calibration_request_id' => $req1->id,
                'equipment_name' => 'Manomètre WIKA 0-100 bar',
            ],
            [
                'calibration_service_id' => $servicePressure?->id,
                'serial_number' => 'WK-785412',
                'brand' => 'WIKA',
                'model' => '232.50',
                'measurement_range' => '0 à 100 bar',
                'tolerance' => 'Classe 1.0',
                'quantity' => 1,
                'status' => 'COMPLETED',
                'created_at' => now()->subDays(25),
            ]
        );

        // Operation 1
        $op1 = CalibrationOperation::firstOrCreate(
            ['operation_number' => 'OP-2026-0001'],
            [
                'calibration_request_id' => $req1->id,
                'calibration_request_item_id' => $item1->id,
                'client_id' => $client->id,
                'technician_id' => $technician?->id,
                'supervisor_id' => $manager?->id,
                'scheduled_date' => now()->subDays(15)->toDateString(),
                'actual_date' => now()->subDays(14)->toDateString(),
                'location' => 'laboratory',
                'status' => CalibrationOperation::STATUS_COMPLETED,
                'notes' => 'Points d\'étalonnage testés : 0, 20, 40, 60, 80, 100 bar en montée et descente.',
                'created_at' => now()->subDays(20),
            ]
        );

        // Report 1
        $rep1 = CalibrationReport::firstOrCreate(
            ['report_number' => 'RAP-2026-0001'],
            [
                'calibration_operation_id' => $op1->id,
                'calibration_request_id' => $req1->id,
                'calibration_request_item_id' => $item1->id,
                'uploaded_by_id' => $technician?->id,
                'file_name' => 'Rapport_Technique_WK785412.pdf',
                'file_path' => $reportFilePath,
                'file_size' => 1024,
                'mime_type' => 'application/pdf',
                'status' => CalibrationReport::STATUS_APPROVED,
                'review_notes' => 'Rapport conforme aux exigences normatives. Écarts tolérables respectés.',
                'reviewed_by_id' => $manager?->id,
                'reviewed_at' => now()->subDays(13),
                'created_at' => now()->subDays(14),
            ]
        );

        // Certificate 1 (Validated & Final)
        $cert1 = CalibrationCertificate::firstOrCreate(
            ['certificate_number' => 'CERT-2026-000001'],
            [
                'calibration_operation_id' => $op1->id,
                'calibration_request_id' => $req1->id,
                'calibration_request_item_id' => $item1->id,
                'client_id' => $client->id,
                'calibration_report_id' => $rep1->id,
                'generated_by_id' => $manager?->id,
                'file_name' => 'Certificat_Calibration_CERT-2026-000001.pdf',
                'file_path' => $certFilePath,
                'file_size' => 1024,
                'mime_type' => 'application/pdf',
                'status' => CalibrationCertificate::STATUS_VALIDATED,
                'validated_by_id' => $manager?->id,
                'validated_at' => now()->subDays(12),
                'is_final' => true,
                'created_at' => now()->subDays(12),
            ]
        );

        // Document for Certificate 1
        Document::firstOrCreate(
            ['file_path' => $certFilePath],
            [
                'document_type' => Document::TYPE_CERTIFICATE,
                'file_name' => 'Certificat_Calibration_CERT-2026-000001.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 1024,
                'uploaded_by_id' => $manager?->id,
                'uploaded_at' => now()->subDays(12),
                'documentable_type' => CalibrationCertificate::class,
                'documentable_id' => $cert1->id,
                'status' => 'ACTIVE',
            ]
        );

        // Request 1 status histories
        if ($req1->statusHistories()->count() === 0) {
            RequestStatusHistory::create([
                'calibration_request_id' => $req1->id,
                'from_status' => null,
                'to_status' => CalibrationRequest::STATUS_SUBMITTED,
                'changed_by_id' => $clientUser?->id,
                'comment' => 'Création de la demande par le client',
                'created_at' => now()->subDays(25),
            ]);
            RequestStatusHistory::create([
                'calibration_request_id' => $req1->id,
                'from_status' => CalibrationRequest::STATUS_SUBMITTED,
                'to_status' => CalibrationRequest::STATUS_SENT_TO_METROLOGY,
                'changed_by_id' => $commercial?->id,
                'comment' => 'Transmise à la métrologie',
                'created_at' => now()->subDays(24),
            ]);
            RequestStatusHistory::create([
                'calibration_request_id' => $req1->id,
                'from_status' => CalibrationRequest::STATUS_SENT_TO_METROLOGY,
                'to_status' => CalibrationRequest::STATUS_ACCEPTED,
                'changed_by_id' => $clientUser?->id,
                'comment' => 'Date acceptée',
                'created_at' => now()->subDays(22),
            ]);
            RequestStatusHistory::create([
                'calibration_request_id' => $req1->id,
                'from_status' => CalibrationRequest::STATUS_ACCEPTED,
                'to_status' => CalibrationRequest::STATUS_COMPLETED,
                'changed_by_id' => $manager?->id,
                'comment' => 'Calibration achevée et certificat validé',
                'created_at' => now()->subDays(12),
            ]);
        }

        // 3. Request 2: IN_CALIBRATION
        $req2 = CalibrationRequest::firstOrCreate(
            ['request_number' => 'REQ-2026-0002'],
            [
                'client_id' => $client->id,
                'status' => CalibrationRequest::STATUS_IN_CALIBRATION,
                'preferred_date' => now()->subDays(5)->toDateString(),
                'preferred_location' => 'laboratory',
                'scheduled_date' => now()->toDateString(),
                'scheduled_location' => 'laboratory',
                'contract_id' => $contract->id,
                'client_notes' => 'Multimètre de précision du laboratoire de contrôle.',
                'created_by_id' => $clientUser?->id,
                'created_at' => now()->subDays(10),
            ]
        );

        $item2 = CalibrationRequestItem::firstOrCreate(
            [
                'calibration_request_id' => $req2->id,
                'equipment_name' => 'Multimètre Numérique Keysight 34461A',
            ],
            [
                'calibration_service_id' => $serviceElec?->id,
                'serial_number' => 'MY53214589',
                'brand' => 'Keysight Technologies',
                'model' => '34461A 6½ Digits',
                'measurement_range' => 'DCV 100mV à 1000V, ACV 100mV à 750V',
                'quantity' => 1,
                'status' => 'IN_CALIBRATION',
                'created_at' => now()->subDays(10),
            ]
        );

        CalibrationOperation::firstOrCreate(
            ['operation_number' => 'OP-2026-0002'],
            [
                'calibration_request_id' => $req2->id,
                'calibration_request_item_id' => $item2->id,
                'client_id' => $client->id,
                'technician_id' => $technician?->id,
                'supervisor_id' => $manager?->id,
                'scheduled_date' => now()->toDateString(),
                'actual_date' => now()->toDateString(),
                'location' => 'laboratory',
                'status' => CalibrationOperation::STATUS_IN_PROGRESS,
                'notes' => 'Vérification en cours sur calibrateur multifonction ET-ELE-003.',
                'created_at' => now()->subDays(5),
            ]
        );

        // 4. Request 3: DATE_PROPOSED (Waiting client confirmation)
        $req3 = CalibrationRequest::firstOrCreate(
            ['request_number' => 'REQ-2026-0003'],
            [
                'client_id' => $client->id,
                'status' => CalibrationRequest::STATUS_DATE_PROPOSED,
                'preferred_date' => now()->addDays(5)->toDateString(),
                'preferred_location' => 'client_site',
                'proposed_date' => now()->addDays(7)->toDateString(),
                'proposed_location' => 'client_site',
                'client_notes' => 'Étalonnage de pied à coulisse et micromètres sur notre site de Lille.',
                'created_by_id' => $clientUser?->id,
                'created_at' => now()->subDays(3),
            ]
        );

        CalibrationRequestItem::firstOrCreate(
            [
                'calibration_request_id' => $req3->id,
                'equipment_name' => 'Pied à coulisse d\'atelier Mitutoyo 0-200mm',
            ],
            [
                'calibration_service_id' => $serviceDim?->id,
                'serial_number' => 'MIT-500-196-30',
                'brand' => 'Mitutoyo',
                'model' => 'AOS Absolute Digimatic',
                'measurement_range' => '0-200 mm / 0.01 mm',
                'quantity' => 2,
                'status' => 'PENDING',
                'created_at' => now()->subDays(3),
            ]
        );

        // 5. Request 4: SUBMITTED (Incoming client request)
        $req4 = CalibrationRequest::firstOrCreate(
            ['request_number' => 'REQ-2026-0004'],
            [
                'client_id' => $client->id,
                'status' => CalibrationRequest::STATUS_SUBMITTED,
                'preferred_date' => now()->addDays(14)->toDateString(),
                'preferred_location' => 'laboratory',
                'client_notes' => 'Sonde de température à étalonner avant mise en service chaîne de froid.',
                'created_by_id' => $clientUser?->id,
                'created_at' => now()->subHours(4),
            ]
        );

        CalibrationRequestItem::firstOrCreate(
            [
                'calibration_request_id' => $req4->id,
                'equipment_name' => 'Sonde PT100 4 fils avec transmetteur 4-20mA',
            ],
            [
                'calibration_service_id' => $serviceTemp?->id,
                'serial_number' => 'PT-4F-9821',
                'brand' => 'Endress+Hauser',
                'model' => 'iTHERM TM411',
                'measurement_range' => '-20°C à +150°C',
                'quantity' => 1,
                'status' => 'PENDING',
                'created_at' => now()->subHours(4),
            ]
        );

        // Sample Quotation
        Quotation::firstOrCreate(
            ['quotation_number' => 'DEV-2026-0001'],
            [
                'client_id' => $client->id,
                'calibration_request_id' => $req3->id,
                'amount' => 850.00,
                'currency' => 'EUR',
                'status' => 'SENT',
                'validity_date' => now()->addDays(30)->toDateString(),
                'notes' => 'Devis d\'intervention métrologique sur site client avec déplacement inclus.',
                'created_by_id' => $commercial?->id,
            ]
        );

        // Initial Audit Logs
        AuditLog::record(
            action: 'Initialisation de l\'environnement de démonstration',
            entityType: 'System',
            entityId: null,
            oldValues: null,
            newValues: ['seeder' => 'DemoDataSeeder']
        );
    }
}
