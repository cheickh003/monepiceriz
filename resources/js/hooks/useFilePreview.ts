import { useState, useEffect, useCallback } from 'react'

export interface FilePreview {
  file: File
  url: string
  id: string
  isValid: boolean
  error?: string
}

interface UseFilePreviewOptions {
  files: File[]
}

export const useFilePreview = ({ files }: UseFilePreviewOptions) => {
  const [previews, setPreviews] = useState<FilePreview[]>([])

  // Synchroniser les previews avec les fichiers
  useEffect(() => {
    if (files.length === 0) {
      // Nettoyer les URLs d'objet pour éviter les fuites mémoire
      previews.forEach(preview => URL.revokeObjectURL(preview.url))
      setPreviews([])
      return
    }

    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: `${file.name}-${file.size}-${file.lastModified}`,
      isValid: true
    }))

    // Nettoyer les anciennes URLs
    previews.forEach(preview => URL.revokeObjectURL(preview.url))
    setPreviews(newPreviews)

    // Cleanup function
    return () => {
      newPreviews.forEach(preview => URL.revokeObjectURL(preview.url))
    }
  }, [files])

  const isImage = useCallback((file: File): boolean => {
    return file.type.startsWith('image/')
  }, [])

  const removePreview = useCallback((fileId: string) => {
    const fileToRemove = previews.find(p => p.id === fileId)
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.url)
    }
    setPreviews(prev => prev.filter(p => p.id !== fileId))
  }, [previews])

  const clearAllPreviews = useCallback(() => {
    previews.forEach(preview => URL.revokeObjectURL(preview.url))
    setPreviews([])
  }, [previews])

  const getTotalSize = useCallback(() => {
    return files.reduce((total, file) => total + file.size, 0)
  }, [files])

  return {
    previews,
    isImage,
    removePreview,
    clearAllPreviews,
    getTotalSize
  }
} 