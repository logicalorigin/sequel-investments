import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { 
  MapPin, 
  DollarSign, 
  ArrowLeft, 
  Calendar, 
  TrendingUp,
  Building2,
  CheckCircle2
} from "lucide-react";
import { fundedProperties } from "./RecentFundingsPage";

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
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Bridge":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "Construction":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

export default function PropertyDetailPage() {
  const params = useParams<{ propertyId: string }>();
  const property = fundedProperties.find(p => p.id === params.propertyId);

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
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

  const closedMonth = property.closedDate === "2025-10" ? "October 2025" : 
                      property.closedDate === "2025-11" ? "November 2025" : 
                      property.closedDate === "2025-12" ? "December 2025" : property.closedDate;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/fundings" data-testid="link-back-fundings">
            <Button variant="ghost" className="mb-6" data-testid="button-back-fundings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recent Fundings
            </Button>
          </Link>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.address}
                  className="w-full h-[400px] object-cover"
                  data-testid="img-property"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={`${getLoanTypeBadgeColor(property.loanType)} border text-sm px-3 py-1`}>
                    {property.loanType} Loan
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
                <h1 className="text-3xl font-bold mb-2" data-testid="text-property-address">
                  {property.address}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg" data-testid="text-property-location">
                    {property.city}, {property.state} {property.zip}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#e55c2b]/10 text-[#e55c2b] px-4 py-2 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-2xl font-bold" data-testid="text-loan-amount">
                    {formatCurrency(property.loanAmount)}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Closed {closedMonth}
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#e55c2b]" />
                    Deal Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="text-xl font-bold" data-testid="text-rate">{property.metrics.rate}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">LTV</p>
                      <p className="text-xl font-bold" data-testid="text-ltv">{property.metrics.ltv}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Property Value</p>
                      <p className="text-xl font-bold" data-testid="text-property-value">
                        {formatCurrency(property.metrics.propertyValue)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Loan Term</p>
                      <p className="text-xl font-bold" data-testid="text-term">{property.metrics.term}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Time to Close</p>
                      <p className="text-xl font-bold text-green-500" data-testid="text-close-time">
                        {property.metrics.closeTime}
                      </p>
                    </div>
                    {property.metrics.dscr && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">DSCR</p>
                        <p className="text-xl font-bold" data-testid="text-dscr">{property.metrics.dscr}x</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#e55c2b]" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-semibold" data-testid="text-property-type">{property.propertyType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Loan Product</p>
                      <p className="font-semibold" data-testid="text-loan-product">{property.loanType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold" data-testid="text-state">{property.state}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold text-green-500" data-testid="text-status">Funded & Closed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="pt-4">
                <Link href="/get-quote">
                  <Button 
                    size="lg" 
                    className="w-full bg-[#e55c2b] hover:bg-[#d44d1f]" 
                    data-testid="button-get-quote"
                  >
                    Get Your Rate Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">Other Recent Fundings</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {fundedProperties
              .filter(p => p.id !== property.id)
              .slice(0, 3)
              .map((p) => (
                <Link key={p.id} href={`/fundings/${p.id}`} data-testid={`link-related-${p.id}`}>
                  <Card className="overflow-hidden hover-elevate cursor-pointer group">
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        src={p.image} 
                        alt={p.address}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm group-hover:text-[#e55c2b] transition-colors">
                        {p.address}
                      </h3>
                      <p className="text-xs text-muted-foreground">{p.city}, {p.state}</p>
                      <p className="font-bold mt-2">{formatCurrency(p.loanAmount)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
