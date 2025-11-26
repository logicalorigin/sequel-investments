import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2,
  LogOut,
  Calculator,
  TrendingUp,
  DollarSign,
  Percent,
  ArrowRight,
  Home,
  Building,
} from "lucide-react";

const propertyTypes = [
  { id: "sfr", label: "Single Family", icon: "sfr" },
  { id: "duplex", label: "Duplex", icon: "duplex" },
  { id: "triplex", label: "Triplex", icon: "triplex" },
  { id: "fourplex", label: "Fourplex", icon: "fourplex" },
  { id: "townhome", label: "Townhome/Condo", icon: "townhome" },
];

const dealTypes = [
  { id: "rehab", label: "Rehab", icon: "rehab" },
  { id: "new_construction", label: "New Construction", icon: "construction" },
  { id: "rental", label: "Rental", icon: "rental" },
];

function DealTypeIcon({ type, className = "" }: { type: string; className?: string }) {
  const baseClass = `${className}`;
  
  if (type === "rehab") {
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 44L44 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M40 16L48 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M44 20L52 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M48 16L56 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M16 48L8 56" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <rect x="8" y="48" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="2" fill="none" transform="rotate(-45 14 52)"/>
      </svg>
    );
  }
  
  if (type === "construction") {
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 36L32 16L52 36" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M32 16V8" stroke="currentColor" strokeWidth="2"/>
        <rect x="16" y="36" width="32" height="20" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="26" y="42" width="12" height="14" stroke="currentColor" strokeWidth="2" fill="none"/>
        <line x1="8" y1="56" x2="56" y2="56" stroke="currentColor" strokeWidth="2"/>
        <circle cx="32" cy="24" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  
  if (type === "rental") {
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 28L32 8L56 28V56H8V28Z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="26" y="38" width="12" height="18" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="35" cy="48" r="2" fill="currentColor"/>
        <path d="M44 20L44 8L52 8L52 16" stroke="currentColor" strokeWidth="2"/>
        <path d="M20 56V48C20 46 22 44 24 44H26" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  
  return <Home className={baseClass} />;
}

function PropertyTypeIcon({ type, className = "" }: { type: string; className?: string }) {
  const baseClass = `${className}`;
  
  if (type === "sfr") {
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 28L32 8L56 28V56H8V28Z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="26" y="38" width="12" height="18" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="16" y="34" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="40" y="34" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M32 8L32 2" stroke="currentColor" strokeWidth="2"/>
      </svg>
    );
  }
  
  if (type === "duplex") {
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="20" width="24" height="36" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="34" y="20" width="24" height="36" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="12" y="42" width="8" height="14" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="44" y="42" width="8" height="14" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="12" y="28" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="46" y="28" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M6 20L18 10L30 20" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M34 20L46 10L58 20" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  
  if (type === "triplex") {
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="22" width="18" height="34" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="23" y="22" width="18" height="34" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="42" y="22" width="18" height="34" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="8" y="44" width="6" height="12" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="29" y="44" width="6" height="12" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="48" y="44" width="6" height="12" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M4 22L13 14L22 22" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M23 22L32 14L41 22" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M42 22L51 14L60 22" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  
  if (type === "fourplex") {
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="18" width="52" height="38" stroke="currentColor" strokeWidth="2" fill="none"/>
        <line x1="32" y1="18" x2="32" y2="56" stroke="currentColor" strokeWidth="2"/>
        <line x1="6" y1="37" x2="58" y2="37" stroke="currentColor" strokeWidth="2"/>
        <rect x="12" y="24" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="38" y="24" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="12" y="44" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="38" y="44" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M6 18L32 6L58 18" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    );
  }
  
  if (type === "townhome") {
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="24" width="20" height="32" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="36" y="24" width="20" height="32" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="14" y="42" width="8" height="14" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="42" y="42" width="8" height="14" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="14" y="30" width="4" height="4" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="44" y="30" width="4" height="4" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M8 24L18 14L28 24" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M36 24L46 14L56 24" stroke="currentColor" strokeWidth="2" fill="none"/>
        <line x1="28" y1="14" x2="36" y2="14" stroke="currentColor" strokeWidth="2"/>
        <line x1="28" y1="24" x2="36" y2="24" stroke="currentColor" strokeWidth="2"/>
      </svg>
    );
  }
  
  return <Home className={baseClass} />;
}

export default function InvestmentAnalysisPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("sfr");
  const [dealType, setDealType] = useState("rehab");
  const [arv, setArv] = useState("500000");
  const [loanTermMonths, setLoanTermMonths] = useState("9");
  const [holdTimeMonths, setHoldTimeMonths] = useState("9");
  const [annualTaxes, setAnnualTaxes] = useState("7500");
  const [annualInsurance, setAnnualInsurance] = useState("3500");
  const [annualHOA, setAnnualHOA] = useState("4000");
  const [totalClosingCosts, setTotalClosingCosts] = useState("5000");
  const [purchasePrice, setPurchasePrice] = useState("350000");
  const [downPayment, setDownPayment] = useState("35000");
  const [rehabBudget, setRehabBudget] = useState("100000");
  const [requestedRehabFunding, setRequestedRehabFunding] = useState("100000");
  const [interestRate, setInterestRate] = useState("9.9");

  useEffect(() => {
    document.title = "Investment Analysis | Secured Asset Funding";
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to access the portal.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast]);

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const results = useMemo(() => {
    const arvVal = parseFloat(arv) || 0;
    const purchasePriceVal = parseFloat(purchasePrice) || 0;
    const downPaymentVal = parseFloat(downPayment) || 0;
    const closingCostsVal = parseFloat(totalClosingCosts) || 0;
    const taxesVal = parseFloat(annualTaxes) || 0;
    const insuranceVal = parseFloat(annualInsurance) || 0;
    const hoaVal = parseFloat(annualHOA) || 0;
    const rate = parseFloat(interestRate) || 9.9;
    const loanTermVal = parseFloat(loanTermMonths) || 12;
    
    const rehabBudgetVal = dealType !== "rental" ? (parseFloat(rehabBudget) || 0) : 0;
    const rehabFundingVal = dealType !== "rental" ? (parseFloat(requestedRehabFunding) || 0) : 0;
    const holdMonths = dealType !== "rental" ? (parseFloat(holdTimeMonths) || 9) : loanTermVal;

    const loanAmount = purchasePriceVal - downPaymentVal + rehabFundingVal;
    
    const monthlyTaxes = taxesVal / 12;
    const monthlyInsurance = insuranceVal / 12;
    const monthlyHOA = hoaVal / 12;
    const monthlyHoldingCosts = monthlyTaxes + monthlyInsurance + monthlyHOA;
    const totalHoldingCosts = monthlyHoldingCosts * holdMonths;
    
    const interestCost = (loanAmount * (rate / 100)) * (holdMonths / 12);
    
    const totalProjectCost = purchasePriceVal + rehabBudgetVal + closingCostsVal + totalHoldingCosts + interestCost;
    
    const cashInvested = downPaymentVal + closingCostsVal + (rehabBudgetVal - rehabFundingVal);
    
    const totalProfit = arvVal - totalProjectCost;
    
    const roi = cashInvested > 0 ? (totalProfit / cashInvested) * 100 : 0;
    
    const profitMargin = arvVal > 0 ? (totalProfit / arvVal) * 100 : 0;
    
    const ltv = arvVal > 0 ? (loanAmount / arvVal) * 100 : 0;
    
    const totalCost = purchasePriceVal + rehabBudgetVal;
    const ltc = totalCost > 0 ? (loanAmount / totalCost) * 100 : 0;

    return {
      totalProjectCost,
      cashInvested,
      totalProfit,
      roi,
      profitMargin,
      ltv,
      ltc,
      loanAmount,
    };
  }, [arv, purchasePrice, rehabBudget, downPayment, totalClosingCosts, annualTaxes, annualInsurance, annualHOA, holdTimeMonths, interestRate, requestedRehabFunding, dealType, loanTermMonths]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Secured Asset Funding</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/portal">
              <Button variant="ghost" size="sm" data-testid="link-portfolio">
                Portfolio
              </Button>
            </Link>
            <Link href="/portal/investment-analysis">
              <Button variant="ghost" size="sm" className="bg-primary/10" data-testid="link-investment-analysis">
                Investment Analysis
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {user?.firstName || user?.email || "User"}
              </span>
            </div>
            <a href="/api/logout">
              <Button variant="ghost" size="sm" data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            Investment Analysis
          </h1>
          <p className="text-muted-foreground">
            Analyze your deal and calculate potential returns before applying
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Deal Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label className="mb-3 block">Property Type</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {propertyTypes.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setPropertyType(pt.id)}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                          propertyType === pt.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                        data-testid={`button-property-type-${pt.id}`}
                      >
                        <PropertyTypeIcon type={pt.icon} className="w-10 h-10 mb-2 text-muted-foreground" />
                        <span className="text-xs text-center font-medium">{pt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="10180 E CARON ST, SCOTTSDALE, AZ 85258"
                    className="mt-1"
                    data-testid="input-address"
                  />
                </div>

                <div className="mb-6">
                  <Label className="mb-3 block">Deal Type</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {dealTypes.map((dt) => (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => setDealType(dt.id)}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                          dealType === dt.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                        data-testid={`button-deal-type-${dt.id}`}
                      >
                        <DealTypeIcon type={dt.icon} className="w-10 h-10 mb-2 text-muted-foreground" />
                        <span className="text-xs text-center font-medium">{dt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <Label htmlFor="arv">{dealType === "rental" ? "Property Value" : "ARV"}</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="arv"
                        type="number"
                        value={arv}
                        onChange={(e) => setArv(e.target.value)}
                        className="pl-7"
                        data-testid="input-arv"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="purchasePrice"
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        className="pl-7"
                        data-testid="input-purchase-price"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="downPayment">Down Payment</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="downPayment"
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                        className="pl-7"
                        data-testid="input-down-payment"
                      />
                    </div>
                  </div>
                </div>

                {dealType !== "rental" && (
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <Label htmlFor="rehabBudget">
                        {dealType === "new_construction" ? "Construction Budget" : "Rehab Budget"}
                      </Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="rehabBudget"
                          type="number"
                          value={rehabBudget}
                          onChange={(e) => setRehabBudget(e.target.value)}
                          className="pl-7"
                          data-testid="input-rehab-budget"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="requestedRehabFunding">
                        {dealType === "new_construction" ? "Requested Construction Funding" : "Requested Rehab Funding"}
                      </Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="requestedRehabFunding"
                          type="number"
                          value={requestedRehabFunding}
                          onChange={(e) => setRequestedRehabFunding(e.target.value)}
                          className="pl-7"
                          data-testid="input-rehab-funding"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="holdTime">
                        {dealType === "new_construction" ? "Build Duration (months)" : "Hold Time (months)"}
                      </Label>
                      <Input
                        id="holdTime"
                        type="number"
                        value={holdTimeMonths}
                        onChange={(e) => setHoldTimeMonths(e.target.value)}
                        className="mt-1"
                        data-testid="input-hold-time"
                      />
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <Label htmlFor="loanTerm">Loan Term (months)</Label>
                    <Input
                      id="loanTerm"
                      type="number"
                      value={loanTermMonths}
                      onChange={(e) => setLoanTermMonths(e.target.value)}
                      className="mt-1"
                      data-testid="input-loan-term"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="mt-1"
                      data-testid="input-interest-rate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="closingCosts">Total Closing Costs</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="closingCosts"
                        type="number"
                        value={totalClosingCosts}
                        onChange={(e) => setTotalClosingCosts(e.target.value)}
                        className="pl-7"
                        data-testid="input-closing-costs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <Label htmlFor="annualTaxes">Annual Taxes</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="annualTaxes"
                        type="number"
                        value={annualTaxes}
                        onChange={(e) => setAnnualTaxes(e.target.value)}
                        className="pl-7"
                        data-testid="input-annual-taxes"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="annualInsurance">Annual Insurance</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="annualInsurance"
                        type="number"
                        value={annualInsurance}
                        onChange={(e) => setAnnualInsurance(e.target.value)}
                        className="pl-7"
                        data-testid="input-annual-insurance"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="annualHOA">Annual HOA</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="annualHOA"
                        type="number"
                        value={annualHOA}
                        onChange={(e) => setAnnualHOA(e.target.value)}
                        className="pl-7"
                        data-testid="input-annual-hoa"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-analyze"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                  <Link href="/get-quote">
                    <Button variant="outline" data-testid="button-continue-application">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continue to Application
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Project Cost</p>
                      <p className="text-xl font-bold text-primary" data-testid="result-project-cost">
                        {formatCurrency(results.totalProjectCost)}
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cash Invested</p>
                      <p className="text-xl font-bold" data-testid="result-cash-invested">
                        {formatCurrency(results.cashInvested)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Profit</p>
                    <p className={`text-2xl font-bold ${results.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="result-profit">
                      {formatCurrency(results.totalProfit)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background rounded-lg p-4">
                      <div className="flex items-center gap-1 mb-1">
                        <Percent className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">ROI</p>
                      </div>
                      <p className={`text-xl font-bold ${results.roi >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="result-roi">
                        {results.roi.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-4">
                      <div className="flex items-center gap-1 mb-1">
                        <Percent className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Profit Margin</p>
                      </div>
                      <p className={`text-xl font-bold ${results.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="result-margin">
                        {results.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background rounded-lg p-4">
                      <div className="flex items-center gap-1 mb-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">LTC (%)</p>
                      </div>
                      <p className="text-xl font-bold" data-testid="result-ltc">
                        {results.ltc.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-4">
                      <div className="flex items-center gap-1 mb-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">LTV (%)</p>
                      </div>
                      <p className="text-xl font-bold" data-testid="result-ltv">
                        {results.ltv.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="bg-background rounded-lg p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Loan Amount</p>
                    <p className="text-lg font-semibold" data-testid="result-loan-amount">
                      {formatCurrency(results.loanAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
