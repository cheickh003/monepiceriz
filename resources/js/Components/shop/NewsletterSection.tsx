import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import SafeButton from '@/Components/SafeButton';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface NewsletterSectionProps {
    className?: string;
}

export default function NewsletterSection({ className }: NewsletterSectionProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !email.includes('@')) {
            setStatus('error');
            setMessage('Veuillez entrer une adresse email valide');
            return;
        }

        setStatus('loading');
        
        try {
            const response = await axios.post('/newsletter/subscribe', {
                email,
                consent: true, // L'utilisateur accepte en soumettant le formulaire
            });
            
            setStatus('success');
            setMessage(response.data.message || 'Merci de votre inscription ! Vous recevrez bientôt nos offres exclusives.');
            setEmail('');
            
            // Reset status after 5 seconds
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);
        } catch (error: any) {
            setStatus('error');
            if (error.response?.data?.message) {
                setMessage(error.response.data.message);
            } else if (error.response?.data?.errors?.email) {
                setMessage(error.response.data.errors.email[0]);
            } else {
                setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
            }
        }
    };

    return (
        <section className={cn("py-16 bg-gradient-to-br from-green-50 to-green-100", className)}>
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="mb-8">
                        <Mail className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Restez informé de nos offres
                        </h2>
                        <p className="text-gray-700 text-lg">
                            Inscrivez-vous à notre newsletter et profitez d'offres exclusives, 
                            de nouveautés et de conseils pour vos achats.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-4">
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Votre adresse email"
                                className="flex-grow px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={status === 'loading' || status === 'success'}
                                aria-label="Adresse email pour la newsletter"
                            />
                            <SafeButton
                                type="submit"
                                size="lg"
                                disabled={status === 'loading' || status === 'success'}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3"
                            >
                                {status === 'loading' ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Inscription...
                                    </span>
                                ) : (
                                    "S'inscrire"
                                )}
                            </SafeButton>
                        </div>
                    </form>

                    {message && (
                        <div className={cn(
                            "flex items-center justify-center gap-2 text-sm",
                            status === 'success' ? "text-green-600" : "text-red-600"
                        )}>
                            {status === 'success' ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <AlertCircle className="w-4 h-4" />
                            )}
                            <span>{message}</span>
                        </div>
                    )}

                    <p className="text-xs text-gray-600 mt-4">
                        En vous inscrivant, vous acceptez de recevoir nos communications marketing. 
                        Vous pouvez vous désinscrire à tout moment. 
                        <a href="/privacy" className="text-green-600 hover:underline ml-1">
                            Politique de confidentialité
                        </a>
                    </p>

                    <div className="mt-8 pt-8 border-t border-green-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Avantages exclusifs pour nos abonnés
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">1</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Offres exclusives</h4>
                                    <p className="text-xs text-gray-600">Jusqu'à -20% pour nos abonnés</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">2</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Nouveautés en avant-première</h4>
                                    <p className="text-xs text-gray-600">Soyez les premiers informés</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">3</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Conseils & recettes</h4>
                                    <p className="text-xs text-gray-600">Des idées pour vos repas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}