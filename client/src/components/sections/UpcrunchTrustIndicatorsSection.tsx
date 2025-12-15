
import { Shield, TrendingUp, Clock, Award } from "lucide-react";

interface TrustIndicator {
  icon: "shield" | "trending" | "clock" | "award";
  value: string;
  label: string;
}

interface UpcrunchTrustIndicatorsSectionProps {
  heading?: string;
  indicators?: TrustIndicator[];
}

const iconMap = {
  shield: Shield,
  trending: TrendingUp,
  clock: Clock,
  award: Award,
};

const defaultIndicators: TrustIndicator[] = [
  {
    icon: "shield",
    value: "$500M+",
    label: "Funded to Date",
  },
  {
    icon: "trending",
    value: "5,000+",
    label: "Loans Closed",
  },
  {
    icon: "clock",
    value: "10-14 Days",
    label: "Average Close Time",
  },
  {
    icon: "award",
    value: "4.9/5",
    label: "Customer Rating",
  },
];

export default function UpcrunchTrustIndicatorsSection({
  heading = "Trusted by Thousands of Investors",
  indicators = defaultIndicators,
}: UpcrunchTrustIndicatorsSectionProps) {
  return (
    <section className="py-12 md:py-16 bg-[#F7F7F9]">
      <div className="max-w-7xl mx-auto px-6">
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
            {heading}
          </h2>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {indicators.map((indicator, index) => {
            const Icon = iconMap[indicator.icon];
            return (
              <div
                key={index}
                className="text-center"
                data-testid={`indicator-${index}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-[#806BFF] to-[#23D7FF]">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {indicator.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {indicator.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
