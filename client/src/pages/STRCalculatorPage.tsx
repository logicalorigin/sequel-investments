import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  MapPin, 
  Bed,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Building2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

// Market data estimates by region (conservative averages)
const marketData: Record<string, { avgNightlyRate: number; avgOccupancy: number }> = {
  // High-demand markets
  "FL": { avgNightlyRate: 225, avgOccupancy: 0.72 },
  "CA": { avgNightlyRate: 275, avgOccupancy: 0.68 },
  "TX": { avgNightlyRate: 195, avgOccupancy: 0.65 },
  "TN": { avgNightlyRate: 210, avgOccupancy: 0.70 },
  "AZ": { avgNightlyRate: 200, avgOccupancy: 0.67 },
  "CO": { avgNightlyRate: 235, avgOccupancy: 0.65 },
  "NC": { avgNightlyRate: 180, avgOccupancy: 0.62 },
  "SC": { avgNightlyRate: 190, avgOccupancy: 0.68 },
  "GA": { avgNightlyRate: 175, avgOccupancy: 0.60 },
  "NV": { avgNightlyRate: 220, avgOccupancy: 0.65 },
  "HI": { avgNightlyRate: 350, avgOccupancy: 0.75 },
  // Standard markets
  "NY": { avgNightlyRate: 200, avgOccupancy: 0.58 },
  "PA": { avgNightlyRate: 155, avgOccupancy: 0.55 },
  "OH": { avgNightlyRate: 140, avgOccupancy: 0.52 },
  "MI": { avgNightlyRate: 150, avgOccupancy: 0.55 },
  "IL": { avgNightlyRate: 165, avgOccupancy: 0.54 },
  "VA": { avgNightlyRate: 175, avgOccupancy: 0.58 },
  "WA": { avgNightlyRate: 195, avgOccupancy: 0.60 },
  "OR": { avgNightlyRate: 175, avgOccupancy: 0.58 },
  "MA": { avgNightlyRate: 210, avgOccupancy: 0.56 },
  "NJ": { avgNightlyRate: 185, avgOccupancy: 0.55 },
  "default": { avgNightlyRate: 165, avgOccupancy: 0.58 }
};

const stateOptions = [
  { value: "AL", label: "Alabama" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "Washington D.C." }
];

const propertyTypes = [
  { value: "entire_home", label: "Entire Home", multiplier: 1.0 },
  { value: "condo", label: "Condo/Apartment", multiplier: 0.85 },
  { value: "townhouse", label: "Townhouse", multiplier: 0.92 },
  { value: "cabin", label: "Cabin/Cottage", multiplier: 1.15 },
  { value: "beach_house", label: "Beach House", multiplier: 1.35 },
  { value: "mountain", label: "Mountain Property", multiplier: 1.20 }
];

