<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\CalibrationCertificate;
use App\Models\CalibrationOperation;
use App\Models\CalibrationReport;
use App\Models\CalibrationRequest;
use App\Models\CalibrationRequestItem;
use App\Models\Client;
use App\Models\Document;
use App\Models\RequestStatusHistory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WorkflowService
{
    /**
     * Create a calibration request with items.
     */
    public function createRequest(Client $client, array $data, array $items, User $user): CalibrationRequest
    {
        return DB::transaction(function () use ($client, $data, $items, $user) {
            $year = date('Y');
            $count = CalibrationRequest::whereYear('created_at', $year)->count() + 1;
            $requestNumber = sprintf('REQ-%s-%04d', $year, $count);

            $request = CalibrationRequest::create([
                'request_number' => $requestNumber,
                'client_id' => $client->id,
                'status' => CalibrationRequest::STATUS_SUBMITTED,
                'preferred_date' => $data['preferred_date'] ?? null,
                'preferred_location' => $data['preferred_location'] ?? 'laboratory',
                'client_notes' => $data['client_notes'] ?? null,
                'created_by_id' => $user->id,
            ]);

            foreach ($items as $itemData) {
                CalibrationRequestItem::create([
                    'calibration_request_id' => $request->id,
                    'calibration_service_id' => $itemData['calibration_service_id'],
                    'equipment_name' => $itemData['equipment_name'],
                    'serial_number' => $itemData['serial_number'] ?? null,
                    'brand' => $itemData['brand'] ?? null,
                    'model' => $itemData['model'] ?? null,
                    'measurement_range' => $itemData['measurement_range'] ?? null,
                    'tolerance' => $itemData['tolerance'] ?? null,
                    'quantity' => $itemData['quantity'] ?? 1,
                    'specific_notes' => $itemData['specific_notes'] ?? null,
                    'status' => 'PENDING',
                ]);
            }

            RequestStatusHistory::create([
                'calibration_request_id' => $request->id,
                'from_status' => null,
                'to_status' => CalibrationRequest::STATUS_SUBMITTED,
                'changed_by_id' => $user->id,
                'comment' => 'Création de la demande de calibration par le client',
            ]);

            AuditLog::record(
                action: 'Création de la demande de calibration',
                entityType: 'CalibrationRequest',
                entityId: $request->id,
                oldValues: null,
                newValues: ['request_number' => $requestNumber, 'items_count' => count($items)]
            );

            // Notify Commercial
            NotificationService::notifyRole(
                roleName: 'commercial',
                title: 'Nouvelle demande de calibration',
                message: "La demande {$requestNumber} a été soumise par le client {$client->company_name}.",
                url: "/commercial/requests/{$request->id}",
                type: 'info',
                entityType: 'CalibrationRequest',
                entityId: $request->id
            );

            return $request->load('items.service', 'client');
        });
    }

    /**
     * Commercial sends request to Metrology.
     */
    public function sendToMetrology(CalibrationRequest $request, User $user, ?string $notes = null): CalibrationRequest
    {
        return DB::transaction(function () use ($request, $user, $notes) {
            $fromStatus = $request->status;
            $request->update([
                'status' => CalibrationRequest::STATUS_SENT_TO_METROLOGY,
                'internal_notes' => $notes ?: $request->internal_notes,
            ]);

            RequestStatusHistory::create([
                'calibration_request_id' => $request->id,
                'from_status' => $fromStatus,
                'to_status' => CalibrationRequest::STATUS_SENT_TO_METROLOGY,
                'changed_by_id' => $user->id,
                'comment' => $notes ?: 'Demande transmise au service métrologie pour planification',
            ]);

            AuditLog::record(
                action: 'Transmission au service Métrologie',
                entityType: 'CalibrationRequest',
                entityId: $request->id,
                oldValues: ['status' => $fromStatus],
                newValues: ['status' => CalibrationRequest::STATUS_SENT_TO_METROLOGY]
            );

            // Notify Metrology and Manager
            NotificationService::notifyRole(
                roleName: 'metrology',
                title: 'Demande transmise pour planification',
                message: "La demande {$request->request_number} a été transmise par le service commercial.",
                url: '/metrology/scheduling',
                type: 'info',
                entityType: 'CalibrationRequest',
                entityId: $request->id
            );

            NotificationService::notifyRole(
                roleName: 'manager',
                title: 'Nouvelle demande reçue en Métrologie',
                message: "La demande {$request->request_number} nécessite une planification.",
                url: '/manager/scheduling',
                type: 'info',
                entityType: 'CalibrationRequest',
                entityId: $request->id
            );

            return $request->fresh(['items', 'client']);
        });
    }

    /**
     * Metrology / Manager proposes calibration date and location.
     */
    public function proposeSchedule(CalibrationRequest $request, string $date, string $location, User $user, ?string $notes = null): CalibrationRequest
    {
        return DB::transaction(function () use ($request, $date, $location, $user, $notes) {
            $fromStatus = $request->status;
            $request->update([
                'status' => CalibrationRequest::STATUS_DATE_PROPOSED,
                'proposed_date' => $date,
                'proposed_location' => $location,
                'internal_notes' => $notes ?: $request->internal_notes,
            ]);

            RequestStatusHistory::create([
                'calibration_request_id' => $request->id,
                'from_status' => $fromStatus,
                'to_status' => CalibrationRequest::STATUS_DATE_PROPOSED,
                'changed_by_id' => $user->id,
                'comment' => "Date proposée : {$date}, Lieu : {$location}. ".($notes ?? ''),
            ]);

            AuditLog::record(
                action: 'Proposition de date de calibration',
                entityType: 'CalibrationRequest',
                entityId: $request->id,
                oldValues: ['status' => $fromStatus],
                newValues: ['status' => CalibrationRequest::STATUS_DATE_PROPOSED, 'proposed_date' => $date, 'proposed_location' => $location]
            );

            // Notify Client user if linked
            if ($request->client && $request->client->user) {
                NotificationService::notifyUser(
                    user: $request->client->user,
                    title: 'Date de calibration proposée',
                    message: "Une date de calibration a été proposée pour votre demande {$request->request_number} : {$date}.",
                    url: "/client/requests/{$request->id}",
                    type: 'info',
                    entityType: 'CalibrationRequest',
                    entityId: $request->id
                );
            }

            // Notify Commercial
            NotificationService::notifyRole(
                roleName: 'commercial',
                title: 'Date de calibration proposée',
                message: "La métrologie a proposé la date du {$date} pour la demande {$request->request_number}.",
                url: "/commercial/requests/{$request->id}",
                type: 'info',
                entityType: 'CalibrationRequest',
                entityId: $request->id
            );

            return $request->fresh(['items', 'client']);
        });
    }

    /**
     * Client accepts proposed date.
     */
    public function clientConfirmDate(CalibrationRequest $request, User $user): CalibrationRequest
    {
        return DB::transaction(function () use ($request, $user) {
            $fromStatus = $request->status;
            $request->update([
                'status' => CalibrationRequest::STATUS_ACCEPTED,
                'scheduled_date' => $request->proposed_date,
                'scheduled_location' => $request->proposed_location,
            ]);

            RequestStatusHistory::create([
                'calibration_request_id' => $request->id,
                'from_status' => $fromStatus,
                'to_status' => CalibrationRequest::STATUS_ACCEPTED,
                'changed_by_id' => $user->id,
                'comment' => "Le client a accepté la date proposée ({$request->scheduled_date})",
            ]);

            AuditLog::record(
                action: 'Acceptation de la date par le client',
                entityType: 'CalibrationRequest',
                entityId: $request->id,
                oldValues: ['status' => $fromStatus],
                newValues: ['status' => CalibrationRequest::STATUS_ACCEPTED, 'scheduled_date' => $request->scheduled_date]
            );

            // Notify Commercial and Metrology
            NotificationService::notifyRole(
                roleName: 'commercial',
                title: 'Date confirmée par le client',
                message: "Le client a accepté la date pour la demande {$request->request_number}.",
                url: "/commercial/requests/{$request->id}",
                type: 'success',
                entityType: 'CalibrationRequest',
                entityId: $request->id
            );

            NotificationService::notifyRole(
                roleName: 'metrology',
                title: 'Date confirmée par le client',
                message: "La date du {$request->scheduled_date} est confirmée pour la demande {$request->request_number}.",
                url: '/metrology/scheduling',
                type: 'success',
                entityType: 'CalibrationRequest',
                entityId: $request->id
            );

            return $request->fresh(['items', 'client']);
        });
    }

    /**
     * Client cancels request (only allowed if isCancellable).
     */
    public function clientCancelRequest(CalibrationRequest $request, User $user, string $reason): CalibrationRequest
    {
        if (! $request->isCancellable()) {
            throw ValidationException::withMessages([
                'cancellation' => 'Cette demande ne peut plus être annulée car le processus technique est déjà engagé.',
            ]);
        }

        return DB::transaction(function () use ($request, $user, $reason) {
            $fromStatus = $request->status;
            $request->update([
                'status' => CalibrationRequest::STATUS_CANCELLED,
                'cancellation_reason' => $reason,
            ]);

            // Cancel any pending items and operations
            $request->items()->update(['status' => 'CANCELLED']);
            $request->operations()->update(['status' => CalibrationOperation::STATUS_CANCELLED]);

            RequestStatusHistory::create([
                'calibration_request_id' => $request->id,
                'from_status' => $fromStatus,
                'to_status' => CalibrationRequest::STATUS_CANCELLED,
                'changed_by_id' => $user->id,
                'comment' => "Annulation par l'utilisateur : {$reason}",
            ]);

            AuditLog::record(
                action: 'Annulation de la demande',
                entityType: 'CalibrationRequest',
                entityId: $request->id,
                oldValues: ['status' => $fromStatus],
                newValues: ['status' => CalibrationRequest::STATUS_CANCELLED, 'reason' => $reason]
            );

            // Notify Commercial and Metrology
            NotificationService::notifyRole(
                roleName: 'commercial',
                title: 'Demande de calibration annulée',
                message: "La demande {$request->request_number} a été annulée. Motif : {$reason}",
                url: "/commercial/requests/{$request->id}",
                type: 'warning',
                entityType: 'CalibrationRequest',
                entityId: $request->id
            );

            NotificationService::notifyRole(
                roleName: 'metrology',
                title: 'Demande de calibration annulée',
                message: "La demande {$request->request_number} a été annulée par le client.",
                url: '/metrology/scheduling',
                type: 'warning',
                entityType: 'CalibrationRequest',
                entityId: $request->id
            );

            return $request->fresh(['items', 'client']);
        });
    }

    /**
     * Commercial associates contract or completes commercial stage.
     */
    public function commercialContractRequest(CalibrationRequest $request, ?int $contractId, User $user): CalibrationRequest
    {
        return DB::transaction(function () use ($request, $contractId, $user) {
            $fromStatus = $request->status;
            $request->update([
                'contract_id' => $contractId ?: $request->contract_id,
                'status' => CalibrationRequest::STATUS_SCHEDULED,
            ]);

            // Create initial operations for all items if not yet created
            foreach ($request->items as $item) {
                if (! $item->operations()->exists()) {
                    $year = date('Y');
                    $count = CalibrationOperation::whereYear('created_at', $year)->count() + 1;
                    $opNumber = sprintf('OP-%s-%04d', $year, $count);

                    CalibrationOperation::create([
                        'operation_number' => $opNumber,
                        'calibration_request_id' => $request->id,
                        'calibration_request_item_id' => $item->id,
                        'client_id' => $request->client_id,
                        'scheduled_date' => $request->scheduled_date,
                        'location' => $request->scheduled_location ?: 'laboratory',
                        'status' => CalibrationOperation::STATUS_SCHEDULED,
                    ]);
                }
            }

            RequestStatusHistory::create([
                'calibration_request_id' => $request->id,
                'from_status' => $fromStatus,
                'to_status' => CalibrationRequest::STATUS_SCHEDULED,
                'changed_by_id' => $user->id,
                'comment' => 'Traitement commercial et contractualisation finalisés. Prêt pour affectation technique.',
            ]);

            AuditLog::record(
                action: 'Validation commerciale et contractualisation',
                entityType: 'CalibrationRequest',
                entityId: $request->id,
                oldValues: ['status' => $fromStatus],
                newValues: ['status' => CalibrationRequest::STATUS_SCHEDULED, 'contract_id' => $contractId]
            );

            NotificationService::notifyRole(
                roleName: 'manager',
                title: 'Demande prête pour affectation',
                message: "La demande {$request->request_number} a été validée commercialement et peut être affectée aux techniciens.",
                url: "/manager/assignments?search={$request->request_number}",
                type: 'info',
                entityType: 'CalibrationRequest',
                entityId: $request->id
            );

            return $request->fresh(['items.operations', 'client']);
        });
    }

    /**
     * Manager assigns technician to an operation.
     */
    public function assignTechnician(CalibrationOperation $operation, int $technicianId, User $user, ?string $scheduledDate = null, ?string $notes = null): CalibrationOperation
    {
        return DB::transaction(function () use ($operation, $technicianId, $user, $scheduledDate, $notes) {
            $technician = User::findOrFail($technicianId);
            $fromStatus = $operation->status;

            $operation->update([
                'technician_id' => $technicianId,
                'supervisor_id' => $user->id,
                'scheduled_date' => $scheduledDate ?: $operation->scheduled_date,
                'status' => CalibrationOperation::STATUS_ASSIGNED,
                'notes' => $notes ?: $operation->notes,
            ]);

            $request = $operation->request;
            if ($request->status !== CalibrationRequest::STATUS_ASSIGNED && $request->status !== CalibrationRequest::STATUS_IN_CALIBRATION) {
                $fromReqStatus = $request->status;
                $request->update(['status' => CalibrationRequest::STATUS_ASSIGNED]);

                RequestStatusHistory::create([
                    'calibration_request_id' => $request->id,
                    'from_status' => $fromReqStatus,
                    'to_status' => CalibrationRequest::STATUS_ASSIGNED,
                    'changed_by_id' => $user->id,
                    'comment' => "Opération {$operation->operation_number} affectée à {$technician->name}",
                ]);
            }

            AuditLog::record(
                action: 'Affectation du technicien',
                entityType: 'CalibrationOperation',
                entityId: $operation->id,
                oldValues: ['status' => $fromStatus, 'technician_id' => $operation->getOriginal('technician_id')],
                newValues: ['status' => CalibrationOperation::STATUS_ASSIGNED, 'technician_id' => $technicianId]
            );

            // Notify assigned technician
            NotificationService::notifyUser(
                user: $technician,
                title: 'Nouvelle calibration affectée',
                message: "Vous avez été affecté à l'opération {$operation->operation_number} ({$operation->item->equipment_name}).",
                url: "/metrology/operations/{$operation->id}",
                type: 'info',
                entityType: 'CalibrationOperation',
                entityId: $operation->id
            );

            return $operation->fresh(['technician', 'supervisor', 'item', 'request']);
        });
    }

    /**
     * Technician marks calibration in progress.
     */
    public function startCalibration(CalibrationOperation $operation, User $user): CalibrationOperation
    {
        return DB::transaction(function () use ($operation, $user) {
            $operation->update([
                'status' => CalibrationOperation::STATUS_IN_PROGRESS,
                'actual_date' => now()->toDateString(),
            ]);

            $request = $operation->request;
            if ($request->status !== CalibrationRequest::STATUS_IN_CALIBRATION) {
                $fromReqStatus = $request->status;
                $request->update(['status' => CalibrationRequest::STATUS_IN_CALIBRATION]);

                RequestStatusHistory::create([
                    'calibration_request_id' => $request->id,
                    'from_status' => $fromReqStatus,
                    'to_status' => CalibrationRequest::STATUS_IN_CALIBRATION,
                    'changed_by_id' => $user->id,
                    'comment' => "Démarrage des opérations techniques de calibration par {$user->name}",
                ]);
            }

            AuditLog::record(
                action: 'Démarrage de la calibration',
                entityType: 'CalibrationOperation',
                entityId: $operation->id,
                oldValues: null,
                newValues: ['status' => CalibrationOperation::STATUS_IN_PROGRESS]
            );

            return $operation->fresh();
        });
    }

    /**
     * Metrology technician uploads calibration report (PDF, DOC, DOCX).
     */
    public function uploadReport(CalibrationOperation $operation, UploadedFile $file, User $user, ?string $notes = null): CalibrationReport
    {
        return DB::transaction(function () use ($operation, $file, $user, $notes) {
            $year = date('Y');
            $count = CalibrationReport::whereYear('created_at', $year)->count() + 1;
            $reportNumber = sprintf('RAP-%s-%04d', $year, $count);

            $path = $file->store('reports', 'local');

            $report = CalibrationReport::create([
                'report_number' => $reportNumber,
                'calibration_operation_id' => $operation->id,
                'calibration_request_id' => $operation->calibration_request_id,
                'calibration_request_item_id' => $operation->calibration_request_item_id,
                'uploaded_by_id' => $user->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
                'status' => CalibrationReport::STATUS_PENDING_REVIEW,
                'review_notes' => $notes,
            ]);

            // Register in general documents table
            Document::create([
                'document_type' => Document::TYPE_REPORT,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by_id' => $user->id,
                'uploaded_at' => now(),
                'documentable_type' => CalibrationReport::class,
                'documentable_id' => $report->id,
                'status' => 'ACTIVE',
            ]);

            $operation->update(['status' => CalibrationOperation::STATUS_REPORT_UPLOADED]);

            $request = $operation->request;
            $fromReqStatus = $request->status;
            $request->update(['status' => CalibrationRequest::STATUS_REPORT_UPLOADED]);

            RequestStatusHistory::create([
                'calibration_request_id' => $request->id,
                'from_status' => $fromReqStatus,
                'to_status' => CalibrationRequest::STATUS_REPORT_UPLOADED,
                'changed_by_id' => $user->id,
                'comment' => "Rapport de calibration {$reportNumber} téléversé par {$user->name}. En attente de revue par le responsable.",
            ]);

            AuditLog::record(
                action: 'Téléversement du rapport de calibration',
                entityType: 'CalibrationReport',
                entityId: $report->id,
                oldValues: null,
                newValues: ['report_number' => $reportNumber, 'file_name' => $file->getClientOriginalName()]
            );

            // Notify Manager
            NotificationService::notifyRole(
                roleName: 'manager',
                title: 'Nouveau rapport à valider',
                message: "Le technicien {$user->name} a déposé le rapport {$reportNumber} pour la demande {$request->request_number}.",
                url: "/manager/reports/{$report->id}",
                type: 'info',
                entityType: 'CalibrationReport',
                entityId: $report->id
            );

            return $report->fresh(['operation', 'request', 'item']);
        });
    }

    /**
     * Manager reviews report (Approve or Reject/Request Correction).
     */
    public function reviewReport(CalibrationReport $report, string $decision, ?string $reviewNotes, User $user): CalibrationReport
    {
        return DB::transaction(function () use ($report, $decision, $reviewNotes, $user) {
            $isApproved = ($decision === 'APPROVE');
            $newStatus = $isApproved ? CalibrationReport::STATUS_APPROVED : CalibrationReport::STATUS_REJECTED;

            $report->update([
                'status' => $newStatus,
                'review_notes' => $reviewNotes,
                'reviewed_by_id' => $user->id,
                'reviewed_at' => now(),
            ]);

            $operation = $report->operation;
            $request = $report->request;

            if ($isApproved) {
                $operation->update(['status' => CalibrationOperation::STATUS_CERTIFICATE_GENERATED]);
                $request->update(['status' => CalibrationRequest::STATUS_WAITING_CERTIFICATE]);

                RequestStatusHistory::create([
                    'calibration_request_id' => $request->id,
                    'from_status' => $request->getOriginal('status'),
                    'to_status' => CalibrationRequest::STATUS_WAITING_CERTIFICATE,
                    'changed_by_id' => $user->id,
                    'comment' => "Rapport {$report->report_number} approuvé par le responsable. En attente de génération du certificat.",
                ]);
            } else {
                $operation->update(['status' => CalibrationOperation::STATUS_REPORT_REJECTED]);

                RequestStatusHistory::create([
                    'calibration_request_id' => $request->id,
                    'from_status' => $request->getOriginal('status'),
                    'to_status' => $request->status,
                    'changed_by_id' => $user->id,
                    'comment' => "Correction demandée sur le rapport {$report->report_number} : {$reviewNotes}",
                ]);

                // Notify technician
                if ($report->uploadedBy) {
                    NotificationService::notifyUser(
                        user: $report->uploadedBy,
                        title: 'Correction de rapport demandée',
                        message: "Des corrections sont demandées sur le rapport {$report->report_number} : {$reviewNotes}",
                        url: "/metrology/operations/{$operation->id}",
                        type: 'warning',
                        entityType: 'CalibrationReport',
                        entityId: $report->id
                    );
                }
            }

            AuditLog::record(
                action: $isApproved ? 'Approbation du rapport' : 'Demande de correction du rapport',
                entityType: 'CalibrationReport',
                entityId: $report->id,
                oldValues: ['status' => $report->getOriginal('status')],
                newValues: ['status' => $newStatus, 'notes' => $reviewNotes]
            );

            return $report->fresh();
        });
    }

    /**
     * Manager generates / uploads calibration certificate.
     */
    public function generateCertificate(CalibrationOperation $operation, UploadedFile $file, User $user): CalibrationCertificate
    {
        $operation->loadMissing('request');
        if (! $operation->request?->contract_id) {
            throw new \DomainException("La génération d'un certificat nécessite obligatoirement un contrat associé à la demande.");
        }

        return DB::transaction(function () use ($operation, $file, $user) {
            $year = date('Y');
            $count = CalibrationCertificate::whereYear('created_at', $year)->count() + 1;
            $certNumber = sprintf('CERT-%s-%06d', $year, $count);

            $path = $file->store('certificates', 'local');

            $certificate = CalibrationCertificate::create([
                'certificate_number' => $certNumber,
                'calibration_operation_id' => $operation->id,
                'calibration_request_id' => $operation->calibration_request_id,
                'calibration_request_item_id' => $operation->calibration_request_item_id,
                'client_id' => $operation->client_id,
                'calibration_report_id' => $operation->report?->id,
                'generated_by_id' => $user->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
                'status' => CalibrationCertificate::STATUS_DRAFT,
                'is_final' => false,
            ]);

            // Register in general documents table
            Document::create([
                'document_type' => Document::TYPE_CERTIFICATE,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
                'file_size' => $file->getSize(),
                'uploaded_by_id' => $user->id,
                'uploaded_at' => now(),
                'documentable_type' => CalibrationCertificate::class,
                'documentable_id' => $certificate->id,
                'status' => 'ACTIVE',
            ]);

            $request = $operation->request;
            $fromReqStatus = $request->status;
            $request->update(['status' => CalibrationRequest::STATUS_CERTIFICATE_GENERATED]);

            RequestStatusHistory::create([
                'calibration_request_id' => $request->id,
                'from_status' => $fromReqStatus,
                'to_status' => CalibrationRequest::STATUS_CERTIFICATE_GENERATED,
                'changed_by_id' => $user->id,
                'comment' => "Certificat de calibration {$certNumber} généré (brouillon) par {$user->name}",
            ]);

            AuditLog::record(
                action: 'Génération du certificat de calibration',
                entityType: 'CalibrationCertificate',
                entityId: $certificate->id,
                oldValues: null,
                newValues: ['certificate_number' => $certNumber, 'file_name' => $file->getClientOriginalName()]
            );

            return $certificate->fresh(['operation', 'request', 'item', 'client']);
        });
    }

    /**
     * Manager (or authorized delegated metrology user) validates certificate.
     * Once validated -> FINAL (immutable!).
     */
    public function validateCertificate(CalibrationCertificate $certificate, User $user): CalibrationCertificate
    {
        if ($certificate->is_final) {
            throw ValidationException::withMessages([
                'certificate' => 'Ce certificat est déjà validé et ne peut plus être modifié.',
            ]);
        }

        return DB::transaction(function () use ($certificate, $user) {
            $certificate->update([
                'status' => CalibrationCertificate::STATUS_VALIDATED,
                'validated_by_id' => $user->id,
                'validated_at' => now(),
                'is_final' => true,
            ]);

            $operation = $certificate->operation;
            $operation->update(['status' => CalibrationOperation::STATUS_COMPLETED]);

            $item = $certificate->item;
            $item->update(['status' => 'COMPLETED']);

            $request = $certificate->request;

            // Check if all operations of this request are completed
            $allCompleted = $request->operations()->where('status', '!=', CalibrationOperation::STATUS_COMPLETED)->doesntExist();

            $nextStatus = $allCompleted ? CalibrationRequest::STATUS_COMPLETED : CalibrationRequest::STATUS_CERTIFICATE_VALIDATED;
            $fromReqStatus = $request->status;

            $request->update(['status' => $nextStatus]);

            RequestStatusHistory::create([
                'calibration_request_id' => $request->id,
                'from_status' => $fromReqStatus,
                'to_status' => $nextStatus,
                'changed_by_id' => $user->id,
                'comment' => "Certificat {$certificate->certificate_number} validé et rendu définitif par {$user->name}.".($allCompleted ? ' Toutes les opérations sont terminées.' : ''),
            ]);

            AuditLog::record(
                action: 'Validation définitive du certificat',
                entityType: 'CalibrationCertificate',
                entityId: $certificate->id,
                oldValues: ['is_final' => false, 'status' => CalibrationCertificate::STATUS_DRAFT],
                newValues: [
                    'is_final' => true,
                    'status' => CalibrationCertificate::STATUS_VALIDATED,
                    'validated_by' => $user->name,
                    'delegated' => ($user->isMetrology() && $user->is_delegated_manager),
                ]
            );

            // Notify Client (certificate available!)
            if ($certificate->client && $certificate->client->user) {
                NotificationService::notifyUser(
                    user: $certificate->client->user,
                    title: 'Certificat de calibration disponible',
                    message: "Le certificat {$certificate->certificate_number} pour votre équipement {$item->equipment_name} est maintenant validé et disponible en téléchargement.",
                    url: '/client/certificates',
                    type: 'success',
                    entityType: 'CalibrationCertificate',
                    entityId: $certificate->id
                );
            }

            // Notify Commercial
            NotificationService::notifyRole(
                roleName: 'commercial',
                title: 'Opération de calibration terminée',
                message: "Le certificat {$certificate->certificate_number} a été validé pour la demande {$request->request_number}.",
                url: "/commercial/requests/{$request->id}",
                type: 'success',
                entityType: 'CalibrationCertificate',
                entityId: $certificate->id
            );

            return $certificate->fresh();
        });
    }
}
