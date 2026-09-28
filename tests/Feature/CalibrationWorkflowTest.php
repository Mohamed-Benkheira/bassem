<?php

use App\Models\CalibrationCertificate;
use App\Models\CalibrationOperation;
use App\Models\CalibrationReport;
use App\Models\CalibrationRequest;
use App\Models\CalibrationService;
use App\Models\Client;
use App\Models\Contract;
use App\Models\MetrologyMaterial;
use App\Models\User;
use App\Services\WorkflowService;
use Database\Seeders\CalibrationCatalogSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(CalibrationCatalogSeeder::class);
    Storage::fake('local');

    // Create client user and client entity
    $this->clientUser = User::factory()->create([
        'name' => 'Jean Dupont',
        'email' => 'client@acme.fr',
        'is_active' => true,
    ]);
    $this->clientUser->assignRole('client');

    $this->client = Client::create([
        'user_id' => $this->clientUser->id,
        'company_name' => 'Acme Industries SAS',
        'contact_name' => 'Jean Dupont',
        'email' => 'client@acme.fr',
        'phone' => '+33 1 23 45 67 89',
        'address' => '10 Rue de l\'Industrie',
        'city' => 'Paris',
        'postal_code' => '75001',
    ]);

    // Create commercial user
    $this->commercialUser = User::factory()->create([
        'name' => 'Pierre Commercial',
        'email' => 'commercial@metrolab.fr',
        'is_active' => true,
    ]);
    $this->commercialUser->assignRole('commercial');

    // Create metrology technician user
    $this->metrologyUser = User::factory()->create([
        'name' => 'Lucie Technicienne',
        'email' => 'metrologie@metrolab.fr',
        'is_active' => true,
    ]);
    $this->metrologyUser->assignRole('metrology');

    // Create delegated metrology technician user (absence fallback)
    $this->delegatedMetrologyUser = User::factory()->create([
        'name' => 'Adjoint Metrologie',
        'email' => 'adjoint@metrolab.fr',
        'is_active' => true,
        'is_delegated_manager' => true,
    ]);
    $this->delegatedMetrologyUser->assignRole('metrology');

    // Create manager user
    $this->managerUser = User::factory()->create([
        'name' => 'Marc Responsable',
        'email' => 'manager@metrolab.fr',
        'is_active' => true,
    ]);
    $this->managerUser->assignRole('manager');

    // Create second client for tenant isolation tests
    $this->clientUser2 = User::factory()->create([
        'name' => 'Autre Client',
        'email' => 'autre@autrecorp.fr',
        'is_active' => true,
    ]);
    $this->clientUser2->assignRole('client');

    $this->client2 = Client::create([
        'user_id' => $this->clientUser2->id,
        'company_name' => 'Autre Corporation SARL',
        'contact_name' => 'Autre Client',
        'email' => 'autre@autrecorp.fr',
    ]);
});

test('it allows a client to submit a multi-item calibration request', function () {
    $service1 = CalibrationService::first();
    $service2 = CalibrationService::skip(1)->first();

    $payload = [
        'preferred_date' => now()->addDays(7)->format('Y-m-d'),
        'preferred_location' => 'laboratory',
        'client_notes' => 'Équipements critiques de production ligne A',
        'items' => [
            [
                'calibration_service_id' => $service1->id,
                'equipment_name' => 'Manomètre numérique Wika',
                'serial_number' => 'MN-2026-001',
                'brand' => 'Wika',
                'model' => 'CPG1500',
                'measurement_range' => '0 - 100 bar',
                'tolerance' => '±0.05% FS',
                'quantity' => 1,
                'specific_notes' => 'Calibration 5 points montants et descendants',
            ],
            [
                'calibration_service_id' => $service2->id,
                'equipment_name' => 'Sonde de température PT100',
                'serial_number' => 'PT-2026-009',
                'brand' => 'Fluke',
                'model' => '5615',
                'measurement_range' => '-50°C à +250°C',
                'tolerance' => '±0.02°C',
                'quantity' => 1,
                'specific_notes' => 'Contrôle à 0°C, 50°C et 100°C',
            ],
        ],
    ];

    $response = $this->actingAs($this->clientUser)->post(route('client.requests.store'), $payload);

    $response->assertRedirect();

    $this->assertDatabaseHas('calibration_requests', [
        'client_id' => $this->client->id,
        'status' => CalibrationRequest::STATUS_SUBMITTED,
        'preferred_location' => 'laboratory',
    ]);

    $this->assertDatabaseCount('calibration_request_items', 2);
    $this->assertDatabaseHas('calibration_request_items', [
        'serial_number' => 'MN-2026-001',
        'equipment_name' => 'Manomètre numérique Wika',
    ]);

    // Check status history was logged
    $this->assertDatabaseHas('request_status_histories', [
        'to_status' => CalibrationRequest::STATUS_SUBMITTED,
        'changed_by_id' => $this->clientUser->id,
    ]);

    // Check notification for commercial
    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->commercialUser->id,
    ]);
});

