import type { User } from './auth';

export type Role = {
    id: number;
    name: string;
    label: string;
    description?: string;
};

export type Client = {
    id: number;
    user_id?: number | null;
    company_name: string;
    contact_name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    postal_code?: string | null;
    tax_number?: string | null;
    notes?: string | null;
    requests_count?: number;
    contracts_count?: number;
    quotations_count?: number;
    requests?: CalibrationRequest[];
    contracts?: Contract[];
};

export type CalibrationService = {
    id: number;
    name: string;
    code: string;
    equipment_type: string;
    description?: string | null;
    measurement_category: string;
    calibration_type: string;
    method?: string | null;
    required_info?: string | null;
    is_active: boolean;
};

export type CalibrationRequestItem = {
    id: number;
    calibration_request_id: number;
    calibration_service_id: number;
    equipment_name: string;
    serial_number?: string | null;
    brand?: string | null;
    model?: string | null;
    measurement_range?: string | null;
    tolerance?: string | null;
    quantity: number;
    specific_notes?: string | null;
    status: string;
    service?: CalibrationService;
    operations?: CalibrationOperation[];
};

export type RequestStatusHistory = {
    id: number;
    calibration_request_id: number;
    from_status?: string | null;
    to_status: string;
    from_status_label?: string | null;
    to_status_label: string;
    changed_by_id?: number | null;
    comment?: string | null;
    created_at: string;
    changed_by?: User;
};

export type CalibrationRequest = {
    id: number;
    request_number: string;
    client_id: number;
    status: string;
    status_label: string;
    preferred_date?: string | null;
    preferred_location: string;
    client_notes?: string | null;
    internal_notes?: string | null;
    proposed_date?: string | null;
    proposed_location?: string | null;
    scheduled_date?: string | null;
    scheduled_location?: string | null;
    cancellation_reason?: string | null;
    contract_id?: number | null;
    created_at: string;
    updated_at: string;
    client?: Client;
    contract?: Contract | null;
    items?: CalibrationRequestItem[];
    items_count?: number;
    operations?: CalibrationOperation[];
    quotations?: Quotation[];
    status_histories?: RequestStatusHistory[];
    certificates?: CalibrationCertificate[];
};

export type Contract = {
    id: number;
    contract_number: string;
    client_id: number;
    start_date?: string | null;
    end_date?: string | null;
    status: string;
    document_path?: string | null;
    document_name?: string | null;
    notes?: string | null;
    uploaded_by_id?: number | null;
    archived_at?: string | null;
    created_at: string;
    client?: Client;
    uploaded_by?: User;
    requests?: CalibrationRequest[];
};

export type Quotation = {
    id: number;
    quotation_number: string;
    client_id: number;
    calibration_request_id?: number | null;
    amount: number | string;
    currency: string;
    status: string;
    document_path?: string | null;
    document_name?: string | null;
    validity_date?: string | null;
    notes?: string | null;
    created_at: string;
    client?: Client;
    request?: CalibrationRequest;
    created_by?: User;
};

export type CalibrationOperation = {
    id: number;
    operation_number: string;
    calibration_request_id: number;
    calibration_request_item_id: number;
    client_id: number;
    technician_id?: number | null;
    supervisor_id?: number | null;
    scheduled_date?: string | null;
    actual_date?: string | null;
    location: string;
    status: string;
    status_label: string;
    notes?: string | null;
    created_at: string;
    client?: Client;
    item?: CalibrationRequestItem;
    request?: CalibrationRequest;
    technician?: User | null;
    supervisor?: User | null;
    report?: CalibrationReport | null;
    certificate?: CalibrationCertificate | null;
};

export type CalibrationReport = {
    id: number;
    report_number: string;
    calibration_operation_id: number;
    calibration_request_id: number;
    calibration_request_item_id: number;
    uploaded_by_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    status: string;
    status_label: string;
    review_notes?: string | null;
    reviewed_by_id?: number | null;
    reviewed_at?: string | null;
    created_at: string;
    operation?: CalibrationOperation;
    request?: CalibrationRequest;
    item?: CalibrationRequestItem;
    uploaded_by?: User;
    technician?: User;
    reviewed_by?: User;
};

export type CalibrationCertificate = {
    id: number;
    certificate_number: string;
    calibration_operation_id: number;
    calibration_request_id: number;
    calibration_request_item_id: number;
    client_id: number;
    calibration_report_id?: number | null;
    generated_by_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    status: string;
    status_label: string;
    validated_by_id?: number | null;
    validated_at?: string | null;
    is_final: boolean;
    created_at: string;
    client?: Client;
    item?: CalibrationRequestItem;
    request?: CalibrationRequest;
    operation?: CalibrationOperation;
    report?: CalibrationReport;
    generated_by?: User;
    validated_by?: User;
};

export type MetrologyMaterial = {
    id: number;
    name: string;
    reference_code: string;
    serial_number?: string | null;
    manufacturer?: string | null;
    model?: string | null;
    category: string;
    calibration_date?: string | null;
    expiration_date?: string | null;
    status: string;
    status_label: string;
    is_expired?: boolean;
    location?: string | null;
    notes?: string | null;
};

export type Document = {
    id: number;
    document_type: string;
    document_type_label: string;
    file_name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    formatted_file_size: string;
    uploaded_at?: string | null;
    status: string;
    uploaded_by?: User;
    documentable?: unknown;
};

export type AuditLog = {
    id: number;
    user_id?: number | null;
    action: string;
    entity_type: string;
    model_type?: string;
    entity_id?: number | null;
    old_values?: Record<string, unknown> | null;
    new_values?: Record<string, unknown> | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
    user?: User;
};

export type InAppNotification = {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        title?: string;
        message?: string;
        url?: string;
        type?: 'info' | 'success' | 'warning' | 'alert';
        created_at?: string;
    };
    read_at?: string | null;
    created_at: string;
};
