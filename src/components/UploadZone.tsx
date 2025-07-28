
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage } from "lucide-react";

interface UploadZoneProps {
  onFilesSelect: (files: File[]) => void;
  className?: string;
}

const UploadZone = ({ onFilesSelect, className }: UploadZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const imageFiles: File[] = [];
      
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        if (file.type.startsWith("image/")) {
          imageFiles.push(file);
        }
      }
      
      if (imageFiles.length > 0) {
        onFilesSelect(imageFiles);
      }
    }
  }, [onFilesSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const imageFiles: File[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file.type.startsWith("image/")) {
          imageFiles.push(file);
        }
      }
      
      if (imageFiles.length > 0) {
        onFilesSelect(imageFiles);
      }
    }
  }, [onFilesSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`glass-card rounded-2xl p-12 text-center interactive-glow ${className}`}
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-primary/60 bg-primary/10 glow-primary' 
            : 'border-border/50 hover:border-primary/40 hover:bg-primary/5'
          }
        `}
        onClick={() => inputRef.current?.click()}
      >
        {/* Animated Upload Icon */}
        <motion.div
          animate={{ 
            y: isDragOver ? -10 : 0,
            scale: isDragOver ? 1.1 : 1
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mx-auto mb-6"
        >
          <div className={`
            w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragOver 
              ? 'bg-primary/20 border-2 border-primary/40' 
              : 'bg-surface-2/50 border-2 border-border/30'
            }
          `}>
            <Upload 
              className={`
                w-10 h-10 transition-all duration-300
                ${isDragOver ? 'text-primary' : 'text-muted-foreground'}
              `} 
            />
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-medium text-foreground">
            {isDragOver ? 'Drop your images here' : 'Upload Images'}
          </h3>
          
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            {isDragOver 
              ? 'Release to start compressing your images'
              : 'Drag and drop your images here, or click to browse files'
            }
          </p>

          {/* Format Info */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2/50 border border-border/30">
              <FileImage className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">
                Supports JPEG, PNG, WebP
              </span>
            </div>
          </div>

          {/* Action Button */}
          {!isDragOver && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="pt-2"
            >
              <button className="px-8 py-3 bg-primary hover:bg-primary-glow text-primary-foreground rounded-xl font-medium transition-smooth interactive-scale glow-primary">
                Choose Files
              </button>
            </motion.div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Decorative Elements */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-accent/5 to-transparent rounded-full translate-x-20 translate-y-20" />
        </div>
      </div>
    </motion.div>
  );
};

export default UploadZone;
