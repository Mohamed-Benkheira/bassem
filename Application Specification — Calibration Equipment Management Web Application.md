# Application Specification
## Web Application for Managing Equipment Calibration Operations

**Application name (French):**  
**Application Web de Gestion de la Calibration des Équipements**

**Technology:** Laravel + React + Filament where appropriate

**Application language:** French only

**Specification language:** English

---

# 1. Project Overview

The application is a web-based platform used by a company to manage the complete lifecycle of equipment calibration requests.

The platform connects:

- External clients
- Commercial department
- Metrology department
- Metrology Manager
- IT Administrator

The system manages:

- Calibration service catalog
- Client requests
- Calibration scheduling
- Commercial processing
- Quotations
- Contracts
- Metrology assignments
- Calibration operations
- Calibration reports
- Calibration certificates
- Equipment/material management
- Notifications
- Document archiving
- User management
- Request history and audit trail

The application must be designed as a professional business application with a clear workflow and strict role-based access control.

---

# 2. Important Business Principle

The application does **not** perform the technical calibration calculations itself.

The technical calibration operation is documented through uploaded files.

The workflow is:

```text
Client Request
      ↓
Commercial Processing
      ↓
Metrology Scheduling
      ↓
Calibration Operation
      ↓
Calibration Report Uploaded
      ↓
Manager Review
      ↓
Calibration Certificate Generated/Uploaded
      ↓
Certificate Validation
      ↓
Client Access
```

Calibration reports and certificates are documents uploaded to the system.

The application manages the lifecycle, metadata, permissions, status, relationships, storage, and history of these documents.

---

# 3. User Roles

The application has five main roles.

## 3.1 Client

External customer.

The client can:

- Create an account
- Log in
- Browse available calibration services
- View calibration capabilities offered by the company
- Select equipment/services for calibration
- Create calibration requests
- Include multiple equipment/items in one request
- View request details
- View request status
- View proposed calibration dates
- Accept proposed dates
- Cancel requests when cancellation is allowed
- View contracts associated with their requests
- Download available documents
- View calibration history
- Download finalized calibration certificates
- Receive application notifications

The client must NOT have access to:

- Internal commercial information
- Internal metrology information
- Internal technician assignments
- Internal management information
- Other clients' data
- Internal reports unless explicitly made available
- Administrative functions

---

# 4. Commercial Role

The Commercial department manages the commercial side of calibration requests.

Commercial can:

- View incoming client requests
- View complete request information
- Forward requests to Metrology
- View proposed calibration dates
- Create/manage quotations
- Submit commercial information to the client
- Manage client acceptance
- Manage contracts
- Upload contracts
- Associate contracts with clients and requests
- Archive contracts
- View contract history
- View request history
- Receive notifications
- Download relevant documents

Commercial does not perform technical calibration operations.

Commercial should not modify technical calibration reports or certificates.

---

# 5. Metrology Role

Metrology employees handle the technical calibration workflow.

Metrology can:

- View requests sent by Commercial
- View complete request information
- View requested equipment/services
- Schedule calibration operations
- Define calibration dates
- Define calibration location
- View assigned work
- Perform calibration operations
- Upload calibration reports
- View relevant calibration materials/equipment
- Update calibration operation status
- Receive notifications
- View previous calibration information where permitted
- Upload supporting documents

Metrology employees should only be able to perform actions permitted by their role and assignment.

---

# 6. Manager Role

The Manager is also part of the Metrology department but has additional privileges.

The Manager can:

- Perform Metrology functions
- View all Metrology operations
- Assign calibration work to Metrology employees
- Assign calibration material/equipment where applicable
- Monitor workload
- Review calibration reports
- Generate calibration certificates
- Upload calibration certificates
- Validate certificates
- Reject/request correction of reports when necessary
- View complete calibration history
- Manage technical workflow
- Receive notifications
- Access management dashboards

The Manager has higher permissions than ordinary Metrology employees.

---

# 7. Admin / IT Role

The Admin is responsible for system administration.

Admin can:

- Create users
- Edit users
- Disable/enable users
- Reset user access
- Assign roles
- Manage permissions
- Manage clients
- Manage commercial users
- Manage metrology users
- Manage managers
- Manage calibration service catalog
- Manage equipment/service definitions
- Manage company calibration capabilities
- Manage system configuration
- Access all records
- Access all documents
- Access audit logs
- Manage archival configuration
- Monitor system activity

