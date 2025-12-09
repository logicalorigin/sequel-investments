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
import { AirDNAEmbed } from "@/components/AirDNAEmbed";

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
        <div className="flex-1 min-h-0">
          <AirDNAEmbed height="100%" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AirDNAModal() {
  return <AirDNAModalTrigger />;
}
