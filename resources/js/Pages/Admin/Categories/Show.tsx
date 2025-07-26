import React from 'react';
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
    Edit,
    Trash2,
    Package,
    FolderTree,
    Calendar,
    Eye,
    Hash,
    Type,
    Check,
    X
} from 'lucide-react';
import { formatDate, formatPrice } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent?: {
        id: number;
        name: string;
        slug: string;
    };
    icon?: string;
    position: number;
    is_active: boolean;
    is_featured: boolean;
    meta_title?: string;
    meta_description?: string;
    products_count: number;
    children: Array<{
        id: number;
        name: string;
        slug: string;
        products_count: number;
        is_active: boolean;
    }>;
    products: Array<{
        id: number;
        name: string;
        slug: string;
        price_ttc: number;
        image_url?: string;
        is_active: boolean;
    }>;
    created_at: string;
    updated_at: string;
}

interface CategoryShowProps {
    category: Category;
    stats?: {
        total_views: number;
        total_orders: number;
        total_revenue: number;
    };
}

export default function CategoryShow({ category, stats }: CategoryShowProps) {
    // Valeurs par défaut pour stats
    const defaultStats = {
        total_views: 0,
        total_orders: 0,
        total_revenue: 0
    };
    const categoryStats = stats || defaultStats;
    const handleDelete = () => {
        const message = category.children.length > 0
            ? `Cette catégorie contient ${category.children.length} sous-catégorie(s). Veuillez d'abord les supprimer.`
            : category.products_count > 0
            ? `Cette catégorie contient ${category.products_count} produit(s). Veuillez d'abord les retirer.`
            : `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`;

        if (category.children.length > 0 || category.products_count > 0) {
            alert(message);
            return;
        }

        if (confirm(message)) {
            router.delete(`/admin/categories/${category.id}`, {
                onSuccess: () => {
                    router.visit('/admin/categories');
                },
            });
        }
    };

    const breadcrumbs = [
        { label: 'Catégories', href: '/admin/categories' },
        { label: category.name }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
                        <div className="mt-2 flex items-center gap-4">
                            <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                {category.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {category.is_featured && (
                                <Badge variant="secondary">En vedette</Badge>
                            )}
                            {category.parent && (
                                <span className="text-sm text-muted-foreground">
                                    Parent : <Link href={`/admin/categories/${category.parent.id}`} className="hover:underline">
                                        {category.parent.name}
                                    </Link>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/admin/categories/${category.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={category.children.length > 0 || category.products_count > 0}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Produits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold">{category.products_count}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Sous-catégories
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <FolderTree className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold">{category.children.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Vues totales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span className="text-2xl font-bold">{categoryStats.total_views}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                CA généré
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">{formatPrice(categoryStats.total_revenue)}</span>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* General Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                Informations générales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Slug URL</p>
                                <p className="font-mono text-sm">{category.slug}</p>
                            </div>
                            {category.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="text-sm">{category.description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Position</p>
                                    <p className="font-medium">{category.position}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Icône</p>
                                    <p className="font-medium">{category.icon || 'Aucune'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Créé le</p>
                                    <p className="text-sm">{formatDate(category.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Modifié le</p>
                                    <p className="text-sm">{formatDate(category.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO */}
                    {(category.meta_title || category.meta_description) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    SEO
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {category.meta_title && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Meta titre</p>
                                        <p className="text-sm">{category.meta_title}</p>
                                    </div>
                                )}
                                {category.meta_description && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Meta description</p>
                                        <p className="text-sm">{category.meta_description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Subcategories */}
                {category.children.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Sous-catégories</CardTitle>
                            <Link href="/admin/categories/create">
                                <Button size="sm" variant="outline">
                                    Ajouter une sous-catégorie
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead className="text-center">Produits</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {category.children.map((child) => (
                                        <TableRow key={child.id}>
                                            <TableCell className="font-medium">{child.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{child.slug}</TableCell>
                                            <TableCell className="text-center">{child.products_count}</TableCell>
                                            <TableCell>
                                                <Badge variant={child.is_active ? 'default' : 'secondary'}>
                                                    {child.is_active ? (
                                                        <>
                                                            <Check className="mr-1 h-3 w-3" />
                                                            Actif
                                                        </>
                                                    ) : (
                                                        <>
                                                            <X className="mr-1 h-3 w-3" />
                                                            Inactif
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/categories/${child.id}`}>
                                                        <Button size="sm" variant="ghost">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/categories/${child.id}/edit`}>
                                                        <Button size="sm" variant="ghost">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Products */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Produits dans cette catégorie</CardTitle>
                        <Link href={`/admin/products?category_id=${category.id}`}>
                            <Button size="sm" variant="outline">
                                Voir tous les produits
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {category.products.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {category.products.slice(0, 6).map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/admin/products/${product.id}`}
                                        className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50"
                                    >
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatPrice(product.price_ttc)}
                                            </p>
                                            <Badge
                                                variant={product.is_active ? 'default' : 'secondary'}
                                                className="mt-1 text-xs"
                                            >
                                                {product.is_active ? 'Actif' : 'Inactif'}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-8">
                                Aucun produit dans cette catégorie
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}