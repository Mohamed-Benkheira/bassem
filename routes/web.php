<?php

use App\Http\Controllers\Admin\AdminArchiveController;
use App\Http\Controllers\Admin\AdminAuditLogController;
use App\Http\Controllers\Admin\AdminServiceController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Client\ClientCertificateController;
use App\Http\Controllers\Client\ClientContractController;
use App\Http\Controllers\Client\ClientHistoryController;
use App\Http\Controllers\Client\ClientRequestController;
use App\Http\Controllers\Commercial\CommercialClientController;
use App\Http\Controllers\Commercial\CommercialContractController;
use App\Http\Controllers\Commercial\CommercialQuotationController;
use App\Http\Controllers\Commercial\CommercialRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\Manager\ManagerAssignmentController;
use App\Http\Controllers\Manager\ManagerCertificateController;
use App\Http\Controllers\Manager\ManagerHistoryController;
use App\Http\Controllers\Manager\ManagerReportController;
use App\Http\Controllers\Metrology\MetrologyMaterialController;
use App\Http\Controllers\Metrology\MetrologyOperationController;
use App\Http\Controllers\Metrology\MetrologySchedulingController;
use App\Http\Controllers\NotificationController;
use App\Models\CalibrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Home / Portal
Route::get('/', function () {
    $services = CalibrationService::where('is_active', true)->get();

    return Inertia::render('welcome', [
        'services' => $services,
    ]);
})->name('home');

// Locale Switching (French / English)
Route::post('/locale', function (Request $request) {
    $locale = $request->input('locale', 'fr');
    if (in_array($locale, ['fr', 'en'])) {
        session(['locale' => $locale]);
        app()->setLocale($locale);
    }

    return back();
})->name('locale.update');

