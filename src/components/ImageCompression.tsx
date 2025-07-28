import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Eye, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";
import { compressImage, formatFileSize } from "@/utils/imageCompression";
import { ImageItem } from "@/components/MultiImagePreview";

interface ImageCompressionProps {
  images: ImageItem[];
  quality: number;
  onQualityChange: (quality: number) => void;
  onRemoveImage: (id: string) => void;
  onImagesUpdate: (images: ImageItem[]) => void;
  onReset: () => void;
  onAddMore: () => void;
  className?: string;
}

type FormatType = 'jpeg' | 'png' | 'webp';

const ImageCompression = ({
  images,
  quality,
  onQualityChange,
  onRemoveImage,
  onImagesUpdate,
  onReset,
  onAddMore,
  className
}: ImageCompressionProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);

  const currentImage = images[selectedIndex];

  useEffect(() => {
    if (selectedIndex >= images.length && images.length > 0) {
      setSelectedIndex(0);
    }
  }, [images.length, selectedIndex]);

  const handleFormatChange = async (format: FormatType) => {
    if (!currentImage || isProcessing) return;
    
    setSelectedFormat(format);
    setIsProcessing(true);

    try {
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                      format === 'png' ? 'image/png' : 'image/webp';
      
      const result = await compressImage(currentImage.originalFile, {
        quality: format === 'png' ? 1 : quality,
        format: mimeType,
        maxWidth: 2000,
        maxHeight: 2000,
      });

      const updatedImages = images.map(img => {
        if (img.id === currentImage.id) {
          if (img.compressedUrl) {
            URL.revokeObjectURL(img.compressedUrl);
          }
          return {
            ...img,
            compressedUrl: result.url,
            compressedBlob: result.blob,
            compressedSize: result.compressedSize,
            compressionRatio: result.compressionRatio,
          };
        }
        return img;
      });

      onImagesUpdate(updatedImages);
      toast.success(`Converted to ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to convert format');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQualityChange = (value: number[]) => {
    onQualityChange(value[0]);
  };

  const handleDownload = () => {
    if (!currentImage) return;

    const link = document.createElement('a');
    link.href = currentImage.compressedUrl;
    const originalName = currentImage.originalFile.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const ext = selectedFormat === 'jpeg' ? 'jpg' : selectedFormat;
    link.download = `${nameWithoutExt}_compressed.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Download started');
  };

  const handlePreview = () => {
    if (!currentImage) return;
    window.open(currentImage.compressedUrl, '_blank');
  };

  if (!currentImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-card border border-border rounded-lg p-6 ${className}`}
    >
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Choose different
          </Button>
          <Button variant="outline" size="sm" onClick={onAddMore}>
            Add more images
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemoveImage(currentImage.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </div>

      {/* Main Image Display */}
      <div className="relative mb-6">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <img
            src={showOriginal ? currentImage.originalUrl : currentImage.compressedUrl}
            alt={currentImage.originalFile.name}
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Image Toggle */}
        <div className="absolute top-4 right-4">
          <Toggle
            pressed={showOriginal}
            onPressedChange={setShowOriginal}
            variant="outline"
            size="sm"
          >
            {showOriginal ? 'Original' : 'Compressed'}
          </Toggle>
        </div>
      </div>

      {/* File Info */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2">{currentImage.originalFile.name}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Original: {formatFileSize(currentImage.originalSize)}</span>
          <span>Compressed: {formatFileSize(currentImage.compressedSize)}</span>
          <span className="text-primary font-medium">
            {currentImage.compressionRatio.toFixed(1)}% smaller
          </span>
        </div>
      </div>

      {/* Quality Control */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium">Quality</label>
          <span className="text-sm text-primary font-medium">
            {Math.round(quality * 100)}%
          </span>
        </div>
        <Slider
          value={[quality]}
          onValueChange={handleQualityChange}
          max={1}
          min={0.1}
          step={0.01}
          disabled={selectedFormat === 'png' || isProcessing}
        />
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-3 block">Format</label>
        <div className="flex gap-2">
          {(['png', 'jpeg', 'webp'] as FormatType[]).map((format) => (
            <Toggle
              key={format}
              pressed={selectedFormat === format}
              onPressedChange={() => selectedFormat !== format && handleFormatChange(format)}
              variant="outline"
              disabled={isProcessing}
              className="uppercase"
            >
              {format}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handlePreview} variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          Preview {selectedFormat.toUpperCase()}
        </Button>
        <Button onClick={handleDownload} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download {selectedFormat.toUpperCase()}
        </Button>
      </div>

      {/* Thumbnails for multiple images */}
      {images.length > 1 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === selectedIndex 
                    ? 'border-primary' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <img
                  src={image.originalUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ImageCompression;