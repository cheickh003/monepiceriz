import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { 
    X, 
    Upload, 
    FileIcon, 
    Image as ImageIcon, 
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import type { FilePreview } from '@/hooks/useFilePreview';
import type { ValidationError } from '@/hooks/useFileValidation';

// Zone de dépôt de fichiers
interface FileUploadDropzoneProps {
    isDragActive: boolean;
    isDisabled?: boolean;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    currentFiles?: number;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onClick: () => void;
    children?: React.ReactNode;
    className?: string;
}

export const FileUploadDropzone = forwardRef<HTMLDivElement, FileUploadDropzoneProps>(
    ({ 
        isDragActive, 
        isDisabled, 
        accept, 
        multiple, 
        maxFiles, 
        currentFiles = 0,
        onDrop, 
        onDragOver, 
        onDragLeave, 
        onClick,
        children,
        className 
    }, ref) => {
        const remainingFiles = maxFiles ? maxFiles - currentFiles : null;
        const canAddMore = !maxFiles || currentFiles < maxFiles;

        return (
            <div
                ref={ref}
                className={cn(
                    "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
                    isDragActive && "border-primary bg-primary/5",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    !isDragActive && !isDisabled && "hover:border-primary/50",
                    className
                )}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={!isDisabled ? onClick : undefined}
            >
                {children || (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className={cn(
                            "h-10 w-10",
                            isDragActive ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div className="text-sm">
                            <span className="font-semibold">
                                {isDragActive ? "Déposez les fichiers ici" : "Cliquez ou glissez des fichiers ici"}
                            </span>
                            {!canAddMore && (
                                <p className="text-destructive mt-1">
                                    Nombre maximum de fichiers atteint ({maxFiles})
                                </p>
                            )}
                            {canAddMore && remainingFiles !== null && (
                                <p className="text-muted-foreground mt-1">
                                    {remainingFiles} fichier{remainingFiles > 1 ? 's' : ''} restant{remainingFiles > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                        {accept && (
                            <p className="text-xs text-muted-foreground">
                                Formats acceptés: {accept}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

FileUploadDropzone.displayName = 'FileUploadDropzone';

// Aperçu d'un fichier
interface FileUploadPreviewProps {
    preview: FilePreview;
    onRemove: (fileId: string) => void;
    isImage: (file: File) => boolean;
    uploadProgress?: number;
    isUploading?: boolean;
    error?: string;
    className?: string;
}

export const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({
    preview,
    onRemove,
    isImage,
    uploadProgress,
    isUploading,
    error,
    className
}) => {
    const isImageFile = isImage(preview.file);
    const fileSize = (preview.file.size / 1024 / 1024).toFixed(2);

    return (
        <div className={cn(
            "relative rounded-lg border bg-card p-2 transition-all",
            error && "border-destructive",
            className
        )}>
            <div className="flex items-start gap-3">
                {/* Aperçu de l'image ou icône */}
                <div className="relative h-16 w-16 flex-shrink-0">
                    {isImageFile ? (
                        <img
                            src={preview.url}
                            alt={preview.file.name}
                            className="h-full w-full rounded object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded bg-muted">
                            <FileIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                    
                    {/* Indicateur de statut */}
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded bg-background/80">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}
                    
                    {error && (
                        <div className="absolute -right-1 -top-1">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </div>
                    )}
                    
                    {!isUploading && !error && uploadProgress === 100 && (
                        <div className="absolute -right-1 -top-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                    )}
                </div>

                {/* Informations du fichier */}
                <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">
                        {preview.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {fileSize} MB
                    </p>
                    
                    {/* Barre de progression */}
                    {isUploading && uploadProgress !== undefined && (
                        <Progress value={uploadProgress} className="mt-2 h-1" />
                    )}
                    
                    {/* Message d'erreur */}
                    {error && (
                        <p className="mt-1 text-xs text-destructive">{error}</p>
                    )}
                </div>

                {/* Bouton de suppression */}
                {!isUploading && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onRemove(preview.id)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
};

// Liste des aperçus
interface FileUploadPreviewListProps {
    previews: FilePreview[];
    onRemove: (fileId: string) => void;
    isImage: (file: File) => boolean;
    uploadProgress?: Record<string, number>;
    uploadingFiles?: string[];
    errors?: Record<string, string>;
    className?: string;
}

export const FileUploadPreviewList: React.FC<FileUploadPreviewListProps> = ({
    previews,
    onRemove,
    isImage,
    uploadProgress = {},
    uploadingFiles = [],
    errors = {},
    className
}) => {
    if (previews.length === 0) return null;

    return (
        <div className={cn("space-y-2", className)}>
            {previews.map((preview) => (
                <FileUploadPreview
                    key={preview.id}
                    preview={preview}
                    onRemove={onRemove}
                    isImage={isImage}
                    uploadProgress={uploadProgress[preview.id]}
                    isUploading={uploadingFiles.includes(preview.id)}
                    error={errors[preview.id]}
                />
            ))}
        </div>
    );
};

// Liste des erreurs de validation
interface FileUploadErrorListProps {
    errors: ValidationError[];
    onDismiss?: () => void;
    className?: string;
}

export const FileUploadErrorList: React.FC<FileUploadErrorListProps> = ({
    errors,
    onDismiss,
    className
}) => {
    if (errors.length === 0) return null;

    return (
        <Alert variant="destructive" className={className}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
                <div className="space-y-1">
                    {errors.map((error, index) => (
                        <div key={index}>
                            {error.fileName && (
                                <span className="font-medium">{error.fileName}: </span>
                            )}
                            {error.message}
                        </div>
                    ))}
                </div>
                {onDismiss && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={onDismiss}
                    >
                        Fermer
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
};

// Input file caché
interface FileUploadInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    innerRef: React.RefObject<HTMLInputElement>;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({ 
    innerRef, 
    ...props 
}) => {
    return (
        <input
            ref={innerRef}
            type="file"
            className="sr-only"
            {...props}
        />
    );
};

// Informations sur les limites
interface FileUploadInfoProps {
    maxSize?: number;
    maxFiles?: number;
    allowedExtensions?: string[];
    className?: string;
}

export const FileUploadInfo: React.FC<FileUploadInfoProps> = ({
    maxSize,
    maxFiles,
    allowedExtensions,
    className
}) => {
    const formatFileSize = (bytes: number): string => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(0)} MB`;
    };

    return (
        <div className={cn("text-xs text-muted-foreground space-y-1", className)}>
            {maxSize && (
                <p>Taille maximale par fichier: {formatFileSize(maxSize)}</p>
            )}
            {maxFiles && (
                <p>Nombre maximum de fichiers: {maxFiles}</p>
            )}
            {allowedExtensions && allowedExtensions.length > 0 && (
                <p>Formats acceptés: {allowedExtensions.join(', ')}</p>
            )}
        </div>
    );
};

// Bouton d'upload personnalisé
interface FileUploadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isUploading?: boolean;
    uploadCount?: number;
    children?: React.ReactNode;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
    isUploading,
    uploadCount,
    children,
    className,
    ...props
}) => {
    return (
        <Button
            type="button"
            variant="outline"
            className={cn("gap-2", className)}
            disabled={isUploading}
            {...props}
        >
            {isUploading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Upload en cours...
                    {uploadCount && uploadCount > 1 && ` (${uploadCount})`}
                </>
            ) : (
                <>
                    <Upload className="h-4 w-4" />
                    {children || "Choisir des fichiers"}
                </>
            )}
        </Button>
    );
};