test('it rejects client request with duplicate serial numbers across items', function () {
    $service = CalibrationService::first();

    $payload = [
        'preferred_location' => 'both',
        'items' => [
            [
                'calibration_service_id' => $service->id,
                'equipment_name' => 'Manomètre A',
                'serial_number' => 'SN-DUPLICATE-100',
                'quantity' => 1,
            ],
            [
                'calibration_service_id' => $service->id,
                'equipment_name' => 'Manomètre B',
                'serial_number' => 'sn-duplicate-100', // case insensitive duplicate
                'quantity' => 1,
            ],
        ],
    ];

    $response = $this->actingAs($this->clientUser)->post(route('client.requests.store'), $payload);

    $response->assertSessionHasErrors(['items.1.serial_number']);
    $this->assertDatabaseCount('calibration_requests', 0);
});

test('it rejects equipment item with unique serial number and quantity greater than 1', function () {
    $service = CalibrationService::first();

    $payload = [
        'preferred_location' => 'laboratory',
        'items' => [
            [
                'calibration_service_id' => $service->id,
                'equipment_name' => 'Thermomètre',
                'serial_number' => 'TH-9988',
                'quantity' => 3,
            ],
        ],
    ];

    $response = $this->actingAs($this->clientUser)->post(route('client.requests.store'), $payload);

    $response->assertSessionHasErrors(['items.0.quantity']);
    $this->assertDatabaseCount('calibration_requests', 0);
});

test('it automatically sets quantity to 1 when client submits request without quantity', function () {
    $service = CalibrationService::first();

    $payload = [
        'preferred_location' => 'laboratory',
        'items' => [
            [
                'calibration_service_id' => $service->id,
                'equipment_name' => 'Thermomètre sans quantité',
                'serial_number' => 'TH-NOQTY-01',
            ],
        ],
    ];

    $response = $this->actingAs($this->clientUser)->post(route('client.requests.store'), $payload);

    $response->assertRedirect();
    $this->assertDatabaseHas('calibration_request_items', [
        'equipment_name' => 'Thermomètre sans quantité',
        'serial_number' => 'TH-NOQTY-01',
        'quantity' => 1,
    ]);
});

test('it accepts client request with preferred location set to both', function () {
    $service = CalibrationService::first();

    $payload = [
        'preferred_location' => 'both',
        'items' => [
            [
                'calibration_service_id' => $service->id,
                'equipment_name' => 'Capteur multi-sites',
                'serial_number' => 'CPT-BOTH-01',
                'quantity' => 1,
            ],
        ],
    ];

    $response = $this->actingAs($this->clientUser)->post(route('client.requests.store'), $payload);

    $response->assertRedirect();
    $this->assertDatabaseHas('calibration_requests', [
        'client_id' => $this->client->id,
        'preferred_location' => 'both',
    ]);
});