Admin has full system access.

---

# 8. Application Language

The application's user interface must be **French**.

The specification and source-code comments may be English.

All user-facing content must be French.

This includes:

- Navigation
- Buttons
- Forms
- Tables
- Statuses
- Notifications
- Validation messages
- Error messages
- Success messages
- Emails if email notifications are later enabled
- Dashboard labels
- Filters
- Search labels
- Modal dialogs
- Confirmation dialogs
- Empty states
- Tooltips
- Help text
- Authentication pages

Do NOT expose English UI text to normal application users.

Examples:

```text
Dashboard → Tableau de bord
Requests → Demandes
Clients → Clients
Contracts → Contrats
Equipment → Équipements
Calibration → Calibration
Reports → Rapports
Certificates → Certificats
Users → Utilisateurs
Settings → Paramètres
```

Use proper professional French rather than literal machine translation.

The application should support French typography and accents correctly:

```text
Équipement
Calibration
Métrologie
Demande
Contrat
Certificat
Validation
Référence
Échéance
```

---

# 9. Main Application Modules

The system should be organized into the following modules.

```text
1. Authentication
2. Client Management
3. Calibration Service Catalog
4. Calibration Requests
5. Commercial Management
6. Quotations
7. Contracts
8. Scheduling
9. Metrology Operations
10. Technician Assignment
11. Calibration Materials/Equipment
12. Calibration Reports
13. Calibration Certificates
14. Notifications
15. Document Management
16. Archive
17. Audit Logs
18. User & Role Management
19. Dashboard & Statistics
```

---

# 10. Authentication

The application must provide secure authentication.

Required functionality:

- Login
- Logout
- Password hashing
- Password reset
- Password change
- Account activation/deactivation
- Role-based authorization
- Session security

Clients and internal users should have appropriate authentication flows.

---

# 11. Calibration Service Catalog

Admin manages the list of services/calibration capabilities that the company offers.

This catalog is visible to Clients.

Each catalog item should contain information such as:

- Service name
- Equipment type
- Description
- Manufacturer compatibility if applicable
- Model/reference information if applicable
- Measurement category
- Calibration type
- Available calibration method
- Required information
- Active/inactive status
- Additional details
- Optional documents

The exact technical fields should remain configurable because the company may offer different calibration services.

Clients must select from the catalog rather than manually inventing a calibration service.

---

# 12. Client Calibration Request

A client can create a calibration request.

A request can contain multiple equipment/items.

Example:

```text
Request #REQ-2026-0015

1. Pressure Gauge
2. Digital Multimeter
3. Temperature Sensor
4. Pressure Calibrator
```

Each requested item must reference an available service/catalog item.

The request should store:

- Request number
- Client
- Creation date
- Requested items
- Equipment information
- Quantity
- Client-provided details
- Preferred date if applicable
- Preferred location if applicable
- Additional notes
- Current status
- Related contract
- Related quotation
- Related calibration operations
- Related reports
- Related certificates
- History

---

# 13. Request Status System

The application must use a controlled workflow.

Suggested statuses:

```text
SUBMITTED
SENT_TO_METROLOGY
DATE_PROPOSED
WAITING_CLIENT_CONFIRMATION
ACCEPTED
CONTRACTED
SCHEDULED
ASSIGNED
IN_CALIBRATION
REPORT_UPLOADED
WAITING_CERTIFICATE
CERTIFICATE_GENERATED
CERTIFICATE_VALIDATED
COMPLETED
CANCELLED
REJECTED
```

These statuses must be displayed in French.

Example:

```text
Soumise
Transmise à la métrologie
Date proposée
En attente de confirmation du client
Acceptée
Sous contrat
Planifiée
Affectée
En cours de calibration
Rapport téléversé
En attente de certificat
Certificat généré
Certificat validé
Terminée
Annulée
Rejetée
```

The exact transitions must be enforced by backend authorization and business rules.

Do not allow users to arbitrarily change statuses.

---

# 14. Request Workflow

## Step 1 — Client

Client:

