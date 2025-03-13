import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Save, CheckCircle2 } from "lucide-react";
import { 
  compressImage, 
  getFileExtension, 
  downloadFile 
} from "@/utils/imageCompression";
import { toast } from "sonner";

interface ExportOptionsProps {
  originalFile: File | null;
  compressedBlob: Blob | null;
  quality: number;
  onExport: (blob: Blob, url: string) => void;
  className?: string;
}

type FormatOption = {
  id: "jpeg" | "png" | "webp";
  label: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  description: string;
};

const formatOptions: FormatOption[] = [
  {
    id: "jpeg",
    label: "JPEG",
    mimeType: "image/jpeg",
    description: "Best for photos, smaller file size"
  },
  {
    id: "png",
    label: "PNG",
    mimeType: "image/png",
    description: "Lossless quality, supports transparency"
  },
  {
    id: "webp",
    label: "WebP",
    mimeType: "image/webp",
    description: "Modern format, excellent compression"
  }
];

const ExportOptions = ({ 
  originalFile, 
  compressedBlob, 
  quality, 
  onExport,
  className 
}: ExportOptionsProps) => {
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>(formatOptions[0]);
  const [isExporting, setIsExporting] = useState(false);

  const handleFormatChange = (format: FormatOption) => {
    setSelectedFormat(format);
  };

  const handleExport = async () => {
    if (!originalFile) return;
    
    setIsExporting(true);
    
    try {
      const result = await compressImage(originalFile, {
        quality: quality,
        format: selectedFormat.mimeType,
        maxWidth: 2000,
        maxHeight: 2000
      });
      
      onExport(result.blob, result.url);
      toast.success(`Image converted to ${selectedFormat.label}`, {
        description: `Compressed from ${result.originalSize} to ${result.compressedSize} bytes`
      });
    } catch (error) {
      toast.error("Failed to export image", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !originalFile) return;
    
    const filename = originalFile.name.split('.')[0] + getFileExtension(selectedFormat.mimeType);
    downloadFile(compressedBlob, filename);
    
    toast.success("Download started", {
      description: `Your compressed image is being downloaded as ${filename}`
    });
  };

  if (!originalFile || !compressedBlob) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className={`rounded-2xl bg-white p-6 shadow-lg ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-secondary">
          <Save className="h-5 w-5 text-primary" strokeWidth={2} />
        </div>
        <h3 className="text-lg font-medium">Export Options</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-3 block">Format</label>
          <div className="grid grid-cols-3 gap-3">
            {formatOptions.map((format) => (
              <div
                key={format.id}
                onClick={() => handleFormatChange(format)}
                className={`
                  relative rounded-lg border p-3 flex flex-col cursor-pointer transition-all
                  ${
                    selectedFormat.id === format.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }
                `}
              >
                {selectedFormat.id === format.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2} />
                  </div>
                )}
                <span className="font-medium">{format.label}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {format.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting || !originalFile}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium text-sm
              flex items-center justify-center gap-2 transition-all
              ${
                isExporting
                  ? "bg-primary/70 text-primary-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }
            `}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Converting...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Convert to {selectedFormat.label}
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting || !compressedBlob}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg font-medium text-sm
                    flex items-center justify-center gap-2 transition-all hover:bg-secondary/80"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExportOptions;
