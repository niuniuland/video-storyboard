import React, { useRef, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

const ImageUpload = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const containerRef = useRef(null)
  const dragCounter = useRef(0)

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onUpload(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e) => {
    handleDrag(e)
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    handleDrag(e)
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e) => {
    handleDrag(e)
    setIsDragging(false)
    dragCounter.current = 0
    const file = e.dataTransfer.files[0]
    handleImageChange(file)
  }

  const handlePaste = (e) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        handleImageChange(file)
        break
      }
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('paste', handlePaste)
      return () => {
        container.removeEventListener('paste', handlePaste)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="relative border-2 border-dashed border-gray-300 transition-colors duration-300 ease-in-out"
      style={{
        borderColor: isDragging ? 'rgb(59, 130, 246)' : 'transparent',
        backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
      }}
      tabIndex="0"
    >
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e.target.files[0])}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-10 z-10 relative"
      >
        <Upload className="h-4 w-4" />
      </Button>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-blue-500 transition-opacity duration-300 ease-in-out"
           style={{ opacity: isDragging ? 1 : 0 }}>
          释放以上传图片
        </p>
      </div>
      <p className="mt-2 text-sm text-gray-500 text-center">
        点击上传，或拖拽图片至此，或直接粘贴图片
      </p>
    </div>
  )
}

export default ImageUpload