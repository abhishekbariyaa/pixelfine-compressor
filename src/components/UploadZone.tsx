
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon } from "lucide-react";

interface UploadZoneProps {
  onFilesSelect: (files: File[]) => void;
  className?: string;
}

const UploadZone = ({ onFilesSelect, className }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

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
    },
    [onFilesSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [onFilesSelect]
  );

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className={`relative ${className}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="file-upload"
        multiple
      />

      <div
        className={`
          flex flex-col items-center justify-center w-full p-10 
          border-2 border-dashed rounded-none transition-all duration-300
          ${
            isDragging
              ? "border-primary bg-white/5"
              : "border-white/20 hover:border-white/40 hover:bg-white/5"
          }
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isDragging ? "dragging" : "not-dragging"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            {isDragging ? (
              <>
                <div className="mb-4 p-3 rounded-none bg-white/5 w-fit mx-auto">
                  <ImageIcon
                    className="h-8 w-8 text-white animate-pulse"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-lg font-medium mb-2">Drop your images here</h3>
                <p className="text-sm text-muted-foreground">
                  Release to upload your images
                </p>
              </>
            ) : (
              <>
                <div className="mb-4 p-3 rounded-none bg-white/5 w-fit mx-auto">
                  <Upload className="h-8 w-8 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Drag & drop your images here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports multiple images: JPG, PNG, WebP and more
                </p>
                <button
                  onClick={handleButtonClick}
                  className="px-4 py-2 bg-white text-black rounded-none font-medium 
                        transition-all hover:bg-white/90 focus:outline-none"
                >
                  Select Images
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default UploadZone;