test('it allows commercial to view submitted request and forward it to metrology', function () {
    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST1',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_SUBMITTED,
        'preferred_location' => 'laboratory',
    ]);

    $response = $this->actingAs($this->commercialUser)
        ->post(route('commercial.requests.send-to-metrology', $calibrationRequest), [
            'internal_notes' => 'Client régulier, demande prioritaire.',
        ]);

    $response->assertRedirect();

    $calibrationRequest->refresh();
    expect($calibrationRequest->status)->toBe(CalibrationRequest::STATUS_SENT_TO_METROLOGY);

    $this->assertDatabaseHas('request_status_histories', [
        'calibration_request_id' => $calibrationRequest->id,
        'to_status' => CalibrationRequest::STATUS_SENT_TO_METROLOGY,
        'changed_by_id' => $this->commercialUser->id,
    ]);

    // Notification created for metrology
    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->metrologyUser->id,
    ]);
});

test('it prevents unauthorized users from forwarding request to metrology', function () {
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST2',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_SUBMITTED,
        'preferred_location' => 'laboratory',
    ]);

    // Client attempts to forward -> 403 Forbidden
    $response = $this->actingAs($this->clientUser)
        ->post(route('commercial.requests.send-to-metrology', $calibrationRequest));
    $response->assertForbidden();

    // Metrology technician attempts to forward -> 403 Forbidden
    $response = $this->actingAs($this->metrologyUser)
        ->post(route('commercial.requests.send-to-metrology', $calibrationRequest));
    $response->assertForbidden();
});

test('it allows metrology to propose an intervention date and location', function () {
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST3',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_SENT_TO_METROLOGY,
        'preferred_location' => 'laboratory',
    ]);

    $proposedDate = now()->addDays(5)->format('Y-m-d');

    $response = $this->actingAs($this->metrologyUser)
        ->post(route('metrology.scheduling.propose', $calibrationRequest), [
            'proposed_date' => $proposedDate,
            'proposed_location' => 'laboratory',
            'internal_notes' => 'Banc de mesure pression disponible le matin',
        ]);

    $response->assertRedirect();

    $calibrationRequest->refresh();
    expect($calibrationRequest->status)->toBe(CalibrationRequest::STATUS_DATE_PROPOSED);
    expect($calibrationRequest->proposed_date->format('Y-m-d'))->toBe($proposedDate);

    // Notification created for client
    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->clientUser->id,
    ]);
});

test('it allows client to accept proposed intervention date', function () {
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST4',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_DATE_PROPOSED,
        'proposed_date' => now()->addDays(5),
        'proposed_location' => 'laboratory',
    ]);

    $response = $this->actingAs($this->clientUser)
        ->post(route('client.requests.accept-date', $calibrationRequest));

    $response->assertRedirect();

    $calibrationRequest->refresh();
    expect($calibrationRequest->status)->toBe(CalibrationRequest::STATUS_ACCEPTED);
});

test('it allows client to cancel request with reason in cancellable status', function () {
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST5',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_DATE_PROPOSED,
        'proposed_date' => now()->addDays(5),
    ]);

    $response = $this->actingAs($this->clientUser)
        ->post(route('client.requests.cancel', $calibrationRequest), [
            'reason' => 'Arrêt machine annulé, équipement non disponible pour expédition.',
        ]);

    $response->assertRedirect();

    $calibrationRequest->refresh();
    expect($calibrationRequest->status)->toBe(CalibrationRequest::STATUS_CANCELLED);
    expect($calibrationRequest->cancellation_reason)->toContain('Arrêt machine annulé');
});

test('it blocks client from cancelling request when status is not cancellable', function () {
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST6',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_IN_CALIBRATION,
    ]);

    $response = $this->actingAs($this->clientUser)
        ->post(route('client.requests.cancel', $calibrationRequest), [
            'reason' => 'Tentative annulation en cours de manipulation.',
        ]);

    $response->assertForbidden();

    $calibrationRequest->refresh();
    expect($calibrationRequest->status)->toBe(CalibrationRequest::STATUS_IN_CALIBRATION);
});

