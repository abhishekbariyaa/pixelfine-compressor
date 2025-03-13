
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

const UploadZone = ({ onFileSelect, className }: UploadZoneProps) => {
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

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
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
      />

      <div
        className={`
          flex flex-col items-center justify-center w-full p-10 
          border-2 border-dashed rounded-2xl transition-all duration-300
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-secondary/50"
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
                <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit mx-auto">
                  <ImageIcon
                    className="h-8 w-8 text-primary animate-pulse"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-lg font-medium mb-2">Drop your image here</h3>
                <p className="text-sm text-muted-foreground">
                  Release to upload your image
                </p>
              </>
            ) : (
              <>
                <div className="mb-4 p-3 rounded-full bg-secondary w-fit mx-auto">
                  <Upload className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Drag & drop your image here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports JPG, PNG, WebP and more
                </p>
                <button
                  onClick={handleButtonClick}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium 
                        transition-all shadow-[0_0_0_0_rgba(59,130,246,0.3)] 
                        hover:shadow-[0_0_0_4px_rgba(59,130,246,0.3)] focus:outline-none"
                >
                  Select Image
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
