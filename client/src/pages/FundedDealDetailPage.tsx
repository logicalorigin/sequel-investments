import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  MapPin, 
  DollarSign, 
  ArrowLeft, 
  Calendar, 
  TrendingUp,
  Building2,
  CheckCircle2,
  Clock,
  Percent,
  Home,
  Loader2
} from "lucide-react";
import type { FundedDeal } from "@shared/schema";

import luxuryHome from "@assets/stock_images/luxury_modern_single_2639d1bd.jpg";
import renovationHome from "@assets/stock_images/house_renovation_con_aaeb0f05.jpg";
import newConstruction from "@assets/stock_images/new_construction_hom_ee055247.jpg";
import rentalProperty from "@assets/stock_images/residential_investme_a188ab28.jpg";
import suburbanHome from "@assets/stock_images/suburban_single_fami_544678ca.jpg";
import multiFamilyHome from "@assets/stock_images/multi-family_apartme_e7cec58d.jpg";

const defaultImages = [luxuryHome, renovationHome, newConstruction, rentalProperty, suburbanHome, multiFamilyHome];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getLoanTypeBadgeColor = (loanType: string) => {
  switch (loanType) {
    case "DSCR":
      return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "Fix & Flip":
      return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
    case "New Construction":
      return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
    default:
      return "bg-muted";
  }
};

const getDefaultImage = (loanType: string, index: number = 0) => {
  switch (loanType) {
    case "Fix & Flip":
      return renovationHome;
    case "New Construction":
      return newConstruction;
    case "DSCR":
    default:
      return defaultImages[index % defaultImages.length];
  }
};

export default function FundedDealDetailPage() {
  const params = useParams<{ id: string }>();
  
  const { data: deal, isLoading, error } = useQuery<FundedDeal>({
    queryKey: ["/api/funded-deals", params.id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Deal Not Found</h1>
          <p className="text-muted-foreground mb-6">This funded deal could not be found or is no longer available.</p>
          <Link href="/fundings">
            <Button data-testid="button-back-not-found">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recent Fundings
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const dealImage = deal.imageUrl || getDefaultImage(deal.loanType, 0);
  const rate = typeof deal.rate === 'string' ? parseFloat(deal.rate) : deal.rate;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link href="/fundings" data-testid="link-back-fundings">
            <Button variant="ghost" className="mb-6" data-testid="button-back-fundings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recent Fundings
            </Button>
          </Link>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={dealImage} 
                  alt={`${deal.location}, ${deal.state}`}
                  className="w-full h-[300px] sm:h-[400px] object-cover"
                  data-testid="img-property"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={`${getLoanTypeBadgeColor(deal.loanType)} border text-sm px-3 py-1`}>
                    {deal.loanType} Loan
                  </Badge>
                </div>
                <div className="absolute bottom-4 right-4">
                  <Badge className="bg-green-500 text-white border-0">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Funded
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="text-deal-location">
                  {deal.location}, {deal.state}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-5 w-5" />
                  <span className="text-lg" data-testid="text-property-type">
                    {deal.propertyType}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-xl sm:text-2xl font-bold" data-testid="text-loan-amount">
                    {formatCurrency(deal.loanAmount)}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  <span className="text-sm">Loan Amount</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Percent className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Interest Rate</p>
                        <p className="text-xl font-bold" data-testid="text-rate">{rate.toFixed(3)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{deal.ltv ? "LTV" : "LTC"}</p>
                        <p className="text-xl font-bold" data-testid="text-ltv-ltc">{deal.ltv || deal.ltc}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time to Close</p>
                        <p className="text-xl font-bold" data-testid="text-close-time">{deal.closeTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Home className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Property Type</p>
                        <p className="text-xl font-bold" data-testid="text-property-type-card">{deal.propertyType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Deal Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="text-lg font-semibold">{deal.location}, {deal.state}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Loan Type</p>
                    <p className="text-lg font-semibold">{deal.loanType}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Funded Amount</p>
                    <p className="text-lg font-semibold">{formatCurrency(deal.loanAmount)}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Closing Speed</p>
                    <p className="text-lg font-semibold">{deal.closeTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-8">
                <h3 className="text-xl font-bold mb-2">Ready to Fund Your Next Deal?</h3>
                <p className="text-muted-foreground mb-6">
                  Get started with a free quote and see how fast we can close your investment property loan.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/get-quote">
                    <Button size="lg" data-testid="button-get-quote">
                      Get Your Free Quote
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" data-testid="button-contact">
                      Talk to a Specialist
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
