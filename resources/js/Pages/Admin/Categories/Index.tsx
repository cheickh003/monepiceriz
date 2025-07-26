import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    SearchInput,
    AdminTable,
    ActionDropdown,
    EmptyState,
    useCrudActions,
    type Column
} from '@/Components/admin';
import {
    Plus,
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    Check,
    X,
    Package,
    FolderTree
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    position: number;
    is_active: boolean;
    is_featured: boolean;
    products_count: number;
    children: Category[];
}

interface CategoriesIndexProps {
    categories: Category[];
}

interface CategoryRowProps {
    category: Category;
    level: number;
    expanded: Set<number>;
    onToggle: (id: number) => void;
    onDelete: (category: Category) => void;
}

// Separate component for category actions to properly use hooks
const CategoryActions: React.FC<{ category: Category; onDelete: (category: Category) => void }> = ({ category, onDelete }) => {
    const actions = useCrudActions('/admin/categories', category, {
        canDuplicate: false,
        onDelete: () => onDelete(category),
        deleteDisabled: (category.products_count || 0) > 0 || (category.children?.length || 0) > 0
    });
    
    return <ActionDropdown actions={actions} />;
};

// Fonction pour aplatir les catégories hiérarchiques en liste plate
const flattenCategories = (categories: Category[], level = 0, expanded: Set<number>): Array<Category & { level: number }> => {
    const result: Array<Category & { level: number }> = [];
    
    categories.forEach(category => {
        result.push({ ...category, level });
        
        if (category.children && category.children.length > 0 && expanded.has(category.id)) {
            result.push(...flattenCategories(category.children, level + 1, expanded));
        }
    });
    
    return result;
};

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const handleToggle = (id: number) => {
        const newExpanded = new Set(expanded);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpanded(newExpanded);
    };

    const handleDelete = (category: Category) => {
        const childrenCount = category.children?.length || 0;
        const message = childrenCount > 0
            ? `Cette catégorie contient ${childrenCount} sous-catégorie(s). Veuillez d'abord les supprimer.`
            : category.products_count > 0
            ? `Cette catégorie contient ${category.products_count} produit(s). Veuillez d'abord les retirer.`
            : `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`;

        if (childrenCount > 0 || category.products_count > 0) {
            alert(message);
            return;
        }

        if (confirm(message)) {
            router.delete(`/admin/categories/${category.id}`, {
                onSuccess: () => {
                    // Success is handled by the backend
                },
            });
        }
    };

    const filterCategories = (categories: Category[], searchTerm: string): Category[] => {
        return categories.reduce((acc: Category[], category) => {
            const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 category.slug.toLowerCase().includes(searchTerm.toLowerCase());
            
            const filteredChildren = filterCategories(category.children || [], searchTerm);
            
            if (matchesSearch || filteredChildren.length > 0) {
                acc.push({
                    ...category,
                    children: filteredChildren
                });
            }
            
            return acc;
        }, []);
    };

    const filteredCategories = search ? filterCategories(categories, search) : categories;
    const flatCategories = flattenCategories(filteredCategories, 0, expanded);

    // Configuration des colonnes pour AdminTable
    const columns: Column<Category & { level: number }>[] = [
        {
            key: 'name',
            title: 'Nom',
            render: (_, category) => {
                const hasChildren = (category.children?.length || 0) > 0;
                const isExpanded = expanded.has(category.id);
                
                return (
                    <div className="flex items-center" style={{ paddingLeft: `${category.level * 24}px` }}>
                        <button
                            onClick={() => hasChildren && handleToggle(category.id)}
                            className="mr-2 p-1 hover:bg-gray-100 rounded"
                            disabled={!hasChildren}
                        >
                            {hasChildren ? (
                                isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                            ) : (
                                <div className="h-4 w-4" />
                            )}
                        </button>
                        <div className="flex items-center gap-2">
                            {isExpanded ? (
                                <FolderOpen className="h-4 w-4 text-gray-500" />
                            ) : (
                                <Folder className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="font-medium">{category.name}</span>
                            {category.is_featured && (
                                <Badge variant="secondary" className="text-xs">
                                    En vedette
                                </Badge>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'slug',
            title: 'Slug',
            render: (value) => <span className="text-muted-foreground">{value}</span>
        },
        {
            key: 'position',
            title: 'Position',
            align: 'center'
        },
        {
            key: 'products_count',
            title: 'Produits',
            align: 'center',
            render: (value) => (
                <div className="flex items-center justify-center gap-1">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span>{value}</span>
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
            render: (_, category) => {
                return <CategoryActions category={category} onDelete={handleDelete} />;
            }
        }
    ];

    const breadcrumbs = [
        { label: 'Catégories' }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Catégories" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Catégories</h1>
                        <p className="text-muted-foreground">
                            Organisez vos produits en catégories
                        </p>
                    </div>
                    <Link href="/admin/categories/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle catégorie
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <SearchInput
                    placeholder="Rechercher une catégorie..."
                    onSearch={setSearch}
                />

                {/* Categories Table */}
                <AdminTable
                    columns={columns}
                    data={flatCategories}
                    emptyState={{
                        title: "Aucune catégorie trouvée",
                        description: search ? 
                            `Aucune catégorie ne correspond à "${search}". Essayez avec d'autres mots-clés.` :
                            "Vous n'avez pas encore créé de catégorie. Commencez par ajouter votre première catégorie.",
                        icon: <FolderTree className="h-12 w-12" />,
                        action: !search ? {
                            label: 'Créer une catégorie',
                            onClick: () => window.location.href = '/admin/categories/create'
                        } : undefined
                    }}
                />

                {/* Info */}
                <div className="rounded-lg bg-blue-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-800">
                                Les catégories peuvent être organisées de manière hiérarchique. 
                                Utilisez la fonction glisser-déposer pour réorganiser l'ordre des catégories (bientôt disponible).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}