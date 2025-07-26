import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    ShoppingCart,
    Package,
    Euro,
    TrendingUp,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    ArrowRight,
    Users,
    FolderTree,
    Settings
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface DashboardProps {
    stats: {
        orders_today: number;
        orders_week: number;
        orders_month: number;
        revenue_today: number;
        revenue_week: number;
        revenue_month: number;
        active_products: number;
        total_categories: number;
        pending_orders: number;
        processing_orders: number;
    };
    recent_orders: Array<{
        id: number;
        order_number: string;
        customer_name: string;
        total_amount: number;
        status: string;
        created_at: string;
    }>;
    alerts: Array<{
        type: 'warning' | 'error' | 'info';
        message: string;
        action?: string;
        action_url?: string;
    }>;
}

export default function Dashboard({ stats, recent_orders, alerts }: DashboardProps) {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            pending: { label: 'En attente', variant: 'secondary' },
            confirmed: { label: 'Confirmée', variant: 'default' },
            processing: { label: 'En préparation', variant: 'default' },
            ready: { label: 'Prête', variant: 'default' },
            completed: { label: 'Complétée', variant: 'secondary' },
            cancelled: { label: 'Annulée', variant: 'destructive' }
        };

        const config = statusMap[status] || { label: status, variant: 'outline' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <AdminLayout title="Tableau de bord">
            <Head title="Tableau de bord" />

            <div className="space-y-6">
                {/* Alerts */}
                {alerts.length > 0 && (
                    <div className="space-y-3">
                        {alerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-4 rounded-lg border ${
                                    alert.type === 'error'
                                        ? 'bg-red-50 border-red-200'
                                        : alert.type === 'warning'
                                        ? 'bg-yellow-50 border-yellow-200'
                                        : 'bg-blue-50 border-blue-200'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {getAlertIcon(alert.type)}
                                    <p className="text-sm font-medium">{alert.message}</p>
                                </div>
                                {alert.action && alert.action_url && (
                                    <Link href={alert.action_url}>
                                        <Button size="sm" variant="outline">
                                            {alert.action}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Commandes aujourd'hui
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.orders_today}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.orders_week} cette semaine
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Chiffre d'affaires
                            </CardTitle>
                            <Euro className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatPrice(stats.revenue_today)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {formatPrice(stats.revenue_week)} cette semaine
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Produits actifs
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_products}</div>
                            <p className="text-xs text-muted-foreground">
                                Dans {stats.total_categories} catégories
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Commandes en cours
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.pending_orders + stats.processing_orders}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.pending_orders} en attente, {stats.processing_orders} en préparation
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link href="/admin/orders/create">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Nouvelle commande</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Créer une commande manuelle
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/admin/products/create">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Nouveau produit</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Ajouter un produit au catalogue
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/admin/categories">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <FolderTree className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Catégories</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Gérer les catégories
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/admin/product-attributes">
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Settings className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Attributs</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Configurer les attributs produits
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>

                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Dernières commandes</CardTitle>
                        <Link href="/admin/orders">
                            <Button variant="ghost" size="sm">
                                Voir tout
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recent_orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between space-x-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="text-sm font-medium text-primary hover:underline"
                                        >
                                            {order.order_number}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">
                                            {order.customer_name} · {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {formatPrice(order.total_amount)}
                                            </p>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </div>
                            ))}
                            {recent_orders.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-4">
                                    Aucune commande récente
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}