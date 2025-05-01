
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sliders } from "lucide-react";

interface QualityControlProps {
  quality: number;
  onQualityChange: (value: number) => void;
  className?: string;
}

const QualityControl = ({ quality, onQualityChange, className }: QualityControlProps) => {
  const [internalQuality, setInternalQuality] = useState(quality);
  const [activeLabel, setActiveLabel] = useState<string>("balanced");

  useEffect(() => {
    // Update label based on quality
    if (internalQuality < 0.4) {
      setActiveLabel("low");
    } else if (internalQuality < 0.7) {
      setActiveLabel("balanced");
    } else if (internalQuality < 0.9) {
      setActiveLabel("high");
    } else {
      setActiveLabel("maximum");
    }
  }, [internalQuality]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setInternalQuality(value);
  };

  const handleChangeComplete = () => {
    onQualityChange(internalQuality);
  };

  const setPresetQuality = (value: number, label: string) => {
    setInternalQuality(value);
    setActiveLabel(label);
    onQualityChange(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className={`rounded-md bg-card border border-border p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-secondary">
          <Sliders className="h-5 w-5 text-primary" strokeWidth={2} />
        </div>
        <h3 className="text-lg font-medium">Quality Settings</h3>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-3">
            <label htmlFor="quality-slider" className="text-sm font-medium">
              Compression Quality
            </label>
            <span className="text-sm text-primary font-medium">
              {Math.round(internalQuality * 100)}%
            </span>
          </div>

          <input
            id="quality-slider"
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={internalQuality}
            onChange={handleChange}
            onMouseUp={handleChangeComplete}
            onTouchEnd={handleChangeComplete}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between mt-3">
            <button
              onClick={() => setPresetQuality(0.3, "low")}
              className={`px-3 py-1 text-xs rounded-none transition-all ${
                activeLabel === "low"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              Low
            </button>
            <button
              onClick={() => setPresetQuality(0.6, "balanced")}
              className={`px-3 py-1 text-xs rounded-none transition-all ${
                activeLabel === "balanced"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              Balanced
            </button>
            <button
              onClick={() => setPresetQuality(0.8, "high")}
              className={`px-3 py-1 text-xs rounded-none transition-all ${
                activeLabel === "high"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              High
            </button>
            <button
              onClick={() => setPresetQuality(0.95, "maximum")}
              className={`px-3 py-1 text-xs rounded-none transition-all ${
                activeLabel === "maximum"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              Maximum
            </button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {activeLabel === "low" && (
            <p>Minimal file size, suitable for thumbnails and previews.</p>
          )}
          {activeLabel === "balanced" && (
            <p>Good balance between quality and file size. Recommended for most web uses.</p>
          )}
          {activeLabel === "high" && (
            <p>Higher quality with reasonable file size. Ideal for important images.</p>
          )}
          {activeLabel === "maximum" && (
            <p>Best quality with larger file size. Use when quality is critical.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QualityControl;
