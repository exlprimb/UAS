import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Ganti dengan komponen Button Anda

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  initialPreview?: string | null;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, initialPreview, className }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validasi ukuran file (contoh: 2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 2MB.');
        return;
      }
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };

  const handleUploadClick = () => {
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary bg-muted/50"
        onClick={() => inputRef.current?.click()}
      >
        <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
        ) : (
          <div className="text-center text-muted-foreground">
            <UploadCloud className="mx-auto h-12 w-12" />
            <p>Klik untuk memilih gambar</p>
            <p className="text-xs">PNG, JPG, GIF hingga 2MB</p>
          </div>
        )}
      </div>
      {file && (
        <div className="flex justify-end">
          <Button onClick={handleUploadClick} variant="default">
            <UploadCloud className="mr-2 h-4 w-4" /> Unggah Gambar
          </Button>
        </div>
      )}
    </div>
  );
};
