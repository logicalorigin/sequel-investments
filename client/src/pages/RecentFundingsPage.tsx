import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { MapPin, DollarSign, ArrowRight } from "lucide-react";

import img1 from "@assets/stock_images/suburban_single_fami_ed3bb196.jpg";
import img2 from "@assets/stock_images/suburban_single_fami_2f95bb5e.jpg";
import img3 from "@assets/stock_images/suburban_single_fami_59058814.jpg";
import img4 from "@assets/stock_images/suburban_single_fami_f589cb9a.jpg";
import img5 from "@assets/stock_images/suburban_single_fami_544678ca.jpg";
import img6 from "@assets/stock_images/residential_investme_a188ab28.jpg";
import img7 from "@assets/stock_images/residential_investme_9db82e16.jpg";
import img8 from "@assets/stock_images/residential_investme_97b50935.jpg";
import img9 from "@assets/stock_images/residential_investme_5516da57.jpg";
import img10 from "@assets/stock_images/residential_investme_2580db4a.jpg";
import img11 from "@assets/stock_images/real_estate_property_2096ed40.jpg";
import img12 from "@assets/stock_images/real_estate_property_e2a938e3.jpg";
import img13 from "@assets/stock_images/real_estate_property_248e1b1b.jpg";
import img14 from "@assets/stock_images/real_estate_property_d2e0892f.jpg";

interface FundedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  loanAmount: number;
  loanType: "DSCR" | "Bridge" | "Construction";
  image: string;
  propertyType: string;
  closedDate: string;
}

interface DealMetrics {
  rate: string;
  ltv: number;
  propertyValue: number;
  term: string;
  closeTime: string;
  dscr: string | null;
}

