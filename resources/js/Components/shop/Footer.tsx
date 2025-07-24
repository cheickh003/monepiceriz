import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, CreditCard } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { name: 'À propos', href: '/about' },
            { name: 'Notre équipe', href: '/team' },
            { name: 'Nos valeurs', href: '/values' },
            { name: 'Carrières', href: '/careers' }
        ],
        service: [
            { name: 'FAQ', href: '/faq' },
            { name: 'Livraison', href: '/delivery' },
            { name: 'Retours', href: '/returns' },
            { name: 'Contact', href: '/contact' }
        ],
        legal: [
            { name: 'Conditions générales', href: '/terms' },
            { name: 'Politique de confidentialité', href: '/privacy' },
            { name: 'Mentions légales', href: '/legal' },
            { name: 'Cookies', href: '/cookies' }
        ]
    };

    const socialLinks = [
        { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
        { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
        { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' }
    ];

    const paymentMethods = [
        { name: 'Visa', icon: '💳' },
        { name: 'Mastercard', icon: '💳' },
        { name: 'PayPal', icon: '💰' },
        { name: 'Virement', icon: '🏦' }
    ];

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Contact Information */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm">123 Rue du Commerce</p>
                                    <p className="text-sm">75001 Paris, France</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <a href="tel:+33123456789" className="text-sm hover:text-white transition-colors">
                                    +33 1 23 45 67 89
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <a href="mailto:contact@monepiceriz.fr" className="text-sm hover:text-white transition-colors">
                                    contact@monepiceriz.fr
                                </a>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p>Lun-Ven: 8h00 - 20h00</p>
                                    <p>Sam-Dim: 9h00 - 19h00</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Entreprise</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Service Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Service Client</h3>
                        <ul className="space-y-2">
                            {footerLinks.service.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links & Newsletter */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Informations Légales</h3>
                        <ul className="space-y-2 mb-6">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.href}
                                        className="text-sm hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Social Links */}
                        <h3 className="text-white font-semibold text-lg mb-4">Suivez-nous</h3>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                                        aria-label={social.name}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Payment Methods & Copyright */}
                <div className="border-t border-gray-800 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm">Moyens de paiement :</span>
                            <div className="flex items-center gap-3">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.name}
                                        className="w-10 h-8 bg-white rounded flex items-center justify-center text-gray-700"
                                        title={method.name}
                                    >
                                        <span className="text-sm">{method.icon}</span>
                                    </div>
                                ))}
                                <CreditCard className="w-10 h-8 text-gray-400" />
                            </div>
                        </div>
                        
                        <p className="text-sm text-center">
                            © {currentYear} MonEpice&Riz. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}