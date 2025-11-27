import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Percent, Clock, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { FundedDeal as DbFundedDeal } from "@shared/schema";

import luxuryHome from "@assets/stock_images/luxury_modern_single_2639d1bd.jpg";
import renovationHome from "@assets/stock_images/house_renovation_con_aaeb0f05.jpg";
import newConstruction from "@assets/stock_images/new_construction_hom_ee055247.jpg";
import rentalProperty from "@assets/stock_images/residential_investme_a188ab28.jpg";
import suburbanHome from "@assets/stock_images/suburban_single_fami_544678ca.jpg";
import multiFamilyHome from "@assets/stock_images/multi-family_apartme_e7cec58d.jpg";

interface FundedDeal {
  id: string;
  image: string;
  location: string;
  state: string;
  loanType: "DSCR" | "Fix & Flip" | "New Construction";
  loanAmount: number;
  rate: number;
  ltv?: number;
  ltc?: number;
  closeTime: string;
  propertyType: string;
}

const defaultImages = [luxuryHome, renovationHome, newConstruction, rentalProperty, suburbanHome, multiFamilyHome];

const sampleDeals: FundedDeal[] = [
  {
    id: "1",
    image: luxuryHome,
    location: "Austin",
    state: "TX",
    loanType: "DSCR",
    loanAmount: 425000,
    rate: 6.125,
    ltv: 75,
    closeTime: "21 days",
    propertyType: "Single Family",
  },
  {
    id: "2",
    image: renovationHome,
    location: "Phoenix",
    state: "AZ",
    loanType: "Fix & Flip",
    loanAmount: 320000,
    rate: 9.9,
    ltc: 85,
    closeTime: "48 hrs",
    propertyType: "Single Family",
  },
  {
    id: "3",
    image: newConstruction,
    location: "Tampa",
    state: "FL",
    loanType: "New Construction",
    loanAmount: 580000,
    rate: 10.5,
    ltc: 87,
    closeTime: "14 days",
    propertyType: "Single Family",
  },
  {
    id: "4",
    image: rentalProperty,
    location: "Denver",
    state: "CO",
    loanType: "DSCR",
    loanAmount: 365000,
    rate: 6.25,
    ltv: 70,
    closeTime: "18 days",
    propertyType: "Single Family",
  },
  {
    id: "5",
    image: suburbanHome,
    location: "Atlanta",
    state: "GA",
    loanType: "Fix & Flip",
    loanAmount: 275000,
    rate: 10.25,
    ltc: 90,
    closeTime: "72 hrs",
    propertyType: "Single Family",
  },
  {
    id: "6",
    image: multiFamilyHome,
    location: "Nashville",
    state: "TN",
    loanType: "DSCR",
    loanAmount: 520000,
    rate: 6.375,
    ltv: 72,
    closeTime: "24 days",
    propertyType: "Duplex",
  },
  {
    id: "7",
    image: luxuryHome,
    location: "Dallas",
    state: "TX",
    loanType: "Fix & Flip",
    loanAmount: 385000,
    rate: 9.75,
    ltc: 88,
    closeTime: "5 days",
    propertyType: "Single Family",
  },
  {
    id: "8",
    image: newConstruction,
    location: "Charlotte",
    state: "NC",
    loanType: "New Construction",
    loanAmount: 720000,
    rate: 10.25,
    ltc: 85,
    closeTime: "21 days",
    propertyType: "Townhome",
  },
  {
    id: "9",
    image: suburbanHome,
    location: "Orlando",
    state: "FL",
    loanType: "New Construction",
    loanAmount: 495000,
    rate: 10.75,
    ltc: 90,
    closeTime: "18 days",
    propertyType: "Single Family",
  },
];

interface RecentlyFundedCarouselProps {
  loanType?: "DSCR" | "Fix & Flip" | "New Construction" | "all";
  state?: string;
  title?: string;
  subtitle?: string;
}

