import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Save,
    X,
    FolderTree,
    Hash,
    Image,
    Type,
    AlignLeft,
    ToggleLeft,
    Clock,
    Package,
    AlertCircle,
    Trash2
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent_id: number | null;
    icon?: string;
    position: number;
    is_active: boolean;
    is_featured: boolean;
    meta_title?: string;
    meta_description?: string;
    products_count: number;
    children_count: number;
    created_at: string;
    updated_at: string;
}

interface CategoryOption {
    id: number;
    name: string;
    parent_id: number | null;
    children?: CategoryOption[];
}

interface CategoryEditProps {
    category: Category;
    categories?: CategoryOption[];
}

export default function CategoryEdit({ category, categories = [] }: CategoryEditProps) {
    const [hasChanges, setHasChanges] = useState(false);
    
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parent_id: category.parent_id?.toString() || 'none',
        icon: category.icon || 'none',
        position: category.position.toString(),
        is_active: category.is_active,
        is_featured: category.is_featured,
        meta_title: category.meta_title || '',
        meta_description: category.meta_description || ''
    });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (name: string) => {
        setData('name', name);
        setHasChanges(true);
    };

    const handleFieldChange = (field: string, value: any) => {
        setData(field as any, value);
        setHasChanges(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare data for submission
        const submitData = {
            ...data,
            parent_id: data.parent_id === 'none' ? null : data.parent_id,
            icon: data.icon === 'none' ? '' : data.icon
        };
        
        put(`/admin/categories/${category.id}`, submitData, {
            onSuccess: () => {
                setHasChanges(false);
            },
        });
    };

    const handleDelete = () => {
        const message = category.children_count > 0
            ? `Cette catégorie contient ${category.children_count} sous-catégorie(s). Veuillez d'abord les supprimer.`
            : category.products_count > 0
            ? `Cette catégorie contient ${category.products_count} produit(s). Veuillez d'abord les retirer.`
            : `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`;

        if (category.children_count > 0 || category.products_count > 0) {
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

    const renderCategoryOptions = (categories: CategoryOption[], level = 0): React.ReactNode => {
        if (!categories || !Array.isArray(categories)) {
            return null;
        }
        
        return categories.map((cat) => {
            // Prevent category from being its own parent
            if (cat.id === category.id) return null;
            
            return (
                <React.Fragment key={cat.id}>
                    <SelectItem value={cat.id.toString()}>
                        {'\u00A0'.repeat(level * 4)}{cat.name}
                    </SelectItem>
                    {cat.children && renderCategoryOptions(cat.children, level + 1)}
                </React.Fragment>
            );
        });
    };

    const iconOptions = [
        { value: 'folder', label: 'Dossier' },
        { value: 'shopping-basket', label: 'Panier' },
        { value: 'package', label: 'Paquet' },
        { value: 'tag', label: 'Étiquette' },
        { value: 'leaf', label: 'Feuille' },
        { value: 'coffee', label: 'Café' },
        { value: 'apple', label: 'Pomme' },
        { value: 'beef', label: 'Viande' },
        { value: 'fish', label: 'Poisson' },
        { value: 'milk', label: 'Lait' },
        { value: 'wheat', label: 'Blé' },
        { value: 'candy', label: 'Bonbon' },
        { value: 'wine', label: 'Vin' },
        { value: 'soup', label: 'Soupe' },
        { value: 'ice-cream', label: 'Glace' },
    ];

    const breadcrumbs = [
        { label: 'Catégories', href: '/admin/categories' },
        { label: category.name }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${category.name}`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Modifier la catégorie</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Créé le {formatDate(category.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Modifié le {formatDate(category.updated_at)}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={category.children_count > 0 || category.products_count > 0}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                        <Link href="/admin/categories">
                            <Button type="button" variant="outline">
                                <X className="mr-2 h-4 w-4" />
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer
                        </Button>
                    </div>
                </div>

                {/* Unsaved changes warning */}
                {hasChanges && (
                    <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <p>Vous avez des modifications non sauvegardées</p>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Produits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Package className="h-8 w-8 text-muted-foreground" />
                                <span className="text-2xl font-bold">{category.products_count}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Sous-catégories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <FolderTree className="h-8 w-8 text-muted-foreground" />
                                <span className="text-2xl font-bold">{category.children_count}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Form */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* General Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                Informations générales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom de la catégorie *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className={cn(errors.name && 'border-red-500')}
                                    placeholder="Ex: Fruits et légumes"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug URL</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => handleFieldChange('slug', e.target.value)}
                                    className={cn(errors.slug && 'border-red-500')}
                                    placeholder="fruits-et-legumes"
                                />
                                {errors.slug && (
                                    <p className="text-sm text-red-500">{errors.slug}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    L'URL de la catégorie sera : /categories/{data.slug || 'slug'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => handleFieldChange('description', e.target.value)}
                                    rows={3}
                                    placeholder="Description de la catégorie..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hierarchy & Display */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FolderTree className="h-4 w-4" />
                                Hiérarchie et affichage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="parent">Catégorie parent</Label>
                                <Select
                                    value={data.parent_id}
                                    onValueChange={(value) => handleFieldChange('parent_id', value)}
                                >
                                    <SelectTrigger className={cn(errors.parent_id && 'border-red-500')}>
                                        <SelectValue placeholder="Aucune (catégorie racine)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Aucune (catégorie racine)</SelectItem>
                                        {renderCategoryOptions(categories)}
                                    </SelectContent>
                                </Select>
                                {errors.parent_id && (
                                    <p className="text-sm text-red-500">{errors.parent_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="icon">Icône</Label>
                                <Select
                                    value={data.icon}
                                    onValueChange={(value) => handleFieldChange('icon', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez une icône" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Aucune icône</SelectItem>
                                        {iconOptions.map((icon) => (
                                            <SelectItem key={icon.value} value={icon.value}>
                                                {icon.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">Position</Label>
                                <Input
                                    id="position"
                                    type="number"
                                    value={data.position}
                                    onChange={(e) => handleFieldChange('position', e.target.value)}
                                    placeholder="0"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Ordre d'affichage (plus petit = affiché en premier)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                SEO
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="meta_title">Meta titre</Label>
                                <Input
                                    id="meta_title"
                                    value={data.meta_title}
                                    onChange={(e) => handleFieldChange('meta_title', e.target.value)}
                                    placeholder="Titre pour les moteurs de recherche"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meta_description">Meta description</Label>
                                <Textarea
                                    id="meta_description"
                                    value={data.meta_description}
                                    onChange={(e) => handleFieldChange('meta_description', e.target.value)}
                                    rows={3}
                                    placeholder="Description pour les moteurs de recherche"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Recommandé : 150-160 caractères
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ToggleLeft className="h-4 w-4" />
                                Statut
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="is_active">Catégorie active</Label>
                                    <p className="text-sm text-muted-foreground">
                                        La catégorie sera visible sur la boutique
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => handleFieldChange('is_active', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="is_featured">Catégorie en vedette</Label>
                                    <p className="text-sm text-muted-foreground">
                                        La catégorie sera mise en avant sur la page d'accueil
                                    </p>
                                </div>
                                <Switch
                                    id="is_featured"
                                    checked={data.is_featured}
                                    onCheckedChange={(checked) => handleFieldChange('is_featured', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}