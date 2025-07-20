import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ErrorMessageProps = {
  title?: string;
  message: string;
  transparent?: boolean;
  dismissible?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "warning";
};

export default function ErrorMessage({
  title = "Error",
  message,
  transparent = false,
  dismissible = false,
  className,
  variant = "destructive",
}: ErrorMessageProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const variants = {
    default: {
      bg: transparent ? "bg-red-50/70" : "bg-red-50",
      border: "border-red-200",
      text: "text-red-900",
      icon: "text-red-500",
      pre: "text-red-800 bg-red-100/80",
    },
    destructive: {
      bg: transparent ? "bg-red-100/70" : "bg-red-100",
      border: "border-red-300",
      text: "text-red-950",
      icon: "text-red-600",
      pre: "text-red-900 bg-red-200/80",
    },
    warning: {
      bg: transparent ? "bg-yellow-50/70" : "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-900",
      icon: "text-yellow-500",
      pre: "text-yellow-800 bg-yellow-100/80",
    },
  };

  const currentVariant = variants[variant];

  return (
    <div
      className={cn(
        "border rounded-lg p-4 text-sm max-w-full overflow-x-auto transition-all duration-200",
        currentVariant.bg,
        currentVariant.border,
        currentVariant.text,
        transparent && "backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          className={cn("w-4 h-4 mt-0.5 flex-shrink-0", currentVariant.icon)}
        />
        <div className="flex flex-col gap-1 w-full min-w-0">
          <div className="flex items-start justify-between">
            <strong className="font-medium">{title}</strong>
            {dismissible && (
              <button
                onClick={() => setIsDismissed(true)}
                className={cn(
                  "ml-2 p-0.5 rounded-sm hover:bg-black/10 transition-colors flex-shrink-0",
                  currentVariant.icon
                )}
                aria-label="Dismiss error"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <pre
            className={cn(
              "whitespace-pre-wrap break-all font-mono text-xs p-2 rounded-md overflow-x-auto",
              currentVariant.pre
            )}
          >
            {message}
          </pre>
        </div>
      </div>
    </div>
  );
}
