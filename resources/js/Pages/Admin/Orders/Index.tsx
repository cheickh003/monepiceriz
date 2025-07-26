import React, { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Badge } from '@/Components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
    Search, Download, Filter, TrendingUp, Package, 
    Clock, CheckCircle2, XCircle, Eye, Calendar,
    Euro, ShoppingCart, Loader2
} from 'lucide-react'
import { Pagination } from '@/Components/Pagination'

interface OrdersIndexProps {
    orders: any
    filters: any
    statistics: any
    statuses: Record<string, string>
    paymentStatuses: Record<string, string>
}

export default function OrdersIndex({ 
    orders, 
    filters, 
    statistics, 
    statuses,
    paymentStatuses 
}: OrdersIndexProps) {
    const [isExporting, setIsExporting] = useState(false)
    const { data, setData, get, processing } = useForm({
        status: filters.status || 'all',
        payment_status: filters.payment_status || 'all',
        delivery_method: filters.delivery_method || 'all',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        search: filters.search || '',
    })

    const handleFilter = () => {
        const filterData = {
            ...data,
            status: data.status === 'all' ? '' : data.status,
            payment_status: data.payment_status === 'all' ? '' : data.payment_status,
            delivery_method: data.delivery_method === 'all' ? '' : data.delivery_method,
        }
        
        router.get('/admin/orders', filterData, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleExport = async (format: string) => {
        setIsExporting(true)
        try {
            const exportData = {
                ...data,
                status: data.status === 'all' ? '' : data.status,
                payment_status: data.payment_status === 'all' ? '' : data.payment_status,
                delivery_method: data.delivery_method === 'all' ? '' : data.delivery_method,
            }
            const response = await window.fetch(`/admin/orders/export?format=${format}&${new URLSearchParams(exportData as any)}`)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `commandes_${format}.${format}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
        } finally {
            setIsExporting(false)
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

    const StatCard = ({ title, value, icon, trend }: any) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className="text-xs text-muted-foreground">
                        <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span> vs hier
                    </p>
                )}
            </CardContent>
        </Card>
    )

    return (
        <AdminLayout>
            <Head title="Gestion des commandes" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Commandes</h1>
                        <p className="text-muted-foreground">Gérez les commandes et leur statut</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleExport('csv')}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Statistics */}
                <Tabs defaultValue="today" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
                        <TabsTrigger value="week">Cette semaine</TabsTrigger>
                        <TabsTrigger value="month">Ce mois</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="today" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Commandes"
                                value={statistics.total_orders}
                                icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
                                trend={12}
                            />
                            <StatCard
                                title="Chiffre d'affaires"
                                value={formatPrice(statistics.total_revenue)}
                                icon={<Euro className="h-4 w-4 text-muted-foreground" />}
                                trend={8}
                            />
                            <StatCard
                                title="En attente"
                                value={statistics.pending_orders}
                                icon={<Clock className="h-4 w-4 text-orange-500" />}
                            />
                            <StatCard
                                title="Panier moyen"
                                value={formatPrice(statistics.average_order_value || 0)}
                                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtres
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div>
                                <Label htmlFor="search">Rechercher</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="N° commande, client..."
                                        className="pl-8"
                                        value={data.search}
                                        onChange={e => setData('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="status">Statut</Label>
                                <Select value={data.status} onValueChange={value => setData('status', value)}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Tous" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        {Object.entries(statuses).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="payment_status">Paiement</Label>
                                <Select value={data.payment_status} onValueChange={value => setData('payment_status', value)}>
                                    <SelectTrigger id="payment_status">
                                        <SelectValue placeholder="Tous" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        {Object.entries(paymentStatuses).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="delivery_method">Livraison</Label>
                                <Select value={data.delivery_method} onValueChange={value => setData('delivery_method', value)}>
                                    <SelectTrigger id="delivery_method">
                                        <SelectValue placeholder="Tous" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        <SelectItem value="pickup">Retrait</SelectItem>
                                        <SelectItem value="delivery">Livraison</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="date_from">Du</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={data.date_from}
                                    onChange={e => setData('date_from', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="date_to">Au</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={data.date_to}
                                    onChange={e => setData('date_to', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={handleFilter} disabled={processing}>
                                {processing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="mr-2 h-4 w-4" />
                                )}
                                Filtrer
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des commandes</CardTitle>
                        <CardDescription>
                            {orders.total} commande{orders.total > 1 ? 's' : ''} trouvée{orders.total > 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>N° Commande</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Articles</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Livraison</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Paiement</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.data.map((order: any) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                {order.order_number}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(order.created_at), 'dd/MM', { locale: fr })}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(order.created_at), 'HH:mm')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>{order.customer_name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {order.customer_phone}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-3 w-3" />
                                                    {order.items_count || order.items?.length || 0}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatPrice(order.total_amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {order.delivery_method === 'pickup' ? 'Retrait' : 'Livraison'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(order.status)}>
                                                    {order.status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
                                                    {order.payment_status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.visit(`/admin/orders/${order.id}`)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {orders.data.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucune commande trouvée
                            </div>
                        )}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="mt-4">
                                <Pagination links={orders.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}