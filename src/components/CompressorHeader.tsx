
import { motion } from "framer-motion";

interface CompressorHeaderProps {
  className?: string;
}

const CompressorHeader = ({ className }: CompressorHeaderProps) => {
  return (
    <header className={`text-center mb-8 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="inline-block px-3 py-1 text-xs font-medium text-primary-foreground rounded-full bg-primary mb-2 tracking-wide animate-pulse-slow">
          Fast • Efficient • Simple
        </span>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
          Image Compressor
        </h1>
        
        <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
          Compress your images without losing quality for faster websites and apps. 
          Adjust quality and choose your preferred format.
        </p>
      </motion.div>
    </header>
  );
};

export default CompressorHeader;