Route::get('/locale/{locale}', function (string $locale) {
    if (in_array($locale, ['fr', 'en'])) {
        session(['locale' => $locale]);
        app()->setLocale($locale);
    }

    return back();
})->name('locale.switch');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    // Dynamic Dashboard Redirection
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Secure Document Downloads
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::get('/certificates/{certificate}/download', [DocumentController::class, 'downloadCertificate'])->name('certificates.download');
    Route::get('/reports/{report}/download', [DocumentController::class, 'downloadReport'])->name('reports.download');
    Route::get('/contracts/{contract}/download', [DocumentController::class, 'downloadContract'])->name('contracts.download');

    // 1. CLIENT Routes
    Route::middleware(['role:client'])->prefix('client')->name('client.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'client'])->name('dashboard');
        Route::get('/requests', [ClientRequestController::class, 'index'])->name('requests.index');
        Route::get('/requests/create', [ClientRequestController::class, 'create'])->name('requests.create');
        Route::post('/requests', [ClientRequestController::class, 'store'])->name('requests.store');
        Route::get('/requests/{calibrationRequest}', [ClientRequestController::class, 'show'])->name('requests.show');
        Route::post('/requests/{calibrationRequest}/accept-date', [ClientRequestController::class, 'acceptDate'])->name('requests.accept-date');
        Route::post('/requests/{calibrationRequest}/cancel', [ClientRequestController::class, 'cancel'])->name('requests.cancel');

        Route::get('/contracts', [ClientContractController::class, 'index'])->name('contracts.index');
        Route::get('/contracts/{contract}', [ClientContractController::class, 'show'])->name('contracts.show');

        Route::get('/certificates', [ClientCertificateController::class, 'index'])->name('certificates.index');
        Route::get('/history', [ClientHistoryController::class, 'index'])->name('history.index');
    });

    // 2. COMMERCIAL Routes
    Route::middleware(['role:commercial'])->prefix('commercial')->name('commercial.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'commercial'])->name('dashboard');

        Route::get('/requests', [CommercialRequestController::class, 'index'])->name('requests.index');
        Route::get('/requests/{calibrationRequest}', [CommercialRequestController::class, 'show'])->name('requests.show');
        Route::post('/requests/{calibrationRequest}/send-to-metrology', [CommercialRequestController::class, 'sendToMetrology'])->name('requests.send-to-metrology');
        Route::post('/requests/{calibrationRequest}/contract', [CommercialRequestController::class, 'contract'])->name('requests.contract');

        Route::get('/quotations', [CommercialQuotationController::class, 'index'])->name('quotations.index');
        Route::post('/quotations', [CommercialQuotationController::class, 'store'])->name('quotations.store');
        Route::patch('/quotations/{quotation}/status', [CommercialQuotationController::class, 'updateStatus'])->name('quotations.status');

        Route::get('/contracts', [CommercialContractController::class, 'index'])->name('contracts.index');
        Route::post('/contracts', [CommercialContractController::class, 'store'])->name('contracts.store');
        Route::post('/contracts/{contract}/archive', [CommercialContractController::class, 'archive'])->name('contracts.archive');

        Route::get('/clients', [CommercialClientController::class, 'index'])->name('clients.index');
        Route::post('/clients', [CommercialClientController::class, 'store'])->name('clients.store');
        Route::get('/clients/{client}', [CommercialClientController::class, 'show'])->name('clients.show');
    });

    // 3. METROLOGY Routes
    Route::middleware(['role:metrology'])->prefix('metrology')->name('metrology.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'metrology'])->name('dashboard');

        Route::get('/operations', [MetrologyOperationController::class, 'index'])->name('operations.index');
        Route::get('/operations/{calibrationOperation}', [MetrologyOperationController::class, 'show'])->name('operations.show');
        Route::post('/operations/{calibrationOperation}/start', [MetrologyOperationController::class, 'start'])->name('operations.start');
        Route::post('/operations/{calibrationOperation}/report', [MetrologyOperationController::class, 'uploadReport'])->name('operations.report');

        Route::get('/scheduling', [MetrologySchedulingController::class, 'index'])->name('scheduling.index');
        Route::post('/scheduling/{calibrationRequest}/propose', [MetrologySchedulingController::class, 'propose'])->name('scheduling.propose');

        Route::get('/materials', [MetrologyMaterialController::class, 'index'])->name('materials.index');
        Route::post('/materials', [MetrologyMaterialController::class, 'store'])->name('materials.store');
        Route::put('/materials/{material}', [MetrologyMaterialController::class, 'update'])->name('materials.update');
    });

    // 4. MANAGER Routes
    Route::middleware(['role:manager'])->prefix('manager')->name('manager.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'manager'])->name('dashboard');

        Route::get('/operations', [MetrologyOperationController::class, 'index'])->name('operations.index');

        Route::get('/scheduling', [MetrologySchedulingController::class, 'index'])->name('scheduling.index');
        Route::post('/scheduling/{calibrationRequest}/propose', [MetrologySchedulingController::class, 'propose'])->name('scheduling.propose');

        Route::get('/assignments', [ManagerAssignmentController::class, 'index'])->name('assignments.index');
        Route::post('/assignments/{calibrationOperation}', [ManagerAssignmentController::class, 'assign'])->name('assignments.assign');

        Route::get('/reports', [ManagerReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/{report}', [ManagerReportController::class, 'show'])->name('reports.show');
        Route::post('/reports/{report}/review', [ManagerReportController::class, 'review'])->name('reports.review');

        Route::get('/certificates', [ManagerCertificateController::class, 'index'])->name('certificates.index');
        Route::post('/operations/{calibrationOperation}/certificate', [ManagerCertificateController::class, 'generate'])->name('certificates.generate');
        Route::post('/certificates/{certificate}/validate', [ManagerCertificateController::class, 'validateCertificate'])->name('certificates.validate');

        Route::get('/materials', [MetrologyMaterialController::class, 'index'])->name('materials.index');
        Route::get('/history', [ManagerHistoryController::class, 'index'])->name('history.index');
    });

    // 5. ADMIN Routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'admin'])->name('dashboard');

        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::post('/users/{user}/toggle', [AdminUserController::class, 'toggleStatus'])->name('users.toggle');

        Route::get('/clients', [CommercialClientController::class, 'index'])->name('clients.index');

        Route::get('/services', [AdminServiceController::class, 'index'])->name('services.index');
        Route::post('/services', [AdminServiceController::class, 'store'])->name('services.store');
        Route::put('/services/{service}', [AdminServiceController::class, 'update'])->name('services.update');
        Route::post('/services/{service}/toggle', [AdminServiceController::class, 'destroy'])->name('services.toggle');

        Route::get('/archives', [AdminArchiveController::class, 'index'])->name('archives.index');
        Route::get('/audit-logs', [AdminAuditLogController::class, 'index'])->name('audit-logs.index');
    });
});

require __DIR__.'/settings.php';
