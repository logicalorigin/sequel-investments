import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface AirDNAModalTriggerProps {
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AirDNAModalTrigger({
  children,
  variant = "outline",
  size = "default",
  className,
}: AirDNAModalTriggerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          data-testid="button-open-airdna-modal"
        >
          {children || (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Estimate STR Income
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-5xl h-[90vh] flex flex-col"
        data-testid="airdna-modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Estimate STR Income with AirDNA
          </DialogTitle>
        </DialogHeader>
        <div className="relative flex-1 min-h-0">
          {isLoading && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <iframe
            src="https://www.airdna.co/airbnb-calculator"
            className="w-full h-full border-0 rounded-md"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            title="AirDNA Rentalizer Calculator"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AirDNAModal() {
  return <AirDNAModalTrigger />;
}