export default function STRCalculatorPage() {
  const [state, setState] = useState("");
  const [bedrooms, setBedrooms] = useState(2);
  const [propertyType, setPropertyType] = useState("entire_home");
  const [propertyValue, setPropertyValue] = useState("");
  const [downPayment, setDownPayment] = useState(25);
  const [customOccupancy, setCustomOccupancy] = useState<number | null>(null);
  const [customNightlyRate, setCustomNightlyRate] = useState<string>("");

  const calculations = useMemo(() => {
    if (!state) return null;

    const market = marketData[state] || marketData["default"];
    const propType = propertyTypes.find(p => p.value === propertyType) || propertyTypes[0];
    
    // Base nightly rate adjusted for bedrooms and property type
    const bedroomMultiplier = 1 + (bedrooms - 1) * 0.25; // +25% per additional bedroom
    const baseNightlyRate = customNightlyRate 
      ? parseFloat(customNightlyRate) 
      : market.avgNightlyRate * bedroomMultiplier * propType.multiplier;
    
    const occupancyRate = customOccupancy !== null 
      ? customOccupancy / 100 
      : market.avgOccupancy;
    
    // Calculate annual revenue
    const bookedNights = Math.round(365 * occupancyRate);
    const grossAnnualRevenue = baseNightlyRate * bookedNights;
    
    // Operating expenses (typically 25-35% for STR)
    const operatingExpenseRate = 0.30;
    const operatingExpenses = grossAnnualRevenue * operatingExpenseRate;
    
    // Net operating income
    const netOperatingIncome = grossAnnualRevenue - operatingExpenses;
    const monthlyNOI = netOperatingIncome / 12;
    
    // Loan calculations if property value provided
    let loanAmount = 0;
    let monthlyPayment = 0;
    let dscr = 0;
    let dscrStatus: "excellent" | "good" | "qualifying" | "below" = "below";
    
    if (propertyValue) {
      const value = parseFloat(propertyValue.replace(/,/g, ""));
      loanAmount = value * (1 - downPayment / 100);
      
      // Estimate monthly payment (assuming 7% rate, 30-year term)
      const annualRate = 0.07;
      const monthlyRate = annualRate / 12;
      const numPayments = 360;
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      // DSCR calculation
      dscr = monthlyNOI / monthlyPayment;
      
      if (dscr >= 1.25) dscrStatus = "excellent";
      else if (dscr >= 1.0) dscrStatus = "good";
      else if (dscr >= 0.75) dscrStatus = "qualifying";
      else dscrStatus = "below";
    }
    
    return {
      baseNightlyRate: Math.round(baseNightlyRate),
      occupancyRate: Math.round(occupancyRate * 100),
      bookedNights,
      grossAnnualRevenue: Math.round(grossAnnualRevenue),
      operatingExpenses: Math.round(operatingExpenses),
      netOperatingIncome: Math.round(netOperatingIncome),
      monthlyNOI: Math.round(monthlyNOI),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      dscr: dscr.toFixed(2),
      dscrStatus
    };
  }, [state, bedrooms, propertyType, propertyValue, downPayment, customOccupancy, customNightlyRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-12 pb-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="secondary">
              <Calculator className="h-3 w-3 mr-1" />
              STR Income Calculator
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Estimate Your Short-Term Rental Income
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Calculate potential rental income for your Airbnb or vacation rental property. 
              See if your STR qualifies for our DSCR loan programs.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>STR-Friendly Lender</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No Income Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Close in 21 Days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Input Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Property Details
                </CardTitle>
                <CardDescription>
                  Enter your property information to estimate rental income
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* State Selection */}
                <div className="space-y-2">
                  <Label htmlFor="state" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Property State
                  </Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger id="state" data-testid="select-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bedrooms */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Bedrooms: {bedrooms}
                  </Label>
                  <Slider
                    value={[bedrooms]}
                    onValueChange={(v) => setBedrooms(v[0])}
                    min={1}
                    max={8}
                    step={1}
                    data-testid="slider-bedrooms"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>8</span>
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                  <Label htmlFor="property-type" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Property Type
                  </Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger id="property-type" data-testid="select-property-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Nightly Rate (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="nightly-rate" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Custom Nightly Rate
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Leave blank to use market average, or enter your expected nightly rate</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="nightly-rate"
                    type="text"
                    placeholder="Leave blank for market estimate"
                    value={customNightlyRate}
                    onChange={(e) => setCustomNightlyRate(e.target.value.replace(/[^0-9.]/g, ""))}
                    data-testid="input-nightly-rate"
                  />
                </div>

                {/* Custom Occupancy (Optional) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Occupancy Rate: {customOccupancy !== null ? customOccupancy : (marketData[state]?.avgOccupancy * 100 || 58).toFixed(0)}%
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Adjust based on your market knowledge or leave at market average</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Slider
                    value={[customOccupancy !== null ? customOccupancy : (marketData[state]?.avgOccupancy * 100 || 58)]}
                    onValueChange={(v) => setCustomOccupancy(v[0])}
                    min={30}
                    max={90}
                    step={1}
                    data-testid="slider-occupancy"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>30%</span>
                    <span>90%</span>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Loan Details (Optional)
                  </h4>
                  
                  {/* Property Value */}
                  <div className="space-y-2">
                    <Label htmlFor="property-value">Property Value</Label>
                    <Input
                      id="property-value"
                      type="text"
                      placeholder="e.g., 450,000"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value.replace(/[^0-9,]/g, ""))}
                      data-testid="input-property-value"
                    />
                  </div>

                  {/* Down Payment */}
                  <div className="space-y-2">
                    <Label>Down Payment: {downPayment}%</Label>
                    <Slider
                      value={[downPayment]}
                      onValueChange={(v) => setDownPayment(v[0])}
                      min={20}
                      max={50}
                      step={5}
                      data-testid="slider-down-payment"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>20%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Income Estimate
                </CardTitle>
                <CardDescription>
                  Based on market data and your property details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!state ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a state to see income estimates</p>
                  </div>
                ) : calculations ? (
                  <div className="space-y-8">
                    {/* Revenue Summary */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-card border rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Avg. Nightly Rate</p>
                        <p className="text-2xl font-bold text-primary" data-testid="text-nightly-rate">
                          {formatCurrency(calculations.baseNightlyRate)}
                        </p>
                      </div>
                      <div className="bg-card border rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Occupancy Rate</p>
                        <p className="text-2xl font-bold" data-testid="text-occupancy">
                          {calculations.occupancyRate}%
                        </p>
                      </div>
                      <div className="bg-card border rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Booked Nights/Year</p>
                        <p className="text-2xl font-bold" data-testid="text-booked-nights">
                          {calculations.bookedNights}
                        </p>
                      </div>
                    </div>

                    {/* Income Breakdown */}
                    <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                      <h4 className="font-semibold text-lg">Annual Income Breakdown</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Gross Annual Revenue</span>
                          <span className="font-semibold text-lg" data-testid="text-gross-revenue">
                            {formatCurrency(calculations.grossAnnualRevenue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Operating Expenses (30%)</span>
                          <span className="text-red-500">
                            -{formatCurrency(calculations.operatingExpenses)}
                          </span>
                        </div>
                        <div className="border-t pt-3 flex justify-between items-center">
                          <span className="font-semibold">Net Operating Income</span>
                          <span className="font-bold text-xl text-green-600" data-testid="text-noi">
                            {formatCurrency(calculations.netOperatingIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm bg-background rounded p-2">
                          <span className="text-muted-foreground">Monthly NOI</span>
                          <span className="font-semibold">
                            {formatCurrency(calculations.monthlyNOI)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DSCR Analysis */}
                    {propertyValue && calculations.loanAmount > 0 && (
                      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                        <h4 className="font-semibold text-lg">DSCR Loan Analysis</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Loan Amount (at {100 - downPayment}% LTV)</p>
                            <p className="font-semibold">{formatCurrency(calculations.loanAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Est. Monthly Payment</p>
                            <p className="font-semibold">{formatCurrency(calculations.monthlyPayment)}</p>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold">Debt Service Coverage Ratio</span>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold" data-testid="text-dscr">
                                {calculations.dscr}x
                              </span>
                              <Badge 
                                variant={
                                  calculations.dscrStatus === "excellent" ? "default" :
                                  calculations.dscrStatus === "good" ? "secondary" :
                                  calculations.dscrStatus === "qualifying" ? "outline" : "destructive"
                                }
                                data-testid="badge-dscr-status"
                              >
                                {calculations.dscrStatus === "excellent" ? "Excellent" :
                                 calculations.dscrStatus === "good" ? "Good" :
                                 calculations.dscrStatus === "qualifying" ? "May Qualify" : "Below Threshold"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {calculations.dscrStatus === "excellent" && (
                              <p className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                Strong cash flow! This property likely qualifies for our best rates.
                              </p>
                            )}
                            {calculations.dscrStatus === "good" && (
                              <p className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                Good cash flow. This property should qualify for DSCR financing.
                              </p>
                            )}
                            {calculations.dscrStatus === "qualifying" && (
                              <p className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                This property may qualify. We offer programs with no minimum DSCR requirement.
                              </p>
                            )}
                            {calculations.dscrStatus === "below" && (
                              <p className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                Consider a larger down payment or confirm actual rental income with market research.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="bg-primary/10 rounded-lg p-6 text-center">
                      <h4 className="font-semibold text-lg mb-2">Ready to Get Started?</h4>
                      <p className="text-muted-foreground mb-4">
                        Get a personalized rate quote for your STR investment property
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/get-quote">
                          <Button size="lg" data-testid="button-get-quote">
                            Get Your Rate
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href="/dscr-loans">
                          <Button size="lg" variant="outline" data-testid="button-learn-dscr">
                            Learn About DSCR Loans
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <Info className="h-4 w-4 inline mr-1" />
              These estimates are based on market averages and should be used for informational purposes only. 
              Actual rental income will vary based on property condition, location, amenities, and market conditions. 
              For precise projections, we recommend consulting with a local property manager or using services like AirDNA.
            </p>
          </div>
        </div>
      </section>

      {/* Why STR Investors Choose Sequel Investments */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why STR Investors Choose Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We understand short-term rentals and offer financing tailored to vacation rental investors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex gap-4" data-testid="benefit-str-friendly">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">STR-Friendly</h3>
                <p className="text-muted-foreground">
                  We accept short-term rental income for DSCR qualification. Many lenders don't - we do.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="benefit-no-income-docs">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">No W2 Required</h3>
                <p className="text-muted-foreground">
                  We qualify the property's income potential, not your personal income. No tax returns needed.
                </p>
              </div>
            </div>

            <div className="flex gap-4" data-testid="benefit-flexible-dscr">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Flexible DSCR</h3>
                <p className="text-muted-foreground">
                  No minimum DSCR requirement. We work with investors at various cash flow levels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
