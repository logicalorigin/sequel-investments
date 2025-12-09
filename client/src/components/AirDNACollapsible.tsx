import { useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AirDNACollapsibleProps {
  defaultOpen?: boolean;
  className?: string;
}

export function AirDNACollapsible({
  defaultOpen = false,
  className,
}: AirDNACollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("w-full", className)}
      data-testid="airdna-collapsible"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          data-testid="button-toggle-airdna-collapsible"
        >
          <span className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Estimate STR Income
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <div className="relative w-full" style={{ height: "500px" }}>
          {isLoading && (
            <Skeleton className="absolute inset-0 w-full h-full rounded-md" />
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
      </CollapsibleContent>
    </Collapsible>
  );
}
