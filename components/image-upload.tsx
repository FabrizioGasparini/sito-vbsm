"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { normalizeImageSrc } from "@/lib/utils"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = "Immagine" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Seleziona solo file immagine")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Errore sconosciuto" }))
        console.error("Upload failed:", err)
        alert(err.error || "Errore durante l'upload")
        setIsUploading(false)
        return
      }

      const data = await res.json()
      onChange(data.url)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Errore durante il caricamento dell'immagine")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleUrlChange = (url: string) => {
    onChange(normalizeImageSrc(url.trim()))
  }

  const clearImage = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getPreviewSrc = () => {
    if (!value) return "/images/placeholder.svg"
    return normalizeImageSrc(value) || "/images/placeholder.svg"
  }

  const inputValue = (() => {
    if (!value || value.startsWith("data:")) return ""
    return normalizeImageSrc(value)
  })()

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* URL Input */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">URL Immagine</Label>
        <Input
          value={inputValue}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://esempio.com/immagine.jpg"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Oppure carica un file</Label>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Caricamento..." : "Carica Immagine"}
          </Button>
          {value && (
            <Button type="button" variant="outline" size="icon" onClick={clearImage}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview */}
      {value && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Anteprima</Label>
          <div className="relative aspect-[2/1] w-full max-h-48 border rounded-lg overflow-hidden bg-muted">
            <img loading="lazy" decoding="async"
              src={getPreviewSrc() || "/images/placeholder.svg"}
              alt="Anteprima"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  )
}