const fundedProperties: (FundedProperty & { metrics: DealMetrics })[] = [
  {
    id: "1026-e-concorda",
    address: "1026 E Concorda Dr",
    city: "Tempe",
    state: "AZ",
    zip: "85282",
    loanAmount: 370350,
    loanType: "Bridge",
    image: img1,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "9.250", ltv: 75, propertyValue: 493800, term: "12 Months", closeTime: "5 Days", dscr: null },
  },
  {
    id: "523-n-division",
    address: "523 N Division Ave",
    city: "Sandpoint",
    state: "ID",
    zip: "83864",
    loanAmount: 391500,
    loanType: "Bridge",
    image: img2,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "9.500", ltv: 70, propertyValue: 559286, term: "12 Months", closeTime: "4 Days", dscr: null },
  },
  {
    id: "6020-lantana",
    address: "6020 Lantana Lane",
    city: "Fort Worth",
    state: "TX",
    zip: "76112",
    loanAmount: 297500,
    loanType: "Bridge",
    image: img3,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "9.750", ltv: 72, propertyValue: 413194, term: "12 Months", closeTime: "6 Days", dscr: null },
  },
  {
    id: "103-saxton",
    address: "103 Saxton Rd",
    city: "Dover",
    state: "DE",
    zip: "19901",
    loanAmount: 189000,
    loanType: "DSCR",
    image: img4,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "6.875", ltv: 75, propertyValue: 252000, term: "30 Years", closeTime: "18 Days", dscr: "1.25" },
  },
  {
    id: "135-spruance",
    address: "135 Spruance Rd",
    city: "Dover",
    state: "DE",
    zip: "19901",
    loanAmount: 126000,
    loanType: "DSCR",
    image: img5,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "7.125", ltv: 78, propertyValue: 161538, term: "30 Years", closeTime: "21 Days", dscr: "1.18" },
  },
  {
    id: "33-buckthorn",
    address: "33 Buckthorn Dr",
    city: "Camden Wyoming",
    state: "DE",
    zip: "19934",
    loanAmount: 199500,
    loanType: "DSCR",
    image: img6,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "6.625", ltv: 80, propertyValue: 249375, term: "30 Years", closeTime: "14 Days", dscr: "1.35" },
  },
  {
    id: "490-duck-creek",
    address: "490 W Duck Creek Rd",
    city: "Clayton",
    state: "DE",
    zip: "19938",
    loanAmount: 182000,
    loanType: "DSCR",
    image: img7,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "6.750", ltv: 76, propertyValue: 239474, term: "30 Years", closeTime: "16 Days", dscr: "1.22" },
  },
  {
    id: "5-welch",
    address: "5 Welch Dr E",
    city: "Dover",
    state: "DE",
    zip: "19901",
    loanAmount: 166750,
    loanType: "DSCR",
    image: img8,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "7.000", ltv: 77, propertyValue: 216558, term: "30 Years", closeTime: "19 Days", dscr: "1.15" },
  },
  {
    id: "113-w-23rd",
    address: "113 W 23rd Ave",
    city: "Post Falls",
    state: "ID",
    zip: "83854",
    loanAmount: 387500,
    loanType: "Bridge",
    image: img9,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "9.375", ltv: 73, propertyValue: 530822, term: "12 Months", closeTime: "3 Days", dscr: null },
  },
  {
    id: "224-e-2-s",
    address: "224 E 2 S",
    city: "Rexburg",
    state: "ID",
    zip: "83440",
    loanAmount: 130000,
    loanType: "DSCR",
    image: img10,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "7.250", ltv: 75, propertyValue: 173333, term: "30 Years", closeTime: "22 Days", dscr: "1.10" },
  },
  {
    id: "1237-east-ruth",
    address: "1237 East Ruth Avenue",
    city: "Phoenix",
    state: "AZ",
    zip: "85020",
    loanAmount: 315000,
    loanType: "Bridge",
    image: img11,
    propertyType: "Single Family",
    closedDate: "2025-10",
    metrics: { rate: "9.625", ltv: 70, propertyValue: 450000, term: "12 Months", closeTime: "5 Days", dscr: null },
  },
  {
    id: "2504-deerfoot",
    address: "2504 Deerfoot Trl",
    city: "Austin",
    state: "TX",
    zip: "78704",
    loanAmount: 920500,
    loanType: "Bridge",
    image: img12,
    propertyType: "Single Family",
    closedDate: "2025-11",
    metrics: { rate: "9.125", ltv: 68, propertyValue: 1353676, term: "12 Months", closeTime: "4 Days", dscr: null },
  },
  {
    id: "61-main-st",
    address: "61 Main St",
    city: "Broad Brook",
    state: "CT",
    zip: "06016",
    loanAmount: 120000,
    loanType: "Bridge",
    image: img13,
    propertyType: "Single Family",
    closedDate: "2025-11",
    metrics: { rate: "10.000", ltv: 75, propertyValue: 160000, term: "12 Months", closeTime: "7 Days", dscr: null },
  },
  {
    id: "3967-belfast",
    address: "3967 Belfast Ave",
    city: "Cincinnati",
    state: "OH",
    zip: "45236",
    loanAmount: 126000,
    loanType: "Bridge",
    image: img14,
    propertyType: "Single Family",
    closedDate: "2025-11",
    metrics: { rate: "9.875", ltv: 72, propertyValue: 175000, term: "12 Months", closeTime: "5 Days", dscr: null },
  },
];

export { fundedProperties };
export type { FundedProperty };

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

export default function RecentFundingsPage() {
  const totalFunded = fundedProperties.reduce((sum, p) => sum + p.loanAmount, 0);
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-12 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#D4A01D]/20 text-[#D4A01D] border-[#D4A01D]/30">
              Recent Closings
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Recent Fundings
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              See our latest funded deals. Click on any property to view detailed deal metrics.
            </p>
            <div className="mt-8 flex justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#D4A01D]">{fundedProperties.length}</p>
                <p className="text-white/60 text-sm">Properties Funded</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#D4A01D]">{formatCurrency(totalFunded)}</p>
                <p className="text-white/60 text-sm">Total Funded</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" role="region" aria-label="Funded properties list">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundedProperties.map((property) => (
              <Link 
                key={property.id} 
                href={`/fundings/${property.id}`}
                data-testid={`link-property-${property.id}`}
                className="focus-visible:outline-none"
              >
                <Card className="overflow-hidden hover-elevate cursor-pointer group h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={property.image} 
                      alt={property.address}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={`${getLoanTypeBadgeColor(property.loanType)} border`}>
                        {property.loanType}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-[#D4A01D] transition-colors">
                          {property.address}
                        </h3>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{property.city}, {property.state} {property.zip}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#D4A01D] group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-[#D4A01D]" />
                        <span className="font-bold text-lg">{formatCurrency(property.loanAmount)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{property.propertyType}</span>
                    </div>
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
