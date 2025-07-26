import React, { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useFileValidation } from '@/hooks/useFileValidation';
import { useFilePreview } from '@/hooks/useFilePreview';
import {
    FileUploadDropzone,
    FileUploadPreviewList,
    FileUploadErrorList,
    FileUploadInput,
    FileUploadInfo,
    FileUploadButton
} from './file-upload-components';
import { toast } from '@/Components/ui/use-toast';
import { z } from 'zod';

// Schéma Zod pour la validation des fichiers
const createFileSchema = (options: {
    maxSize: number;
    allowedExtensions: string[];
    maxFiles: number;
}) => {
    return z.object({
        files: z.array(z.instanceof(File))
            .max(options.maxFiles, `Maximum ${options.maxFiles} fichiers autorisés`)
            .refine(
                (files) => files.every(file => file.size <= options.maxSize),
                (files) => {
                    const oversizedFile = files.find(file => file.size > options.maxSize);
                    return {
                        message: `Le fichier ${oversizedFile?.name} dépasse la taille maximale autorisée`
                    };
                }
            )
            .refine(
                (files) => files.every(file => {
                    const extension = file.name.split('.').pop()?.toLowerCase();
                    return extension && options.allowedExtensions.includes(`.${extension}`);
                }),
                (files) => {
                    const invalidFile = files.find(file => {
                        const extension = file.name.split('.').pop()?.toLowerCase();
                        return !extension || !options.allowedExtensions.includes(`.${extension}`);
                    });
                    return {
                        message: `Le fichier ${invalidFile?.name} n'a pas une extension autorisée`
                    };
                }
            )
    });
};

export interface FileUploadProps {
    name?: string;
    value?: File[];
    onChange?: (files: File[]) => void;
    onUpload?: (files: File[]) => Promise<void>;
    onRemove?: (file: File) => void;
    maxSize?: number;
    maxFiles?: number;
    allowedExtensions?: string[];
    validateFileSignature?: boolean;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    dropzoneClassName?: string;
    previewClassName?: string;
    showInfo?: boolean;
    autoUpload?: boolean;
    existingFiles?: Array<{ id: string; url: string; name: string }>;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    name,
    value = [],
    onChange,
    onUpload,
    onRemove,
    maxSize = 10 * 1024 * 1024, // 10MB par défaut
    maxFiles = 5,
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'],
    validateFileSignature = true,
    disabled = false,
    required = false,
    className,
    dropzoneClassName,
    previewClassName,
    showInfo = true,
    autoUpload = false,
    existingFiles = []
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

    // Hooks personnalisés
    const {
        isValidating,
        errors,
        validateFiles,
        formatFileSize,
        clearErrors,
        setErrors
    } = useFileValidation({
        maxSize,
        maxFiles,
        allowedExtensions,
        validateFileSignature,
        currentFiles: value
    });

    const {
        previews,
        isImage,
        removePreview,
        clearAllPreviews
    } = useFilePreview({ files: value });

    // Schéma de validation Zod
    const fileSchema = createFileSchema({ maxSize, allowedExtensions, maxFiles });

