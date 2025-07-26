import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Eye, Package, Star } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import SimpleModal from '@/Components/ui/modal';
import { useCart } from '@/contexts/CartContext';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface QuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addToCart } = useCart();

    if (!product) return null;

    const images = product.gallery_images?.filter(Boolean) || (product.image_url ? [product.image_url] : []);
    const hasDiscount = product.is_promoted && product.promo_price;
    const discountPercentage = hasDiscount && product.price_ttc
        ? Math.round(((product.price_ttc - (product.promo_price || 0)) / product.price_ttc) * 100)
        : 0;
    const currentPrice = product.effective_price || product.price_ttc || 0;
    const hasStock = product.default_sku && product.default_sku.stock_quantity > 0;

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        const maxStock = product.default_sku?.stock_quantity || 99;
        if (newQuantity >= 1 && newQuantity <= maxStock) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (!hasStock) return;
        
        addToCart(product, quantity);
        onClose();
        setQuantity(1);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, index) => (
                    <Star
                        key={index}
                        className={cn(
                            "w-4 h-4",
                            index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        )}
                    />
                ))}
            </div>
        );
    };

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div className="relative p-0">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    aria-label="Fermer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Gallery */}
                    <div className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={images[selectedImage] || '/img/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {hasDiscount && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                -{discountPercentage}%
                            </span>
                        )}

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={cn(
                                            "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                                            selectedImage === index ? "border-green-600" : "border-gray-200"
                                        )}
                                    >
                                        <img
                                            src={image || '/img/placeholder.png'}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="p-6">
                        {/* Category */}
                        {product.category && (
                            <Link 
                                href={`/categories/${product.category.slug}`}
                                className="text-sm text-green-600 hover:text-green-700 mb-2 inline-block"
                            >
                                {product.category.name}
                            </Link>
                        )}

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {product.name}
                        </h2>

                        {/* Rating */}
                        {product.average_rating && (
                            <div className="flex items-center gap-2 mb-4">
                                {renderStars(product.average_rating)}
                                <span className="text-sm text-gray-600">
                                    ({product.reviews_count || 0} avis)
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="mb-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-green-600">
                                    {formatPrice(currentPrice)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-lg text-gray-500 line-through">
                                        {formatPrice(product.price_ttc || 0)}
                                    </span>
                                )}
                            </div>
                            {hasDiscount && (
                                <p className="text-sm text-green-600 mt-1">
                                    Économisez {formatPrice((product.price_ttc || 0) - currentPrice)}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-6">
                            {product.description}
                        </p>


                        {/* Stock Status */}
                        <div className="flex items-center gap-2 mb-6">
                            <Package className="w-5 h-5 text-gray-500" />
                            <span className={cn(
                                "text-sm font-medium",
                                (product.default_sku?.stock_quantity || 0) > 10 ? "text-green-600" : 
                                (product.default_sku?.stock_quantity || 0) > 0 ? "text-orange-600" : "text-red-600"
                            )}>
                                {(product.default_sku?.stock_quantity || 0) > 10 ? "En stock" :
                                 (product.default_sku?.stock_quantity || 0) > 0 ? `Plus que ${product.default_sku?.stock_quantity} en stock` :
                                 "Rupture de stock"}
                            </span>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-sm font-medium text-gray-700">Quantité :</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Diminuer la quantité"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 min-w-[50px] text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= (product.default_sku?.stock_quantity || 0)}
                                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Augmenter la quantité"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleAddToCart}
                                disabled={!hasStock}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                                size="lg"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Ajouter au panier
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="gap-2"
                            >
                                <Link href={`/produits/${product.slug}`}>
                                    <Eye className="w-5 h-5" />
                                    Voir les détails
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
}