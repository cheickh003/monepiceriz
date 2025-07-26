import React, { useState, useEffect } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import { useCart } from '@/contexts/CartContext'
import ShopLayout from '@/Layouts/ShopLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group'
import { Textarea } from '@/Components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Separator } from '@/Components/ui/separator'
import { Alert, AlertDescription } from '@/Components/ui/alert'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertCircle, Truck, Store, CreditCard, Banknote, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/Components/ui/use-toast'
import axios from 'axios'

interface CheckoutProps {
    subtotal: number
    estimatedDeliveryFee: number | null
    minimumOrderAmount: number
    pickupTimeSlots: Record<string, string>
}

export default function Checkout({
    subtotal: initialSubtotal,
    estimatedDeliveryFee,
    minimumOrderAmount,
    pickupTimeSlots
}: CheckoutProps) {
    const { items, clearCart } = useCart()
    const [isCalculatingFee, setIsCalculatingFee] = useState(false)
    const [deliveryFee, setDeliveryFee] = useState(estimatedDeliveryFee || 0)

    // Form data
    const { data, setData, post, processing, errors, reset } = useForm({
        customer: {
            name: '',
            phone: '',
            email: ''
        },
        delivery: {
            method: 'pickup',
            address: '',
            notes: '',
            pickup_date: format(new Date(), 'yyyy-MM-dd'),
            pickup_time_slot: '09:00-12:00'
        },
        payment_method: 'cash',
        cart: {
            items: items.map(item => ({
                sku_id: item.product.selected_sku?.id || item.product.default_sku?.id,
                quantity: item.quantity,
                price: item.product.effective_price || item.product.price_ttc,
                estimated_weight: item.product.selected_sku?.is_variable_weight ? 1000 : undefined
            }))
        }
    })

    // Calculate subtotal from cart items
    const subtotal = items.reduce((total, item) => {
        const price = item.product.effective_price || item.product.price_ttc || 0
        return total + (price * item.quantity)
    }, 0)

    const total = subtotal + (data.delivery.method === 'delivery' ? deliveryFee : 0)
    const canDeliver = subtotal >= minimumOrderAmount

    // Update delivery fee when address changes
    useEffect(() => {
        if (data.delivery.method === 'delivery' && data.delivery.address && canDeliver) {
            const debounceTimer = setTimeout(() => {
                calculateDeliveryFee()
            }, 1000)

            return () => clearTimeout(debounceTimer)
        }
    }, [data.delivery.address, data.delivery.method])

    const calculateDeliveryFee = async () => {
        if (!data.delivery.address || !canDeliver) return

        setIsCalculatingFee(true)
        try {
            const response = await axios.post('/shop/checkout/calculate-delivery-fee', {
                address: data.delivery.address,
                subtotal: subtotal
            })

            if (response.data.success) {
                setDeliveryFee(response.data.delivery_fee)
            }
        } catch (error) {
            console.error('Failed to calculate delivery fee:', error)
        } finally {
            setIsCalculatingFee(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (items.length === 0) {
            toast({
                title: "Panier vide",
                description: "Votre panier est vide",
                variant: "destructive"
            })
            return
        }

        post('/shop/checkout', {
            onSuccess: (response: any) => {
                // Clear cart on success
                clearCart()
                
                // Handle redirect based on payment method
                if (response.props.payment_url) {
                    // Redirect to payment gateway
                    window.location.href = response.props.payment_url
                } else if (response.props.redirect_url) {
                    // Redirect to success page
                    router.visit(response.props.redirect_url)
                }
            },
            onError: () => {
                toast({
                    title: "Erreur",
                    description: "Une erreur est survenue lors de la validation de votre commande",
                    variant: "destructive"
                })
            }
        })
    }

    if (items.length === 0) {
        return (
            <ShopLayout>
                <Head title="Checkout" />
                <div className="container mx-auto px-4 py-8">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Votre panier est vide. Veuillez ajouter des produits avant de continuer.
                        </AlertDescription>
                    </Alert>
                    <Button 
                        className="mt-4"
                        onClick={() => router.visit('/products')}
                    >
                        Continuer mes achats
                    </Button>
                </div>
            </ShopLayout>
        )
    }

    return (
        <ShopLayout>
            <Head title="Finaliser ma commande" />
            
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-8">Finaliser ma commande</h1>

                <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
                    {/* Left column - Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations client</CardTitle>
                                <CardDescription>
                                    Vos coordonnées pour la commande
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nom complet *</Label>
                                    <Input
                                        id="name"
                                        value={data.customer.name}
                                        onChange={e => setData('customer', { ...data.customer, name: e.target.value })}
                                        placeholder="Jean Dupont"
                                        className={errors['customer.name'] ? 'border-red-500' : ''}
                                    />
                                    {errors['customer.name'] && (
                                        <p className="text-sm text-red-500 mt-1">{errors['customer.name']}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="phone">Téléphone *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.customer.phone}
                                        onChange={e => setData('customer', { ...data.customer, phone: e.target.value })}
                                        placeholder="07 00 00 00 00"
                                        className={errors['customer.phone'] ? 'border-red-500' : ''}
                                    />
                                    {errors['customer.phone'] && (
                                        <p className="text-sm text-red-500 mt-1">{errors['customer.phone']}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email (optionnel)</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.customer.email}
                                        onChange={e => setData('customer', { ...data.customer, email: e.target.value })}
                                        placeholder="jean@example.com"
                                        className={errors['customer.email'] ? 'border-red-500' : ''}
                                    />
                                    {errors['customer.email'] && (
                                        <p className="text-sm text-red-500 mt-1">{errors['customer.email']}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Mode de récupération</CardTitle>
                                <CardDescription>
                                    Comment souhaitez-vous recevoir votre commande ?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup
                                    value={data.delivery.method}
                                    onValueChange={value => setData('delivery', { ...data.delivery, method: value })}
                                >
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                        <RadioGroupItem value="pickup" id="pickup" />
                                        <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <Store className="h-5 w-5" />
                                                <div>
                                                    <p className="font-medium">Retrait en magasin</p>
                                                    <p className="text-sm text-muted-foreground">Gratuit</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>

                                    <div className={`flex items-center space-x-2 p-4 border rounded-lg ${!canDeliver ? 'opacity-50' : ''}`}>
                                        <RadioGroupItem value="delivery" id="delivery" disabled={!canDeliver} />
                                        <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <Truck className="h-5 w-5" />
                                                <div>
                                                    <p className="font-medium">Livraison à domicile</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {canDeliver ? `Frais: ${formatPrice(deliveryFee)}` : `Minimum ${formatPrice(minimumOrderAmount)} requis`}
                                                    </p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {errors['delivery.method'] && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errors['delivery.method']}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Pickup Options */}
                                {data.delivery.method === 'pickup' && (
                                    <div className="space-y-4 pt-4">
                                        <div>
                                            <Label htmlFor="pickup_date">Date de retrait *</Label>
                                            <Input
                                                id="pickup_date"
                                                type="date"
                                                value={data.delivery.pickup_date}
                                                onChange={e => setData('delivery', { ...data.delivery, pickup_date: e.target.value })}
                                                min={format(new Date(), 'yyyy-MM-dd')}
                                                className={errors['delivery.pickup_date'] ? 'border-red-500' : ''}
                                            />
                                            {errors['delivery.pickup_date'] && (
                                                <p className="text-sm text-red-500 mt-1">{errors['delivery.pickup_date']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="pickup_time">Créneau horaire *</Label>
                                            <RadioGroup
                                                value={data.delivery.pickup_time_slot}
                                                onValueChange={value => setData('delivery', { ...data.delivery, pickup_time_slot: value })}
                                            >
                                                {Object.entries(pickupTimeSlots).map(([value, label]) => (
                                                    <div key={value} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={value} id={value} />
                                                        <Label htmlFor={value} className="cursor-pointer">{label}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                            {errors['delivery.pickup_time_slot'] && (
                                                <p className="text-sm text-red-500 mt-1">{errors['delivery.pickup_time_slot']}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Options */}
                                {data.delivery.method === 'delivery' && (
                                    <div className="space-y-4 pt-4">
                                        <div>
                                            <Label htmlFor="address">Adresse de livraison *</Label>
                                            <Textarea
                                                id="address"
                                                value={data.delivery.address}
                                                onChange={e => setData('delivery', { ...data.delivery, address: e.target.value })}
                                                placeholder="Rue, quartier, commune..."
                                                rows={3}
                                                className={errors['delivery.address'] ? 'border-red-500' : ''}
                                            />
                                            {errors['delivery.address'] && (
                                                <p className="text-sm text-red-500 mt-1">{errors['delivery.address']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="notes">Instructions de livraison (optionnel)</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.delivery.notes}
                                                onChange={e => setData('delivery', { ...data.delivery, notes: e.target.value })}
                                                placeholder="Indications pour le livreur..."
                                                rows={2}
                                            />
                                        </div>

                                        {isCalculatingFee && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Calcul des frais de livraison...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Mode de paiement</CardTitle>
                                <CardDescription>
                                    Choisissez votre mode de paiement
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={data.payment_method}
                                    onValueChange={value => setData('payment_method', value)}
                                >
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                        <RadioGroupItem value="cash" id="cash" />
                                        <Label htmlFor="cash" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <Banknote className="h-5 w-5" />
                                                <div>
                                                    <p className="font-medium">Paiement à la livraison</p>
                                                    <p className="text-sm text-muted-foreground">Espèces uniquement</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                        <RadioGroupItem value="card" id="card" />
                                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="h-5 w-5" />
                                                <div>
                                                    <p className="font-medium">Paiement par carte</p>
                                                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Orange Money</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column - Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Récapitulatif</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Items */}
                                <div className="space-y-2">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="truncate flex-1">
                                                {item.product.name} x{item.quantity}
                                            </span>
                                            <span className="font-medium">
                                                {formatPrice((item.product.effective_price || item.product.price_ttc) * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                {/* Totals */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Sous-total</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    
                                    {data.delivery.method === 'delivery' && (
                                        <div className="flex justify-between">
                                            <span>Frais de livraison</span>
                                            <span>{formatPrice(deliveryFee)}</span>
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Traitement...
                                        </>
                                    ) : (
                                        'Valider la commande'
                                    )}
                                </Button>

                                {/* Info */}
                                <p className="text-xs text-center text-muted-foreground">
                                    En validant, vous acceptez nos conditions générales de vente
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </ShopLayout>
    )
}