test('it allows commercial to create contract and link it to request', function () {
    $contract = Contract::create([
        'contract_number' => 'CTR-2026-TEST',
        'client_id' => $this->client->id,
        'title' => 'Contrat de maintenance métrologique',
        'status' => 'ACTIVE',
        'start_date' => now()->subMonth(),
        'end_date' => now()->addYear(),
        'created_by_id' => $this->commercialUser->id,
    ]);

    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST7',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_ACCEPTED,
        'scheduled_date' => now()->addDays(3),
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Dynamomètre Sauter',
        'quantity' => 1,
    ]);

    $response = $this->actingAs($this->commercialUser)
        ->post(route('commercial.requests.contract', $calibrationRequest), [
            'contract_id' => $contract->id,
        ]);

    $response->assertRedirect();

    $calibrationRequest->refresh();
    expect($calibrationRequest->contract_id)->toBe($contract->id);
    expect($calibrationRequest->status)->toBe(CalibrationRequest::STATUS_SCHEDULED);

    // Verify operations were generated for items
    $this->assertDatabaseHas('calibration_operations', [
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'status' => CalibrationOperation::STATUS_SCHEDULED,
    ]);
});

test('it allows manager to assign a metrology technician to the operation', function () {
    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST8',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_SCHEDULED,
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Micromètre d\'extérieur',
        'quantity' => 1,
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-TEST8',
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'status' => CalibrationOperation::STATUS_SCHEDULED,
    ]);

    $response = $this->actingAs($this->managerUser)
        ->post(route('manager.assignments.assign', $operation), [
            'technician_id' => $this->metrologyUser->id,
            'scheduled_date' => now()->addDays(2)->format('Y-m-d'),
            'notes' => 'Attention à l\'étalonnage selon norme ISO 3611.',
        ]);

    $response->assertRedirect();

    $operation->refresh();
    expect($operation->status)->toBe(CalibrationOperation::STATUS_ASSIGNED);
    expect($operation->technician_id)->toBe($this->metrologyUser->id);

    // Notification generated for technician
    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->metrologyUser->id,
    ]);
});

test('it allows a manager to browse an operation from the manager namespace', function () {
    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST8B',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_SCHEDULED,
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Comparateur d\'étalons',
        'quantity' => 1,
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-TEST8B',
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'status' => CalibrationOperation::STATUS_SCHEDULED,
    ]);

    $this->actingAs($this->managerUser)
        ->get(route('manager.operations.index'))
        ->assertOk();

    $this->actingAs($this->managerUser)
        ->get(route('manager.operations.show', $operation))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('metrology/operations/show'));
});

test('it allows assigned technician to start calibration and upload report', function () {
    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST9',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_SCHEDULED,
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Balance d\'analyse Mettler',
        'quantity' => 1,
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-TEST9',
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'technician_id' => $this->metrologyUser->id,
        'status' => CalibrationOperation::STATUS_ASSIGNED,
    ]);

    // Technician starts operation
    $response = $this->actingAs($this->metrologyUser)
        ->post(route('metrology.operations.start', $operation));

    $response->assertRedirect();

    $operation->refresh();
    expect($operation->status)->toBe(CalibrationOperation::STATUS_IN_PROGRESS);

    // Technician uploads report
    $fakePdf = UploadedFile::fake()->create('rapport_balance.pdf', 300, 'application/pdf');

    $response = $this->actingAs($this->metrologyUser)
        ->post(route('metrology.operations.report', $operation), [
            'file' => $fakePdf,
            'notes' => 'Étalonnage effectué en salle climatisée à 20°C ± 1°C.',
        ]);

    $response->assertRedirect();

    $operation->refresh();
    expect($operation->status)->toBe(CalibrationOperation::STATUS_REPORT_UPLOADED);

    $this->assertDatabaseHas('calibration_reports', [
        'calibration_operation_id' => $operation->id,
        'status' => CalibrationReport::STATUS_PENDING_REVIEW,
        'uploaded_by_id' => $this->metrologyUser->id,
    ]);

    // Manager notified
    $this->assertDatabaseHas('notifications', [
        'notifiable_type' => User::class,
        'notifiable_id' => $this->managerUser->id,
    ]);
});

