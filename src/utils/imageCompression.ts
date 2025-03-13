
/**
 * Image compression utility functions
 */

type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

type CompressionOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality: number;
  format: ImageFormat;
};

/**
 * Compresses an image based on provided options
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions
): Promise<{ 
  blob: Blob; 
  url: string; 
  originalSize: number; 
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (options.maxWidth && width > options.maxWidth) {
          const ratio = options.maxWidth / width;
          width = options.maxWidth;
          height = height * ratio;
        }
        
        if (options.maxHeight && height > options.maxHeight) {
          const ratio = options.maxHeight / height;
          height = options.maxHeight;
          width = width * ratio;
        }
        
        // Create canvas and context
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw image on canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to specified format with quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not create blob'));
              return;
            }
            
            const url = URL.createObjectURL(blob);
            const originalSize = file.size;
            const compressedSize = blob.size;
            const compressionRatio = (1 - compressedSize / originalSize) * 100;
            
            resolve({
              blob,
              url,
              originalSize,
              compressedSize,
              compressionRatio,
              width,
              height
            });
          },
          options.format,
          options.quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Formats file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get appropriate file extension from mime type
 */
export const getFileExtension = (format: ImageFormat): string => {
  switch (format) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    default:
      return '.jpg';
  }
};

/**
 * Download blob as file
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
