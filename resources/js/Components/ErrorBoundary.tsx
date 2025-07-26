import React, { Component, ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import SafeButton from '@/Components/SafeButton';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isSymbolError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      isSymbolError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a Symbol conversion error
    const isSymbolError = error.message.includes('Cannot convert a Symbol value to a string') ||
                          error.message.includes('Symbol') ||
                          error.stack?.includes('Symbol');
    
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, isSymbolError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error info for detailed debugging
    this.setState({ errorInfo });
    
    // Log component stack for Symbol errors
    if (this.state.isSymbolError) {
      console.error('Symbol conversion error detected in component stack:', errorInfo.componentStack);
      
      // Log additional debugging information
      if (process.env.NODE_ENV === 'development') {
        console.group('Symbol Error Debugging Information');
        console.log('Error Message:', error.message);
        console.log('Error Stack:', error.stack);
        console.log('Component Stack:', errorInfo.componentStack);
        console.log('This error often occurs with Radix UI Slot components when Symbol values are passed as props');
        console.groupEnd();
      }
    }
  }

  handleRetry = () => {
    // Reset the error state
    this.setState({ hasError: false, error: null, errorInfo: null, isSymbolError: false });
    // Reload the current page with Inertia
    router.reload({ only: ['*'] });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const { error, errorInfo, isSymbolError } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-2xl w-full text-center">
            <div className="mb-4">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isSymbolError ? 'Erreur de rendu de composant' : 'Oups ! Quelque chose s\'est mal passé'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {isSymbolError 
                ? 'Une erreur de conversion de symbole s\'est produite. Cela peut être dû à des propriétés incompatibles.'
                : 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
            </p>

            {isDevelopment && error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="font-semibold text-red-800 mb-2">Détails de l'erreur :</h3>
                <p className="text-sm font-mono text-red-800">
                  {error.toString()}
                </p>
                
                {isSymbolError && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="font-semibold text-yellow-800 text-sm mb-1">
                      Cause probable :
                    </h4>
                    <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                      <li>Un composant utilisant Radix UI Slot a reçu une valeur Symbol</li>
                      <li>Vérifiez les props passées aux composants Button avec asChild</li>
                      <li>Assurez-vous que toutes les props sont des valeurs sérialisables</li>
                    </ul>
                  </div>
                )}
                
                {error.stack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-red-700">
                      Stack trace complet
                    </summary>
                    <pre className="mt-2 text-xs text-red-700 overflow-x-auto whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
                
                {errorInfo?.componentStack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-red-700">
                      Component stack
                    </summary>
                    <pre className="mt-2 text-xs text-red-700 overflow-x-auto whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <SafeButton
                onClick={this.handleRetry}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Réessayer
              </SafeButton>
              
              <SafeButton
                variant="outline"
                onClick={() => router.visit('/')}
              >
                Retour à l'accueil
              </SafeButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}