test('it allows manager to review and reject report with comments, then approve resubmission', function () {
    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST10',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_IN_CALIBRATION,
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Multimètre Fluke 87V',
        'quantity' => 1,
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-TEST10',
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'technician_id' => $this->metrologyUser->id,
        'status' => CalibrationOperation::STATUS_REPORT_UPLOADED,
    ]);

    $report = CalibrationReport::create([
        'report_number' => 'RAP-2026-TEST10',
        'calibration_operation_id' => $operation->id,
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'uploaded_by_id' => $this->metrologyUser->id,
        'status' => CalibrationReport::STATUS_PENDING_REVIEW,
        'file_name' => 'rapport_multimetre.pdf',
        'file_path' => 'reports/test.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
    ]);

    // Step 1: Manager Rejects report
    $response = $this->actingAs($this->managerUser)
        ->post(route('manager.reports.review', $report), [
            'decision' => 'REJECT',
            'review_notes' => 'Incertitude de mesure non conforme au tableau d\'accréditation.',
        ]);

    $response->assertRedirect();

    $report->refresh();
    $operation->refresh();
    expect($report->status)->toBe(CalibrationReport::STATUS_REJECTED);
    expect($report->review_notes)->toContain('Incertitude de mesure non conforme');
    expect($operation->status)->toBe(CalibrationOperation::STATUS_REPORT_REJECTED);

    // Step 2: Manager Approves report
    $response = $this->actingAs($this->managerUser)
        ->post(route('manager.reports.review', $report), [
            'decision' => 'APPROVE',
            'review_notes' => 'Corrections vérifiées, rapport conforme.',
        ]);

    $response->assertRedirect();

    $report->refresh();
    $operation->refresh();
    expect($report->status)->toBe(CalibrationReport::STATUS_APPROVED);
    expect($operation->status)->toBe(CalibrationOperation::STATUS_CERTIFICATE_GENERATED);
});

test('it allows manager to generate certificate draft and validate it to make it final', function () {
    $contract = Contract::create([
        'contract_number' => 'CTR-2026-CERT',
        'client_id' => $this->client->id,
        'title' => 'Contrat annuel étalonnage',
        'status' => 'ACTIVE',
        'start_date' => now()->subMonth(),
        'end_date' => now()->addYear(),
        'created_by_id' => $this->commercialUser->id,
    ]);

    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST11',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'contract_id' => $contract->id,
        'status' => CalibrationRequest::STATUS_IN_CALIBRATION,
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Chronomètre numérique',
        'quantity' => 1,
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-TEST11',
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'technician_id' => $this->metrologyUser->id,
        'status' => CalibrationOperation::STATUS_CERTIFICATE_GENERATED,
    ]);

    // Generate certificate
    $fakePdf = UploadedFile::fake()->create('certificat_chrono.pdf', 400, 'application/pdf');

    $response = $this->actingAs($this->managerUser)
        ->post(route('manager.certificates.generate', $operation), [
            'file' => $fakePdf,
        ]);

    $response->assertRedirect();

    $certificate = CalibrationCertificate::where('calibration_operation_id', $operation->id)->first();
    expect($certificate)->not->toBeNull();
    expect($certificate->status)->toBe(CalibrationCertificate::STATUS_DRAFT);
    expect($certificate->is_final)->toBeFalse();

    // Validate certificate
    $response = $this->actingAs($this->managerUser)
        ->post(route('manager.certificates.validate', $certificate));

    $response->assertRedirect();

    $certificate->refresh();
    $operation->refresh();
    $calibrationRequest->refresh();

    expect($certificate->status)->toBe(CalibrationCertificate::STATUS_VALIDATED);
    expect($certificate->is_final)->toBeTrue();
    expect($certificate->validated_at)->not->toBeNull();
    expect($certificate->validated_by_id)->toBe($this->managerUser->id);

    // Operation and Request are marked completed
    expect($operation->status)->toBe(CalibrationOperation::STATUS_COMPLETED);
    expect($calibrationRequest->status)->toBe(CalibrationRequest::STATUS_COMPLETED);
});

