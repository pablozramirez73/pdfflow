import React, { useRef, useState } from 'react';
import { X, UploadCloud, FileType, Loader2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert("Per favore carica solo file PDF.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    await onUpload(file);
    setIsUploading(false);
    setFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Carica Documento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {!file ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-brand-500 bg-brand-50' 
                  : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
              }`}
            >
              <div className="w-16 h-16 bg-orange-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={32} />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                Clicca o trascina qui il file
              </p>
              <p className="text-sm text-gray-500 mb-4">Supporto PDF fino a 10MB</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="application/pdf"
                onChange={handleFileSelect}
              />
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                Sfoglia file
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                  <FileType size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)} 
                className="text-gray-400 hover:text-red-500 p-2"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Caricamento...
              </>
            ) : (
              'Analizza Documento'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
