import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, Clock, MapPin } from "lucide-react";
import type { RecentlyFundedSectionConfig } from "@shared/schema";

interface RecentlyFundedSectionProps {
  config: RecentlyFundedSectionConfig;
}

const SAMPLE_DEALS = [
  { id: 1, propertyType: "Single Family", location: "Phoenix, AZ", loanAmount: 425000, loanType: "Fix & Flip", rate: "10.5%", closeTime: "5 days" },
  { id: 2, propertyType: "Duplex", location: "Austin, TX", loanAmount: 580000, loanType: "DSCR", rate: "7.99%", closeTime: "14 days" },
  { id: 3, propertyType: "Townhome", location: "Tampa, FL", loanAmount: 320000, loanType: "Fix & Flip", rate: "11%", closeTime: "7 days" },
  { id: 4, propertyType: "Single Family", location: "Nashville, TN", loanAmount: 275000, loanType: "DSCR", rate: "8.25%", closeTime: "12 days" },
  { id: 5, propertyType: "Multi-Family", location: "Atlanta, GA", loanAmount: 1250000, loanType: "Construction", rate: "11.5%", closeTime: "21 days" },
  { id: 6, propertyType: "Single Family", location: "Denver, CO", loanAmount: 385000, loanType: "Fix & Flip", rate: "10.75%", closeTime: "6 days" },
  { id: 7, propertyType: "Condo", location: "Miami, FL", loanAmount: 290000, loanType: "DSCR", rate: "8.5%", closeTime: "15 days" },
  { id: 8, propertyType: "Single Family", location: "Las Vegas, NV", loanAmount: 410000, loanType: "Fix & Flip", rate: "10.25%", closeTime: "8 days" },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  return `$${(amount / 1000).toFixed(0)}K`;
}

export function RecentlyFundedSection({ config }: RecentlyFundedSectionProps) {
  const title = config.title || "Recently Funded Deals";
  const maxItems = config.maxItems || 8;
  const showRate = config.showRate !== false;
  const showCloseTime = config.showCloseTime !== false;
  const autoScroll = config.autoScroll !== false;

  const deals = SAMPLE_DEALS.slice(0, maxItems);

  return (
    <section className="py-12 sm:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8" data-testid="text-funded-title">
          {title}
        </h2>

        <div className={`${autoScroll ? "overflow-x-auto scrollbar-hide" : ""}`}>
          <div className={`grid gap-4 ${autoScroll ? "grid-flow-col auto-cols-[280px] sm:auto-cols-[300px]" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
            {deals.map((deal) => (
              <Card key={deal.id} className="hover-elevate" data-testid={`card-funded-deal-${deal.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{deal.propertyType}</span>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">{deal.loanType}</Badge>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{deal.location}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-lg font-bold text-primary">{formatCurrency(deal.loanAmount)}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {showRate && (
                      <span>{deal.rate}</span>
                    )}
                    {showCloseTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{deal.closeTime}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
