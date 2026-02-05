import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

const FormField = ({ 
  label, 
  htmlFor, 
  error, 
  hint, 
  required, 
  icon: Icon,
  children,
  className 
}: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={htmlFor} 
        className={cn(
          "text-base font-semibold flex items-center gap-2",
          error && "text-destructive"
        )}
      >
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      
      {hint && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
      
      {children}
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormField;
