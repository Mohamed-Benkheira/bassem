<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\CalibrationCertificate;
use App\Models\CalibrationOperation;
use App\Models\CalibrationReport;
use App\Models\CalibrationRequest;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Document;
use App\Models\MetrologyMaterial;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Automatic redirection to role dashboard.
     */
    public function index(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        } elseif ($user->isManager()) {
            return redirect()->route('manager.dashboard');
        } elseif ($user->isMetrology()) {
            return redirect()->route('metrology.dashboard');
        } elseif ($user->isCommercial()) {
            return redirect()->route('commercial.dashboard');
        } elseif ($user->isClient()) {
            return redirect()->route('client.dashboard');
        }

        return redirect()->route('profile.edit');
    }

    /**
     * Client Dashboard.
     * Section 33: Mes demandes, Demandes en cours, Demandes terminées, Demandes annulées, Certificats disponibles, Notifications.
     */
    public function client(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            // If client profile not yet created, create one default
            $client = Client::create([
                'user_id' => $user->id,
                'company_name' => $user->name,
                'contact_name' => $user->name,
                'email' => $user->email,
            ]);
        }

        $requestsQuery = CalibrationRequest::where('client_id', $client->id);

        $stats = [
            'total_requests' => (clone $requestsQuery)->count(),
            'in_progress' => (clone $requestsQuery)->whereNotIn('status', [
                CalibrationRequest::STATUS_COMPLETED,
                CalibrationRequest::STATUS_CANCELLED,
                CalibrationRequest::STATUS_REJECTED,
            ])->count(),
            'completed' => (clone $requestsQuery)->where('status', CalibrationRequest::STATUS_COMPLETED)->count(),
            'cancelled' => (clone $requestsQuery)->where('status', CalibrationRequest::STATUS_CANCELLED)->count(),
            'available_certificates' => CalibrationCertificate::where('client_id', $client->id)->where('is_final', true)->count(),
        ];

        $recentRequests = (clone $requestsQuery)
            ->with(['items.service'])
            ->latest()
            ->take(5)
            ->get();

        $recentCertificates = CalibrationCertificate::where('client_id', $client->id)
            ->where('is_final', true)
            ->with(['item'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('client/dashboard', [
            'stats' => $stats,
            'recentRequests' => $recentRequests,
            'recentCertificates' => $recentCertificates,
            'client' => $client,
        ]);
    }

    /**
     * Commercial Dashboard.
     * Section 33: Nouvelles demandes, Demandes en traitement, Demandes transmises à la métrologie, Demandes en attente du client, Contrats actifs, Contrats arrivant à échéance, Notifications.
     */
    public function commercial(Request $request): Response
    {
        $stats = [
            'new_requests' => CalibrationRequest::where('status', CalibrationRequest::STATUS_SUBMITTED)->count(),
            'in_processing' => CalibrationRequest::whereIn('status', [
                CalibrationRequest::STATUS_SENT_TO_METROLOGY,
                CalibrationRequest::STATUS_DATE_PROPOSED,
                CalibrationRequest::STATUS_WAITING_CLIENT_CONFIRMATION,
                CalibrationRequest::STATUS_ACCEPTED,
            ])->count(),
            'sent_to_metrology' => CalibrationRequest::where('status', CalibrationRequest::STATUS_SENT_TO_METROLOGY)->count(),
            'waiting_client' => CalibrationRequest::where('status', CalibrationRequest::STATUS_WAITING_CLIENT_CONFIRMATION)
                ->orWhere('status', CalibrationRequest::STATUS_DATE_PROPOSED)
                ->count(),
            'active_contracts' => Contract::where('status', 'ACTIVE')->count(),
            'expiring_contracts' => Contract::where('status', 'ACTIVE')
                ->whereBetween('end_date', [now(), now()->addDays(30)])
                ->count(),
        ];

        $pendingRequests = CalibrationRequest::with(['client', 'items.service'])
            ->whereIn('status', [
                CalibrationRequest::STATUS_SUBMITTED,
                CalibrationRequest::STATUS_ACCEPTED,
                CalibrationRequest::STATUS_DATE_PROPOSED,
            ])
            ->latest()
            ->take(6)
            ->get();

        $activeContracts = Contract::with(['client'])
            ->where('status', 'ACTIVE')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('commercial/dashboard', [
            'stats' => $stats,
            'pendingRequests' => $pendingRequests,
            'activeContracts' => $activeContracts,
        ]);
    }

    /**
     * Metrology Dashboard.
     * Section 33: Mes calibrations, Calibrations à venir, Calibrations en cours, Rapports à téléverser, Calibrations terminées, Notifications.
     */
    public function metrology(Request $request): Response
    {
        $user = $request->user();
        $opsQuery = CalibrationOperation::where('technician_id', $user->id);

        $stats = [
            'my_calibrations' => (clone $opsQuery)->count(),
            'upcoming' => (clone $opsQuery)->where('status', CalibrationOperation::STATUS_ASSIGNED)->count(),
            'in_progress' => (clone $opsQuery)->where('status', CalibrationOperation::STATUS_IN_PROGRESS)->count(),
            'pending_reports' => (clone $opsQuery)->whereIn('status', [
                CalibrationOperation::STATUS_IN_PROGRESS,
                CalibrationOperation::STATUS_REPORT_REJECTED,
            ])->count(),
            'completed' => (clone $opsQuery)->where('status', CalibrationOperation::STATUS_COMPLETED)->count(),
        ];

        $assignedOperations = (clone $opsQuery)
            ->with(['client', 'item', 'request'])
            ->whereIn('status', [
                CalibrationOperation::STATUS_ASSIGNED,
                CalibrationOperation::STATUS_IN_PROGRESS,
                CalibrationOperation::STATUS_REPORT_REJECTED,
            ])
            ->orderByRaw("CASE WHEN status = 'ASSIGNED' THEN 0 WHEN status = 'REPORT_REJECTED' THEN 1 WHEN status = 'IN_PROGRESS' THEN 2 ELSE 3 END")
            ->latest('updated_at')
            ->take(8)
            ->get();

        $expiringMaterials = MetrologyMaterial::where(function ($q) {
            $q->where('status', MetrologyMaterial::STATUS_EXPIRED)
                ->orWhereBetween('expiration_date', [now(), now()->addDays(30)]);
        })->take(4)->get();

        return Inertia::render('metrology/dashboard', [
            'stats' => $stats,
            'assignedOperations' => $assignedOperations,
            'expiringMaterials' => $expiringMaterials,
        ]);
    }

    /**
     * Manager Dashboard.
     * Section 33: Calibrations en cours, Calibrations assignées, Rapports en attente, Certificats à générer, Certificats à valider, Charge de travail des techniciens, Historique, Notifications.
     */
    public function manager(Request $request): Response
    {
        $stats = [
            'calibrations_in_progress' => CalibrationOperation::where('status', CalibrationOperation::STATUS_IN_PROGRESS)->count(),
            'calibrations_assigned' => CalibrationOperation::where('status', CalibrationOperation::STATUS_ASSIGNED)->count(),
            'unassigned_operations' => CalibrationOperation::whereNull('technician_id')
                ->whereNotIn('status', [CalibrationOperation::STATUS_COMPLETED, CalibrationOperation::STATUS_CANCELLED])
                ->count(),
            'reports_pending_review' => CalibrationReport::where('status', CalibrationReport::STATUS_PENDING_REVIEW)->count(),
            'certificates_to_generate' => CalibrationOperation::where('status', CalibrationOperation::STATUS_CERTIFICATE_GENERATED)
                ->whereDoesntHave('certificate')
                ->count(),
            'certificates_to_validate' => CalibrationCertificate::where('status', CalibrationCertificate::STATUS_DRAFT)->count(),
        ];

        $techniciansWorkload = User::whereHas('role', fn ($q) => $q->where('name', 'metrology'))
            ->withCount([
                'assignedOperations as active_calibrations_count' => fn ($q) => $q->whereIn('status', [
                    CalibrationOperation::STATUS_ASSIGNED,
                    CalibrationOperation::STATUS_IN_PROGRESS,
                ]),
                'assignedOperations as completed_calibrations_count' => fn ($q) => $q->where('status', CalibrationOperation::STATUS_COMPLETED),
            ])
            ->get();

        $unassignedOperations = CalibrationOperation::with(['client', 'item', 'request'])
            ->whereNull('technician_id')
            ->whereNotIn('status', [CalibrationOperation::STATUS_COMPLETED, CalibrationOperation::STATUS_CANCELLED])
            ->latest()
            ->take(6)
            ->get();

        $recentAssignments = CalibrationOperation::with(['client', 'item', 'technician', 'request'])
            ->whereNotNull('technician_id')
            ->latest('updated_at')
            ->take(5)
            ->get();

        $pendingReports = CalibrationReport::with(['operation', 'item', 'uploadedBy', 'request.client'])
            ->where('status', CalibrationReport::STATUS_PENDING_REVIEW)
            ->latest()
            ->take(5)
            ->get();

        $draftCertificates = CalibrationCertificate::with(['item', 'client', 'generatedBy'])
            ->where('status', CalibrationCertificate::STATUS_DRAFT)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('manager/dashboard', [
            'stats' => $stats,
            'techniciansWorkload' => $techniciansWorkload,
            'unassignedOperations' => $unassignedOperations,
            'recentAssignments' => $recentAssignments,
            'pendingReports' => $pendingReports,
            'draftCertificates' => $draftCertificates,
        ]);
    }

    /**
     * Admin Dashboard.
     * Section 33: Utilisateurs, Clients, Demandes, Contrats, Calibrations, Certificats, Documents, Activity logs.
     */
    public function admin(Request $request): Response
    {
        $stats = [
            'total_users' => User::count(),
            'total_clients' => Client::count(),
            'total_requests' => CalibrationRequest::count(),
            'total_contracts' => Contract::count(),
            'total_operations' => CalibrationOperation::count(),
            'total_certificates' => CalibrationCertificate::count(),
            'total_documents' => Document::count(),
            'materials_expired' => MetrologyMaterial::where('status', MetrologyMaterial::STATUS_EXPIRED)->count(),
        ];

        $recentLogs = AuditLog::with(['user'])
            ->latest('created_at')
            ->take(8)
            ->get();

        $recentUsers = User::with(['role'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentLogs' => $recentLogs,
            'recentUsers' => $recentUsers,
        ]);
    }
}
