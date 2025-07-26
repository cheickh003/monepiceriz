import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "../button"
import { X, FileImage, CheckCircle2, AlertCircle } from "lucide-react"
import { FilePreview } from "@/hooks/useFilePreview"

interface FilePreviewGridProps {
  previews: FilePreview[]
  maxFiles: number
  onRemoveFile: (fileId: string) => void
  formatFileSize: (bytes: number) => string
  isImage: (file: File) => boolean
  getTotalSize: () => number
}

export const FilePreviewGrid: React.FC<FilePreviewGridProps> = ({
  previews,
  maxFiles,
  onRemoveFile,
  formatFileSize,
  isImage,
  getTotalSize
}) => {
  if (previews.length === 0) return null

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          Fichiers sélectionnés ({previews.length}/{maxFiles})
        </h4>
        <div className="text-xs text-gray-500">
          Taille totale: {formatFileSize(getTotalSize())}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {previews.map((preview) => (
          <FilePreviewItem
            key={preview.id}
            preview={preview}
            onRemove={onRemoveFile}
            formatFileSize={formatFileSize}
            isImage={isImage}
          />
        ))}
      </div>
    </div>
  )
}

interface FilePreviewItemProps {
  preview: FilePreview
  onRemove: (fileId: string) => void
  formatFileSize: (bytes: number) => string
  isImage: (file: File) => boolean
}

const FilePreviewItem: React.FC<FilePreviewItemProps> = ({
  preview,
  onRemove,
  formatFileSize,
  isImage
}) => {
  return (
    <div
      className={cn(
        "relative group border rounded-lg overflow-hidden",
        preview.isValid ? "bg-gray-50 border-gray-200" : "bg-red-50 border-red-200"
      )}
    >
      {isImage(preview.file) ? (
        <div className="aspect-square">
          <img
            src={preview.url}
            alt={preview.file.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square flex items-center justify-center">
          <FileImage className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      {/* Overlay avec informations */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-end">
        <div className="w-full p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <p className="text-xs font-medium truncate" title={preview.file.name}>
            {preview.file.name}
          </p>
          <p className="text-xs opacity-75">
            {formatFileSize(preview.file.size)}
          </p>
          {preview.error && (
            <p className="text-xs text-red-300 mt-1">
              {preview.error}
            </p>
          )}
        </div>
      </div>

      {/* Indicateur de validation */}
      <div className={cn(
        "absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center",
        preview.isValid ? "bg-green-500" : "bg-red-500"
      )}>
        {preview.isValid ? (
          <CheckCircle2 className="w-3 h-3 text-white" />
        ) : (
          <AlertCircle className="w-3 h-3 text-white" />
        )}
      </div>

      {/* Bouton de suppression */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(preview.id)
        }}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  )
} 