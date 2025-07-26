import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "../button"

interface FileStatsProps {
  fileCount: number
  multiple: boolean
  onClearAll: () => void
}

export const FileStats: React.FC<FileStatsProps> = ({
  fileCount,
  multiple,
  onClearAll
}) => {
  if (fileCount === 0) return null

  return (
    <div className="mt-3 flex items-center justify-between text-sm">
      <div className="flex items-center text-green-600">
        <CheckCircle2 className="w-4 h-4 mr-1" />
        {fileCount} fichier{fileCount > 1 ? 's' : ''} sélectionné{fileCount > 1 ? 's' : ''}
      </div>
      {multiple && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-red-600 hover:text-red-700"
        >
          Tout supprimer
        </Button>
      )}
    </div>
  )
} 