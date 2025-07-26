import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    AdminTable,
    ActionDropdown,
    EmptyState,
    type Column
} from '@/Components/admin';
import {
    Plus,
    Filter,
    Package,
    AlertCircle,
    Check,
    X
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Product {
    id: number;
    name: string;
    slug: string;
    reference: string;
    barcode: string | null;
    category: {
        id: number;
        name: string;
    };
    image_url: string | null;
    price_ttc: number;
    stock_quantity: number;
    is_active: boolean;
    is_featured: boolean;
    is_variable_weight: boolean;
    views_count: number;
    created_at: string;
    defaultSku?: {
        stock_quantity: number;
        price_ttc: number;
    };
}

interface ProductsData {
    data: Product[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
    };
}

interface ProductsIndexProps {
    products: ProductsData;
    categories: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
        category_id?: string;
        is_active?: string;
        is_variable_weight?: string;
    };
}

export default function ProductsIndex({ products, categories, filters }: ProductsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedFilters, setSelectedFilters] = useState(filters);

    const handleSearch = (searchValue: string) => {
        setSearch(searchValue);
        router.get('/admin/products', { ...selectedFilters, search: searchValue }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...selectedFilters, [key]: value === 'all' ? undefined : value };
        setSelectedFilters(newFilters);
        router.get('/admin/products', { ...newFilters, search }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (product: Product) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
            router.delete(`/admin/products/${product.id}`, {
                onSuccess: () => {
                    // Success is handled by the backend
                },
            });
        }
    };

    const handleDuplicate = (product: Product) => {
        router.post(`/admin/products/${product.id}/duplicate`, {}, {
            onSuccess: () => {
                // Success is handled by the backend
            },
        });
    };

    // Actions communes pour tous les produits (hook appelé au niveau supérieur)
    const createActions = (product: Product) => [
        {
            key: 'view',
            label: 'Voir',
            href: `/admin/products/${product.id}`
        },
        {
            key: 'edit',
            label: 'Modifier',
            href: `/admin/products/${product.id}/edit`
        },
        {
            key: 'duplicate',
            label: 'Dupliquer',
            onClick: () => handleDuplicate(product)
        },
        {
            key: 'delete',
            label: 'Supprimer',
            onClick: () => handleDelete(product),
            variant: 'destructive' as const
        }
    ];

    // Configuration des colonnes pour AdminTable
    const columns: Column<Product>[] = [
        {
            key: 'image',
            title: 'Image',
            width: '80px',
            render: (_, product) => (
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'name',
            title: 'Nom',
            render: (_, product) => (
                <div className="space-y-1">
                    <p className="font-medium">{product.name}</p>
                    <div className="flex items-center gap-2">
                        {product.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                                En vedette
                            </Badge>
                        )}
                        {product.is_variable_weight && (
                            <Badge variant="outline" className="text-xs">
                                Poids variable
                            </Badge>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'reference',
            title: 'Référence',
            render: (_, product) => (
                <div className="space-y-1">
                    <p className="text-sm">{product.reference}</p>
                    {product.barcode && (
                        <p className="text-xs text-muted-foreground">
                            {product.barcode}
                        </p>
                    )}
                </div>
            )
        },
        {
            key: 'category',
            title: 'Catégorie',
            render: (_, product) => product.category.name
        },
        {
            key: 'price_ttc',
            title: 'Prix',
            render: (value) => formatPrice(value)
        },
        {
            key: 'stock',
            title: 'Stock',
            render: (_, product) => (
                <div className="flex items-center gap-1">
                    {product.defaultSku?.stock_quantity || 0}
                    {(product.defaultSku?.stock_quantity || 0) <= 5 && (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                </div>
            )
        },
        {
            key: 'is_active',
            title: 'Statut',
            render: (value) => (
                <Badge
                    variant={value ? 'default' : 'secondary'}
                    className="flex items-center gap-1 w-fit"
                >
                    {value ? (
                        <>
                            <Check className="h-3 w-3" />
                            Actif
                        </>
                    ) : (
                        <>
                            <X className="h-3 w-3" />
                            Inactif
                        </>
                    )}
                </Badge>
            )
        },
        {
            key: 'actions',
            title: 'Actions',
            align: 'right',
            render: (_, product) => {
                const actions = createActions(product);
                return <ActionDropdown actions={actions} />;
            }
        }
    ];

    const breadcrumbs = [
        { label: 'Produits' }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Produits" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Produits</h1>
                        <p className="text-muted-foreground">
                            Gérez votre catalogue de produits
                        </p>
                    </div>
                    <Link href="/admin/products/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau produit
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filtres et recherche
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-5">
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <Select
                                value={selectedFilters.category_id || 'all'}
                                onValueChange={(value) => handleFilterChange('category_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes les catégories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedFilters.is_active || 'all'}
                                onValueChange={(value) => handleFilterChange('is_active', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="1">Actif</SelectItem>
                                    <SelectItem value="0">Inactif</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={selectedFilters.is_variable_weight || 'all'}
                                onValueChange={(value) => handleFilterChange('is_variable_weight', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Type de poids" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    <SelectItem value="1">Poids variable</SelectItem>
                                    <SelectItem value="0">Poids fixe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <AdminTable
                    columns={columns}
                    data={products?.data || []}
                    pagination={products?.meta ? {
                        current_page: products.meta.current_page,
                        last_page: products.meta.last_page,
                        per_page: 20,
                        total: products.meta.total,
                        from: ((products.meta.current_page - 1) * 20) + 1,
                        to: Math.min(products.meta.current_page * 20, products.meta.total),
                        links: products.links || []
                    } : undefined}
                    emptyState={{
                        title: "Aucun produit trouvé",
                        description: search ? 
                            `Aucun produit ne correspond à "${search}". Essayez avec d'autres mots-clés.` :
                            "Vous n'avez pas encore créé de produit. Commencez par ajouter votre premier produit.",
                        icon: <Package className="h-12 w-12" />,
                        action: !search ? {
                            label: 'Créer un produit',
                            onClick: () => window.location.href = '/admin/products/create'
                        } : undefined
                    }}
                />
            </div>
        </AdminLayout>
    );
}