test('manager cannot generate certificate without contract', function () {
    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-NOCONTRACT',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_IN_CALIBRATION,
        'contract_id' => null, // explicitly no contract
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Balance de précision',
        'quantity' => 1,
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-NOCONTRACT',
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'technician_id' => $this->metrologyUser->id,
        'status' => CalibrationOperation::STATUS_CERTIFICATE_GENERATED,
    ]);

    $fakePdf = UploadedFile::fake()->create('certificat_balance.pdf', 400, 'application/pdf');

    $response = $this->actingAs($this->managerUser)
        ->post(route('manager.certificates.generate', $operation), [
            'file' => $fakePdf,
        ]);

    $response->assertSessionHasErrors(['contract']);
    $certificate = CalibrationCertificate::where('calibration_operation_id', $operation->id)->first();
    expect($certificate)->toBeNull();
});

test('it enforces certificate immutability once validated', function () {
    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST12',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_COMPLETED,
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Clé dynamométrique',
        'quantity' => 1,
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-TEST12',
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'status' => CalibrationOperation::STATUS_COMPLETED,
    ]);

    $certificate = CalibrationCertificate::create([
        'certificate_number' => 'CERT-2026-IMMUTABLE',
        'calibration_operation_id' => $operation->id,
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'generated_by_id' => $this->managerUser->id,
        'validated_by_id' => $this->managerUser->id,
        'validated_at' => now(),
        'status' => CalibrationCertificate::STATUS_VALIDATED,
        'is_final' => true,
        'file_name' => 'certificat_cle.pdf',
        'file_path' => 'certificates/certificat_cle.pdf',
        'file_size' => 2048,
        'mime_type' => 'application/pdf',
    ]);

    // Manager cannot validate an already final certificate
    expect($this->managerUser->can('validate', $certificate))->toBeFalse();

    // Re-validation in WorkflowService throws ValidationException
    expect(function () use ($certificate) {
        app(WorkflowService::class)->validateCertificate($certificate, $this->managerUser);
    })->toThrow(ValidationException::class);
});

test('it allows delegated metrology technician to validate certificate during manager absence', function () {
    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST13',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_IN_CALIBRATION,
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Capteur de pression',
        'quantity' => 1,
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-TEST13',
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'status' => CalibrationOperation::STATUS_CERTIFICATE_GENERATED,
    ]);

    $certificate = CalibrationCertificate::create([
        'certificate_number' => 'CERT-2026-DELEGATED',
        'calibration_operation_id' => $operation->id,
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'generated_by_id' => $this->delegatedMetrologyUser->id,
        'status' => CalibrationCertificate::STATUS_DRAFT,
        'is_final' => false,
        'file_name' => 'certificat_capteur.pdf',
        'file_path' => 'certificates/certificat_capteur.pdf',
        'file_size' => 2048,
        'mime_type' => 'application/pdf',
    ]);

    // Regular technician without delegation cannot validate
    expect($this->metrologyUser->canPerformManagerAction())->toBeFalse();

    // Delegated technician can perform manager action
    expect($this->delegatedMetrologyUser->canPerformManagerAction())->toBeTrue();

    // Delegated technician validates certificate
    $response = $this->actingAs($this->delegatedMetrologyUser)
        ->post(route('manager.certificates.validate', $certificate));

    $response->assertRedirect();

    $certificate->refresh();
    expect($certificate->is_final)->toBeTrue();
    expect($certificate->validated_by_id)->toBe($this->delegatedMetrologyUser->id);
});

