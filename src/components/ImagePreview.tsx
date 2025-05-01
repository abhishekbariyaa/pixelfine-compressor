
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatFileSize } from "@/utils/imageCompression";

interface ImagePreviewProps {
  originalImage: string | null;
  compressedImage: string | null;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  className?: string;
}

const ImagePreview = ({
  originalImage,
  compressedImage,
  originalSize,
  compressedSize,
  compressionRatio,
  className,
}: ImagePreviewProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (compressedImage) {
      setIsLoading(true);
      const img = new Image();
      img.src = compressedImage;
      img.onload = () => {
        setIsLoading(false);
      };
    }
  }, [compressedImage]);

  if (!originalImage || !compressedImage) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-none border border-border bg-card shadow-lg ${className}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={showOriginal ? "original" : "compressed"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-background"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              <img
                src={showOriginal ? originalImage : compressedImage}
                alt={showOriginal ? "Original image" : "Compressed image"}
                className="w-full h-full object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-4 left-4 flex gap-2">
          <div
            className={`px-3 py-1 rounded-none text-xs font-medium cursor-pointer transition-all ${
              !showOriginal
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => setShowOriginal(false)}
          >
            Compressed
          </div>
          <div
            className={`px-3 py-1 rounded-none text-xs font-medium cursor-pointer transition-all ${
              showOriginal
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => setShowOriginal(true)}
          >
            Original
          </div>
        </div>

        <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-none text-xs font-medium text-white">
          {showOriginal
            ? `Original: ${formatFileSize(originalSize)}`
            : `Compressed: ${formatFileSize(compressedSize)}`}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Original</p>
            <p className="font-medium">{formatFileSize(originalSize)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Compressed</p>
            <p className="font-medium">{formatFileSize(compressedSize)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Savings</p>
            <p className="font-medium text-primary">
              {compressionRatio.toFixed(1)}%
            </p>
          </div>
        </div>

        <div 
          className="relative h-8 bg-secondary rounded-none overflow-hidden cursor-pointer"
          onClick={() => setShowOriginal(!showOriginal)}
        >
          <div 
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
            style={{ width: `${100 - compressionRatio}%` }}
          ></div>
          
          <div className="absolute inset-y-0 left-0 w-full flex">
            <div className="w-1/2 flex items-center justify-center text-xs font-medium z-10 text-foreground">
              Original
            </div>
            <div className="w-1/2 flex items-center justify-center text-xs font-medium z-10 text-foreground">
              Compressed
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImagePreview;
