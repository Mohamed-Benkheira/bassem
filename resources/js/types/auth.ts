export type User = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string;
    role?: string | { name?: string; label?: string } | null;
    role_name?: string | null;
    role_label?: string | null;
    is_delegated_manager?: boolean;
    can_manage_certificates?: boolean;
    client?: {
        id: number;
        company_name: string;
        contact_name: string;
        email: string;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        postal_code?: string | null;
        tax_number?: string | null;
    } | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
