import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: string;
    label?: string;
    className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
    const { t, isEnglish } = useTranslation();

    const getVariantAndClass = () => {
        switch (status) {
            case 'SUBMITTED':
                return {
                    label: isEnglish ? 'Submitted' : (label || 'Soumise'),
                    bg: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                };
            case 'SENT_TO_METROLOGY':
                return {
                    label: isEnglish ? 'Sent to Metrology' : (label || 'Transmise à la métrologie'),
                    bg: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300'
                };
            case 'DATE_PROPOSED':
                return {
                    label: isEnglish ? 'Date Proposed' : (label || 'Date proposée'),
                    bg: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                };
            case 'WAITING_CLIENT_CONFIRMATION':
                return {
                    label: isEnglish ? 'Awaiting Client Confirmation' : (label || 'En attente du client'),
                    bg: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                };
            case 'ACCEPTED':
                return {
                    label: isEnglish ? 'Accepted' : (label || 'Acceptée'),
                    bg: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300'
                };
            case 'CONTRACTED':
                return {
                    label: isEnglish ? 'Contracted' : (label || 'Sous contrat'),
                    bg: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300'
                };
            case 'SCHEDULED':
                return {
                    label: isEnglish ? 'Scheduled' : (label || 'Planifiée'),
                    bg: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300'
                };
            case 'ASSIGNED':
                return {
                    label: isEnglish ? 'Assigned' : (label || 'Affectée'),
                    bg: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300'
                };
            case 'IN_CALIBRATION':
            case 'IN_PROGRESS':
                return {
                    label: isEnglish ? 'In Progress' : (label || 'En cours'),
                    bg: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                };
            case 'REPORT_UPLOADED':
                return {
                    label: isEnglish ? 'Report Uploaded' : (label || 'Rapport téléversé'),
                    bg: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                };
            case 'REPORT_REJECTED':
                return {
                    label: isEnglish ? 'Needs Correction' : (label || 'Rapport à corriger'),
                    bg: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300'
                };
            case 'REJECTED':
                return {
                    label: isEnglish ? 'Rejected' : (label || 'Rejetée'),
                    bg: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300'
                };
            case 'WAITING_CERTIFICATE':
            case 'CERTIFICATE_GENERATED':
                return {
                    label: isEnglish ? 'Certificate Generated' : (label || 'Certificat généré'),
                    bg: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300'
                };
            case 'CERTIFICATE_VALIDATED':
            case 'COMPLETED':
            case 'VALIDATED':
            case 'ACTIVE':
            case 'VALID':
            case 'APPROVED':
                return {
                    label: isEnglish ? 'Validated / Completed' : (label || 'Validé / Terminée'),
                    bg: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                };
            case 'OPERATIONAL':
                return {
                    label: isEnglish ? 'Operational' : (label || 'Opérationnel'),
                    bg: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                };
            case 'IN_MAINTENANCE':
                return {
                    label: isEnglish ? 'In Maintenance' : (label || 'En maintenance'),
                    bg: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                };
            case 'OUT_OF_ORDER':
                return {
                    label: isEnglish ? 'Out of Order' : (label || 'Hors service'),
                    bg: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                };
            case 'EXPIRED':
                return {
                    label: isEnglish ? 'Expired' : (label || 'Expiré'),
                    bg: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                };
            case 'CANCELLED':
                return {
                    label: isEnglish ? 'Cancelled' : (label || 'Annulée'),
                    bg: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
                };
            case 'DRAFT':
                return {
                    label: isEnglish ? 'Draft' : (label || 'Brouillon'),
                    bg: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                };
            default:
                return { label: label || status, bg: 'bg-muted text-muted-foreground' };
        }
    };

    const config = getVariantAndClass();

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
                config.bg,
                className
            )}
        >
            {config.label}
        </span>
    );
}
