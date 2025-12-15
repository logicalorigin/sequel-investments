import type { StatsBarSectionConfig } from "@shared/schema";
import { useSectionVariant } from "@/hooks/useSectionVariant";

interface StatsBarSectionProps {
  config: StatsBarSectionConfig;
}

const DEFAULT_STATS = [
  { value: "500", label: "Loans Closed Annually", suffix: "+" },
  { value: "250", label: "Million Funded", prefix: "$", suffix: "M" },
  { value: "7", label: "Day Average Close", suffix: " Days" },
  { value: "47", label: "States Served" },
];

export function StatsBarSection({ config }: StatsBarSectionProps) {
  const variantStyles = useSectionVariant("stats_bar");
  const stats = config.stats?.length ? config.stats : DEFAULT_STATS;

  if (stats.length === 0) return null;

  return (
    <section 
      className={`${variantStyles.spacing} ${variantStyles.background} border-y`}
      style={config.backgroundColor ? { backgroundColor: config.backgroundColor } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="text-center"
              data-testid={`stats-bar-item-${i}`}
            >
              <p className={`${variantStyles.typography.headline} text-primary`}>
                {stat.prefix}{stat.value}{stat.suffix}
              </p>
              <p className={`${variantStyles.typography.body} mt-1`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
