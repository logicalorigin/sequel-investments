import { GeometricPattern } from "@/components/GeometricPattern";
import type { TrustIndicatorsSectionConfig } from "@shared/schema";

interface TrustIndicatorsSectionProps {
  config: TrustIndicatorsSectionConfig;
}

const DEFAULT_STATS = [
  { value: "$500M+", label: "Loans Funded", mobileLabel: "Funded" },
  { value: "1,500+", label: "Investors Served", mobileLabel: "Investors" },
  { value: "48 hrs", label: "Fastest Closing", mobileLabel: "Fastest" },
  { value: "48", label: "States + DC Licensed", mobileLabel: "States" },
];

export function TrustIndicatorsSection({ config }: TrustIndicatorsSectionProps) {
  const stats = config.customStats?.length 
    ? config.customStats.map(s => ({ value: s.value, label: s.label, mobileLabel: s.label }))
    : DEFAULT_STATS.filter((_, i) => {
        if (i === 0 && config.showTotalFunded === false) return false;
        if (i === 1 && config.showActiveLoans === false) return false;
        if (i === 2 && config.showYearsInBusiness === false) return false;
        if (i === 3 && config.showStatesServed === false) return false;
        return true;
      });

  if (stats.length === 0) return null;

  return (
    <section className="py-4 sm:py-12 bg-card border-b relative overflow-hidden">
      <GeometricPattern 
        variant="dots" 
        className="text-primary" 
        opacity={0.15}
        animated={false}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="sm:hidden grid grid-cols-2 min-[360px]:grid-cols-4 gap-2 min-[360px]:gap-1 text-center">
          {stats.map((stat, i) => (
            <div key={i} data-testid={`stat-${i}`}>
              <p className="text-sm min-[360px]:text-base font-bold text-primary">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground leading-tight">{stat.mobileLabel}</p>
            </div>
          ))}
        </div>
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <p className="text-3xl md:text-4xl font-bold text-primary group-hover:animate-scale-pulse">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
