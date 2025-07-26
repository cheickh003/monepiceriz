import * as React from "react"
import { AlertCircle } from "lucide-react"
import { ValidationError } from "@/hooks/useFileValidation"

interface ValidationErrorsProps {
  errors: ValidationError[]
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({ errors }) => {
  if (errors.length === 0) return null

  const getErrorIcon = (type: ValidationError['type']) => {
    switch (type) {
      case 'extension':
      case 'signature':
        return <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
      case 'size':
        return <AlertCircle className="w-4 h-4 mr-1 text-orange-500" />
      case 'count':
        return <AlertCircle className="w-4 h-4 mr-1 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <h5 className="text-sm font-medium text-red-700">
        Erreurs de validation ({errors.length})
      </h5>
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
        {errors.map((error, index) => (
          <div key={index} className="flex items-start text-sm">
            {getErrorIcon(error.type)}
            <div className="flex-1">
              {error.fileName && (
                <span className="font-medium text-red-700">{error.fileName}: </span>
              )}
              <span className="text-red-600">{error.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 