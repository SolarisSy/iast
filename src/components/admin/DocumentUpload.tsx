'use client';

import { useState, useRef } from 'react';

interface DocumentUploadProps {
  onUploadSuccess: (message: string) => void;
  onUploadError: (message: string) => void;
}

export function DocumentUpload({ onUploadSuccess, onUploadError }: DocumentUploadProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      // Filtrar apenas PDFs
      const pdfFiles = Array.from(droppedFiles).filter(
        file => file.type === 'application/pdf'
      );
      
      if (pdfFiles.length === 0) {
        onUploadError('Apenas arquivos PDF são permitidos');
        return;
      }

      const dataTransfer = new DataTransfer();
      pdfFiles.forEach(file => dataTransfer.items.add(file));
      setFiles(dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      onUploadError('Selecione pelo menos um arquivo PDF');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      
      if (files.length === 1) {
        formData.append('pdf', files[0]);
        formData.append('autoProcess', 'true');

        const response = await fetch(`${API_URL}/api/documents/upload`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          onUploadSuccess(
            `PDF "${files[0].name}" enviado e processado com sucesso! ` +
            `${result.processing?.totalChunks || 0} chunks indexados.`
          );
          setFiles(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          onUploadError(result.error || 'Erro ao fazer upload');
        }
      } else {
        // Upload múltiplo
        Array.from(files).forEach(file => {
          formData.append('pdfs', file);
        });
        formData.append('autoProcess', 'true');

        const response = await fetch(`${API_URL}/api/documents/upload-multiple`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          onUploadSuccess(
            `${files.length} PDFs enviados e processados com sucesso! ` +
            `${result.processing?.totalChunks || 0} chunks indexados.`
          );
          setFiles(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          onUploadError(result.error || 'Erro ao fazer upload');
        }
      }
    } catch (error) {
      onUploadError('Erro ao conectar com o servidor: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    if (!files) return;
    
    const dataTransfer = new DataTransfer();
    Array.from(files).forEach((file, i) => {
      if (i !== index) dataTransfer.items.add(file);
    });
    
    setFiles(dataTransfer.files.length > 0 ? dataTransfer.files : null);
    if (dataTransfer.files.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h2 className="text-xl font-medium text-white mb-4">📤 Upload de Documentos</h2>
      
      {/* Drag & Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-white/20 hover:border-white/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="pointer-events-none">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-white/80 mb-2">
            Arraste PDFs aqui ou clique para selecionar
          </p>
          <p className="text-sm text-white/40">
            Suporta múltiplos arquivos • Máximo 50MB cada
          </p>
        </div>
      </div>

      {/* Files List */}
      {files && files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-white/60 mb-2">
            {files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}:
          </p>
          {Array.from(files).map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-white/40">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-red-400 hover:text-red-300 transition-colors p-2"
                disabled={uploading}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!files || files.length === 0 || uploading}
        className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Processando... Isso pode levar alguns segundos
          </span>
        ) : (
          `Enviar e Treinar IA${files && files.length > 1 ? ` (${files.length} arquivos)` : ''}`
        )}
      </button>

      {uploading && (
        <div className="mt-3 text-center">
          <p className="text-xs text-white/40">
            Aguarde enquanto processamos e indexamos os documentos...
          </p>
        </div>
      )}
    </div>
  );
}

