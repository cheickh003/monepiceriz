import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
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
    } = useProductForm();

    const renderCategoryOptions = (categories: Category[], level = 0): React.ReactNode => {
        return categories.map((category) => (
            <React.Fragment key={category.id}>
                <option value={category.id.toString()}>
                    {'\u00A0'.repeat(level * 4)}{category.name}
                </option>
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

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nouveau produit</h1>
                        <p className="text-muted-foreground">
                            Créez un nouveau produit dans votre catalogue
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/products" className="btn btn-outline">
                            Annuler
                        </Link>
                        <button 
                            onClick={handleSubmit} 
                            disabled={processing}
                            className="btn btn-primary"
                        >
                            {processing ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </div>

                {/* Tabs de navigation */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'general'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Général
                        </button>
                        <button
                            onClick={() => setActiveTab('images')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'images'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Images
                        </button>
                        <button
                            onClick={() => setActiveTab('skus')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'skus'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            SKUs
                        </button>
                    </nav>
                </div>

                {/* Contenu des onglets */}
                <div className="bg-white shadow rounded-lg p-6">
                    {activeTab === 'general' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nom du produit *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => updateData('slug', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                />
                                {errors.slug && (
                                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Catégorie *
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => updateData('category_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    required
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {renderCategoryOptions(categories)}
                                </select>
                                {errors.category_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => updateData('description', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => updateData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Produit actif
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Image principale
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleMainImageChange(Array.from(e.target.files || []))}
                                    className="mt-1 block w-full"
                                />
                                {mainImage && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        Fichier sélectionné: {mainImage.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Images de galerie
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleGalleryImagesChange(Array.from(e.target.files || []))}
                                    className="mt-1 block w-full"
                                />
                                {galleryImages.length > 0 && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        {galleryImages.length} fichier(s) sélectionné(s)
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'skus' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">SKUs du produit</h3>
                                <button
                                    onClick={addSku}
                                    className="btn btn-primary btn-sm"
                                >
                                    Ajouter un SKU
                                </button>
                            </div>

                            <div className="space-y-4">
                                {skus.map((sku, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium">SKU {index + 1}</h4>
                                            {skus.length > 1 && (
                                                <button
                                                    onClick={() => removeSku(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Supprimer
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Code SKU
                                                </label>
                                                <input
                                                    type="text"
                                                    value={sku.sku}
                                                    onChange={(e) => updateSku(index, 'sku', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Prix TTC (€)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={sku.price_ttc}
                                                    onChange={(e) => updateSku(index, 'price_ttc', parseFloat(e.target.value) || 0)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Stock
                                                </label>
                                                <input
                                                    type="number"
                                                    value={sku.stock_quantity}
                                                    onChange={(e) => updateSku(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                                                />
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={sku.is_default}
                                                    onChange={(e) => updateSku(index, 'is_default', e.target.checked)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 block text-sm text-gray-900">
                                                    SKU par défaut
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
} 