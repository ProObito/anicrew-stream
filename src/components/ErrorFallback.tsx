import { AlertCircle } from "lucide-react";

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorFallback = ({ message = "Something went wrong", onRetry }: ErrorFallbackProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <AlertCircle className="w-12 h-12 text-primary mb-4" />
    <p className="text-foreground text-lg font-bold uppercase tracking-wide mb-2">{message}</p>
    <p className="text-muted-foreground text-sm mb-6">Please try again later.</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-neon">
        Try Again
      </button>
    )}
  </div>
);

export default ErrorFallback;