```text
Login
↓
Browse calibration catalog
↓
Select services/equipment
↓
Create request
↓
Submit
```

Request status:

```text
Soumise
```

---

## Step 2 — Commercial

Commercial receives a notification.

Commercial reviews the request.

Commercial sends the request to Metrology.

Status:

```text
Transmise à la métrologie
```

Commercial does not need to perform technical modifications to the request.

---

# 15. Metrology Scheduling

Metrology receives the request.

Metrology determines:

- Calibration date
- Calibration location
- Calibration planning
- Required technical resources
- Assigned personnel where applicable

A request may involve:

- Calibration at the company's laboratory
- Calibration at the client's location

A request may contain multiple items.

The architecture must support different scheduling information for individual request items if required.

Do not assume that all equipment in a request necessarily has the same technical operation.

---

# 16. Client Date Confirmation

After Metrology proposes the calibration date, the relevant information becomes available to Commercial/Client according to the workflow.

The Client must be able to see the proposed date.

The Client can:

- Accept the proposed date
- Cancel the request if the proposed date is not suitable

The cancellation action must only be available when the request is in a cancellable state.

Cancellation must be recorded in the audit history.

---

# 17. Quotation

Commercial manages quotations.

A quotation may be associated with:

- Client
- Request
- Requested services
- Contract where applicable

Quotation functionality should support:

- Quotation number
- Date
- Client
- Request
- Amount/details where applicable
- Status
- Attached quotation document
- History

The exact pricing model should remain configurable.

---

# 18. Contract Management

Contracts are managed by Commercial.

A client may have multiple contracts.

A contract can be associated with the relevant client and calibration requests.

Contract lifecycle:

```text
Created
↓
Accepted by company
↓
Accepted by client
↓
Active
↓
Archived
```

The application must support contract document upload.

Contracts must be archived.

Contracts must remain searchable.

Contract information should include:

- Contract number
- Client
- Contract date
- Start date
- End date
- Status
- Associated requests
- Uploaded contract file
- Creation date
- Uploaded by
- Archive date where applicable

A request normally requires the necessary commercial acceptance/contract process before proceeding to the calibration operation.

---

# 19. Metrology Assignment

The Manager can assign calibration work to Metrology employees.

The system must support assignment of:

- Request
- Request item/equipment
- Calibration operation
- Technician

Example:

```text
Request #REQ-001

Equipment A → Technician Ahmed
Equipment B → Technician Karim
Equipment C → Technician Ahmed
```

The architecture should allow assignment at the appropriate level rather than assuming every request has only one technician.

---

# 20. Metrology Employees

Metrology employees should have access to their assigned work.

The dashboard should allow them to see:

- Assigned calibrations
- Upcoming calibrations
- Current calibrations
- Completed calibrations
- Pending reports
- Relevant equipment
- Relevant documents

The Manager can see all Metrology activities.

---

# 21. Calibration Operation

A calibration operation represents the technical execution of calibration.

It should contain:

- Request
- Request item
- Client
- Equipment/service
- Technician
- Manager/supervisor where applicable
- Calibration location
- Scheduled date
- Actual date
- Status
- Calibration material/equipment if tracked
- Report
- Notes
- History

The application does not calculate calibration results.

Technical results remain in the uploaded calibration report.

---

# 22. Calibration Report

The Metrology employee uploads the calibration report after performing the calibration.

Supported formats should include at minimum:

```text
PDF
DOC
DOCX
```

Additional formats may be supported if required.

The report must be stored securely.

Report metadata should include:

- Report number if applicable
- Request
- Calibration operation
- Equipment
- Uploaded by
- Upload date
- File name
- File type
- File size
- Status
- Version if required
- Archive state

The uploaded report is sent to the Manager for review.

---

# 23. Technical Results

The system should NOT recreate the technical content of the calibration report.

Do not implement:

- Measurement calculations
- Error calculations
- Uncertainty calculations
- Tolerance calculations
- Technical calibration formulas

unless explicitly requested later.

The uploaded report is the authoritative technical document.

---

# 24. Calibration Material / Reference Equipment

The application may manage the company's calibration materials/reference equipment.

The exact technical structure should remain flexible.

Potential information:

