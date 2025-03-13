
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Import components
import CompressorHeader from "@/components/CompressorHeader";
import UploadZone from "@/components/UploadZone";
import ImagePreview from "@/components/ImagePreview";
import QualityControl from "@/components/QualityControl";
import ExportOptions from "@/components/ExportOptions";

// Import utility functions
import { compressImage } from "@/utils/imageCompression";

const Index = () => {
  // State for the original file
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  
  // State for original and compressed image URLs
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  
  // State for compression data
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressionRatio, setCompressionRatio] = useState<number>(0);
  
  // Quality control state (0.6 = 60% quality, good default)
  const [quality, setQuality] = useState<number>(0.6);
  
  // Loading state
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Handle file selection from UploadZone
  const handleFileSelect = async (file: File) => {
    try {
      // Create URL for original image preview
      const originalUrl = URL.createObjectURL(file);
      setOriginalFile(file);
      setOriginalImage(originalUrl);
      setOriginalSize(file.size);
      
      // Start compression
      setIsCompressing(true);
      
      // Compress the image with current quality settings
      const result = await compressImage(file, {
        quality,
        format: 'image/jpeg',
        maxWidth: 2000,  // Reasonable max dimensions to preserve quality
        maxHeight: 2000, // while still reducing file size
      });
      
      // Update state with compression results
      setCompressedImage(result.url);
      setCompressedBlob(result.blob);
      setCompressedSize(result.compressedSize);
      setCompressionRatio(result.compressionRatio);
      
      // Show success toast
      toast.success('Image compressed successfully', {
        description: `Reduced by ${result.compressionRatio.toFixed(1)}%`,
      });
    } catch (error) {
      toast.error('Failed to process image', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle quality change from QualityControl
  const handleQualityChange = async (newQuality: number) => {
    if (!originalFile) return;
    
    setQuality(newQuality);
    setIsCompressing(true);
    
    try {
      // Recompress with new quality setting
      const result = await compressImage(originalFile, {
        quality: newQuality,
        format: 'image/jpeg',
        maxWidth: 2000,
        maxHeight: 2000,
      });
      
      // Update compression results
      setCompressedImage(result.url);
      setCompressedBlob(result.blob);
      setCompressedSize(result.compressedSize);
      setCompressionRatio(result.compressionRatio);
    } catch (error) {
      toast.error('Failed to update compression', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle export format change
  const handleExport = (blob: Blob, url: string) => {
    // Release previous blob URL to prevent memory leaks
    if (compressedImage) {
      URL.revokeObjectURL(compressedImage);
    }
    
    // Update state with new compressed image
    setCompressedBlob(blob);
    setCompressedImage(url);
    setCompressedSize(blob.size);
    setCompressionRatio((1 - blob.size / originalSize) * 100);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalImage) URL.revokeObjectURL(originalImage);
      if (compressedImage) URL.revokeObjectURL(compressedImage);
    };
  }, [originalImage, compressedImage]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container max-w-5xl py-10">
        {/* App Header */}
        <CompressorHeader />
        
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Upload Zone (shown when no image is selected) */}
          {!originalImage && (
            <UploadZone onFileSelect={handleFileSelect} />
          )}
          
          {/* Compression Result and Controls (shown after image selection) */}
          <AnimatePresence>
            {originalImage && compressedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Image Upload Section (smaller when image is selected) */}
                <div className="mb-8">
                  <button
                    onClick={() => setOriginalFile(null)}
                    className="text-sm text-primary font-medium hover:underline mb-2 inline-flex items-center"
                  >
                    ← Choose another image
                  </button>
                </div>
                
                {/* Image Preview */}
                <ImagePreview
                  originalImage={originalImage}
                  compressedImage={compressedImage}
                  originalSize={originalSize}
                  compressedSize={compressedSize}
                  compressionRatio={compressionRatio}
                  className="mb-8"
                />
                
                {/* Controls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <QualityControl 
                    quality={quality} 
                    onQualityChange={handleQualityChange} 
                  />
                  
                  <ExportOptions
                    originalFile={originalFile}
                    compressedBlob={compressedBlob}
                    quality={quality}
                    onExport={handleExport}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Loading Overlay */}
          <AnimatePresence>
            {isCompressing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md w-full text-center">
                  <div className="mx-auto w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                  <h3 className="text-lg font-medium mb-2">Processing your image</h3>
                  <p className="text-muted-foreground">This may take a moment depending on the file size...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16 text-center text-sm text-muted-foreground"
        >
          <p>Fast Image Compressor • Optimize images without losing quality</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
