import { Head, router } from '@inertiajs/react';
import { Archive, Download, FileSpreadsheet, FileText, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Document } from '@/types';

interface Props {
    documents: {
        data: Document[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    documentTypes: Record<string, string>;
    filters: {
        search?: string;
        document_type?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function AdminArchivesIndex({ documents, documentTypes, filters }: Props) {
    const { tr, formatDate } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [docType, setDocType] = useState(filters.document_type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: tr('Archives Documentaires', 'Document Archives'), href: '/admin/archives' },
    ];

    const getDocTypeLabel = (key: string, defaultLabel: string) => {
        const docTypeLabels: Record<string, string> = {
            certificate: tr('Certificat d\'étalonnage', 'Calibration Certificate'),
            report: tr('Rapport d\'intervention', 'Intervention Report'),
            quotation: tr('Devis commercial', 'Commercial Quotation'),
            contract: tr('Contrat cadre', 'Framework Contract'),
            procedure: tr('Procédure technique', 'Technical Procedure'),
        };
        return docTypeLabels[key] || defaultLabel;
    };

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/archives',
            {
                search: search || undefined,
                document_type: docType === 'all' ? undefined : docType,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={tr('Archives Documentaires - Admin', 'Document Archives - Admin')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {tr('Archives Documentaires Sécurisées', 'Secure Document Archives')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {tr('Section 30 : Conservation et recherche multi-critères des certificats, contrats, rapports et devis.', 'Section 30: Multi-criteria preservation and search for certificates, contracts, reports, and quotations.')}
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleFilter} className="flex flex-col gap-4">
                            <div className="grid gap-4 sm:grid-cols-4">
                                <div className="sm:col-span-2">
                                    <Input
                                        placeholder={tr('Rechercher par client, n° certificat, n° contrat, équipement, n° série...', 'Search by client, certificate no., contract no., equipment, serial no....')}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Select value={docType} onValueChange={setDocType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={tr('Type de document', 'Document type')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{tr('Tous les types', 'All types')}</SelectItem>
                                            {Object.entries(documentTypes).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {getDocTypeLabel(key, label)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" variant="secondary" className="w-full">
                                        <Filter className="mr-2 h-4 w-4" />
                                        {tr('Rechercher', 'Search')}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Archive className="h-4 w-4 text-blue-600" />
                            {tr('Documents archivés', 'Archived documents')} ({documents.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {documents.data.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">
                                {tr('Aucun document ne correspond aux critères d\'archivage.', 'No documents match the archival criteria.')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-3">{tr('Fichier', 'File')}</th>
                                            <th className="px-6 py-3">{tr('Catégorie', 'Category')}</th>
                                            <th className="px-6 py-3">{tr('Taille', 'Size')}</th>
                                            <th className="px-6 py-3">{tr('Téléversé par', 'Uploaded by')}</th>
                                            <th className="px-6 py-3">{tr('Date d\'archivage', 'Archive date')}</th>
                                            <th className="px-6 py-3">{tr('Statut', 'Status')}</th>
                                            <th className="px-6 py-3 text-right">{tr('Télécharger', 'Download')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {documents.data.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-muted/20">
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    {doc.file_name}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted">
                                                        {getDocTypeLabel(doc.document_type, doc.document_type_label)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                                    {doc.formatted_file_size}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {doc.uploaded_by?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    {doc.uploaded_at ? formatDate(doc.uploaded_at) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={doc.status} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" variant="outline" asChild className="h-8">
                                                        <a href={`/documents/${doc.id}/download`} target="_blank" rel="noreferrer">
                                                            <Download className="mr-1.5 h-3.5 w-3.5" />
                                                            {tr('Télécharger', 'Download')}
                                                        </a>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