- Material/equipment name
- Reference
- Serial number
- Manufacturer
- Model
- Category
- Calibration date
- Expiration/validity date
- Status
- Location
- Supporting document
- Notes

The system should be designed so this module can later be expanded.

If a calibration material's validity expires, the system should support an appropriate warning/status.

Do not implement an automatic technical decision unless the business rule is explicitly confirmed.

---

# 25. Manager Review

When Metrology uploads the calibration report:

```text
Metrology
↓
Upload Report
↓
Manager notified
↓
Manager reviews report
```

The Manager can:

- Accept the report
- Reject/request correction
- Generate the certificate
- Upload the certificate
- Validate the certificate

If the report indicates calibration failure, the final certificate must reflect the result contained in the technical documentation.

The application must not independently determine Pass/Fail.

---

# 26. Calibration Certificate

The Manager generates the calibration certificate based on the calibration report.

The certificate is uploaded as a file.

Recommended format:

```text
PDF
```

The system must support certificate metadata:

- Certificate number
- Request
- Calibration operation
- Client
- Equipment
- Calibration report
- Generated/uploaded by
- Upload date
- Validation date
- Status
- Certificate file

Certificate numbers must be unique.

Example:

```text
CERT-2026-000001
CERT-2026-000002
```

Once validated, the certificate must become final.

The system should prevent modification/replacement of a validated certificate unless an explicit administrative correction workflow is implemented later.

---

# 27. Certificate Validation

Normal workflow:

```text
Calibration performed
↓
Report uploaded
↓
Manager reviews report
↓
Manager generates/uploads certificate
↓
Manager validates certificate
↓
Certificate becomes final
↓
Client can access/download certificate
```

Certificate validation must be recorded.

Store:

- Validator
- Validation date/time
- Certificate number
- Certificate status

---

# 28. Manager Absence / Delegation

The application should support a controlled fallback workflow if the Manager is unavailable.

Authorized Metrology personnel may be allowed to perform specific Manager actions when formally authorized.

This must NOT be an informal permission.

The system should support a configurable permission/delegation mechanism.

Example:

```text
Manager unavailable
↓
Authorized Metrology user
↓
Generate certificate
↓
Validate certificate
```

The authorization should be recorded in the audit trail.

The exact person(s) authorized to perform this fallback should be configurable by Admin/authorized management.

---

# 29. Document Management

All important documents must be stored and associated with their business entities.

Document categories include:

```text
Quotation
Contract
Calibration Report
Calibration Certificate
Supporting Document
```

Every document should have metadata.

Recommended fields:

```text
id
document_type
file_name
file_path
mime_type
file_size
uploaded_by
uploaded_at
related_entity
related_entity_id
status
archived_at
```

Use secure private storage where appropriate.

Do not expose private documents through publicly guessable URLs.

Access documents through authorized Laravel routes/controllers.

---

# 30. Archive

The application must provide an archive system.

Archived documents must remain searchable according to user permissions.

Users should be able to search by:

- Client
- Request number
- Contract number
- Certificate number
- Equipment
- Serial number
- Date
- Status
- Document type

The archive should preserve historical records rather than physically deleting them unless the Admin performs an authorized permanent deletion according to the company's retention policy.

---

# 31. Calibration History

The system should maintain the historical record of calibration operations.

Example:

```text
Equipment:
Pressure Gauge
Serial Number:
PG-4589

Calibration History

2024
Report → Completed
Certificate → CERT-2024-0012

2025
Report → Completed
Certificate → CERT-2025-0091

2026
Report → Completed
Certificate → CERT-2026-0045
```

Clients should only see their own relevant history.

Internal users may have broader access according to their role.

---

# 32. Notifications

The application must provide **in-app notifications**.

Email notifications are not required for the initial version.

Notifications should be generated for important events.

Examples:

### Client

- Request submitted
- Request accepted
- Date proposed
- Date changed
- Request cancelled
- Contract available
- Calibration completed
- Certificate validated
- Certificate available

### Commercial

- New request received
- Metrology proposed a date
- Client accepted date
- Client cancelled request
- Contract action required

### Metrology

- New request received
- Calibration assigned
- Schedule changed
- Work approaching
- Report required
- Report rejected/correction requested

### Manager

- Calibration report uploaded
- Report waiting for review
- Certificate action required
- Technical operation completed

