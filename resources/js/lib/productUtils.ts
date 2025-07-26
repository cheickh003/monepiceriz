import { Sku, ProductFormData, Category } from '@/types/Product';

/**
 * Génère un slug à partir d'un nom de produit
 */
export const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Crée un nouveau SKU avec les valeurs par défaut
 */
export const createDefaultSku = (isFirstSku: boolean = false): Sku => ({
    name: '',
    sku: '',
    barcode: '',
    purchase_price: 0,
    price_ht: 0,
    price_ttc: 0,
    vat_rate: 20, // TVA par défaut à 20%
    stock_quantity: 0,
    weight: undefined,
    is_default: isFirstSku,
    is_variable_weight: false,
    attributes: {},
    // Les champs requis par le backend mais pas dans le type Sku
    reserved_quantity: 0,
    low_stock_threshold: 0,
    weight_grams: undefined,
    min_weight_grams: undefined,
    max_weight_grams: undefined
});

/**
 * Met à jour un SKU spécifique et gère la logique des SKUs par défaut
 */
export const updateSkuInList = (
    skus: Sku[],
    index: number,
    field: keyof Sku,
    value: any
): Sku[] => {
    const updatedSkus = [...skus];
    updatedSkus[index] = { ...updatedSkus[index], [field]: value };
    
    // Si on définit comme défaut, désélectionner les autres
    if (field === 'is_default' && value === true) {
        updatedSkus.forEach((sku, i) => {
            if (i !== index) sku.is_default = false;
        });
    }
    
    return updatedSkus;
};

/**
 * Met à jour un attribut d'un SKU
 */
export const updateSkuAttribute = (
    skus: Sku[],
    skuIndex: number,
    attributeId: number,
    valueId: number
): Sku[] => {
    const updatedSkus = [...skus];
    if (updatedSkus[skuIndex]) {
        if (!updatedSkus[skuIndex].attributes) {
            updatedSkus[skuIndex].attributes = {};
        }
        updatedSkus[skuIndex].attributes[attributeId] = valueId;
    }
    return updatedSkus;
};

/**
 * Supprime un SKU de la liste (pour création) ou le marque pour suppression (pour édition)
 */
export const removeSkuFromList = (skus: Sku[], index: number, isEdit: boolean = false): Sku[] => {
    const updatedSkus = [...skus];
    
    if (isEdit && updatedSkus[index].id) {
        // Marquer le SKU existant pour suppression
        updatedSkus[index]._destroy = true;
    } else {
        // Supprimer le nouveau SKU
        updatedSkus.splice(index, 1);
    }
    
    // S'assurer qu'au moins un SKU est défini comme défaut
    const activeSkus = updatedSkus.filter(sku => !sku._destroy);
    if (activeSkus.length > 0 && !activeSkus.some(sku => sku.is_default)) {
        const firstActiveSku = updatedSkus.find(sku => !sku._destroy);
        if (firstActiveSku) {
            firstActiveSku.is_default = true;
        }
    }
    
    return updatedSkus;
};

/**
 * Valide qu'il y a au moins un SKU actif
 */
export const validateSkus = (skus: Sku[]): { isValid: boolean; message?: string } => {
    const activeSkus = skus.filter(sku => !sku._destroy);
    
    if (activeSkus.length === 0) {
        return {
            isValid: false,
            message: 'Vous devez avoir au moins un SKU actif'
        };
    }
    
    return { isValid: true };
};

/**
 * Prépare les données du formulaire pour l'envoi
 */
export const prepareFormDataForSubmission = (
    data: ProductFormData,
    skus: Sku[],
    mainImage: File | null,
    galleryImages: File[],
    imagesToDelete: number[] = []
): FormData => {
    const formData = new FormData();
    
    // Ajouter les champs de base (exclure les champs spéciaux)
    Object.keys(data).forEach((key) => {
        if (!['main_image', 'gallery_images', 'skus', 'images_to_delete'].includes(key)) {
            const value = data[key as keyof typeof data];
            formData.append(key, String(value));
        }
    });

    // Ajouter les images
    if (mainImage) {
        formData.append('main_image', mainImage);
    }
    galleryImages.forEach((image, index) => {
        formData.append(`gallery_images[${index}]`, image);
    });

    // Ajouter les images à supprimer (pour l'édition)
    imagesToDelete.forEach((id, index) => {
        formData.append(`images_to_delete[${index}]`, id.toString());
    });

    // Ajouter les SKUs en tant qu'objets dans le FormData
    skus.forEach((sku, index) => {
        Object.keys(sku).forEach(key => {
            const value = sku[key as keyof typeof sku];
            if (key === 'attributes') {
                // Gérer les attributs séparément
                Object.keys(value || {}).forEach(attrId => {
                    formData.append(`skus[${index}][attributes][${attrId}]`, String((value as any)[attrId]));
                });
            } else if (value !== undefined && value !== null) {
                formData.append(`skus[${index}][${key}]`, String(value));
            }
        });
    });

    return formData;
};

/**
 * Rend les options de catégories de manière récursive
 */
export const renderCategoryOptions = (categories: Category[], level = 0): any[] => {
    return categories.map((category) => ({
        id: category.id,
        name: category.name,
        level: level,
        children: category.children ? renderCategoryOptions(category.children, level + 1) : []
    }));
};

/**
 * Initialise les données du formulaire pour la création
 */
export const getInitialFormData = (): ProductFormData => ({
    name: '',
    slug: '',
    reference: '',
    barcode: '',
    brand: '',
    description: '',
    short_description: '',
    category_id: '',
    country_of_origin: '',
    is_active: true,
    is_featured: false,
    is_variable_weight: false,
    position: 0,
    main_image: null,
    gallery_images: [],
    skus: []
});

/**
 * Initialise les données du formulaire pour l'édition
 */
export const getInitialFormDataFromProduct = (product: any): ProductFormData => ({
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
    main_image: null,
    gallery_images: [],
    images_to_delete: [],
    skus: product.skus,
    _method: 'PUT'
}); 