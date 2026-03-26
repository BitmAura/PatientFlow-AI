"use client"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface DoctorPhotoUploadProps {
  value?: string
  onChange: (url: string) => void
  name: string
}

export function DoctorPhotoUpload({ value, onChange, name }: DoctorPhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const supabase = createClient()
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `doctors/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success("Photo uploaded")
    } catch (error: any) {
      toast.error("Error uploading photo: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={value} />
          <AvatarFallback className="text-lg">
            {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
          </AvatarFallback>
        </Avatar>
        {value && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={() => onChange('')}
            type="button"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Photo"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
    </div>
  )
}
