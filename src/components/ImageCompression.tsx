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
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`glass-card rounded-2xl p-8 interactive-glow ${className}`}
    >
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="bg-surface-2/50 border-border/50 hover:bg-surface-3/50 hover:border-primary/30 transition-smooth"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Choose different
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddMore}
            className="bg-surface-2/50 border-border/50 hover:bg-surface-3/50 hover:border-accent/30 transition-smooth"
          >
            Add more images
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemoveImage(currentImage.id)}
          className="bg-surface-2/50 border-border/50 hover:bg-destructive/20 hover:border-destructive/50 transition-smooth"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </div>

      {/* Main Image Display */}
      <div className="relative mb-8">
        <div className="aspect-video glass rounded-2xl overflow-hidden relative group">
          <img
            src={showOriginal ? currentImage.originalUrl : currentImage.compressedUrl}
            alt={currentImage.originalFile.name}
            className="w-full h-full object-contain transition-smooth"
          />
          
          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/30 pointer-events-none" />
          
          {/* Processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 glass flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Converting...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Image Toggle */}
        <div className="absolute top-6 right-6">
          <Toggle
            pressed={showOriginal}
            onPressedChange={setShowOriginal}
            variant="outline"
            size="sm"
            className="glass bg-surface-2/80 border-border/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground hover:bg-surface-3/80 transition-smooth"
          >
            {showOriginal ? 'Original' : 'Compressed'}
          </Toggle>
        </div>
      </div>

      {/* File Info */}
      <div className="mb-8 p-6 glass rounded-xl">
        <h3 className="font-medium text-xl mb-4 text-foreground">{currentImage.originalFile.name}</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground mb-1">Original</p>
            <p className="font-medium text-foreground">{formatFileSize(currentImage.originalSize)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-1">Compressed</p>
            <p className="font-medium text-foreground">{formatFileSize(currentImage.compressedSize)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-1">Saved</p>
            <p className="font-medium text-primary">{currentImage.compressionRatio.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Quality Control */}
      <div className="mb-8 p-6 glass rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <label className="text-sm font-medium text-foreground">Quality Control</label>
          <span className="text-sm font-medium px-3 py-1 rounded-lg bg-primary/20 text-primary border border-primary/30">
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
          className="mb-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Smallest</span>
          <span>Balanced</span>
          <span>Highest</span>
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-8 p-6 glass rounded-xl">
        <label className="text-sm font-medium mb-4 block text-foreground">Output Format</label>
        <div className="flex gap-3">
          {(['png', 'jpeg', 'webp'] as FormatType[]).map((format) => (
            <Toggle
              key={format}
              pressed={selectedFormat === format}
              onPressedChange={() => selectedFormat !== format && handleFormatChange(format)}
              variant="outline"
              disabled={isProcessing}
              className={`flex-1 uppercase font-medium transition-smooth ${
                selectedFormat === format
                  ? 'bg-primary text-primary-foreground border-primary glow-primary'
                  : 'bg-surface-2/50 border-border/50 hover:bg-surface-3/50 hover:border-primary/30'
              }`}
            >
              {format}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Button 
          onClick={handlePreview} 
          variant="outline" 
          className="bg-surface-2/50 border-border/50 hover:bg-surface-3/50 hover:border-accent/50 transition-smooth interactive-scale"
          disabled={isProcessing}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview {selectedFormat.toUpperCase()}
        </Button>
        <Button 
          onClick={handleDownload} 
          className="bg-primary hover:bg-primary-glow glow-primary transition-smooth interactive-scale"
          disabled={isProcessing}
        >
          <Download className="h-4 w-4 mr-2" />
          Download {selectedFormat.toUpperCase()}
        </Button>
      </div>

      {/* Thumbnails for multiple images */}
      {images.length > 1 && (
        <div className="pt-8 border-t border-border/30">
          <p className="text-sm font-medium text-muted-foreground mb-4">All Images ({images.length})</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-smooth interactive-scale ${
                  index === selectedIndex 
                    ? 'border-primary glow-primary' 
                    : 'border-border/50 hover:border-primary/50'
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