Notifications must be stored in the database.

Users should have a notification center.

---

# 33. Dashboard

Each role should have a different dashboard.

## Client Dashboard

Display:

```text
Mes demandes
Demandes en cours
Demandes terminées
Demandes annulées
Certificats disponibles
Notifications
```

---

## Commercial Dashboard

Display:

```text
Nouvelles demandes
Demandes en traitement
Demandes transmises à la métrologie
Demandes en attente du client
Contrats actifs
Contrats arrivant à échéance
Notifications
```

---

## Metrology Dashboard

Display:

```text
Mes calibrations
Calibrations à venir
Calibrations en cours
Rapports à téléverser
Calibrations terminées
Notifications
```

---

## Manager Dashboard

Display:

```text
Calibrations en cours
Calibrations assignées
Rapports en attente
Certificats à générer
Certificats à valider
Charge de travail des techniciens
Historique
Notifications
```

---

## Admin Dashboard

Display system-level statistics:

```text
Utilisateurs
Clients
Demandes
Contrats
Calibrations
Certificats
Documents
Activity logs
```

---

# 34. Search and Filtering

All major modules must support search and filtering.

Examples:

```text
Search by client
Search by request number
Search by contract number
Search by certificate number
Search by serial number
Search by status
Search by date
Search by technician
Search by document type
```

Tables should support:

- Sorting
- Filtering
- Pagination
- Search
- Date filters
- Status filters

---

# 35. Audit Log

The system must maintain a detailed audit trail.

Important actions should record:

```text
User
Action
Entity
Entity ID
Old value where relevant
New value where relevant
Date/time
IP address where appropriate
```

Examples:

```text
Client created request
Commercial sent request to Metrology
Metrology scheduled calibration
Manager assigned technician
Metrology uploaded report
Manager generated certificate
Manager validated certificate
Client cancelled request
Commercial uploaded contract
```

Audit logs should not be editable by normal users.

---

# 36. Authorization

Use Laravel's authorization system.

Permissions must be enforced server-side.

Do not rely only on hiding buttons in React/Filament.

Example permissions:

```text
requests.view
requests.create
requests.update
requests.cancel
requests.send_to_metrology

quotations.view
quotations.create
quotations.update

contracts.view
contracts.create
contracts.upload
contracts.archive

calibrations.view
calibrations.assign
calibrations.schedule
calibrations.update

reports.view
reports.upload
reports.review

certificates.view
certificates.generate
certificates.upload
certificates.validate

users.view
users.create
users.update
users.disable

services.view
services.create
services.update
services.delete
```

Roles should receive default permission sets.

Admin has full permissions.

---

# 37. Role Rules

Default access model:

| Feature | Client | Commercial | Metrology | Manager | Admin |
|---|---:|---:|---:|---:|---:|
| Own requests | ✓ | | | | |
| All client requests | | ✓ | ✓ | ✓ | ✓ |
| Create request | ✓ | | | | |
| Send to Metrology | | ✓ | | | ✓ |
| Schedule calibration | | | ✓ | ✓ | ✓ |
| Assign technicians | | | | ✓ | ✓ |
| Upload reports | | | ✓ | ✓ | ✓ |
| Review reports | | | | ✓ | ✓ |
| Generate certificate | | | Limited | ✓ | ✓ |
| Validate certificate | | | Delegated | ✓ | ✓ |
| Manage contracts | | ✓ | | | ✓ |
| Manage services | | | | | ✓ |
| Manage users | | | | | ✓ |
| View audit logs | | | | | ✓ |

The exact permission matrix should be implemented using backend authorization.

---

# 38. Database Architecture

The application should use a relational database.

Recommended core entities:

```text
users
roles
permissions

clients

calibration_services

calibration_requests
calibration_request_items

quotations
contracts

calibration_operations
calibration_assignments

metrology_materials

documents

calibration_reports
calibration_certificates

notifications

audit_logs
```

Potential supporting tables:

```text
locations
status_histories
request_status_histories
contract_requests
material_assignments
```

Use normalized relationships.

Avoid storing complex business relationships as JSON when a relational structure is more appropriate.

---

# 39. Suggested Relationships

## Client

