import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { router } from '@inertiajs/react';
import ErrorBoundary from '@/Components/ErrorBoundary';
import { Toaster } from '@/Components/ui/toaster';
import { toast } from '@/Components/ui/use-toast';
import { sanitizeForReact } from '@/lib/utils';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Global error handlers for debugging
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Special handling for Symbol conversion errors
    if (event.error?.message?.includes('Cannot convert a Symbol value to a string')) {
        console.error('Symbol conversion error detected. This often occurs with Radix UI components.');
        console.error('Check props passed to Button components with asChild prop.');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Add Symbol detection in development
if (process.env.NODE_ENV === 'development') {
    // Override console.error to catch Symbol-related errors early
    const originalError = console.error;
    console.error = (...args: any[]) => {
        const errorString = args.join(' ');
        if (errorString.includes('Symbol') || errorString.includes('Cannot convert')) {
            console.warn('⚠️ Symbol-related error detected:', errorString);
            console.trace('Stack trace for Symbol error:');
        }
        originalError.apply(console, args);
    };
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        // Sanitize props to ensure no Symbol values are passed to the app
        const safeProps = sanitizeForReact(props);
        
        if (process.env.NODE_ENV === 'development' && props !== safeProps) {
            console.warn('App props contained Symbol values and were sanitized', {
                originalProps: props,
                sanitizedProps: safeProps
            });
        }

        root.render(
            <ErrorBoundary>
                <App {...safeProps} />
                <Toaster />
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// Configuration globale des gestionnaires d'erreur Inertia
router.on('error', (event) => {
    const errors = event.detail.errors;
    console.error('Inertia Global Error:', errors);
    
    // Pour les erreurs globales non gérées, on peut afficher un toast générique
    // Les pages individuelles devraient gérer leurs propres erreurs avec le hook useErrorHandler
    if (Object.keys(errors).length > 0) {
        const firstErrorKey = Object.keys(errors)[0];
        const firstError = errors[firstErrorKey];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        
        toast({
            title: "Erreur de validation",
            description: errorMessage || "Une erreur de validation s'est produite",
            variant: "destructive",
        });
    }
});
