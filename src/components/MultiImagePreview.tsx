
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatFileSize } from "@/utils/imageCompression";

export interface ImageItem {
  id: string;
  originalFile: File;
  originalUrl: string;
  originalSize: number;
  compressedUrl: string | null;
  compressedBlob: Blob | null;
  compressedSize: number;
  compressionRatio: number;
}

interface MultiImagePreviewProps {
  images: ImageItem[];
  onRemoveImage: (id: string) => void;
  className?: string;
}

const MultiImagePreview = ({
  images,
  onRemoveImage,
  className,
}: MultiImagePreviewProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);

  if (images.length === 0) {
    return null;
  }

  const selectedImage = images[selectedIndex];
  
  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl overflow-hidden shadow-lg bg-white ${className}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedIndex}-${showOriginal ? "original" : "compressed"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#f5f5f7]"
          >
            <img
              src={showOriginal ? selectedImage.originalUrl : (selectedImage.compressedUrl || selectedImage.originalUrl)}
              alt={showOriginal ? "Original image" : "Compressed image"}
              className="w-full h-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Image controls */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-all cursor-pointer ${
              !showOriginal
                ? "bg-primary text-white"
                : "bg-black/10 text-black"
            }`}
            onClick={() => setShowOriginal(false)}
          >
            Compressed
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md transition-all cursor-pointer ${
              showOriginal
                ? "bg-primary text-white"
                : "bg-black/10 text-black"
            }`}
            onClick={() => setShowOriginal(true)}
          >
            Original
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemoveImage(selectedImage.id)}
          className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-1 rounded-full transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image size info */}
        <div className="absolute bottom-4 right-4 bg-black/30 text-white px-3 py-1 rounded-full text-xs font-medium">
          {showOriginal
            ? `Original: ${formatFileSize(selectedImage.originalSize)}`
            : `Compressed: ${formatFileSize(selectedImage.compressedSize)}`}
        </div>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium truncate flex-1">{selectedImage.originalFile.name}</h3>
          <span className="text-sm text-muted-foreground">
            {selectedIndex + 1} of {images.length}
          </span>
        </div>

        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Original</p>
            <p className="font-medium">{formatFileSize(selectedImage.originalSize)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Compressed</p>
            <p className="font-medium">{formatFileSize(selectedImage.compressedSize)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Savings</p>
            <p className="font-medium text-primary">
              {selectedImage.compressionRatio.toFixed(1)}%
            </p>
          </div>
        </div>

        <div 
          className="relative h-8 bg-secondary rounded-full overflow-hidden cursor-pointer"
          onClick={() => setShowOriginal(!showOriginal)}
        >
          <div 
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
            style={{ width: `${100 - selectedImage.compressionRatio}%` }}
          ></div>
          
          <div className="absolute inset-y-0 left-0 w-full flex">
            <div className="w-1/2 flex items-center justify-center text-xs font-medium z-10">
              Original
            </div>
            <div className="w-1/2 flex items-center justify-center text-xs font-medium z-10">
              Compressed
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto py-2">
            {images.map((image, index) => (
              <div 
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`
                  w-16 h-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer
                  ${selectedIndex === index ? 'ring-2 ring-primary' : 'opacity-70'}
                `}
              >
                <img 
                  src={image.compressedUrl || image.originalUrl} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MultiImagePreview;
