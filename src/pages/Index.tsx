import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Import components
import CompressorHeader from "@/components/CompressorHeader";
import UploadZone from "@/components/UploadZone";
import ImageCompression from "@/components/ImageCompression";
import PrivacyNotice from "@/components/PrivacyNotice";

// Import utility functions
import { compressImage } from "@/utils/imageCompression";
import { ImageItem } from "@/components/MultiImagePreview";

// 10 minutes in milliseconds
const AUTO_DELETE_TIMEOUT = 10 * 60 * 1000;

const Index = () => {
  // State for multiple images
  const [images, setImages] = useState<ImageItem[]>([]);
  
  // Loading state
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  
  // Quality control state (0.6 = 60% quality, good default)
  const [quality, setQuality] = useState<number>(0.6);

  // Handle file selection from UploadZone
  const handleFilesSelect = async (files: File[]) => {
    if (!files || files.length === 0) return;
    
    try {
      setIsCompressing(true);
      
      const newImages: ImageItem[] = [];
      
      // Process each file
      for (const file of files) {
        // Create URL for original image preview
        const originalUrl = URL.createObjectURL(file);
        const imageId = uuidv4();
        
        // Compress the image with current quality settings
        const result = await compressImage(file, {
          quality,
          format: 'image/jpeg',
          maxWidth: 2000,
          maxHeight: 2000,
        });
        
        // Create image item
        const imageItem: ImageItem = {
          id: imageId,
          originalFile: file,
          originalUrl,
          originalSize: file.size,
          compressedUrl: result.url,
          compressedBlob: result.blob,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
        };
        
        newImages.push(imageItem);
        
        // Schedule auto-deletion for this image
        setTimeout(() => {
          removeImage(imageId);
          toast.info("Image removed", {
            description: "Images are automatically deleted after 10 minutes for your privacy",
          });
        }, AUTO_DELETE_TIMEOUT);
      }
      
      // Update state with new images
      setImages(prev => [...prev, ...newImages]);
      
      // Show success toast
      toast.success(`${files.length > 1 ? 'Images' : 'Image'} uploaded and compressed`, {
        description: `${files.length} ${files.length > 1 ? 'images' : 'image'} successfully processed`,
      });
    } catch (error) {
      toast.error('Failed to process images', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle quality change from QualityControl
  const handleQualityChange = async (newQuality: number) => {
    if (images.length === 0) return;
    
    setQuality(newQuality);
    setIsCompressing(true);
    
    try {
      // Create a new array to store updated images
      const updatedImages = await Promise.all(
        images.map(async (image) => {
          // Recompress with new quality setting
          const result = await compressImage(image.originalFile, {
            quality: newQuality,
            format: 'image/jpeg',
            maxWidth: 2000,
            maxHeight: 2000,
          });
          
          // Release previous blob URL to prevent memory leaks
          if (image.compressedUrl) {
            URL.revokeObjectURL(image.compressedUrl);
          }
          
          // Return updated image
          return {
            ...image,
            compressedUrl: result.url,
            compressedBlob: result.blob,
            compressedSize: result.compressedSize,
            compressionRatio: result.compressionRatio,
          };
        })
      );
      
      // Update state with recompressed images
      setImages(updatedImages);
    } catch (error) {
      toast.error('Failed to update compression', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle export format change
  const handleExport = (id: string, blob: Blob, url: string) => {
    setImages(prev => 
      prev.map(img => {
        if (img.id === id) {
          // Release previous blob URL to prevent memory leaks
          if (img.compressedUrl) {
            URL.revokeObjectURL(img.compressedUrl);
          }
          
          // Return updated image
          return {
            ...img,
            compressedBlob: blob,
            compressedUrl: url,
            compressedSize: blob.size,
            compressionRatio: (1 - blob.size / img.originalSize) * 100,
          };
        }
        return img;
      })
    );
  };

  // Remove image by ID
  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      // Find the image to remove
      const imageToRemove = prev.find(img => img.id === id);
      
      // Release object URLs to prevent memory leaks
      if (imageToRemove) {
        if (imageToRemove.originalUrl) URL.revokeObjectURL(imageToRemove.originalUrl);
        if (imageToRemove.compressedUrl) URL.revokeObjectURL(imageToRemove.compressedUrl);
      }
      
      // Filter out the removed image
      return prev.filter(img => img.id !== id);
    });
  }, []);

  // Reset all images
  const handleReset = () => {
    // Clean up object URLs
    images.forEach(img => {
      if (img.originalUrl) URL.revokeObjectURL(img.originalUrl);
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
    });
    
    // Clear images array
    setImages([]);
  };

  // Handle adding more images
  const handleAddMore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        handleFilesSelect(files);
      }
    };
    input.click();
  };

  // Handle images update from ImageCompression component
  const handleImagesUpdate = (updatedImages: ImageItem[]) => {
    setImages(updatedImages);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.originalUrl) URL.revokeObjectURL(img.originalUrl);
        if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8">
        {/* App Header */}
        <CompressorHeader />
        
        {/* Privacy Notice */}
        <PrivacyNotice className="mb-12" />
        
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Upload Zone (shown when no image is selected) */}
          {images.length === 0 && (
            <UploadZone onFilesSelect={handleFilesSelect} />
          )}
          
          {/* Compression Interface (shown after image selection) */}
          {images.length > 0 && (
            <ImageCompression
              images={images}
              quality={quality}
              onQualityChange={handleQualityChange}
              onRemoveImage={removeImage}
              onImagesUpdate={handleImagesUpdate}
              onReset={handleReset}
              onAddMore={handleAddMore}
            />
          )}
          
          {/* Loading Overlay */}
          {isCompressing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-50"
            >
              <div className="glass-card rounded-2xl p-8 text-center max-w-md w-full mx-4">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-medium mb-3 text-foreground">Processing Images</h3>
                <p className="text-muted-foreground">Applying compression algorithms...</p>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="glass rounded-xl px-6 py-4 inline-block">
            <p className="text-sm text-muted-foreground">
              Advanced Image Compression • Powered by Modern Web Technologies
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
