import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

interface FileDropZoneProps {
  accept: string
  multiple: boolean
  disabled: boolean
  dragActive: boolean
  canAddMoreFiles: boolean
  isValidating: boolean
  maxFiles: number
  currentFileCount: number
  allowedExtensions: string[]
  maxSize: number
  formatFileSize: (bytes: number) => string
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onClick: () => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputRef: React.RefObject<HTMLInputElement>
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  accept,
  multiple,
  disabled,
  dragActive,
  canAddMoreFiles,
  isValidating,
  maxFiles,
  currentFileCount,
  allowedExtensions,
  maxSize,
  formatFileSize,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onClick,
  onInputChange,
  inputRef,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 transition-colors",
        dragActive 
          ? "border-green-500 bg-green-50" 
          : "border-gray-300 hover:border-gray-400",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && canAddMoreFiles && "cursor-pointer",
        !canAddMoreFiles && "border-gray-200 bg-gray-50"
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={canAddMoreFiles ? onClick : undefined}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onInputChange}
        disabled={disabled || !canAddMoreFiles}
        className="hidden"
        {...props}
      />

      <div className="flex flex-col items-center justify-center text-center">
        {isValidating ? (
          <>
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm text-gray-600">Validation des fichiers en cours...</p>
          </>
        ) : (
          <>
            <Upload className={cn(
              "w-8 h-8 mb-2",
              canAddMoreFiles ? "text-gray-400" : "text-gray-300"
            )} />
            <p className={cn(
              "text-sm mb-1",
              canAddMoreFiles ? "text-gray-600" : "text-gray-400"
            )}>
              {!canAddMoreFiles 
                ? `Limite atteinte (${maxFiles} fichiers maximum)`
                : dragActive 
                  ? "Déposez les fichiers ici" 
                  : "Glissez-déposez vos fichiers ici ou cliquez pour sélectionner"
              }
            </p>
            <p className="text-xs text-gray-400">
              Extensions autorisées: {allowedExtensions.join(', ')}
              {maxSize && ` • Max ${formatFileSize(maxSize)} par fichier`}
              {multiple && ` • ${currentFileCount}/${maxFiles} fichiers`}
            </p>
          </>
        )}
      </div>
    </div>
  )
} 