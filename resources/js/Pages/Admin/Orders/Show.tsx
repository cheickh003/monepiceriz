import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { useInertiaErrorHandler } from '@/hooks/useErrorHandler'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Badge } from '@/Components/ui/badge'
import { Separator } from '@/Components/ui/separator'
import { Alert, AlertDescription } from '@/Components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
    ArrowLeft, Package, User, Phone, Mail, MapPin, 
    Calendar, Clock, CreditCard, Truck, Store, 
    AlertCircle, CheckCircle2, Scale, Printer,
    Save, Loader2
} from 'lucide-react'
import { toast } from '@/Components/ui/use-toast'

interface OrderShowProps {
    order: any
    canUpdateStatus: boolean
    canUpdateWeights: boolean
    canCapturePayment: boolean
    availableStatuses: Record<string, string>
}

export default function OrderShow({ 
    order, 
    canUpdateStatus, 
    canUpdateWeights, 
    canCapturePayment,
    availableStatuses 
}: OrderShowProps) {
    const [isPrinting, setIsPrinting] = useState(false)
    const [isCapturingPayment, setIsCapturingPayment] = useState(false)
    const { createFormErrorHandler } = useInertiaErrorHandler()
    
    // Form for status update
    const statusForm = useForm({
        status: order.status,
        notes: ''
    })

    // Form for weight updates
    const weightsForm = useForm({
        weights: order.items.reduce((acc: any, item: any) => {
            if (item.is_variable_weight) {
                acc[item.id] = item.actual_weight || item.estimated_weight
            }
            return acc
        }, {})
    })

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        statusForm.patch(`/admin/orders/${order.id}/status`, {
            onSuccess: () => {
                toast({
                    title: "Succès",
                    description: "Le statut a été mis à jour",
                    variant: "success"
                })
                statusForm.reset()
            },
            onError: createFormErrorHandler('update', {
                toastDescription: "Impossible de mettre à jour le statut"
            })
        })
    }

    const handleWeightsUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        weightsForm.patch(`/admin/orders/${order.id}/weights`, {
            onSuccess: () => {
                toast({
                    title: "Succès",
                    description: "Les poids ont été confirmés et le montant ajusté",
                    variant: "success"
                })
            },
            onError: createFormErrorHandler('update', {
                toastDescription: "Impossible de mettre à jour les poids"
            })
        })
    }

    const handleCapturePayment = () => {
        setIsCapturingPayment(true)
        router.post(`/admin/orders/${order.id}/capture`, {}, {
            onSuccess: () => {
                setIsCapturingPayment(false)
                toast({
                    title: "Succès",
                    description: "Le paiement a été capturé",
                    variant: "success"
                })
            },
            onError: () => {
                setIsCapturingPayment(false)
                toast({
                    title: "Erreur",
                    description: "Impossible de capturer le paiement",
                    variant: "destructive"
                })
            }
        })
    }

    const handlePrint = async () => {
        setIsPrinting(true)
        try {
            window.open(`/admin/orders/${order.id}/print`, '_blank')
        } finally {
            setIsPrinting(false)
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        const variants: Record<string, any> = {
            pending: 'secondary',
            confirmed: 'default',
            processing: 'default',
            ready: 'default',
            delivering: 'default',
            completed: 'success',
            cancelled: 'destructive',
        }
        return variants[status] || 'secondary'
    }

    const getPaymentStatusBadgeVariant = (status: string) => {
        const variants: Record<string, any> = {
            pending: 'secondary',
            authorized: 'default',
            paid: 'success',
            failed: 'destructive',
            refunded: 'secondary',
        }
        return variants[status] || 'secondary'
    }

    return (
        <AdminLayout>
            <Head title={`Commande ${order.order_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/admin/orders')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Commande {order.order_number}</h1>
                            <p className="text-muted-foreground">
                                Créée le {format(new Date(order.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        disabled={isPrinting}
                    >
                        {isPrinting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Printer className="mr-2 h-4 w-4" />
                        )}
                        Imprimer
                    </Button>
                </div>

                {/* Status Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Statut commande</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm">
                                {order.status_label}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Statut paiement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)} className="text-sm">
                                {order.payment_status_label}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Mode de livraison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                {order.delivery_method === 'pickup' ? (
                                    <Store className="h-4 w-4" />
                                ) : (
                                    <Truck className="h-4 w-4" />
                                )}
                                <span className="text-sm">{order.delivery_method_label}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatPrice(order.total_amount)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts */}
                {order.requires_weight_confirmation && !order.weight_confirmed_at && (
                    <Alert>
                        <Scale className="h-4 w-4" />
                        <AlertDescription>
                            Cette commande contient des produits à poids variable qui nécessitent une confirmation.
                        </AlertDescription>
                    </Alert>
                )}

                {canCapturePayment && (
                    <Alert>
                        <CreditCard className="h-4 w-4" />
                        <AlertDescription>
                            Le paiement est pré-autorisé et doit être capturé.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Informations client
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="font-medium">{order.customer_name}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{order.customer_phone}</span>
                                </div>
                                {order.customer_email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{order.customer_email}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Delivery Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de livraison</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {order.delivery_method === 'pickup' ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {format(new Date(order.pickup_date), 'EEEE d MMMM yyyy', { locale: fr })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{order.pickup_time_slot}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <span>{order.delivery_address}</span>
                                        </div>
                                        {order.delivery_notes && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm">
                                                    <span className="font-medium">Instructions:</span> {order.delivery_notes}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Articles commandés
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {canUpdateWeights ? (
                                    <form onSubmit={handleWeightsUpdate} className="space-y-4">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-medium">{item.product_name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.sku_name} • Quantité: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium">{formatPrice(item.line_total)}</p>
                                                </div>
                                                
                                                {item.is_variable_weight && (
                                                    <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                                                        <Label htmlFor={`weight-${item.id}`} className="text-sm">
                                                            Poids réel (en grammes)
                                                        </Label>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Input
                                                                id={`weight-${item.id}`}
                                                                type="number"
                                                                min="100"
                                                                max="50000"
                                                                value={weightsForm.data.weights[item.id] || ''}
                                                                onChange={e => weightsForm.setData('weights', {
                                                                    ...weightsForm.data.weights,
                                                                    [item.id]: parseInt(e.target.value)
                                                                })}
                                                                className="w-32"
                                                            />
                                                            <span className="text-sm text-muted-foreground">
                                                                Estimé: {item.estimated_weight}g
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={weightsForm.processing}>
                                                {weightsForm.processing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Mise à jour...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Confirmer les poids
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-3">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="flex justify-between items-start py-3 border-b last:border-0">
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.product_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.sku_name} • Quantité: {item.quantity}
                                                    </p>
                                                    {item.is_variable_weight && (
                                                        <p className="text-sm mt-1">
                                                            <span className="text-muted-foreground">Poids:</span>{' '}
                                                            {item.actual_weight || item.estimated_weight}g
                                                            {item.weight_difference && (
                                                                <span className={item.weight_difference > 0 ? 'text-green-600' : 'text-red-600'}>
                                                                    {' '}({item.weight_difference > 0 ? '+' : ''}{item.weight_difference}g)
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{formatPrice(item.line_total)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatPrice(item.unit_price)} / {item.is_variable_weight ? 'kg' : 'unité'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Separator className="my-4" />

                                {/* Totals */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Sous-total</span>
                                        <span>{formatPrice(order.subtotal)}</span>
                                    </div>
                                    {order.delivery_fee > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Frais de livraison</span>
                                            <span>{formatPrice(order.delivery_fee)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total_amount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {/* Status Update */}
                        {canUpdateStatus && Object.keys(availableStatuses).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Changer le statut</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleStatusUpdate} className="space-y-4">
                                        <div>
                                            <Label htmlFor="status">Nouveau statut</Label>
                                            <Select
                                                value={statusForm.data.status}
                                                onValueChange={value => statusForm.setData('status', value)}
                                            >
                                                <SelectTrigger id="status">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(availableStatuses).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="notes">Notes (optionnel)</Label>
                                            <Textarea
                                                id="notes"
                                                value={statusForm.data.notes}
                                                onChange={e => statusForm.setData('notes', e.target.value)}
                                                placeholder="Ajouter une note..."
                                                rows={3}
                                            />
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full"
                                            disabled={statusForm.processing || statusForm.data.status === order.status}
                                        >
                                            {statusForm.processing ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                            )}
                                            Mettre à jour le statut
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Capture */}
                        {canCapturePayment && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Capturer le paiement</CardTitle>
                                    <CardDescription>
                                        Le paiement est pré-autorisé et doit être capturé pour finaliser la transaction.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        className="w-full"
                                        onClick={handleCapturePayment}
                                        disabled={isCapturingPayment}
                                    >
                                        {isCapturingPayment ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <CreditCard className="mr-2 h-4 w-4" />
                                        )}
                                        {isCapturingPayment ? "Capture en cours..." : `Capturer ${formatPrice(order.total_amount)}`}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Notes */}
                        {order.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes internes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}