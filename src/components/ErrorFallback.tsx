import { AlertCircle } from "lucide-react";

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorFallback = ({ message = "Something went wrong", onRetry }: ErrorFallbackProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <AlertCircle className="w-12 h-12 text-destructive mb-4" />
    <p className="text-foreground text-lg font-medium mb-2">{message}</p>
    <p className="text-muted-foreground text-sm mb-4">Please try again later.</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-neon">
        Try Again
      </button>
    )}
  </div>
);

export default ErrorFallback;
