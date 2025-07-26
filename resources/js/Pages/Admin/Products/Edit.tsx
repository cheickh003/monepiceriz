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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { FileUpload } from '@/Components/ui/file-upload';
import {
    Info,
    Package,
    Image,
    Tag,
    Plus,
    Trash2,
    Save,
    X,
    AlertCircle,
    Copy,
    Clock
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    children?: Category[];
}

interface Attribute {
    id: number;
    name: string;
    type: string;
    values: Array<{
        id: number;
        value: string;
        hex_color?: string;
    }>;
}

interface ProductImage {
    id: number;
    image_url: string;
    is_main: boolean;
}

interface Sku {
    id?: number;
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
    attributes: Record<number, number>;
    _destroy?: boolean;
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
    category_id: number;
    country_of_origin?: string;
    is_active: boolean;
    is_featured: boolean;
    images: ProductImage[];
    skus: Sku[];
    created_at: string;
    updated_at: string;
}

interface ProductEditProps {
    product: Product;
    categories: Category[];
    attributes: Attribute[];
}

export default function ProductEdit({ product, categories, attributes }: ProductEditProps) {
    const [activeTab, setActiveTab] = useState('general');
    const [skus, setSkus] = useState<Sku[]>(product.skus);
    const [existingImages, setExistingImages] = useState<ProductImage[]>(product.images);
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: product.name,
        slug: product.slug,
        reference: product.reference,
        barcode: product.barcode || '',
        brand: product.brand || '',
        description: product.description || '',
        short_description: product.short_description || '',
        category_id: product.category_id.toString(),
        country_of_origin: product.country_of_origin || '',
        is_active: product.is_active,
        is_featured: product.is_featured,
        main_image: null as File | null,
        gallery_images: [] as File[],
        images_to_delete: [] as number[],
        skus: skus,
        _method: 'PUT'
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

    const handleMainImageChange = (files: File[]) => {
        if (files.length > 0) {
            setMainImage(files[0]);
            setData('main_image', files[0]);
            setHasChanges(true);
        }
    };

    const handleGalleryImagesChange = (files: File[]) => {
        setGalleryImages(files);
        setData('gallery_images', files);
        setHasChanges(true);
    };

    const deleteExistingImage = (imageId: number) => {
        setImagesToDelete([...imagesToDelete, imageId]);
        setData('images_to_delete', [...imagesToDelete, imageId]);
        setExistingImages(existingImages.filter(img => img.id !== imageId));
        setHasChanges(true);
    };

    const addSku = () => {
        const newSku: Sku = {
            name: '',
            sku: '',
            barcode: '',
            purchase_price: 0,
            price_ht: 0,
            price_ttc: 0,
            vat_rate: 0,
            stock_quantity: 0,
            weight: undefined,
            is_default: skus.length === 0,
            is_variable_weight: false,
            attributes: {}
        };
        const updatedSkus = [...skus, newSku];
        setSkus(updatedSkus);
        setData('skus', updatedSkus);
        setHasChanges(true);
    };

    const updateSku = (index: number, field: keyof Sku, value: any) => {
        const updatedSkus = [...skus];
        updatedSkus[index] = { ...updatedSkus[index], [field]: value };
        
        // If setting as default, unset others
        if (field === 'is_default' && value === true) {
            updatedSkus.forEach((sku, i) => {
                if (i !== index) sku.is_default = false;
            });
        }
        
        setSkus(updatedSkus);
        setData('skus', updatedSkus);
        setHasChanges(true);
    };

    const updateSkuAttribute = (skuIndex: number, attributeId: number, valueId: number) => {
        const updatedSkus = [...skus];
        updatedSkus[skuIndex].attributes[attributeId] = valueId;
        setSkus(updatedSkus);
        setData('skus', updatedSkus);
        setHasChanges(true);
    };

    const removeSku = (index: number) => {
        const updatedSkus = [...skus];
        if (updatedSkus[index].id) {
            // Mark existing SKU for deletion
            updatedSkus[index]._destroy = true;
        } else {
            // Remove new SKU
            updatedSkus.splice(index, 1);
        }
        
        // Ensure at least one SKU is default
        const activeSkus = updatedSkus.filter(sku => !sku._destroy);
        if (activeSkus.length > 0 && !activeSkus.some(sku => sku.is_default)) {
            activeSkus[0].is_default = true;
        }
        
        setSkus(updatedSkus);
        setData('skus', updatedSkus);
        setHasChanges(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate at least one active SKU
        const activeSkus = skus.filter(sku => !sku._destroy);
        if (activeSkus.length === 0) {
            alert('Vous devez avoir au moins un SKU actif');
            return;
        }

        const formData = new FormData();
        
        // Add basic fields
        Object.keys(data).forEach((key) => {
            if (key === 'main_image' || key === 'gallery_images' || key === 'skus' || key === 'images_to_delete') return;
            formData.append(key, data[key as keyof typeof data] as string);
        });

        // Add images
        if (mainImage) {
            formData.append('main_image', mainImage);
        }
        galleryImages.forEach((image, index) => {
            formData.append(`gallery_images[${index}]`, image);
        });

        // Add images to delete
        imagesToDelete.forEach((id, index) => {
            formData.append(`images_to_delete[${index}]`, id.toString());
        });

        // Add SKUs
        formData.append('skus', JSON.stringify(skus));

        router.post(`/admin/products/${product.id}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                setHasChanges(false);
            },
        });
    };

    const handleDuplicate = () => {
        if (hasChanges) {
            if (!confirm('Vous avez des modifications non sauvegardées. Voulez-vous continuer ?')) {
                return;
            }
        }
        router.post(`/admin/products/${product.id}/duplicate`);
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

    const breadcrumbs = [
        { label: 'Produits', href: '/admin/products' },
        { label: product.name }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${product.name}`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Modifier le produit</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Créé le {formatDate(product.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Modifié le {formatDate(product.updated_at)}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleDuplicate}>
                            <Copy className="mr-2 h-4 w-4" />
                            Dupliquer
                        </Button>
                        <Link href="/admin/products">
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

                {/* Form Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 w-full max-w-[400px]">
                        <TabsTrigger value="general" className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Général
                        </TabsTrigger>
                        <TabsTrigger value="images" className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Images
                        </TabsTrigger>
                        <TabsTrigger value="skus" className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            SKUs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations générales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom du produit *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className={cn(errors.name && 'border-red-500')}
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
                                            onChange={(e) => {
                                                setData('slug', e.target.value);
                                                setHasChanges(true);
                                            }}
                                            className={cn(errors.slug && 'border-red-500')}
                                        />
                                        {errors.slug && (
                                            <p className="text-sm text-red-500">{errors.slug}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reference">Référence *</Label>
                                        <Input
                                            id="reference"
                                            value={data.reference}
                                            onChange={(e) => {
                                                setData('reference', e.target.value);
                                                setHasChanges(true);
                                            }}
                                            className={cn(errors.reference && 'border-red-500')}
                                        />
                                        {errors.reference && (
                                            <p className="text-sm text-red-500">{errors.reference}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="barcode">Code-barres</Label>
                                        <Input
                                            id="barcode"
                                            value={data.barcode}
                                            onChange={(e) => {
                                                setData('barcode', e.target.value);
                                                setHasChanges(true);
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Catégorie *</Label>
                                        <Select
                                            value={data.category_id}
                                            onValueChange={(value) => {
                                                setData('category_id', value);
                                                setHasChanges(true);
                                            }}
                                        >
                                            <SelectTrigger className={cn(errors.category_id && 'border-red-500')}>
                                                <SelectValue placeholder="Sélectionnez une catégorie" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {renderCategoryOptions(categories)}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && (
                                            <p className="text-sm text-red-500">{errors.category_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Marque</Label>
                                        <Input
                                            id="brand"
                                            value={data.brand}
                                            onChange={(e) => {
                                                setData('brand', e.target.value);
                                                setHasChanges(true);
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Pays d'origine</Label>
                                        <Input
                                            id="country"
                                            value={data.country_of_origin}
                                            onChange={(e) => {
                                                setData('country_of_origin', e.target.value);
                                                setHasChanges(true);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="short_description">Description courte</Label>
                                    <Textarea
                                        id="short_description"
                                        value={data.short_description}
                                        onChange={(e) => {
                                            setData('short_description', e.target.value);
                                            setHasChanges(true);
                                        }}
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description complète</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => {
                                            setData('description', e.target.value);
                                            setHasChanges(true);
                                        }}
                                        rows={5}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="is_active">Produit actif</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Le produit sera visible sur la boutique
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => {
                                                setData('is_active', checked);
                                                setHasChanges(true);
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="is_featured">Produit en vedette</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Le produit apparaîtra sur la page d'accueil
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_featured"
                                            checked={data.is_featured}
                                            onCheckedChange={(checked) => {
                                                setData('is_featured', checked);
                                                setHasChanges(true);
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="images" className="space-y-6">
                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Images existantes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                        {existingImages.map((image) => (
                                            <div key={image.id} className="relative group">
                                                <img
                                                    src={image.image_url}
                                                    alt=""
                                                    className="h-32 w-full rounded-lg object-cover"
                                                />
                                                {image.is_main && (
                                                    <Badge className="absolute top-2 left-2" variant="secondary">
                                                        Principale
                                                    </Badge>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => deleteExistingImage(image.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Nouvelle image principale</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Remplacera l'image principale actuelle si elle existe
                                </p>
                            </CardHeader>
                            <CardContent>
                                <FileUpload
                                    accept="image/*"
                                    multiple={false}
                                    maxSize={5 * 1024 * 1024} // 5MB
                                    onFilesChange={handleMainImageChange}
                                />
                                {errors.main_image && (
                                    <p className="mt-2 text-sm text-red-500">{errors.main_image}</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ajouter à la galerie</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FileUpload
                                    accept="image/*"
                                    multiple={true}
                                    maxSize={5 * 1024 * 1024} // 5MB
                                    onFilesChange={handleGalleryImagesChange}
                                />
                                {errors.gallery_images && (
                                    <p className="mt-2 text-sm text-red-500">{errors.gallery_images}</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="skus" className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Variantes SKU</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Gérez les différentes variantes de votre produit
                                    </p>
                                </div>
                                <Button type="button" onClick={addSku} size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter SKU
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {skus.filter(sku => !sku._destroy).map((sku, index) => (
                                        <Card key={index} className={cn(sku._destroy && 'opacity-50')}>
                                            <CardHeader className="pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-medium">
                                                            {sku.id ? `SKU #${sku.id}` : `Nouveau SKU`}
                                                        </h4>
                                                        {sku.is_default && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Par défaut
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeSku(index)}
                                                        disabled={skus.filter(s => !s._destroy).length === 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <div className="space-y-2">
                                                        <Label>Nom</Label>
                                                        <Input
                                                            value={sku.name}
                                                            onChange={(e) => updateSku(index, 'name', e.target.value)}
                                                            placeholder="Ex: 1kg, Rouge, Taille M"
                                                            disabled={sku._destroy}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Référence SKU *</Label>
                                                        <Input
                                                            value={sku.sku}
                                                            onChange={(e) => updateSku(index, 'sku', e.target.value)}
                                                            placeholder="REF-001"
                                                            disabled={sku._destroy}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Code-barres</Label>
                                                        <Input
                                                            value={sku.barcode || ''}
                                                            onChange={(e) => updateSku(index, 'barcode', e.target.value)}
                                                            disabled={sku._destroy}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-4">
                                                    <div className="space-y-2">
                                                        <Label>Prix d'achat</Label>
                                                        <Input
                                                            type="number"
                                                            value={sku.purchase_price}
                                                            onChange={(e) => updateSku(index, 'purchase_price', parseFloat(e.target.value) || 0)}
                                                            disabled={sku._destroy}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Prix HT</Label>
                                                        <Input
                                                            type="number"
                                                            value={sku.price_ht}
                                                            onChange={(e) => updateSku(index, 'price_ht', parseFloat(e.target.value) || 0)}
                                                            disabled={sku._destroy}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Prix TTC *</Label>
                                                        <Input
                                                            type="number"
                                                            value={sku.price_ttc}
                                                            onChange={(e) => updateSku(index, 'price_ttc', parseFloat(e.target.value) || 0)}
                                                            disabled={sku._destroy}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>TVA (%)</Label>
                                                        <Input
                                                            type="number"
                                                            value={sku.vat_rate}
                                                            onChange={(e) => updateSku(index, 'vat_rate', parseFloat(e.target.value) || 0)}
                                                            disabled={sku._destroy}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <div className="space-y-2">
                                                        <Label>Stock</Label>
                                                        <Input
                                                            type="number"
                                                            value={sku.stock_quantity}
                                                            onChange={(e) => updateSku(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                                                            disabled={sku._destroy}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Poids (g)</Label>
                                                        <Input
                                                            type="number"
                                                            value={sku.weight || ''}
                                                            onChange={(e) => updateSku(index, 'weight', parseInt(e.target.value) || undefined)}
                                                            placeholder="Optionnel"
                                                            disabled={sku._destroy}
                                                        />
                                                    </div>
                                                </div>

                                                {attributes.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label>Attributs</Label>
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            {attributes.map((attribute) => (
                                                                <div key={attribute.id} className="space-y-2">
                                                                    <Label className="text-sm">{attribute.name}</Label>
                                                                    <Select
                                                                        value={sku.attributes[attribute.id]?.toString() || ''}
                                                                        onValueChange={(value) => updateSkuAttribute(index, attribute.id, parseInt(value))}
                                                                        disabled={sku._destroy}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Sélectionnez..." />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {attribute.values.map((value) => (
                                                                                <SelectItem key={value.id} value={value.id.toString()}>
                                                                                    <div className="flex items-center gap-2">
                                                                                        {attribute.type === 'color' && value.hex_color && (
                                                                                            <div
                                                                                                className="h-4 w-4 rounded border"
                                                                                                style={{ backgroundColor: value.hex_color }}
                                                                                            />
                                                                                        )}
                                                                                        {value.value}
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={sku.is_default}
                                                            onCheckedChange={(checked) => updateSku(index, 'is_default', checked)}
                                                            disabled={sku._destroy}
                                                        />
                                                        <Label>SKU par défaut</Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={sku.is_variable_weight}
                                                            onCheckedChange={(checked) => updateSku(index, 'is_variable_weight', checked)}
                                                            disabled={sku._destroy}
                                                        />
                                                        <Label>Poids variable</Label>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {errors.skus && (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
                                        <AlertCircle className="h-4 w-4" />
                                        <p>{errors.skus}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </AdminLayout>
    );
}