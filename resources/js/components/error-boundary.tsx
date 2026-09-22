import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Erreur non gérée dans l\'application:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
                    <div className="max-w-md w-full rounded-xl border border-destructive/30 bg-card p-6 shadow-lg text-center space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">
                            Une erreur est survenue lors du chargement
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {this.state.error?.message || 'Une exception inattendue s\'est produite dans l\'interface.'}
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Recharger l'application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
