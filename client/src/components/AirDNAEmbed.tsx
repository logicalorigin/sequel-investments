import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface AirDNAEmbedProps {
  height?: string;
}

export function AirDNAEmbed({ height = "calc(100vh - 200px)" }: AirDNAEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full" style={{ height }} data-testid="airdna-embed">
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <iframe
        src="https://www.airdna.co/airbnb-calculator"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        title="AirDNA Rentalizer Calculator"
      />
    </div>
  );
}
