import React, { useEffect } from 'react'
import { Head, router } from '@inertiajs/react'
import { useCart } from '@/contexts/CartContext'
import ShopLayout from '@/Layouts/ShopLayout'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Separator } from '@/Components/ui/separator'
import { Badge } from '@/Components/ui/badge'
import { CheckCircle2, Package, Truck, Store, Calendar, Clock, MapPin, Phone, Mail, Share2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import confetti from 'canvas-confetti'

interface OrderSuccessProps {
    order: any
    clearCart?: boolean
}

export default function OrderSuccess({ order, clearCart = false }: OrderSuccessProps) {
    const { clearCart: clearCartItems } = useCart()

    useEffect(() => {
        // Clear cart if needed
        if (clearCart) {
            clearCartItems()
        }

        // Launch confetti animation
        const duration = 3 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min
        }

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            })
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            })
        }, 250)

        return () => clearInterval(interval)
    }, [clearCart])

    const shareOrder = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Ma commande MonEpice&Riz',
                text: `J'ai commandé chez MonEpice&Riz ! Commande ${order.order_number}`,
                url: window.location.href
            })
        }
    }

    const getDeliveryInstructions = () => {
        if (order.delivery_method === 'pickup') {
            return {
                icon: <Store className="h-5 w-5" />,
                title: 'Retrait en magasin',
                details: [
                    {
                        icon: <Calendar className="h-4 w-4" />,
                        text: `Date: ${format(new Date(order.pickup_date), 'EEEE d MMMM yyyy', { locale: fr })}`
                    },
                    {
                        icon: <Clock className="h-4 w-4" />,
                        text: `Créneau: ${order.pickup_time_slot}`
                    },
                    {
                        icon: <MapPin className="h-4 w-4" />,
                        text: 'Adresse: Cocody, Abidjan'
                    }
                ]
            }
        } else {
            return {
                icon: <Truck className="h-5 w-5" />,
                title: 'Livraison à domicile',
                details: [
                    {
                        icon: <MapPin className="h-4 w-4" />,
                        text: order.delivery_address
                    },
                    {
                        icon: <Clock className="h-4 w-4" />,
                        text: 'Livraison dans les 24-48h'
                    }
                ]
            }
        }
    }

    const deliveryInfo = getDeliveryInstructions()

    return (
        <ShopLayout>
            <Head title="Commande confirmée" />
            
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Success Message */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
                    <p className="text-lg text-muted-foreground">
                        Merci pour votre commande. Nous la préparons avec soin.
                    </p>
                </div>

                {/* Order Info */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Commande {order.order_number}</CardTitle>
                                <CardDescription>
                                    Passée le {format(new Date(order.created_at), 'dd/MM/yyyy à HH:mm')}
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-green-600">
                                {order.status_label}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Customer Info */}
                        <div>
                            <h3 className="font-semibold mb-2">Informations client</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Nom:</span>
                                    <span>{order.customer_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{order.customer_phone}</span>
                                </div>
                                {order.customer_email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{order.customer_email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Delivery Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                {deliveryInfo.icon}
                                <h3 className="font-semibold">{deliveryInfo.title}</h3>
                            </div>
                            <div className="space-y-2">
                                {deliveryInfo.details.map((detail, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm">
                                        <span className="text-muted-foreground mt-0.5">{detail.icon}</span>
                                        <span>{detail.text}</span>
                                    </div>
                                ))}
                            </div>
                            {order.delivery_notes && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Note: {order.delivery_notes}
                                </p>
                            )}
                        </div>

                        <Separator />

                        {/* Order Items */}
                        <div>
                            <h3 className="font-semibold mb-3">Articles commandés</h3>
                            <div className="space-y-3">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{item.product_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.sku_name} • Quantité: {item.quantity}
                                            </p>
                                            {item.is_variable_weight && (
                                                <p className="text-xs text-orange-600">
                                                    * Poids estimé: {item.estimated_weight}g
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatPrice(item.line_total)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatPrice(item.unit_price)} / unité
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Totals */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Sous-total</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.delivery_fee > 0 && (
                                <div className="flex justify-between">
                                    <span>Frais de livraison</span>
                                    <span>{formatPrice(order.delivery_fee)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{formatPrice(order.total_amount)}</span>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm">
                                <span className="font-semibold">Mode de paiement:</span>{' '}
                                {order.payment_method === 'cash' ? 'Espèces à la livraison' : 'Paiement par carte'}
                            </p>
                            {order.payment_status === 'paid' && (
                                <p className="text-sm text-green-600 mt-1">
                                    ✓ Paiement confirmé
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        onClick={() => router.visit('/products')}
                    >
                        Continuer mes achats
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={shareOrder}
                    >
                        <Share2 className="mr-2 h-4 w-4" />
                        Partager
                    </Button>
                </div>

                {/* Additional Info */}
                <Card className="mt-8 bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Que se passe-t-il ensuite ?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-2 text-sm">
                            <li>1. Nous préparons votre commande avec soin</li>
                            <li>2. Vous recevrez un SMS de confirmation</li>
                            {order.delivery_method === 'pickup' ? (
                                <li>3. Venez récupérer votre commande à la date et heure choisies</li>
                            ) : (
                                <li>3. Notre livreur vous contactera avant la livraison</li>
                            )}
                            <li>4. N'hésitez pas à nous contacter si vous avez des questions</li>
                        </ol>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" />
                            <span>Service client: +225 07 00 00 00 00</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ShopLayout>
    )
}