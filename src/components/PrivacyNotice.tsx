
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Shield, Clock } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface PrivacyNoticeProps {
  className?: string;
}

const PrivacyNotice = ({ className }: PrivacyNoticeProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 15000); // Auto-hide after 15 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Alert className="border-green-500 bg-green-50 text-green-800">
        <Shield className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-700 font-medium">Your privacy is protected</AlertTitle>
        <AlertDescription className="text-green-700">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Images are automatically deleted after 10 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span>Your images are processed locally and never shared with anyone</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default PrivacyNotice;