test('it prevents client A from downloading client B certificate', function () {
    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST14',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_COMPLETED,
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Calibre à coulisse',
        'quantity' => 1,
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-TEST14',
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'status' => CalibrationOperation::STATUS_COMPLETED,
    ]);

    Storage::disk('local')->put('certificates/test14.pdf', '%PDF-1.4 test certificate');

    $certificate = CalibrationCertificate::create([
        'certificate_number' => 'CERT-2026-ISO-14',
        'calibration_operation_id' => $operation->id,
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'generated_by_id' => $this->managerUser->id,
        'validated_by_id' => $this->managerUser->id,
        'validated_at' => now(),
        'status' => CalibrationCertificate::STATUS_VALIDATED,
        'is_final' => true,
        'file_name' => 'certificat_calibre.pdf',
        'file_path' => 'certificates/test14.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
    ]);

    // Client 1 (owner) can download
    $responseOwner = $this->actingAs($this->clientUser)
        ->get(route('certificates.download', $certificate));
    $responseOwner->assertOk();

    // Client 2 (different company) receives 403 Forbidden
    $responseOther = $this->actingAs($this->clientUser2)
        ->get(route('certificates.download', $certificate));
    $responseOther->assertForbidden();
});

test('it prevents client from downloading unvalidated draft certificate', function () {
    $service = CalibrationService::first();
    $calibrationRequest = CalibrationRequest::create([
        'request_number' => 'DEM-2026-TEST15',
        'client_id' => $this->client->id,
        'created_by_id' => $this->clientUser->id,
        'status' => CalibrationRequest::STATUS_IN_CALIBRATION,
    ]);

    $item = $calibrationRequest->items()->create([
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Générateur de signaux',
        'quantity' => 1,
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-TEST15',
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'status' => CalibrationOperation::STATUS_CERTIFICATE_GENERATED,
    ]);

    Storage::disk('local')->put('certificates/test15.pdf', '%PDF-1.4 draft certificate');

    $certificate = CalibrationCertificate::create([
        'certificate_number' => 'CERT-2026-DRAFT',
        'calibration_operation_id' => $operation->id,
        'calibration_request_id' => $calibrationRequest->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $this->client->id,
        'generated_by_id' => $this->managerUser->id,
        'status' => CalibrationCertificate::STATUS_DRAFT,
        'is_final' => false,
        'file_name' => 'certificat_draft.pdf',
        'file_path' => 'certificates/test15.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
    ]);

    // Client tries to download draft certificate -> Forbidden (Section 27)
    $response = $this->actingAs($this->clientUser)
        ->get(route('certificates.download', $certificate));
    $response->assertForbidden();
});

test('it tracks expired metrology materials and prevents uncertified usage', function () {
    $expiredMaterial = MetrologyMaterial::create([
        'name' => 'Masse étalon 1kg Classe E2',
        'reference_code' => 'ETALON-MASS-01',
        'serial_number' => 'SN-MASSE-001',
        'category' => 'Pesage',
        'calibration_date' => now()->subYears(2),
        'expiration_date' => now()->subDay(),
        'status' => MetrologyMaterial::STATUS_EXPIRED,
    ]);

    $validMaterial = MetrologyMaterial::create([
        'name' => 'Manomètre de référence Druck DPI 142',
        'reference_code' => 'ETALON-PRES-02',
        'serial_number' => 'SN-PRES-002',
        'category' => 'Pression',
        'calibration_date' => now()->subMonths(3),
        'expiration_date' => now()->addMonths(9),
        'status' => MetrologyMaterial::STATUS_VALID,
    ]);

    expect($expiredMaterial->status)->toBe(MetrologyMaterial::STATUS_EXPIRED);
    expect($validMaterial->status)->toBe(MetrologyMaterial::STATUS_VALID);

    $expiredList = MetrologyMaterial::where('status', MetrologyMaterial::STATUS_EXPIRED)->get();
    expect($expiredList->pluck('reference_code')->contains('ETALON-MASS-01'))->toBeTrue();
});
