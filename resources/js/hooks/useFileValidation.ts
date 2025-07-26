import { useState, useCallback } from 'react'

export interface ValidationError {
  type: 'extension' | 'signature' | 'size' | 'count' | 'general'
  message: string
  fileName?: string
}

interface UseFileValidationOptions {
  maxSize: number
  maxFiles: number
  allowedExtensions: string[]
  validateFileSignature: boolean
  currentFiles: File[]
}

// Signatures de fichiers courantes (magic numbers)
const FILE_SIGNATURES = {
  // Images JPEG
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],
  ],
  // Images PNG
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  ],
  // Images WebP
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF header (les 4 premiers bytes)
  ],
}

export const useFileValidation = (options: UseFileValidationOptions) => {
  const [isValidating, setIsValidating] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])

  const {
    maxSize,
    maxFiles,
    allowedExtensions,
    validateFileSignature,
    currentFiles
  } = options

  /**
   * Valide l'extension d'un fichier
   */
  const validateExtension = useCallback((file: File): boolean => {
    const fileName = file.name.toLowerCase()
    return allowedExtensions.some(ext => fileName.endsWith(ext.toLowerCase()))
  }, [allowedExtensions])

  /**
   * Lit les premiers bytes d'un fichier pour vérifier sa signature
   */
  const readFileSignature = useCallback((file: File, bytesToRead: number = 8): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer
        resolve(new Uint8Array(arrayBuffer))
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file.slice(0, bytesToRead))
    })
  }, [])

  /**
   * Vérifie si la signature du fichier correspond au type MIME déclaré
   */
  const checkFileSignature = useCallback(async (file: File): Promise<boolean> => {
    if (!validateFileSignature) return true

    try {
      const signature = await readFileSignature(file)
      const expectedSignatures = FILE_SIGNATURES[file.type as keyof typeof FILE_SIGNATURES]
      
      if (!expectedSignatures) {
        // Si on n'a pas de signature connue pour ce type, on accepte
        return true
      }

      return expectedSignatures.some(expectedSig => {
        if (file.type === 'image/webp') {
          // Pour WebP, on vérifie RIFF + on cherche WEBP dans les 12 premiers bytes
          const riffMatch = expectedSig.every((byte, index) => signature[index] === byte)
          if (!riffMatch) return false
          
          // Vérifier la présence de "WEBP" aux positions 8-11
          const webpBytes = [0x57, 0x45, 0x42, 0x50] // "WEBP"
          return webpBytes.every((byte, index) => signature[8 + index] === byte)
        }
        
        return expectedSig.every((byte, index) => signature[index] === byte)
      })
    } catch (error) {
      console.error('Erreur lors de la validation de la signature:', error)
      return false
    }
  }, [validateFileSignature, readFileSignature])

  /**
   * Formate la taille d'un fichier
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  /**
   * Valide un ensemble de fichiers
   */
  const validateFiles = useCallback(async (files: FileList | File[]): Promise<{ validFiles: File[], errors: ValidationError[] }> => {
    const validFiles: File[] = []
    const newErrors: ValidationError[] = []
    const fileArray = Array.from(files)

    // Vérifier le nombre maximum de fichiers
    const totalFiles = currentFiles.length + fileArray.length
    if (totalFiles > maxFiles) {
      newErrors.push({
        type: 'count',
        message: `Nombre maximum de fichiers dépassé (${maxFiles} max). Vous essayez d'ajouter ${fileArray.length} fichier(s) mais vous en avez déjà ${currentFiles.length}.`
      })
      return { validFiles, errors: newErrors }
    }

    setIsValidating(true)

    for (const file of fileArray) {
      let fileErrors: string[] = []

      // Vérifier l'extension
      if (!validateExtension(file)) {
        fileErrors.push(`Extension non autorisée. Extensions acceptées: ${allowedExtensions.join(', ')}`)
      }

      // Vérifier la taille
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
        fileErrors.push(`Taille trop importante (${formatFileSize(file.size)}). Taille maximum: ${maxSizeMB}MB`)
      }

      // Vérifier si le fichier est vide
      if (file.size === 0) {
        fileErrors.push('Le fichier est vide')
      }

      // Vérifier la signature du fichier
      if (validateFileSignature && fileErrors.length === 0) {
        const signatureValid = await checkFileSignature(file)
        if (!signatureValid) {
          fileErrors.push('Le fichier semble corrompu ou ne correspond pas à son extension')
        }
      }

      // Vérifier les doublons
      const isDuplicate = currentFiles.some(existingFile => 
        existingFile.name === file.name && 
        existingFile.size === file.size &&
        existingFile.lastModified === file.lastModified
      )
      
      if (isDuplicate) {
        fileErrors.push('Ce fichier a déjà été ajouté')
      }

      if (fileErrors.length > 0) {
        fileErrors.forEach(error => {
          newErrors.push({
            type: 'general',
            message: error,
            fileName: file.name
          })
        })
      } else {
        validFiles.push(file)
      }
    }

    setIsValidating(false)
    return { validFiles, errors: newErrors }
  }, [
    currentFiles, 
    maxFiles, 
    validateExtension, 
    maxSize, 
    formatFileSize, 
    validateFileSignature, 
    checkFileSignature
  ])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const removeFileErrors = useCallback((fileName: string) => {
    setErrors(prev => prev.filter(error => error.fileName !== fileName))
  }, [])

  return {
    isValidating,
    errors,
    validateFiles,
    formatFileSize,
    clearErrors,
    removeFileErrors,
    setErrors
  }
} 