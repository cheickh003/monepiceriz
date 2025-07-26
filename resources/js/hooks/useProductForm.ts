import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { 
    Sku, 
    ProductFormData, 
    ProductImage, 
    Product 
} from '@/types/Product';
import { useCrudErrorHandlers } from '@/hooks/useErrorHandler';
import { toast } from '@/Components/ui/use-toast';
import {
    createDefaultSku,
    updateSkuInList,
    updateSkuAttribute,
    removeSkuFromList,
    validateSkus,
    prepareFormDataForSubmission,
    generateSlug,
    getInitialFormData,
    getInitialFormDataFromProduct
} from '@/lib/productUtils';

interface UseProductFormOptions {
    product?: Product;
    onSuccess?: () => void;
    onError?: (errors: any) => void;
}

export const useProductForm = (options: UseProductFormOptions = {}) => {
    const { product, onSuccess, onError } = options;
    const isEdit = !!product;
    const { handlers } = useCrudErrorHandlers();

    // États locaux
    const [data, setFormData] = useState<ProductFormData>(
        product ? getInitialFormDataFromProduct(product) : getInitialFormData()
    );
    const [activeTab, setActiveTab] = useState('general');
    const [skus, setSkus] = useState<Sku[]>(
        product?.skus || [createDefaultSku(true)]
    );
    const [existingImages, setExistingImages] = useState<ProductImage[]>(
        product?.images || []
    );
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
    const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
    const [errors, setErrors] = useState<any>({});
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    // Fonction pour mettre à jour les données
    const setData = useCallback((field: keyof ProductFormData | Partial<ProductFormData>, value?: any) => {
        if (typeof field === 'string') {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            setFormData(prev => ({ ...prev, ...field }));
        }
        if (isEdit) setHasChanges(true);
        
        // Nettoyer les erreurs pour ce champ
        if (typeof field === 'string' && errors[field]) {
            setErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [isEdit, errors]);

    // Fonction pour nettoyer les erreurs
    const clearErrors = useCallback((field?: keyof ProductFormData) => {
        if (field) {
            setErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        } else {
            setErrors({});
        }
        setValidationErrors({});
    }, []);

    // Gestion du nom et du slug
    const handleNameChange = useCallback((name: string) => {
        setData('name', name);
        if (!isEdit && (!data.slug || data.slug === generateSlug(data.name))) {
            setData('slug', generateSlug(name));
        }
    }, [data.name, data.slug, isEdit, setData]);

    // Gestion des images principales
    const handleMainImageChange = useCallback((files: File[]) => {
        if (files.length > 0) {
            setMainImage(files[0]);
            setData('main_image', files[0]);
            if (isEdit) setHasChanges(true);
        }
    }, [setData, isEdit]);

    // Gestion des images de galerie
    const handleGalleryImagesChange = useCallback((files: File[]) => {
        setGalleryImages(files);
        setData('gallery_images', files);
        if (isEdit) setHasChanges(true);
    }, [setData, isEdit]);

    // Suppression d'images existantes (pour l'édition)
    const deleteExistingImage = useCallback((imageId: number) => {
        const newImagesToDelete = [...imagesToDelete, imageId];
        setImagesToDelete(newImagesToDelete);
        setData('images_to_delete', newImagesToDelete);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        if (isEdit) setHasChanges(true);
    }, [imagesToDelete, setData, isEdit]);

    // Gestion des SKUs
    const addSku = useCallback(() => {
        const newSku = createDefaultSku(skus.length === 0);
        const updatedSkus = [...skus, newSku];
        setSkus(updatedSkus);
        if (isEdit) setHasChanges(true);
    }, [skus, isEdit]);

    const updateSku = useCallback((index: number, field: keyof Sku, value: any) => {
        const updatedSkus = updateSkuInList(skus, index, field, value);
        setSkus(updatedSkus);
        if (isEdit) setHasChanges(true);
    }, [skus, isEdit]);

    const updateSkuAttributeValue = useCallback((skuIndex: number, attributeId: number, valueId: number) => {
        if (!skus[skuIndex]) {
            console.warn(`SKU at index ${skuIndex} does not exist`);
            return;
        }
        const updatedSkus = updateSkuAttribute(skus, skuIndex, attributeId, valueId);
        setSkus(updatedSkus);
        if (isEdit) setHasChanges(true);
    }, [skus, isEdit]);

    const removeSku = useCallback((index: number) => {
        const updatedSkus = removeSkuFromList(skus, index, isEdit);
        setSkus(updatedSkus);
        if (isEdit) setHasChanges(true);
    }, [skus, isEdit]);

    // Validation personnalisée
    const validateForm = useCallback((): { isValid: boolean; errors: any } => {
        const errors: any = {};
        
        // Validation des champs requis
        if (!data.name.trim()) {
            errors.name = 'Le nom du produit est requis';
        }
        
        if (!data.reference?.trim()) {
            errors.reference = 'La référence du produit est requise';
        }
        
        if (!data.category_id || data.category_id === '') {
            errors.category_id = 'La catégorie est requise';
        }

        // Validation des SKUs
        const skuValidation = validateSkus(skus);
        if (!skuValidation.isValid) {
            errors.skus = skuValidation.message;
        }

        // Validation des SKUs individuels
        const activeSkus = skus.filter(sku => !sku._destroy);
        activeSkus.forEach((sku, index) => {
            if (!sku.sku?.trim()) {
                errors[`sku_${index}_sku`] = 'Le code SKU est requis';
            }
            if (sku.price_ttc === undefined || sku.price_ttc === null || sku.price_ttc <= 0) {
                errors[`sku_${index}_price_ttc`] = 'Le prix TTC doit être supérieur à 0';
            }
        });

        setValidationErrors(errors);
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }, [data, skus]);

    // Préparation des données pour soumission
    const prepareSubmissionData = useCallback(() => {
        return prepareFormDataForSubmission(
            data,
            skus,
            mainImage,
            galleryImages,
            imagesToDelete
        );
    }, [data, skus, mainImage, galleryImages, imagesToDelete]);

    // Soumission du formulaire
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation avant soumission
        const validation = validateForm();
        if (!validation.isValid) {
            toast({
                title: "Erreur de validation",
                description: "Veuillez corriger les erreurs dans le formulaire",
                variant: "destructive",
            });
            return;
        }

        // Initialiser le suivi des uploads
        const filesToUpload: string[] = [];
        if (mainImage) filesToUpload.push('main_image');
        if (galleryImages.length > 0) {
            galleryImages.forEach((_, index) => filesToUpload.push(`gallery_${index}`));
        }
        setUploadingFiles(filesToUpload);

        // Options de requête
        const requestOptions = {
            forceFormData: true,
            onProgress: (progress: any) => {
                if (progress.percentage) {
                    const currentProgress: {[key: string]: number} = {};
                    filesToUpload.forEach(fileKey => {
                        currentProgress[fileKey] = progress.percentage;
                    });
                    setUploadProgress(currentProgress);
                }
            },
            onSuccess: () => {
                setProcessing(false);
                setUploadProgress({});
                setUploadingFiles([]);
                setRecentlySuccessful(true);
                if (isEdit) setHasChanges(false);
                
                // Réinitialiser le succès après 2 secondes
                setTimeout(() => setRecentlySuccessful(false), 2000);
                
                toast({
                    title: "Succès",
                    description: isEdit 
                        ? "Le produit a été modifié avec succès" 
                        : "Le produit a été créé avec succès",
                    variant: "default",
                });
                
                onSuccess?.();
            },
            onError: (errors: any) => {
                setProcessing(false);
                setUploadProgress({});
                setUploadingFiles([]);
                setErrors(errors);
                
                // Log des erreurs pour debug
                console.error('Product submission errors:', errors);
                
                // Gestion d'erreur avec le système centralisé
                const errorHandler = isEdit ? handlers.update : handlers.create;
                errorHandler(errors);
                
                onError?.(errors);
            },
        };

        // Préparation et soumission des données
        const formData = prepareSubmissionData();
        const url = isEdit && product ? `/admin/products/${product.id}` : '/admin/products';
        
        // Log des données pour debug
        console.log('Submitting product data:', {
            data,
            skus,
            mainImage: mainImage?.name,
            galleryImagesCount: galleryImages.length,
            formDataEntries: Array.from(formData.entries())
        });
        
        setProcessing(true);
        router.post(url, formData, requestOptions);
    }, [
        validateForm, prepareSubmissionData, mainImage, galleryImages, imagesToDelete,
        isEdit, product, onSuccess, onError, handlers
    ]);

    // Duplication (pour l'édition uniquement)
    const handleDuplicate = useCallback(() => {
        if (!isEdit || !product) return;
        
        if (hasChanges) {
            if (!confirm('Vous avez des modifications non sauvegardées. Voulez-vous continuer ?')) {
                return;
            }
        }
        
        router.post(`/admin/products/${product.id}/duplicate`, {}, {
            onSuccess: () => {
                toast({
                    title: "Succès",
                    description: "Le produit a été dupliqué avec succès",
                    variant: "default",
                });
            }
        });
    }, [isEdit, product, hasChanges]);

    // Réinitialisation du formulaire
    const resetForm = useCallback(() => {
        setFormData(product ? getInitialFormDataFromProduct(product) : getInitialFormData());
        setSkus(product?.skus || [createDefaultSku(true)]);
        setExistingImages(product?.images || []);
        setImagesToDelete([]);
        setMainImage(null);
        setGalleryImages([]);
        setHasChanges(false);
        setActiveTab('general');
        setValidationErrors({});
        clearErrors();
    }, [product, clearErrors]);

    // Mise à jour générique des données
    const updateData = useCallback((field: keyof ProductFormData, value: any) => {
        setData(field, value);
    }, [setData]);

    // Fonction pour vérifier si le formulaire a des erreurs
    const hasErrors = useCallback(() => {
        return Object.keys(errors).length > 0 || Object.keys(validationErrors).length > 0;
    }, [errors, validationErrors]);

    // Fonction pour obtenir toutes les erreurs
    const getAllErrors = useCallback(() => {
        return { ...errors, ...validationErrors };
    }, [errors, validationErrors]);

    // Fonction pour vérifier si le formulaire peut être soumis
    const canSubmit = useCallback(() => {
        return !processing && !hasErrors() && skus.filter(sku => !sku._destroy).length > 0;
    }, [processing, hasErrors, skus]);

    return {
        // États
        data,
        processing,
        uploadProgress,
        uploadingFiles,
        errors: getAllErrors(),
        activeTab,
        setActiveTab,
        skus,
        existingImages,
        imagesToDelete,
        mainImage,
        galleryImages,
        hasChanges,
        isEdit,
        recentlySuccessful,

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
        resetForm,
        updateData,
        setData,
        validateForm,

        // Utilitaires
        generateSlug,
        hasErrors,
        getAllErrors,
        canSubmit,
        clearErrors
    };
}; 