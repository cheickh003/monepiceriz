import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';
import {
    Eye,
    Edit,
    Copy,
    Trash2,
    Package,
    Tag,
    Calendar,
    BarChart,
    Info,
    Check,
    X,
    Weight,
    Image as ImageIcon
} from 'lucide-react';
import { formatPrice, formatDate, cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
}

interface ProductImage {
    id: number;
    image_url: string;
    is_main: boolean;
}

interface AttributeValue {
    attribute_name: string;
    value_name: string;
    hex_color?: string;
}

interface Sku {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
    purchase_price: number;
    price_ht: number;
    price_ttc: number;
    vat_rate: number;
    stock_quantity: number;
    weight?: number;
    is_default: boolean;
    is_variable_weight: boolean;
    attribute_values: AttributeValue[];
}

interface Product {
    id: number;
    name: string;
    slug: string;
    reference: string;
    barcode?: string;
    brand?: string;
    description?: string;
    short_description?: string;
    category: Category;
    country_of_origin?: string;
    is_active: boolean;
    is_featured: boolean;
    views_count: number;
    images: ProductImage[];
    skus: Sku[];
    created_at: string;
    updated_at: string;
}

interface RelatedProduct {
    id: number;
    name: string;
    slug: string;
    price_ttc: number;
    image_url?: string;
}

interface ProductShowProps {
    product: Product;
    related_products: RelatedProduct[];
    order_stats: {
        total_orders: number;
        total_quantity: number;
        total_revenue: number;
        last_order_date?: string;
    };
}

export default function ProductShow({ product, related_products, order_stats }: ProductShowProps) {
    const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
        product.images.find(img => img.is_main) || product.images[0] || null
    );
    const [activeTab, setActiveTab] = useState('details');

    const handleDelete = () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
            router.delete(`/admin/products/${product.id}`, {
                onSuccess: () => {
                    router.visit('/admin/products');
                },
            });
        }
    };

    const handleDuplicate = () => {
        router.post(`/admin/products/${product.id}/duplicate`);
    };

    const breadcrumbs = [
        { label: 'Produits', href: '/admin/products' },
        { label: product.name }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                        <div className="mt-2 flex items-center gap-4">
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                {product.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                            {product.is_featured && (
                                <Badge variant="secondary">En vedette</Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                                Réf: {product.reference}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={handleDuplicate}>
                            <Copy className="mr-2 h-4 w-4" />
                            Dupliquer
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Images */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-4">
                                {selectedImage ? (
                                    <div className="space-y-4">
                                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                            <img
                                                src={selectedImage.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        {product.images.length > 1 && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {product.images.map((image) => (
                                                    <button
                                                        key={image.id}
                                                        onClick={() => setSelectedImage(image)}
                                                        className={cn(
                                                            "aspect-square overflow-hidden rounded-lg bg-gray-100 ring-2 transition-all",
                                                            selectedImage.id === image.id
                                                                ? "ring-primary"
                                                                : "ring-transparent hover:ring-gray-300"
                                                        )}
                                                    >
                                                        <img
                                                            src={image.image_url}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
                                        <ImageIcon className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-base">Statistiques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Vues</span>
                                    <span className="font-medium">{product.views_count}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Commandes</span>
                                    <span className="font-medium">{order_stats.total_orders}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Quantité vendue</span>
                                    <span className="font-medium">{order_stats.total_quantity}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">CA généré</span>
                                    <span className="font-medium">{formatPrice(order_stats.total_revenue)}</span>
                                </div>
                                {order_stats.last_order_date && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Dernière vente</span>
                                        <span className="font-medium">
                                            {formatDate(order_stats.last_order_date)}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Details */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList>
                                <TabsTrigger value="details" className="flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Détails
                                </TabsTrigger>
                                <TabsTrigger value="skus" className="flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    SKUs
                                </TabsTrigger>
                                <TabsTrigger value="related" className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Produits liés
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Informations générales</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Catégorie</p>
                                                <p className="font-medium">{product.category.name}</p>
                                            </div>
                                            {product.brand && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Marque</p>
                                                    <p className="font-medium">{product.brand}</p>
                                                </div>
                                            )}
                                            {product.barcode && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Code-barres</p>
                                                    <p className="font-medium font-mono">{product.barcode}</p>
                                                </div>
                                            )}
                                            {product.country_of_origin && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Pays d'origine</p>
                                                    <p className="font-medium">{product.country_of_origin}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-muted-foreground">Créé le</p>
                                                <p className="font-medium">{formatDate(product.created_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Modifié le</p>
                                                <p className="font-medium">{formatDate(product.updated_at)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {(product.short_description || product.description) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Description</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {product.short_description && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                                        Description courte
                                                    </p>
                                                    <p className="text-sm">{product.short_description}</p>
                                                </div>
                                            )}
                                            {product.description && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                                        Description complète
                                                    </p>
                                                    <p className="text-sm whitespace-pre-wrap">{product.description}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="skus" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Variantes SKU</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>SKU</TableHead>
                                                        <TableHead>Nom</TableHead>
                                                        <TableHead>Attributs</TableHead>
                                                        <TableHead>Prix TTC</TableHead>
                                                        <TableHead>Stock</TableHead>
                                                        <TableHead>Statut</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {product.skus.map((sku) => (
                                                        <TableRow key={sku.id}>
                                                            <TableCell>
                                                                <div className="space-y-1">
                                                                    <p className="font-medium font-mono">
                                                                        {sku.sku}
                                                                    </p>
                                                                    {sku.barcode && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {sku.barcode}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="space-y-1">
                                                                    <p>{sku.name || '-'}</p>
                                                                    {sku.is_default && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Par défaut
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {sku.attribute_values.length > 0 ? (
                                                                    <div className="space-y-1">
                                                                        {sku.attribute_values.map((attr, index) => (
                                                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                                                <span className="text-muted-foreground">
                                                                                    {attr.attribute_name}:
                                                                                </span>
                                                                                {attr.hex_color && (
                                                                                    <div
                                                                                        className="h-4 w-4 rounded border"
                                                                                        style={{ backgroundColor: attr.hex_color }}
                                                                                    />
                                                                                )}
                                                                                <span>{attr.value_name}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{formatPrice(sku.price_ttc)}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    {sku.stock_quantity}
                                                                    {sku.stock_quantity <= 5 && (
                                                                        <Badge variant="destructive" className="text-xs">
                                                                            Stock faible
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    {sku.is_variable_weight && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            <Weight className="mr-1 h-3 w-3" />
                                                                            Variable
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="related" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Produits de la même catégorie
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {related_products.length > 0 ? (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {related_products.map((relatedProduct) => (
                                                    <Link
                                                        key={relatedProduct.id}
                                                        href={`/admin/products/${relatedProduct.id}`}
                                                        className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50"
                                                    >
                                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                            {relatedProduct.image_url ? (
                                                                <img
                                                                    src={relatedProduct.image_url}
                                                                    alt={relatedProduct.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center">
                                                                    <Package className="h-8 w-8 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">
                                                                {relatedProduct.name}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {formatPrice(relatedProduct.price_ttc)}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-sm text-muted-foreground py-8">
                                                Aucun autre produit dans cette catégorie
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}