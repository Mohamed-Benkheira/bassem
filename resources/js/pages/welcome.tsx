import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    CheckCircle2,
    Clock,
    Cpu,
    FileCheck,
    FileSpreadsheet,
    FileText,
    KeyRound,
    LogIn,
    Shield,
    Sparkles,
    UserPlus,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import type { CalibrationService } from '@/types';

interface Props {
    services: CalibrationService[];
}

export default function Welcome({ services }: Props) {
    const { auth } = usePage<{ auth: { user?: { name: string; role_label?: string } } }>().props;
    const { t, isEnglish } = useTranslation();

    return (
        <>
            <Head title={isEnglish ? 'Calibration Equipment Management Web Application' : 'Application Web de Gestion de la Calibration des Équipements'} />

            <div className="min-h-screen bg-background text-foreground flex flex-col">
                {/* Navbar */}
                <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
                        <AppLogo />

                        <nav className="flex items-center gap-3">
                            <LanguageSwitcher variant="ghost" />
                            {auth.user ? (
                                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                    <Link href="/dashboard">
                                        {isEnglish ? 'Access My Dashboard' : 'Accéder à mon tableau de bord'} ({auth.user.role_label || (isEnglish ? 'Portal' : 'Espace')})
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" asChild>
                                        <Link href="/login">
                                            <LogIn className="mr-2 h-4 w-4" />
                                            {t('login', 'Connexion')}
                                        </Link>
                                    </Button>
                                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                                        <Link href="/register">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            {t('register', 'Créer un compte client')}
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden py-16 lg:py-24 border-b bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/20">
                    <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 shadow-sm">
                            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                            {isEnglish
                                ? 'Integrated Metrology Platform ISO 9001 / ISO/IEC 17025'
                                : 'Plateforme Métrologique Intégrée ISO 9001 / ISO/IEC 17025'}
                        </span>

                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                            {isEnglish
                                ? 'Lifecycle Management for Equipment Calibrations & Standards'
                                : 'Gestion du Cycle de Vie des Calibrations & Étalonnages'}
                        </h1>

                        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
                            {isEnglish
                                ? 'Connect your clients, commercial team, and metrology technicians. From the initial request through to the issuance of officially validated certificates.'
                                : 'Connectez vos clients, le service commercial et les techniciens métrologues. De la demande initiale jusqu\'à la délivrance des certificats officiels validés.'}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                            {auth.user ? (
                                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md">
                                    <Link href="/dashboard">
                                        {isEnglish ? 'Open My Workspace' : 'Ouvrir mon espace de travail'}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md">
                                        <Link href="/register">
                                            {isEnglish ? 'Request a Calibration' : 'Faire une demande de calibration'}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline">
                                        <Link href="/login">
                                            {isEnglish ? 'Staff & Technicians Login' : 'Espace collaborateurs'}
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Workflow Architecture Banner */}
                <section className="py-12 bg-muted/20 border-b">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold tracking-tight">
                                {isEnglish
                                    ? 'Rigorous & Transparent Metrological Process'
                                    : 'Processus Métrologique Rigoureux & Transparent'}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isEnglish
                                    ? 'Digital workflow compliant with industrial traceability requirements'
                                    : 'Workflow numérique conforme aux exigences de traçabilité industrielle'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs">
                            <div className="p-3 rounded-lg border bg-background flex flex-col items-center">
                                <FileText className="h-5 w-5 text-blue-600 mb-1" />
                                <span className="font-semibold">{isEnglish ? '1. Request' : '1. Demande'}</span>
                                <span className="text-[10px] text-muted-foreground">{isEnglish ? 'External client' : 'Client externe'}</span>
                            </div>
                            <div className="p-3 rounded-lg border bg-background flex flex-col items-center">
                                <FileCheck className="h-5 w-5 text-indigo-600 mb-1" />
                                <span className="font-semibold">{isEnglish ? '2. Commercial' : '2. Commercial'}</span>
                                <span className="text-[10px] text-muted-foreground">{isEnglish ? 'Quote & Contract' : 'Devis & Contrat'}</span>
                            </div>
                            <div className="p-3 rounded-lg border bg-background flex flex-col items-center">
                                <Clock className="h-5 w-5 text-purple-600 mb-1" />
                                <span className="font-semibold">{isEnglish ? '3. Planning' : '3. Planification'}</span>
                                <span className="text-[10px] text-muted-foreground">{isEnglish ? 'Dates & Locations' : 'Dates & Lieux'}</span>
                            </div>
                            <div className="p-3 rounded-lg border bg-background flex flex-col items-center">
                                <Wrench className="h-5 w-5 text-amber-600 mb-1" />
                                <span className="font-semibold">{isEnglish ? '4. Calibration' : '4. Étalonnage'}</span>
                                <span className="text-[10px] text-muted-foreground">{isEnglish ? 'Technician' : 'Technicien'}</span>
                            </div>
                            <div className="p-3 rounded-lg border bg-background flex flex-col items-center">
                                <FileSpreadsheet className="h-5 w-5 text-blue-600 mb-1" />
                                <span className="font-semibold">{isEnglish ? '5. Report' : '5. Rapport'}</span>
                                <span className="text-[10px] text-muted-foreground">{isEnglish ? 'Report uploaded' : 'Rapport déposé'}</span>
                            </div>
                            <div className="p-3 rounded-lg border bg-background flex flex-col items-center">
                                <Shield className="h-5 w-5 text-emerald-600 mb-1" />
                                <span className="font-semibold">{isEnglish ? '6. Validation' : '6. Validation'}</span>
                                <span className="text-[10px] text-muted-foreground">{isEnglish ? 'Metrology Manager' : 'Responsable Métrologie'}</span>
                            </div>
                            <div className="p-3 rounded-lg border bg-background flex flex-col items-center">
                                <Award className="h-5 w-5 text-indigo-600 mb-1" />
                                <span className="font-semibold">{isEnglish ? '7. Certificate' : '7. Certificat'}</span>
                                <span className="text-[10px] text-muted-foreground">{isEnglish ? 'Client download' : 'Client téléchargement'}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Calibration Catalog Preview */}
                <section className="py-16 max-w-6xl mx-auto px-6 w-full flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                {isEnglish ? 'Our Calibration Domains & Services' : 'Nos Domaines d\'Étalonnage & Services'}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {isEnglish
                                    ? 'Measurement capabilities and traceability available in laboratory and on client sites.'
                                    : 'Capacités de mesure et raccordements disponibles en laboratoire et sur site client.'}
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/register">
                                {isEnglish ? 'Request a Calibration' : 'Demander un étalonnage'}
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((svc) => (
                            <Card key={svc.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                            {svc.measurement_category}
                                        </span>
                                        <span className="font-mono text-xs text-muted-foreground">
                                            {svc.code}
                                        </span>
                                    </div>
                                    <CardTitle className="text-base font-semibold mt-2">
                                        {svc.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {isEnglish ? 'Equipment' : 'Équipements'} : {svc.equipment_type}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs">
                                    <p className="text-muted-foreground line-clamp-3">
                                        {svc.description}
                                    </p>
                                    <div className="pt-2 border-t text-muted-foreground">
                                        <strong>{isEnglish ? 'Modality' : 'Modalité'} :</strong> {svc.calibration_type}
                                    </div>
                                    {svc.method && (
                                        <div className="text-muted-foreground">
                                            <strong>{isEnglish ? 'Standard' : 'Norme'} :</strong> {svc.method}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Demonstration Credentials Box */}
                <section className="border-t bg-muted/40 py-12">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="rounded-xl border bg-background p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <KeyRound className="h-5 w-5 text-blue-600" />
                                <h3 className="font-bold text-base text-foreground">
                                    {isEnglish
                                        ? 'Demonstration Accounts (All Roles Available)'
                                        : 'Comptes de Démonstration (Tous Rôles Disponibles)'}
                                </h3>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">
                                {isEnglish
                                    ? 'The default password for all test accounts is:'
                                    : 'Le mot de passe par défaut pour l\'ensemble des comptes de test est :'} <strong>password</strong>
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                                <div className="p-3 rounded border bg-muted/20">
                                    <div className="font-semibold text-foreground">
                                        {isEnglish ? 'Industrial Client' : 'Client Industriel'}
                                    </div>
                                    <div className="text-muted-foreground font-mono text-[11px] mt-0.5">client@client-industriel.test</div>
                                </div>
                                <div className="p-3 rounded border bg-muted/20">
                                    <div className="font-semibold text-foreground">
                                        {isEnglish ? 'Commercial Team' : 'Service Commercial'}
                                    </div>
                                    <div className="text-muted-foreground font-mono text-[11px] mt-0.5">commercial@calibration.test</div>
                                </div>
                                <div className="p-3 rounded border bg-muted/20">
                                    <div className="font-semibold text-foreground">
                                        {isEnglish ? 'Metrology Technician' : 'Technicien Métrologue'}
                                    </div>
                                    <div className="text-muted-foreground font-mono text-[11px] mt-0.5">metrologie@calibration.test</div>
                                </div>
                                <div className="p-3 rounded border bg-muted/20">
                                    <div className="font-semibold text-foreground">
                                        {isEnglish ? 'Interim Delegated Technician' : 'Technicien Délégué (Intérim)'}
                                    </div>
                                    <div className="text-muted-foreground font-mono text-[11px] mt-0.5">metrologie.adjoint@calibration.test</div>
                                </div>
                                <div className="p-3 rounded border bg-muted/20">
                                    <div className="font-semibold text-foreground">
                                        {isEnglish ? 'Metrology Manager' : 'Responsable Métrologie'}
                                    </div>
                                    <div className="text-muted-foreground font-mono text-[11px] mt-0.5">manager@calibration.test</div>
                                </div>
                                <div className="p-3 rounded border bg-muted/20">
                                    <div className="font-semibold text-foreground">
                                        {isEnglish ? 'System Administrator' : 'Directeur Admin Système'}
                                    </div>
                                    <div className="text-muted-foreground font-mono text-[11px] mt-0.5">admin@calibration.test</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t py-6 text-center text-xs text-muted-foreground">
                    {isEnglish
                        ? 'Calibration Equipment Management Web Application • All rights reserved.'
                        : 'Application Web de Gestion de la Calibration des Équipements • Tous droits réservés.'}
                </footer>
            </div>
        </>
    );
}