function mapDbDealToDisplay(deal: DbFundedDeal, index: number): FundedDeal {
  const rateStr = deal.rate.replace('%', '');
  const rateNum = parseFloat(rateStr) || 0;
  
  return {
    id: deal.id,
    image: deal.imageUrl || defaultImages[index % defaultImages.length],
    location: deal.location,
    state: deal.state,
    loanType: deal.loanType as "DSCR" | "Fix & Flip" | "New Construction",
    loanAmount: deal.loanAmount,
    rate: rateNum,
    ltv: deal.ltv || undefined,
    ltc: deal.ltc || undefined,
    closeTime: deal.closeTime,
    propertyType: deal.propertyType,
  };
}

export function RecentlyFundedCarousel({ 
  loanType = "all",
  state,
  title = "Recently Funded Deals",
  subtitle = "See what we've funded for investors like you"
}: RecentlyFundedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const queryParams = new URLSearchParams();
  if (loanType !== "all") {
    queryParams.set("loanType", loanType);
  }
  if (state) {
    queryParams.set("state", state);
  }
  const queryString = queryParams.toString();
  const apiUrl = `/api/funded-deals${queryString ? `?${queryString}` : ''}`;

  const { data: apiDeals, isLoading } = useQuery<DbFundedDeal[]>({
    queryKey: ["/api/funded-deals", loanType, state],
    staleTime: 5 * 60 * 1000,
  });

  const mappedDeals = apiDeals && apiDeals.length > 0 
    ? apiDeals.map((deal, idx) => mapDbDealToDisplay(deal, idx))
    : null;

  const baseDeals = mappedDeals || sampleDeals;
  
  const deals = loanType === "all" 
    ? baseDeals 
    : baseDeals.filter(deal => deal.loanType === loanType);

  const extendedDeals = deals.length >= 3 ? deals : 
    deals.length > 0 ? Array.from({ length: 3 }, (_, i) => deals[i % deals.length]) : sampleDeals.slice(0, 3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % extendedDeals.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [extendedDeals.length]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getLoanTypeBadgeColor = (type: string) => {
    switch (type) {
      case "DSCR":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "Fix & Flip":
        return "bg-orange-500/10 text-orange-600 border-orange-500/30";
      case "New Construction":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      default:
        return "bg-muted";
    }
  };

  const getVisibleDeals = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % extendedDeals.length;
      visible.push(extendedDeals[index]);
    }
    return visible;
  };

  if (isLoading) {
    return (
      <section className="py-10 sm:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {getVisibleDeals().map((deal, index) => (
              <Card 
                key={`${deal.id}-${currentIndex}-${index}`}
                className="overflow-hidden hover-elevate transition-all duration-300"
                data-testid={`card-funded-deal-${deal.id}`}
              >
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img 
                    src={deal.image} 
                    alt={`${deal.location}, ${deal.state}`}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    className={`absolute top-2 sm:top-3 left-2 sm:left-3 text-[10px] sm:text-xs ${getLoanTypeBadgeColor(deal.loanType)}`}
                  >
                    {deal.loanType}
                  </Badge>
                  <Badge 
                    variant="secondary"
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 text-[10px] sm:text-xs bg-background/90 backdrop-blur-sm"
                  >
                    {deal.propertyType}
                  </Badge>
                </div>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-1 text-muted-foreground mb-2">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">{deal.location}, {deal.state}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Loan Amount</p>
                        <p className="font-semibold truncate">{formatCurrency(deal.loanAmount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Rate</p>
                        <p className="font-semibold">{deal.rate.toFixed(3)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {deal.ltv ? (
                        <>
                          <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 shrink-0" />
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">LTV</p>
                            <p className="font-semibold">{deal.ltv}%</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 shrink-0" />
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">LTC</p>
                            <p className="font-semibold">{deal.ltc}%</p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 shrink-0" />
                      <div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Closed In</p>
                        <p className="font-semibold">{deal.closeTime}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>

        <div className="text-center mt-6 sm:mt-8">
          <Link href="/fundings">
            <Button variant="outline" data-testid="button-view-all-fundings">
              View All Funded Deals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
