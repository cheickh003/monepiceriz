import React from 'react';
import { Shield, Truck, Clock, Award, CreditCard, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadge {
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface TrustBadgesProps {
    className?: string;
}

export default function TrustBadges({ className }: TrustBadgesProps) {
    const badges: TrustBadge[] = [
        {
            icon: <Shield className="w-8 h-8 text-green-600" />,
            title: "Paiement Sécurisé",
            description: "Transactions 100% sécurisées"
        },
        {
            icon: <Truck className="w-8 h-8 text-green-600" />,
            title: "Livraison Rapide",
            description: "Livraison gratuite dès 25 000 CFA"
        },
        {
            icon: <Clock className="w-8 h-8 text-green-600" />,
            title: "Service Client",
            description: "Support 7j/7 de 8h à 20h"
        },
        {
            icon: <Award className="w-8 h-8 text-green-600" />,
            title: "Qualité Garantie",
            description: "Produits frais et certifiés"
        },
        {
            icon: <CreditCard className="w-8 h-8 text-green-600" />,
            title: "Paiement Flexible",
            description: "CB, PayPal, virement"
        },
        {
            icon: <Package className="w-8 h-8 text-green-600" />,
            title: "Retours Faciles",
            description: "14 jours pour changer d'avis"
        }
    ];

    return (
        <section className={cn("py-12 bg-gray-50", className)}>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                    {badges.map((badge, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 group"
                        >
                            <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                                {badge.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                {badge.title}
                            </h3>
                            <p className="text-xs text-gray-600">
                                {badge.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}