```text
Client
 ├── hasMany Requests
 ├── hasMany Contracts
 ├── hasMany Quotations
 └── hasMany Documents
```

## Request

```text
Request
 ├── belongsTo Client
 ├── hasMany RequestItems
 ├── hasMany CalibrationOperations
 ├── hasOne/hasMany Quotations
 ├── belongsTo Contract where applicable
 ├── hasMany Documents
 └── hasMany StatusHistory records
```

## Request Item

```text
RequestItem
 ├── belongsTo Request
 ├── belongsTo CalibrationService
 ├── hasMany CalibrationOperations
 └── hasMany Documents
```

## Calibration Operation

```text
CalibrationOperation
 ├── belongsTo Request
 ├── belongsTo RequestItem
 ├── belongsTo Technician/User
 ├── hasMany Documents
 ├── hasOne CalibrationReport
 └── hasOne CalibrationCertificate
```

## Contract

```text
Contract
 ├── belongsTo Client
 ├── hasMany Requests
 └── hasMany Documents
```

---

# 40. Technology Stack

## Backend

Use:

```text
Laravel
PHP
Relational database
Laravel Authentication
Laravel Authorization
Laravel Notifications
Laravel Storage
Laravel Queues if needed
```

Use current stable versions compatible with the project environment.

---

# 41. Frontend

Use:

```text
React
```

for the main client-facing/business application interface where appropriate.

Use **Filament** for internal administration/back-office functionality when it significantly reduces development complexity.

The architecture should avoid creating two completely independent applications unnecessarily.

A practical approach is:

```text
Laravel
│
├── API / backend
│
├── React application
│
└── Filament
      └── Internal administration/back-office
```

The final architecture should be chosen based on maintainability.

---

# 42. UI Requirements

The application should have a professional enterprise appearance.

Requirements:

- Responsive
- Desktop-first but mobile-friendly
- Clean dashboard
- Clear status indicators
- Professional tables
- Search and filters
- Consistent forms
- Clear confirmation dialogs
- Good empty states
- Accessible typography
- French localization
- Proper date formatting
- Proper number formatting
- French labels

Use a consistent design system.

Avoid excessive animations.

Prioritize usability for employees processing many requests.

---

# 43. French Localization

Use Laravel localization rather than hardcoding all UI strings.

Example:

```text
resources/lang/fr/
```

or the appropriate modern Laravel localization structure.

All validation messages must be French.

Example:

```text
Ce champ est obligatoire.
Le fichier doit être au format PDF.
La demande a été créée avec succès.
La demande a été annulée.
Le certificat a été validé avec succès.
```

---

# 44. File Upload Requirements

Files must be validated.

Validation should include:

- Allowed MIME types
- Maximum file size
- Filename sanitization
- Secure storage
- Authorization
- Virus/malware scanning integration point if available
- Download authorization

Never trust the original filename or MIME type.

Documents must not be directly accessible by unauthorized users.

---

# 45. Data Integrity

The system must enforce:

- Unique request numbers
- Unique contract numbers where applicable
- Unique certificate numbers
- Referential integrity
- Valid status transitions
- Authorized document access
- Authorized role actions
- No modification of finalized certificates
- No access to another client's private data

Use database transactions for important multi-step operations.

Example:

```text
Create Request
+
Create Request Items
+
Create History Entry
+
Create Notification
```

These operations should be transaction-safe.

---

# 46. Request Cancellation

Clients can cancel their request when the business workflow allows cancellation.

Cancellation must:

- Require confirmation
- Record the cancellation
- Record the user
- Record date/time
- Update request status
- Notify relevant internal users

A request that has already reached an irreversible technical stage should not be cancellable through the normal Client interface.

---

# 47. Document Immutability

Once a certificate is validated:

```text
Certificate = FINAL
```

Normal users must not be able to modify it.

If corrections are required later, the architecture should allow a future:

```text
Certificate correction / replacement workflow
```

without silently overwriting historical records.

---

# 48. Security

Implement:

- CSRF protection
- Authentication
- Authorization
- Password hashing
- Rate limiting where appropriate
- Secure file access
- Input validation
- SQL injection protection through Laravel ORM/query builder
- XSS protection
- Secure session configuration
- Authorization checks on every sensitive endpoint
- Audit logging

Never trust frontend permissions.

