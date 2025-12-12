import type { StatsBarSectionConfig } from "@shared/schema";

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
  const stats = config.stats?.length ? config.stats : DEFAULT_STATS;

  if (stats.length === 0) return null;

  return (
    <section 
      className="py-8 sm:py-12 bg-muted/50 border-y"
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
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                {stat.prefix}{stat.value}{stat.suffix}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
