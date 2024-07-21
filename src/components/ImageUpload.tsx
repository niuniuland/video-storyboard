import React from 'react'
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

const ImageUpload = ({ onUpload }) => {
  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onUpload(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
        id={`imageInput-${Math.random()}`}
      />
      <Button 
        variant="outline" 
        size="icon"
        onClick={(e) => e.target.previousElementSibling?.click()}
        className="w-full h-20"
      >
        <Upload className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default ImageUpload