---

# 49. API

If React communicates with Laravel through an API, use a clean REST-style API.

Suggested endpoint structure:

```text
/api/auth/...

/api/client/requests/...
/api/client/contracts/...
/api/client/certificates/...

/api/commercial/requests/...
/api/commercial/quotations/...
/api/commercial/contracts/...

/api/metrology/operations/...
/api/metrology/reports/...

/api/manager/assignments/...
/api/manager/certificates/...

/api/admin/users/...
/api/admin/services/...
/api/admin/equipment/...
```

Do not expose endpoints that bypass authorization.

---

# 50. Seed Data

Create development seeders for:

## Roles

```text
Client
Commercial
Metrology
Manager
Admin
```

## Example users

Create development users for every role.

## Example calibration services

Use clearly fake/demo data.

Do not use real customer information.

---

# 51. Development Environment

The project must be easy to run locally.

Provide:

```text
.env.example
README.md
Database migrations
Seeders
Factories where useful
Installation instructions
Build instructions
```

The README must explain:

```text
composer install
npm install
php artisan migrate
php artisan db:seed
npm run build / npm run dev
php artisan storage:link where applicable
```

Use environment variables for:

- Database
- Application URL
- Storage
- Mail configuration
- Queue configuration
- Other external services

Never commit secrets.

---

# 52. Testing Requirements

Implement automated tests for critical workflows.

At minimum:

## Authentication

- Login
- Logout
- Unauthorized access

## Requests

- Client creates request
- Request contains multiple items
- Commercial receives request
- Commercial sends request to Metrology
- Client cancellation rules

## Scheduling

- Metrology schedules calibration
- Authorized users can modify scheduling
- Unauthorized users cannot schedule

## Reports

- Metrology uploads report
- Manager receives report
- Unauthorized users cannot upload reports

## Certificates

- Manager generates certificate
- Manager validates certificate
- Validated certificate cannot be modified normally
- Client can access validated certificate
- Unauthorized client cannot access another client's certificate

## Contracts

- Commercial creates/uploads contract
- Client can access relevant contract
- Other clients cannot access it

## Authorization

Test every major role boundary.

---

# 53. Auditability

Every important business action should be traceable.

The system should answer:

```text
Who created this request?
Who sent it to Metrology?
Who scheduled it?
Who assigned the technician?
Who uploaded the report?
Who reviewed it?
Who generated the certificate?
Who validated it?
When did each action happen?
```

This is a core requirement.

---

# 54. Important Architecture Rule

Do not over-engineer the technical calibration component.

The application is primarily a:

```text
Workflow Management
+
Document Management
+
Scheduling
+
Commercial Management
+
User/Role Management
+
Audit System
```

It is NOT initially a laboratory measurement/calculation engine.

---

# 55. Initial End-to-End Workflow

The complete initial workflow should be implemented as:

```text
CLIENT
  │
  │ Create account/login
  ↓
Browse calibration services
  │
  ↓
Select equipment/services
  │
  ↓
Create calibration request
  │
  ↓
Submit request
  │
  ▼
COMMERCIAL
  │
  │ Review request
  ↓
Send to Metrology
  │
  ▼
METROLOGY
  │
  │ Review complete request
  ↓
Determine calibration schedule
  ↓
Propose calibration date/location
  │
  ▼
CLIENT
  │
  ├── Accept
  │
  └── Cancel if date unsuitable
  │
  ▼
COMMERCIAL
  │
  │ Commercial/contract process
  ↓
Contract uploaded/archived
  │
  ▼
METROLOGY / MANAGER
  │
  │ Assign technicians
  ↓
Calibration operation
  ↓
Metrology uploads calibration report
  │
  ▼
MANAGER
  │
  │ Review report
  ↓
Generate/upload certificate
  ↓
Validate certificate
  │
  ▼
CLIENT
  │
  │ View/download certificate
  ↓
REQUEST COMPLETED
```

---

# 56. UI Navigation

## Client

```text
Tableau de bord
Mes demandes
Nouvelle demande
Mes contrats
Mes certificats
Historique
Notifications
Mon profil
Déconnexion
```

## Commercial

```text
Tableau de bord
Demandes
Devis
Contrats
Clients
Documents
Notifications
Mon profil
Déconnexion
```

