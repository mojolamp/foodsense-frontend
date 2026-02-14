'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, FileWarning } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  accept: string
  maxSizeMB: number
  onFile: (file: File) => void
  isUploading?: boolean
  progress?: number
  label?: string
  hint?: string
  className?: string
}

export default function DropZone({
  accept,
  maxSizeMB,
  onFile,
  isUploading = false,
  progress,
  label = 'Drop file here or click to browse',
  hint,
  className,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const acceptedExtensions = accept.split(',').map(e => e.trim().toLowerCase())

  const validateFile = useCallback((file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedExtensions.includes(ext)) {
      return `Unsupported file type. Accepted: ${accept}`
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum: ${maxSizeMB}MB`
    }
    return null
  }, [accept, acceptedExtensions, maxSizeMB])

  const handleFile = useCallback((file: File) => {
    const err = validateFile(file)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setSelectedFile(file)
    onFile(file)
  }, [validateFile, onFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }, [handleFile])

  const clearFile = useCallback(() => {
    setSelectedFile(null)
    setError(null)
  }, [])

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer',
          isDragging && 'border-primary bg-primary/5',
          isUploading && 'cursor-not-allowed opacity-60',
          error && 'border-status-fail/50 bg-red-50 dark:bg-red-950/10',
          !isDragging && !error && 'border-border hover:border-primary/50 hover:bg-muted/30',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <>
            <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
            {progress != null && (
              <div className="w-full max-w-xs">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">{progress}%</p>
              </div>
            )}
          </>
        ) : selectedFile ? (
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 text-chart-success" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); clearFile() }}
              className="p-1 rounded-md hover:bg-muted"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">{label}</p>
              {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-status-fail">
          <FileWarning className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
