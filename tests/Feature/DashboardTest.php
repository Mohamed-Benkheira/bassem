<?php

use App\Models\CalibrationOperation;
use App\Models\CalibrationRequest;
use App\Models\CalibrationRequestItem;
use App\Models\CalibrationService;
use App\Models\Client;
use App\Models\User;
use Database\Seeders\CalibrationCatalogSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users are redirected to their appropriate dashboard based on role', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('profile.edit'));
});

test('metrology dashboard displays upcoming assigned operations and stats', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(CalibrationCatalogSeeder::class);

    $tech = User::factory()->create(['name' => 'Tech Metrology']);
    $tech->assignRole('metrology');

    $clientUser = User::factory()->create();
    $clientUser->assignRole('client');
    $client = Client::create([
        'user_id' => $clientUser->id,
        'company_name' => 'Test Corp',
        'contact_name' => 'Contact Test',
        'email' => 'client@test.com',
    ]);

    $service = CalibrationService::first();
    $request = CalibrationRequest::create([
        'request_number' => 'CR-2026-TEST1',
        'client_id' => $client->id,
        'status' => CalibrationRequest::STATUS_ASSIGNED,
        'preferred_location' => 'laboratory',
    ]);

    $item = CalibrationRequestItem::create([
        'calibration_request_id' => $request->id,
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Precision Caliper',
        'quantity' => 1,
        'status' => 'PENDING',
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-TEST1',
        'calibration_request_id' => $request->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $client->id,
        'technician_id' => $tech->id,
        'status' => CalibrationOperation::STATUS_ASSIGNED,
        'location' => 'laboratory',
    ]);

    $response = $this->actingAs($tech)->get('/metrology/dashboard');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('metrology/dashboard')
        ->where('stats.upcoming', 1)
        ->where('stats.my_calibrations', 1)
        ->has('assignedOperations', 1)
        ->where('assignedOperations.0.id', $operation->id)
    );
});

test('manager dashboard displays unassigned operations and recent assignments', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(CalibrationCatalogSeeder::class);

    $manager = User::factory()->create(['name' => 'Manager User']);
    $manager->assignRole('manager');

    $clientUser = User::factory()->create();
    $clientUser->assignRole('client');
    $client = Client::create([
        'user_id' => $clientUser->id,
        'company_name' => 'Unassigned Corp',
        'contact_name' => 'Contact Test',
        'email' => 'unassigned@test.com',
    ]);

    $service = CalibrationService::first();
    $request = CalibrationRequest::create([
        'request_number' => 'CR-2026-MGR1',
        'client_id' => $client->id,
        'status' => CalibrationRequest::STATUS_SCHEDULED,
        'preferred_location' => 'laboratory',
    ]);

    $item = CalibrationRequestItem::create([
        'calibration_request_id' => $request->id,
        'calibration_service_id' => $service->id,
        'equipment_name' => 'Unassigned Balance',
        'quantity' => 1,
        'status' => 'PENDING',
    ]);

    $operation = CalibrationOperation::create([
        'operation_number' => 'OP-2026-MGR1',
        'calibration_request_id' => $request->id,
        'calibration_request_item_id' => $item->id,
        'client_id' => $client->id,
        'technician_id' => null,
        'status' => CalibrationOperation::STATUS_SCHEDULED,
        'location' => 'laboratory',
    ]);

    $response = $this->actingAs($manager)->get('/manager/dashboard');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('manager/dashboard')
        ->where('stats.unassigned_operations', 1)
        ->has('unassignedOperations', 1)
        ->where('unassignedOperations.0.id', $operation->id)
    );

    // Test assignment search by request number
    $assignSearch = $this->actingAs($manager)->get('/manager/assignments?search=CR-2026-MGR1');
    $assignSearch->assertOk();
    $assignSearch->assertInertia(fn ($page) => $page
        ->component('manager/assignments/index')
        ->has('operations.data', 1)
        ->where('operations.data.0.id', $operation->id)
    );
});