## Metrology

```text
Tableau de bord
Mes calibrations
Planification
Demandes
Rapports
Matériel
Documents
Notifications
Mon profil
Déconnexion
```

## Manager

```text
Tableau de bord
Calibrations
Planification
Affectations
Rapports
Certificats
Matériel
Historique
Notifications
Mon profil
Déconnexion
```

## Admin

```text
Tableau de bord
Utilisateurs
Rôles et permissions
Clients
Services de calibration
Équipements
Documents
Archives
Journaux d'activité
Paramètres
Mon profil
Déconnexion
```

---

# 57. Important Terminology

Use consistent French terminology throughout the application.

Preferred terms:

```text
Client
Commercial
Métrologie
Responsable / Manager
Administrateur
Demande de calibration
Équipement
Service de calibration
Opération de calibration
Planification
Affectation
Technicien
Rapport de calibration
Certificat de calibration
Contrat
Devis
Document
Archive
Notification
Historique
Validation
Annulation
En attente
Terminée
```

Avoid mixing English and French in the UI.

For example, do not display:

```text
Calibration Request
Dashboard
Report Upload
Certificate Validation
```

Use:

```text
Demande de calibration
Tableau de bord
Téléversement du rapport
Validation du certificat
```

---

# 58. Development Priority

Build the application in phases.

## Phase 1 — Foundation

- Laravel setup
- React setup
- Authentication
- Roles
- Permissions
- Database architecture
- French localization
- Base UI

## Phase 2 — Client

- Client accounts
- Service catalog
- Request creation
- Request tracking
- Cancellation
- Notifications

## Phase 3 — Commercial

- Request management
- Metrology transfer
- Quotations
- Contract management
- Contract archive

## Phase 4 — Metrology

- Scheduling
- Calibration operations
- Technician assignments
- Material/equipment
- Report uploads

## Phase 5 — Manager

- Work assignment
- Report review
- Certificate generation/upload
- Certificate validation
- Manager dashboard

## Phase 6 — Documents & Archive

- Secure document storage
- Search
- Archive
- Calibration history

## Phase 7 — Audit & Notifications

- Audit logs
- In-app notifications
- Activity history

## Phase 8 — Testing & Production

- Automated tests
- Security review
- Authorization review
- File security review
- Performance optimization
- Production deployment documentation

---

# 59. Agent Instructions

The coding agent must:

1. Understand the complete workflow before implementing it.
2. Do not invent technical calibration calculations.
3. Keep technical calibration information inside uploaded reports/documents.
4. Implement strict role-based authorization.
5. Implement authorization server-side.
6. Keep all user-facing content in French.
7. Keep source code maintainable and documented.
8. Use Laravel conventions.
9. Use React where it provides value.
10. Use Filament for suitable internal administration/back-office functionality.
11. Avoid unnecessary duplication between React and Filament.
12. Use database migrations for all schema changes.
13. Use seeders for development data.
14. Use Form Requests/API validation where appropriate.
15. Use Policies/Gates/Permissions for authorization.
16. Use Services/Actions for complex business workflows instead of putting everything inside controllers.
17. Use database transactions for critical multi-record operations.
18. Store documents securely.
19. Never expose private documents without authorization.
20. Maintain a complete audit trail.
21. Do not silently delete historical business records.
22. Do not allow arbitrary status changes.
23. Make the system extensible because some business rules are intentionally not finalized yet.
24. Do not hardcode business-specific values that should be configurable.
25. Build the database and workflow around the business process described in this specification.

---

# 60. Expected Deliverables

The completed project should include:

```text
Laravel backend
React frontend where appropriate
Filament administration/back-office where appropriate
Database migrations
Models
Relationships
Factories
Seeders
Policies
Permissions
Authentication
Authorization
Controllers/API
Services/Actions
Form validation
File management
Notifications
Audit logs
Dashboards
French localization
Automated tests
README
.env.example
Deployment documentation
```

The final application must provide a coherent end-to-end workflow from:

```text
Client request
→ Commercial
→ Metrology
→ Scheduling
→ Calibration
→ Report
→ Manager
→ Certificate
→ Validation
→ Client
```

without requiring users to manually manage the workflow outside the application for the core process.