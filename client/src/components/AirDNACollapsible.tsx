import { useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AirDNAEmbed } from "@/components/AirDNAEmbed";
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
        <AirDNAEmbed height="500px" />
      </CollapsibleContent>
    </Collapsible>
  );
}
