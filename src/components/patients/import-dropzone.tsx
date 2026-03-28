'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileSpreadsheet, FileText, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { parseCSV } from '@/lib/import/parse-csv'

interface ImportDropzoneProps {
  onFileSelect: (file: File, data: any[]) => void
}

export function ImportDropzone({ onFileSelect }: ImportDropzoneProps) {
  const [file, setFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isParsing, setIsParsing] = React.useState(false)

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)
    setIsParsing(true)

    try {
      let data: any[] = []

      if (selectedFile.name.endsWith('.csv')) {
        data = await parseCSV(selectedFile)
      } else {
        throw new Error('Unsupported file format')
      }

      if (data.length === 0) {
        throw new Error('File is empty')
      }

      onFileSelect(selectedFile, data)
    } catch (err: any) {
      setError(err.message)
      setFile(null)
    } finally {
      setIsParsing(false)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    multiple: false
  })

  if (file) {
    return (
      <Card className="border-dashed border-2 bg-muted/10">
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-center">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          {isParsing ? (
            <p className="text-sm text-muted-foreground animate-pulse">Parsing file...</p>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setFile(null)}>
              Change File
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors hover:bg-muted/5",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        error && "border-red-500 bg-red-50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-lg">
            {isDragActive ? "Drop the file here" : "Drag & drop your file here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Supports .csv up to 10MB
          </p>
        </div>
        {error && (
          <p className="text-sm text-red-600 font-medium flex items-center gap-2">
            <X className="h-4 w-4" /> {error}
          </p>
        )}
        <Button variant="secondary">Select File</Button>
      </div>
    </div>
  )
}
