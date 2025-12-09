import { useWhiteLabel } from "@/context/WhiteLabelContext";
import { X, AlertCircle } from "lucide-react";
import { useState } from "react";

export function DemoModeBanner() {
  const { isDemoMode, settings } = useWhiteLabel();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) {
    return null;
  }

  return (
    <div 
      className="bg-primary/10 border-b border-primary/20 px-4 py-2"
      data-testid="banner-demo-mode"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span className="text-foreground">
            <strong>Demo Mode Active</strong> - Viewing as{" "}
            <span className="text-primary font-medium" data-testid="text-demo-company-name">
              {settings?.companyName || "Custom Broker"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden sm:inline" data-testid="text-powered-by">
            Powered by Sequel Investments
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-dismiss-demo-banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
