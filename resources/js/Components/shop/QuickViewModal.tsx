import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Eye, Package, Star } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Modal } from '@/Components/ui/modal';
import { useCart } from '@/contexts/CartContext';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    compare_at_price?: number;
    image: string;
    images?: string[];
    stock: number;
    category?: {
        name: string;
        slug: string;
    };
    rating?: number;
    reviews_count?: number;
    variants?: Array<{
        id: number;
        name: string;
        options: string[];
    }>;
}

interface QuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({});
    const { addToCart } = useCart();

    if (!product) return null;

    const images = product.images || [product.image];
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discountPercentage = hasDiscount 
        ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
        : 0;

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
            variants: selectedVariants
        });
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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
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
                                src={images[selectedImage]}
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
                                            src={image}
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
                        {product.rating && (
                            <div className="flex items-center gap-2 mb-4">
                                {renderStars(product.rating)}
                                <span className="text-sm text-gray-600">
                                    ({product.reviews_count || 0} avis)
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="mb-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-green-600">
                                    {product.price.toFixed(2)}€
                                </span>
                                {hasDiscount && (
                                    <span className="text-lg text-gray-500 line-through">
                                        {product.compare_at_price?.toFixed(2)}€
                                    </span>
                                )}
                            </div>
                            {hasDiscount && (
                                <p className="text-sm text-green-600 mt-1">
                                    Économisez {((product.compare_at_price || 0) - product.price).toFixed(2)}€
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-6">
                            {product.description}
                        </p>

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-4 mb-6">
                                {product.variants.map((variant) => (
                                    <div key={variant.id}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {variant.name}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {variant.options.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => setSelectedVariants({
                                                        ...selectedVariants,
                                                        [variant.id]: option
                                                    })}
                                                    className={cn(
                                                        "px-4 py-2 border rounded-lg text-sm transition-colors",
                                                        selectedVariants[variant.id] === option
                                                            ? "border-green-600 bg-green-50 text-green-700"
                                                            : "border-gray-300 hover:border-gray-400"
                                                    )}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Stock Status */}
                        <div className="flex items-center gap-2 mb-6">
                            <Package className="w-5 h-5 text-gray-500" />
                            <span className={cn(
                                "text-sm font-medium",
                                product.stock > 10 ? "text-green-600" : 
                                product.stock > 0 ? "text-orange-600" : "text-red-600"
                            )}>
                                {product.stock > 10 ? "En stock" :
                                 product.stock > 0 ? `Plus que ${product.stock} en stock` :
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
                                    disabled={quantity >= product.stock}
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
                                disabled={product.stock === 0}
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
        </Modal>
    );
}