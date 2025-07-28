
import { motion } from "framer-motion";
import { Zap, Shield, Gauge } from "lucide-react";

interface CompressorHeaderProps {
  className?: string;
}

const CompressorHeader = ({ className }: CompressorHeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className={`text-center mb-16 ${className}`}
    >
      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-5xl md:text-6xl font-medium mb-4 text-foreground">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Image Compressor
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-tight">
          Professional-grade image compression with advanced algorithms. 
          Reduce file sizes while preserving visual quality.
        </p>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6"
      >
        {[
          { icon: Zap, title: "Lightning Fast", description: "Instant compression with real-time preview" },
          { icon: Shield, title: "Privacy First", description: "Client-side processing, your images never leave your device" },
          { icon: Gauge, title: "Quality Control", description: "Fine-tune compression with precision controls" }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            className="glass rounded-xl p-6 interactive-glow"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/20 flex items-center justify-center">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Author Credit */}
      <motion.a 
        href="https://bento.me/abhishekbariya" 
        target="_blank" 
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="inline-flex items-center gap-3 glass rounded-xl px-4 py-2 hover:bg-surface-3/50 transition-smooth"
      >
        <img 
          src="/profile.jpg" 
          alt="Abhishek Bariya" 
          className="w-8 h-8 object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/32x32/111/eee?text=AB";
          }}
        />
        <span className="text-sm text-muted-foreground">made with ❤️ by Abhishek Bariya</span>
      </motion.a>
    </motion.header>
  );
};

export default CompressorHeader;