    // Gestion du drag & drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragActive(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        await handleFiles(droppedFiles);
    }, [disabled]);

    // Gestion des fichiers sélectionnés
    const handleFiles = useCallback(async (files: File[]) => {
        clearErrors();

        // Validation avec Zod
        try {
            const allFiles = [...value, ...files];
            fileSchema.parse({ files: allFiles });
        } catch (error) {
            if (error instanceof z.ZodError) {
                const validationErrors = error.errors.map(err => ({
                    type: 'general' as const,
                    message: err.message
                }));
                setErrors(validationErrors);
                return;
            }
        }

        // Validation personnalisée avec signatures
        const { validFiles, errors: validationErrors } = await validateFiles(files);

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            toast({
                title: "Erreur de validation",
                description: `${validationErrors.length} fichier(s) rejeté(s)`,
                variant: "destructive",
            });
        }

        if (validFiles.length > 0) {
            const newFiles = [...value, ...validFiles];
            onChange?.(newFiles);

            if (autoUpload && onUpload) {
                await uploadFiles(validFiles);
            }

            toast({
                title: "Fichiers ajoutés",
                description: `${validFiles.length} fichier(s) ajouté(s) avec succès`,
                variant: "default",
            });
        }
    }, [value, onChange, validateFiles, clearErrors, setErrors, fileSchema, autoUpload, onUpload]);

    // Upload des fichiers
    const uploadFiles = useCallback(async (files: File[]) => {
        if (!onUpload) return;

        const fileIds = files.map((_, index) => `upload-${Date.now()}-${index}`);
        setUploadingFiles(fileIds);

        // Initialiser la progression
        const initialProgress: Record<string, number> = {};
        fileIds.forEach(id => {
            initialProgress[id] = 0;
        });
        setUploadProgress(initialProgress);

        try {
            // Simuler la progression (à remplacer par la vraie progression)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    fileIds.forEach(id => {
                        if (newProgress[id] < 90) {
                            newProgress[id] = Math.min(newProgress[id] + 10, 90);
                        }
                    });
                    return newProgress;
                });
            }, 200);

            await onUpload(files);

            clearInterval(progressInterval);

            // Marquer comme complété
            const completedProgress: Record<string, number> = {};
            fileIds.forEach(id => {
                completedProgress[id] = 100;
            });
            setUploadProgress(completedProgress);

            toast({
                title: "Upload réussi",
                description: `${files.length} fichier(s) uploadé(s) avec succès`,
                variant: "default",
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'upload";
            
            // Marquer les fichiers comme ayant une erreur
            const newFileErrors: Record<string, string> = {};
            fileIds.forEach(id => {
                newFileErrors[id] = errorMessage;
            });
            setFileErrors(prev => ({ ...prev, ...newFileErrors }));

            toast({
                title: "Erreur d'upload",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setUploadingFiles([]);
        }
    }, [onUpload]);

    // Gestion du clic sur la zone de dépôt
    const handleClick = useCallback(() => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [disabled]);

    // Gestion du changement de l'input file
    const handleInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            await handleFiles(Array.from(files));
        }
        // Réinitialiser l'input pour permettre de sélectionner le même fichier
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleFiles]);

    // Suppression d'un fichier
    const handleRemove = useCallback((fileId: string) => {
        const fileToRemove = previews.find(p => p.id === fileId);
        if (fileToRemove) {
            const newFiles = value.filter(f => f !== fileToRemove.file);
            onChange?.(newFiles);
            removePreview(fileId);
            
            // Nettoyer les erreurs pour ce fichier
            setFileErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fileId];
                return newErrors;
            });

            onRemove?.(fileToRemove.file);
        }
    }, [previews, value, onChange, removePreview, onRemove]);

    // Validation en temps réel
    useEffect(() => {
        if (required && value.length === 0) {
            setErrors([{
                type: 'general',
                message: 'Au moins un fichier est requis'
            }]);
        } else if (value.length > 0) {
            clearErrors();
        }
    }, [value, required, setErrors, clearErrors]);

    const accept = allowedExtensions.join(',');
    const canAddMore = value.length < maxFiles;

    return (
        <div className={cn("space-y-4", className)}>
            {/* Zone de dépôt */}
            <FileUploadDropzone
                isDragActive={isDragActive}
                isDisabled={disabled || !canAddMore}
                accept={accept}
                multiple={maxFiles > 1}
                maxFiles={maxFiles}
                currentFiles={value.length}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClick}
                className={dropzoneClassName}
            />

            {/* Input file caché */}
            <FileUploadInput
                innerRef={fileInputRef}
                name={name}
                accept={accept}
                multiple={maxFiles > 1}
                disabled={disabled || !canAddMore}
                onChange={handleInputChange}
                required={required && value.length === 0}
            />

            {/* Bouton d'upload alternatif */}
            {!autoUpload && onUpload && value.length > 0 && (
                <FileUploadButton
                    onClick={() => uploadFiles(value)}
                    isUploading={uploadingFiles.length > 0}
                    uploadCount={uploadingFiles.length}
                >
                    Uploader {value.length} fichier{value.length > 1 ? 's' : ''}
                </FileUploadButton>
            )}

            {/* Liste des erreurs */}
            <FileUploadErrorList
                errors={errors}
                onDismiss={clearErrors}
            />

            {/* Aperçus des fichiers */}
            <FileUploadPreviewList
                previews={previews}
                onRemove={handleRemove}
                isImage={isImage}
                uploadProgress={uploadProgress}
                uploadingFiles={uploadingFiles}
                errors={fileErrors}
                className={previewClassName}
            />

            {/* Informations sur les limites */}
            {showInfo && (
                <FileUploadInfo
                    maxSize={maxSize}
                    maxFiles={maxFiles}
                    allowedExtensions={allowedExtensions}
                />
            )}
        </div>
    );
}; 