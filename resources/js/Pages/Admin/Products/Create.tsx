import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
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
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category, Attribute } from '@/types/Product';
import { useProductForm } from '@/hooks/useProductForm';

interface ProductCreateProps {
    categories: Category[];
    attributes: Attribute[];
}

export default function ProductCreate({ categories, attributes }: ProductCreateProps) {
    const {
        // États
        data,
        processing,
        errors,
        activeTab,
        setActiveTab,
        skus,
        mainImage,
        galleryImages,

        // Actions
        handleNameChange,
        handleMainImageChange,
        handleGalleryImagesChange,
        addSku,
        updateSku,
        updateSkuAttributeValue,
        removeSku,
        handleSubmit,
        updateData,
        setData,
    } = useProductForm();

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
        { label: 'Nouveau produit' }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Nouveau produit" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nouveau produit</h1>
                        <p className="text-muted-foreground">
                            Créez un nouveau produit dans votre catalogue
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/products">
                            <Button type="button" variant="outline">
                                <X className="mr-2 h-4 w-4" />
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {processing ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </div>
                </div>

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
                                            onChange={(e) => setData('slug', e.target.value)}
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
                                            onChange={(e) => setData('reference', e.target.value)}
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
                                            onChange={(e) => setData('barcode', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Catégorie *</Label>
                                        <Select
                                            value={data.category_id}
                                            onValueChange={(value) => setData('category_id', value)}
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
                                            onChange={(e) => setData('brand', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Pays d'origine</Label>
                                        <Input
                                            id="country"
                                            value={data.country_of_origin}
                                            onChange={(e) => setData('country_of_origin', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="short_description">Description courte</Label>
                                    <Textarea
                                        id="short_description"
                                        value={data.short_description}
                                        onChange={(e) => setData('short_description', e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description complète</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
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
                                            onCheckedChange={(checked) => setData('is_active', checked)}
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
                                            onCheckedChange={(checked) => setData('is_featured', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="images" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Image principale</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FileUpload
                                    accept="image/*"
                                    multiple={false}
                                    maxSize={3 * 1024 * 1024} // 3MB pour l'image principale
                                    maxFiles={1}
                                    allowedExtensions={['.jpg', '.jpeg', '.png', '.webp']}
                                    validateFileSignature={true}
                                    onFilesChange={handleMainImageChange}
                                    value={data.main_image ? [data.main_image] : []}
                                />
                                {errors.main_image && (
                                    <p className="mt-2 text-sm text-red-500">{errors.main_image}</p>
                                )}
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>• Formats acceptés : JPG, JPEG, PNG, WebP</p>
                                    <p>• Taille maximum : 3MB</p>
                                    <p>• Résolution recommandée : 800x800px minimum</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Galerie d'images</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FileUpload
                                    accept="image/*"
                                    multiple={true}
                                    maxSize={2 * 1024 * 1024} // 2MB par image pour la galerie
                                    maxFiles={8}
                                    allowedExtensions={['.jpg', '.jpeg', '.png', '.webp']}
                                    validateFileSignature={true}
                                    onFilesChange={handleGalleryImagesChange}
                                    value={data.gallery_images}
                                />
                                {errors.gallery_images && (
                                    <p className="mt-2 text-sm text-red-500">{errors.gallery_images}</p>
                                )}
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>• Formats acceptés : JPG, JPEG, PNG, WebP</p>
                                    <p>• Taille maximum : 2MB par image</p>
                                    <p>• Maximum 8 images dans la galerie</p>
                                    <p>• Résolution recommandée : 600x600px minimum</p>
                                </div>
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
                                {skus.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            Aucun SKU ajouté. Cliquez sur "Ajouter SKU" pour commencer.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {skus.map((sku, index) => (
                                            <Card key={index}>
                                                <CardHeader className="pb-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-medium">
                                                                SKU #{index + 1}
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
                                                            disabled={skus.length === 1}
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
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Référence SKU *</Label>
                                                            <Input
                                                                value={sku.sku}
                                                                onChange={(e) => updateSku(index, 'sku', e.target.value)}
                                                                placeholder="REF-001"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Code-barres</Label>
                                                            <Input
                                                                value={sku.barcode}
                                                                onChange={(e) => updateSku(index, 'barcode', e.target.value)}
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
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Prix HT</Label>
                                                            <Input
                                                                type="number"
                                                                value={sku.price_ht}
                                                                onChange={(e) => updateSku(index, 'price_ht', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Prix TTC *</Label>
                                                            <Input
                                                                type="number"
                                                                value={sku.price_ttc}
                                                                onChange={(e) => updateSku(index, 'price_ttc', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>TVA (%)</Label>
                                                            <Input
                                                                type="number"
                                                                value={sku.vat_rate}
                                                                onChange={(e) => updateSku(index, 'vat_rate', parseFloat(e.target.value) || 0)}
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
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Poids (g)</Label>
                                                            <Input
                                                                type="number"
                                                                value={sku.weight || ''}
                                                                onChange={(e) => updateSku(index, 'weight', parseInt(e.target.value) || undefined)}
                                                                placeholder="Optionnel"
                                                            />
                                                        </div>
                                                    </div>

                                                    {attributes && attributes.length > 0 && (
                                                        <div className="space-y-2">
                                                            <Label>Attributs</Label>
                                                            <div className="grid gap-4 md:grid-cols-2">
                                                                {attributes.map((attribute) => (
                                                                    <div key={attribute.id} className="space-y-2">
                                                                        <Label className="text-sm">{attribute.name}</Label>
                                                                        <Select
                                                                            value={sku.attributes[attribute.id]?.toString() || ''}
                                                                            onValueChange={(value) => updateSkuAttributeValue(index, attribute.id, parseInt(value))}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Sélectionnez..." />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {(attribute.values ?? []).map((value) => (
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
                                                            />
                                                            <Label>SKU par défaut</Label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={sku.is_variable_weight}
                                                                onCheckedChange={(checked) => updateSku(index, 'is_variable_weight', checked)}
                                                            />
                                                            <Label>Poids variable</Label>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {errors.skus && (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
                                        <AlertCircle className="h-4 w-4" />
                                        <p>{errors.skus}</p>
                                    </div>
                                )}
                                
                                {/* Afficher toutes les erreurs de validation pour debug */}
                                {Object.keys(errors).length > 0 && (
                                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                                        <h4 className="font-semibold text-red-800 mb-2">Erreurs de validation :</h4>
                                        <ul className="list-disc list-inside text-sm text-red-700">
                                            {Object.entries(errors).map(([key, value]) => (
                                                <li key={key}>{key}: {value}</li>
                                            ))}
                                        </ul>
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