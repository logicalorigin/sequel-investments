import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { StateMapSectionConfig } from "@shared/schema";

interface StateMapSectionProps {
  config: StateMapSectionConfig;
}

const STATE_DATA = [
  { abbr: "CA", name: "California", volume: "$45M", deals: 120 },
  { abbr: "TX", name: "Texas", volume: "$38M", deals: 95 },
  { abbr: "FL", name: "Florida", volume: "$32M", deals: 88 },
  { abbr: "AZ", name: "Arizona", volume: "$18M", deals: 52 },
  { abbr: "GA", name: "Georgia", volume: "$15M", deals: 44 },
  { abbr: "NC", name: "North Carolina", volume: "$12M", deals: 38 },
  { abbr: "TN", name: "Tennessee", volume: "$10M", deals: 32 },
  { abbr: "CO", name: "Colorado", volume: "$9M", deals: 28 },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

const EXCLUDED_STATES = ["ND", "SD", "VT"];

export function StateMapSection({ config }: StateMapSectionProps) {
  const title = config.title || "Where We Lend";
  const description = config.description;
  const showLoanVolume = config.showLoanVolume !== false;
  const activeStates = US_STATES.filter(s => !EXCLUDED_STATES.includes(s));

  return (
    <section className="py-12 sm:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="text-map-title">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-1 p-4 opacity-80">
                    {activeStates.map((state) => (
                      <Badge 
                        key={state} 
                        variant="secondary" 
                        className="text-xs"
                        data-testid={`badge-state-${state}`}
                      >
                        {state}
                      </Badge>
                    ))}
                  </div>
                  <div className="relative z-10 text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-primary">{activeStates.length} States + DC</p>
                    <p className="text-muted-foreground">Nationwide Coverage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {showLoanVolume && (
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Top Lending States</h3>
                  <div className="space-y-3">
                    {STATE_DATA.map((state) => (
                      <div 
                        key={state.abbr} 
                        className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                        data-testid={`row-state-volume-${state.abbr}`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs w-8 justify-center">{state.abbr}</Badge>
                          <span className="text-sm">{state.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">{state.volume}</p>
                          <p className="text-xs text-muted-foreground">{state.deals} deals</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
