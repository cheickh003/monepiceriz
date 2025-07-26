import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Package, Users, ShoppingCart, Plus } from 'lucide-react';
import {
    AdminTable,
    ActionDropdown,
    SearchInput,
    EmptyState,
    EmptyStates,
    type Column,
    type ActionItem
} from '@/Components/admin';

// Données de démonstration
interface DemoProduct {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: 'active' | 'inactive';
    created_at: string;
}

const demoProducts: DemoProduct[] = [
    {
        id: 1,
        name: 'Produit de démonstration 1',
        category: 'Électronique',
        price: 29999,
        stock: 15,
        status: 'active',
        created_at: '2025-07-26T10:00:00Z'
    },
    {
        id: 2,
        name: 'Produit de démonstration 2',
        category: 'Vêtements',
        price: 5999,
        stock: 0,
        status: 'inactive',
        created_at: '2025-07-25T14:30:00Z'
    },
    {
        id: 3,
        name: 'Produit de démonstration 3',
        category: 'Maison',
        price: 12500,
        stock: 8,
        status: 'active',
        created_at: '2025-07-24T09:15:00Z'
    }
];

export default function AdminComponentsDemo() {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Filtrer les produits selon la recherche
    const filteredProducts = demoProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Actions pour les démonstrations
    const createDemoActions = (record: DemoProduct) => [
        {
            key: 'view',
            label: 'Voir',
            onClick: () => alert(`Voir le produit: ${record.name}`)
        },
        {
            key: 'edit',
            label: 'Modifier',
            onClick: () => alert(`Modifier le produit: ${record.name}`)
        },
        {
            key: 'duplicate',
            label: 'Dupliquer',
            onClick: () => alert(`Dupliquer le produit: ${record.name}`)
        },
        {
            key: 'delete',
            label: 'Supprimer',
            onClick: () => alert(`Supprimer le produit: ${record.name}`),
            variant: 'destructive' as const,
            disabled: record.stock > 0
        }
    ];

    // Configuration des colonnes pour AdminTable
    const columns: Column<DemoProduct>[] = [
        {
            key: 'name',
            title: 'Nom du produit',
            sortable: true,
            render: (value, record) => (
                <div>
                    <div className="font-medium">{value}</div>
                    <div className="text-sm text-muted-foreground">#{record.id}</div>
                </div>
            )
        },
        {
            key: 'category',
            title: 'Catégorie',
            sortable: true
        },
        {
            key: 'price',
            title: 'Prix',
            align: 'right',
            render: (value) => (
                <span className="font-mono">
                    {new Intl.NumberFormat('fr-CI', {
                        style: 'currency',
                        currency: 'XOF',
                        minimumFractionDigits: 0
                    }).format(value).replace('CFA', 'CFA')}
                </span>
            )
        },
        {
            key: 'stock',
            title: 'Stock',
            align: 'center',
            render: (value) => (
                <Badge variant={value > 0 ? 'default' : 'destructive'}>
                    {value} unités
                </Badge>
            )
        },
        {
            key: 'status',
            title: 'Statut',
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'active' ? 'default' : 'secondary'}>
                    {value === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
            )
        },
        {
            key: 'actions',
            title: 'Actions',
            align: 'right',
            render: (_, record) => {
                const actions = createDemoActions(record);
                return <ActionDropdown actions={actions} />;
            }
        }
    ];

    // Actions personnalisées pour démonstration
    const customActions: ActionItem[] = [
        {
            key: 'export',
            label: 'Exporter les données',
            onClick: () => alert('Export des données...'),
            icon: <Package className="mr-2 h-4 w-4" />
        },
        {
            key: 'settings',
            label: 'Paramètres',
            onClick: () => alert('Ouverture des paramètres...'),
            separator: true
        }
    ];

    const handleSearch = (value: string) => {
        setLoading(true);
        setSearchTerm(value);
        // Simuler un délai de recherche
        setTimeout(() => setLoading(false), 500);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    return (
        <AdminLayout title="Démonstration des composants admin">
            <Head title="Démonstration des composants admin" />

            <div className="space-y-8">
                {/* En-tête */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Démonstration des composants admin</h1>
                    <p className="text-muted-foreground mt-2">
                        Démonstration des composants AdminTable, ActionDropdown, SearchInput, EmptyState et useCrudActions.
                    </p>
                </div>

                {/* Composants de recherche */}
                <Card>
                    <CardHeader>
                        <CardTitle>Composant SearchInput</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SearchInput
                            value={searchTerm}
                            placeholder="Rechercher des produits..."
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={loading}
                            showClearButton={true}
                        />
                        
                        <div className="text-sm text-muted-foreground">
                            {searchTerm ? (
                                <>Recherche pour: <strong>"{searchTerm}"</strong> - {filteredProducts.length} résultat(s)</>
                            ) : (
                                <>Tapez pour rechercher parmi {demoProducts.length} produits</>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Dropdown d'actions personnalisées */}
                <Card>
                    <CardHeader>
                        <CardTitle>Composant ActionDropdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <ActionDropdown
                                actions={customActions}
                                label="Actions personnalisées"
                            />
                            <p className="text-sm text-muted-foreground">
                                Cliquez sur le bouton pour voir les actions disponibles
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tableau principal */}
                <Card>
                    <CardHeader>
                        <CardTitle>Composant AdminTable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredProducts.length > 0 ? (
                            <AdminTable
                                data={filteredProducts}
                                columns={columns}
                                loading={loading}
                                onSort={(key, direction) => {
                                    console.log(`Tri par ${key} en ${direction}`);
                                }}
                            />
                        ) : (
                            <EmptyState
                                {...EmptyStates.searchNoResults(searchTerm, handleClearSearch)}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* États vides */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>État vide - Aucun produit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EmptyState
                                {...EmptyStates.noProducts(() => alert('Créer un nouveau produit'))}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>État vide - Aucune commande</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EmptyState
                                {...EmptyStates.noOrders()}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Résumé des composants */}
                <Card>
                    <CardHeader>
                        <CardTitle>Composants implémentés</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <Package className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h3 className="font-medium">AdminTable</h3>
                                    <p className="text-sm text-muted-foreground">Tableau avec tri et pagination</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <Users className="h-8 w-8 text-green-600" />
                                <div>
                                    <h3 className="font-medium">ActionDropdown</h3>
                                    <p className="text-sm text-muted-foreground">Menu d'actions CRUD</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                <ShoppingCart className="h-8 w-8 text-orange-600" />
                                <div>
                                    <h3 className="font-medium">SearchInput</h3>
                                    <p className="text-sm text-muted-foreground">Recherche avec debounce</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 