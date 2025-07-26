import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/Components/ui/use-toast';

// Configuration Supabase (à remplacer par vos vraies clés)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadOptions {
    bucket: string;
    folder?: string;
    generateUniqueName?: boolean;
    onProgress?: (progress: number) => void;
}

export interface UploadResult {
    url: string;
    path: string;
    fileName: string;
}

export interface UseSupabaseUploadReturn {
    upload: (file: File, options: UploadOptions) => Promise<UploadResult>;
    uploadMultiple: (files: File[], options: UploadOptions) => Promise<UploadResult[]>;
    deleteFile: (path: string, bucket: string) => Promise<boolean>;
    getPublicUrl: (path: string, bucket: string) => string;
    isUploading: boolean;
    uploadProgress: Record<string, number>;
}

export const useSupabaseUpload = (): UseSupabaseUploadReturn => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    // Générer un nom de fichier unique
    const generateFileName = useCallback((file: File, generateUnique: boolean = true): string => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const baseName = file.name.split('.').slice(0, -1).join('.')
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .toLowerCase();

        if (generateUnique) {
            return `${baseName}-${timestamp}-${randomString}.${extension}`;
        }
        return `${baseName}.${extension}`;
    }, []);

    // Upload d'un seul fichier
    const upload = useCallback(async (
        file: File,
        options: UploadOptions
    ): Promise<UploadResult> => {
        const { bucket, folder = '', generateUniqueName = true, onProgress } = options;
        
        try {
            setIsUploading(true);
            
            // Générer le nom du fichier
            const fileName = generateFileName(file, generateUniqueName);
            const filePath = folder ? `${folder}/${fileName}` : fileName;
            
            // Créer un identifiant pour le suivi de progression
            const progressId = `${file.name}-${Date.now()}`;
            
            // Simuler la progression (Supabase ne fournit pas de progression native)
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress = Math.min(progress + 10, 90);
                setUploadProgress(prev => ({ ...prev, [progressId]: progress }));
                onProgress?.(progress);
            }, 100);

            // Upload vers Supabase
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            clearInterval(progressInterval);

            if (error) {
                throw new Error(error.message);
            }

            // Marquer comme complété
            setUploadProgress(prev => ({ ...prev, [progressId]: 100 }));
            onProgress?.(100);

            // Obtenir l'URL publique
            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            // Nettoyer la progression après un délai
            setTimeout(() => {
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[progressId];
                    return newProgress;
                });
            }, 1000);

            return {
                url: publicUrlData.publicUrl,
                path: data.path,
                fileName
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
            toast({
                title: "Erreur d'upload",
                description: errorMessage,
                variant: "destructive"
            });
            throw error;
        } finally {
            setIsUploading(false);
        }
    }, [generateFileName]);

    // Upload de plusieurs fichiers
    const uploadMultiple = useCallback(async (
        files: File[],
        options: UploadOptions
    ): Promise<UploadResult[]> => {
        setIsUploading(true);
        
        try {
            const uploadPromises = files.map((file, index) => {
                // Créer une fonction de progression unique pour chaque fichier
                const fileOnProgress = (progress: number) => {
                    options.onProgress?.(
                        files.reduce((acc, _, i) => {
                            if (i < index) return acc + 100;
                            if (i === index) return acc + progress;
                            return acc;
                        }, 0) / files.length
                    );
                };

                return upload(file, { ...options, onProgress: fileOnProgress });
            });

            const results = await Promise.all(uploadPromises);
            
            toast({
                title: "Upload réussi",
                description: `${files.length} fichier(s) uploadé(s) avec succès`,
                variant: "default"
            });

            return results;
        } catch (error) {
            toast({
                title: "Erreur d'upload",
                description: "Certains fichiers n'ont pas pu être uploadés",
                variant: "destructive"
            });
            throw error;
        } finally {
            setIsUploading(false);
        }
    }, [upload]);

    // Supprimer un fichier
    const deleteFile = useCallback(async (
        path: string,
        bucket: string
    ): Promise<boolean> => {
        try {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path]);

            if (error) {
                throw new Error(error.message);
            }

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
            toast({
                title: "Erreur de suppression",
                description: errorMessage,
                variant: "destructive"
            });
            return false;
        }
    }, []);

    // Obtenir l'URL publique d'un fichier
    const getPublicUrl = useCallback((path: string, bucket: string): string => {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);
        
        return data.publicUrl;
    }, []);

    return {
        upload,
        uploadMultiple,
        deleteFile,
        getPublicUrl,
        isUploading,
        uploadProgress
    };
};

// Hook pour gérer l'upload des images de produits
export const useProductImageUpload = () => {
    const { upload, uploadMultiple, deleteFile, getPublicUrl, isUploading, uploadProgress } = useSupabaseUpload();

    const uploadProductImage = useCallback(async (file: File, productId?: number) => {
        const folder = productId ? `products/${productId}` : 'products/temp';
        return upload(file, {
            bucket: 'product-images',
            folder,
            generateUniqueName: true
        });
    }, [upload]);

    const uploadProductGallery = useCallback(async (files: File[], productId?: number) => {
        const folder = productId ? `products/${productId}/gallery` : 'products/temp/gallery';
        return uploadMultiple(files, {
            bucket: 'product-images',
            folder,
            generateUniqueName: true
        });
    }, [uploadMultiple]);

    const deleteProductImage = useCallback(async (path: string) => {
        return deleteFile(path, 'product-images');
    }, [deleteFile]);

    const getProductImageUrl = useCallback((path: string) => {
        return getPublicUrl(path, 'product-images');
    }, [getPublicUrl]);

    return {
        uploadProductImage,
        uploadProductGallery,
        deleteProductImage,
        getProductImageUrl,
        isUploading,
        uploadProgress
    };
};