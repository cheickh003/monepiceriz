import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { useInertiaErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from '@/Components/ui/use-toast';
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
    ToggleLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    children?: Category[];
}

interface CategoryCreateProps {
    categories: Category[];
}

export default function CategoryCreate({ categories }: CategoryCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        parent_id: 'none',
        icon: 'none',
        position: '',
        is_active: true,
        is_featured: false,
        meta_title: '',
        meta_description: ''
    });

    const { createFormErrorHandler } = useInertiaErrorHandler();

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
        if (!data.slug || data.slug === generateSlug(data.name)) {
            setData('slug', generateSlug(name));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare data for submission
        const submitData = {
            ...data,
            parent_id: data.parent_id === 'none' ? null : data.parent_id,
            icon: data.icon === 'none' ? '' : data.icon
        };
        
        post('/admin/categories', submitData, {
            onSuccess: () => {
                toast({
                    title: "Succès",
                    description: "La catégorie a été créée avec succès",
                    variant: "success",
                });
            },
            onError: createFormErrorHandler('create', {
                toastDescription: "Impossible de créer la catégorie"
            })
        });
    };

    const renderCategoryOptions = (categories: Category[], level = 0): React.ReactNode => {
        return categories.map((category) => (
            <React.Fragment key={category.id}>
                <SelectItem value={category.id.toString()}>
                    {'\u00A0'.repeat(level * 4)}{category.name}
                </SelectItem>
                {category.children && renderCategoryOptions(category.children, level + 1)}
            </React.Fragment>
        ));
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
        { label: 'Nouvelle catégorie' }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouvelle catégorie" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nouvelle catégorie</h1>
                        <p className="text-muted-foreground">
                            Créez une nouvelle catégorie pour organiser vos produits
                        </p>
                    </div>
                    <div className="flex gap-2">
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
                                    onChange={(e) => setData('slug', e.target.value)}
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
                                    onChange={(e) => setData('description', e.target.value)}
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
                                    onValueChange={(value) => setData('parent_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Aucune (catégorie racine)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Aucune (catégorie racine)</SelectItem>
                                        {renderCategoryOptions(categories)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="icon">Icône</Label>
                                <Select
                                    value={data.icon}
                                    onValueChange={(value) => setData('icon', value)}
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
                                    onChange={(e) => setData('position', e.target.value)}
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
                                    onChange={(e) => setData('meta_title', e.target.value)}
                                    placeholder="Titre pour les moteurs de recherche"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meta_description">Meta description</Label>
                                <Textarea
                                    id="meta_description"
                                    value={data.meta_description}
                                    onChange={(e) => setData('meta_description', e.target.value)}
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
                                    onCheckedChange={(checked) => setData('is_active', checked)}
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
                                    onCheckedChange={(checked) => setData('is_featured', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AdminLayout>
    );
}