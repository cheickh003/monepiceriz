import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Category, Attribute, Product } from '@/types/Product';
import { useProductForm } from '@/hooks/useProductForm';

interface ProductEditProps {
    product: Product;
    categories: Category[];
    attributes: Attribute[];
}

export default function ProductEdit({ product, categories, attributes }: ProductEditProps) {
    const {
        // États
        data,
        processing,
        errors,
        activeTab,
        setActiveTab,
        skus,
        existingImages,
        mainImage,
        galleryImages,
        hasChanges,

        // Actions
        handleNameChange,
        handleMainImageChange,
        handleGalleryImagesChange,
        deleteExistingImage,
        addSku,
        updateSku,
        updateSkuAttributeValue,
        removeSku,
        handleSubmit,
        handleDuplicate,
        updateData,
    } = useProductForm({ 
        product,
        onSuccess: () => {
            console.log('Produit mis à jour avec succès');
        },
        onError: (errors) => {
            console.error('Erreur lors de la mise à jour:', errors);
        }
    });

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
        { label: product.name }
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${product.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Modifier le produit</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}</span>
                            <span>Modifié le {new Date(product.updated_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDuplicate}
                            className="btn btn-outline"
                        >
                            Dupliquer
                        </button>
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

                {/* Avertissement modifications non sauvegardées */}
                {hasChanges && (
                    <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Vous avez des modifications non sauvegardées.
                    </div>
                )}

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
                            {/* Images existantes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Images existantes
                                </label>
                                <div className="grid grid-cols-4 gap-4">
                                    {existingImages.map((image) => (
                                        <div key={image.id} className="relative">
                                            <img
                                                src={image.image_url}
                                                alt="Image produit"
                                                className="w-full h-24 object-cover rounded border"
                                            />
                                            <button
                                                onClick={() => deleteExistingImage(image.id)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                            {image.is_main && (
                                                <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                                                    Principal
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nouvelle image principale
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
                                    Nouvelles images de galerie
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
                                {skus.filter(sku => !sku._destroy).map((sku, index) => (
                                    <div key={sku.id || index} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium">
                                                SKU {index + 1} {sku.id ? `(ID: ${sku.id})` : '(Nouveau)'}
                                            </h4>
                                            <button
                                                onClick={() => removeSku(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                {sku.id ? 'Marquer pour suppression' : 'Supprimer'}
                                            </button>
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

                            {/* SKUs marqués pour suppression */}
                            {skus.some(sku => sku._destroy) && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-red-600 mb-2">
                                        SKUs marqués pour suppression
                                    </h4>
                                    <div className="space-y-2">
                                        {skus.filter(sku => sku._destroy).map((sku, index) => (
                                            <div key={sku.id} className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                                                SKU: {sku.sku} - {sku.name} (sera supprimé lors de la sauvegarde)
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
} 