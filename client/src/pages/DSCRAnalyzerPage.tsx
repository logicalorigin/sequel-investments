import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LoanApplication } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { PortalHeader } from "@/components/PortalHeader";
import { 
  Calculator,
  TrendingUp,
  DollarSign,
  Percent,
  Home,
  FileText,
  ArrowDown,
  ArrowUpRight,
  Minus,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

const propertyTypes = [
  { id: "sfr", label: "Single Family", icon: "sfr" },
  { id: "duplex", label: "Duplex", icon: "duplex" },
  { id: "triplex", label: "Triplex", icon: "triplex" },
  { id: "fourplex", label: "Fourplex", icon: "fourplex" },
  { id: "townhome", label: "Townhome/Condo", icon: "townhome" },
];

const transactionTypes = [
  { id: "purchase", label: "Purchase" },
  { id: "cash_out", label: "Cash-Out Refinance" },
  { id: "rate_term", label: "Rate & Term Refinance" },
];

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

function calculateDSCRInterestRate(ltv: number, dscr: number): number {
  const BASE_RATE = 6.25;
  let adjustment = 0;
  
  if (ltv <= 50) adjustment -= 0.5;
  else if (ltv <= 55) adjustment -= 0.25;
  else if (ltv <= 60) adjustment += 0;
  else if (ltv <= 65) adjustment += 0.125;
  else if (ltv <= 70) adjustment += 0.25;
  else if (ltv <= 75) adjustment += 0.375;
  else adjustment += 0.5;
  
  if (dscr >= 1.5) adjustment -= 0.125;
  else if (dscr >= 1.25) adjustment += 0;
  else if (dscr >= 1.0) adjustment += 0.125;
  else if (dscr >= 0.75) adjustment += 0.25;
  else adjustment += 0.375;
  
  return Math.max(5.75, Math.min(9.0, BASE_RATE + adjustment));
}

export default function DSCRAnalyzerPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [propertyType, setPropertyType] = useState("sfr");
  const [transactionType, setTransactionType] = useState("purchase");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyValue, setPropertyValue] = useState("450000");
  const [requestedLoanAmount, setRequestedLoanAmount] = useState("360000");
  const [monthlyRent, setMonthlyRent] = useState("3500");
  const [annualTaxes, setAnnualTaxes] = useState("5400");
  const [annualInsurance, setAnnualInsurance] = useState("1800");
  const [annualHOA, setAnnualHOA] = useState("0");
  const [creditScore, setCreditScore] = useState([740]);
  const [ltvSlider, setLtvSlider] = useState([80]);

  const maxLtv = transactionType === "cash_out" ? 75 : 80;

  useEffect(() => {
    const value = parseFloat(propertyValue) || 0;
    const newLoanAmount = Math.round(value * (ltvSlider[0] / 100));
    setRequestedLoanAmount(newLoanAmount.toString());
  }, [ltvSlider, propertyValue]);

  useEffect(() => {
    const value = parseFloat(propertyValue) || 0;
    const loan = parseFloat(requestedLoanAmount) || 0;
    if (value > 0) {
      const newLtv = Math.round((loan / value) * 100);
      if (newLtv !== ltvSlider[0] && newLtv >= 0 && newLtv <= 100) {
        setLtvSlider([Math.min(newLtv, maxLtv)]);
      }
    }
  }, [requestedLoanAmount]);

  const createApplicationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/applications", {
        loanType: "DSCR",
        propertyAddress: propertyAddress || "TBD",
        propertyValue: parseFloat(propertyValue) || 0,
        loanAmount: parseFloat(requestedLoanAmount) || 0,
      });
      return response.json();
    },
    onSuccess: (data: LoanApplication) => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Created",
        description: "Your DSCR loan application has been started.",
      });
      navigate(`/portal/application/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const results = useMemo(() => {
    const propertyVal = parseFloat(propertyValue) || 0;
    const loanAmount = parseFloat(requestedLoanAmount) || 0;
    const taxesVal = parseFloat(annualTaxes) || 0;
    const insuranceVal = parseFloat(annualInsurance) || 0;
    const hoaVal = parseFloat(annualHOA) || 0;
    const monthlyRentVal = parseFloat(monthlyRent) || 0;
    
    const ltv = propertyVal > 0 ? (loanAmount / propertyVal) * 100 : 0;
    const equityPercent = 100 - ltv;
    
    const monthlyTaxes = taxesVal / 12;
    const monthlyInsurance = insuranceVal / 12;
    const monthlyHOA = hoaVal / 12;
    const monthlyTIA = monthlyTaxes + monthlyInsurance + monthlyHOA;
    
    const estimatedMonthlyRate = 6.5 / 100 / 12;
    const loanTermInMonths = 30 * 12;
    const estimatedMonthlyPI = loanAmount > 0 
      ? (loanAmount * estimatedMonthlyRate * Math.pow(1 + estimatedMonthlyRate, loanTermInMonths)) / 
        (Math.pow(1 + estimatedMonthlyRate, loanTermInMonths) - 1)
      : 0;
    const estimatedMonthlyPITIA = estimatedMonthlyPI + monthlyTIA;
    const preliminaryDSCR = estimatedMonthlyPITIA > 0 ? monthlyRentVal / estimatedMonthlyPITIA : 0;
    
    const rate = calculateDSCRInterestRate(ltv, preliminaryDSCR);
    
    const actualMonthlyRate = rate / 100 / 12;
    const actualMonthlyPI = loanAmount > 0 
      ? (loanAmount * actualMonthlyRate * Math.pow(1 + actualMonthlyRate, loanTermInMonths)) / 
        (Math.pow(1 + actualMonthlyRate, loanTermInMonths) - 1)
      : 0;
    const totalMonthlyPITIA = actualMonthlyPI + monthlyTIA;
    const finalDSCR = totalMonthlyPITIA > 0 ? monthlyRentVal / totalMonthlyPITIA : 0;
    const monthlyCashFlow = monthlyRentVal - totalMonthlyPITIA;

    return {
      ltv,
      equityPercent,
      loanAmount,
      calculatedRate: rate,
      dscrRatio: finalDSCR,
      estimatedValue: propertyVal,
      monthlyPI: actualMonthlyPI,
      monthlyTIA,
      monthlyPITIA: totalMonthlyPITIA,
      monthlyRent: monthlyRentVal,
      monthlyCashFlow,
    };
  }, [propertyValue, requestedLoanAmount, annualTaxes, annualInsurance, annualHOA, monthlyRent, creditScore, propertyType]);

  const rateBreakdown = useMemo(() => {
    const BASE_RATE = 6.25;
    const score = creditScore[0];
    const ltv = results.ltv;
    const dscr = results.dscrRatio;

    let creditAdj = 0;
    let creditLabel = "";
    if (score >= 760) { creditAdj = 0; creditLabel = "760+ (Excellent)"; }
    else if (score >= 740) { creditAdj = 0.25; creditLabel = "740-759 (Very Good)"; }
    else if (score >= 720) { creditAdj = 0.375; creditLabel = "720-739 (Good)"; }
    else if (score >= 700) { creditAdj = 0.5; creditLabel = "700-719 (Fair)"; }
    else if (score >= 680) { creditAdj = 0.75; creditLabel = "680-699"; }
    else { creditAdj = 1.0; creditLabel = "660-679"; }

    let ltvAdj = 0;
    let ltvLabel = "";
    if (ltv <= 50) { ltvAdj = -0.5; ltvLabel = "≤50% (Best)"; }
    else if (ltv <= 55) { ltvAdj = -0.25; ltvLabel = "51-55%"; }
    else if (ltv <= 60) { ltvAdj = 0; ltvLabel = "56-60%"; }
    else if (ltv <= 65) { ltvAdj = 0.125; ltvLabel = "61-65%"; }
    else if (ltv <= 70) { ltvAdj = 0.25; ltvLabel = "66-70%"; }
    else if (ltv <= 75) { ltvAdj = 0.375; ltvLabel = "71-75%"; }
    else { ltvAdj = 0.5; ltvLabel = "76-80%"; }

    let dscrAdj = 0;
    let dscrLabel = "";
    if (dscr >= 1.5) { dscrAdj = -0.125; dscrLabel = "1.50+ (Excellent)"; }
    else if (dscr >= 1.25) { dscrAdj = 0; dscrLabel = "1.25-1.49 (Good)"; }
    else if (dscr >= 1.0) { dscrAdj = 0.125; dscrLabel = "1.00-1.24"; }
    else if (dscr >= 0.75) { dscrAdj = 0.25; dscrLabel = "0.75-0.99"; }
    else { dscrAdj = 0.375; dscrLabel = "<0.75"; }

    const isMultiUnit = propertyType !== "sfr" && propertyType !== "townhome";
    let propAdj = isMultiUnit ? 0.25 : 0;
    let propLabel = isMultiUnit ? "Multi-Unit" : "Single Family/Condo";

    return { BASE_RATE, creditAdj, creditLabel, ltvAdj, ltvLabel, dscrAdj, dscrLabel, propAdj, propLabel };
  }, [creditScore, results.ltv, results.dscrRatio, propertyType]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
      <PortalHeader user={user} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            DSCR Loan Analyzer
          </h1>
          <p className="text-muted-foreground">
            Analyze rental property cash flow and calculate your DSCR loan qualification
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Property Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Property Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {propertyTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setPropertyType(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        propertyType === type.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`button-property-type-${type.id}`}
                    >
                      <PropertyTypeIcon type={type.icon} className="w-8 h-8" />
                      <span className="text-xs font-medium text-center">{type.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transaction Type */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {transactionTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setTransactionType(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        transactionType === type.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`button-transaction-type-${type.id}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Property Address</Label>
                  <AddressAutocomplete
                    value={propertyAddress}
                    onChange={setPropertyAddress}
                    placeholder="Enter property address"
                    className="mt-1"
                    data-testid="input-property-address"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyValue">
                      {transactionType === "purchase" ? "Purchase Price" : "Property Value"}
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="propertyValue"
                        type="number"
                        value={propertyValue}
                        onChange={(e) => setPropertyValue(e.target.value)}
                        className="pl-7"
                        data-testid="input-property-value"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="monthlyRent">Expected Monthly Rent</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="monthlyRent"
                        type="number"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        className="pl-7"
                        data-testid="input-monthly-rent"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Details with LTV Slider */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Loan-to-Value (LTV)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={ltvSlider[0]}
                        onChange={(e) => {
                          const val = Math.min(parseInt(e.target.value) || 0, maxLtv);
                          setLtvSlider([val]);
                        }}
                        className="w-20 h-8 text-center"
                        max={maxLtv}
                        data-testid="input-ltv"
                      />
                      <span className="text-lg font-bold text-primary">%</span>
                    </div>
                  </div>
                  <Slider
                    value={ltvSlider}
                    onValueChange={setLtvSlider}
                    min={0}
                    max={maxLtv}
                    step={1}
                    className="w-full"
                    data-testid="slider-ltv"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>{maxLtv}% Max</span>
                  </div>
                  {transactionType === "cash_out" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Cash-out refinance limited to 75% LTV
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requestedLoanAmount">Requested Loan Amount</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="requestedLoanAmount"
                        type="number"
                        value={requestedLoanAmount}
                        onChange={(e) => setRequestedLoanAmount(e.target.value)}
                        className="pl-7"
                        data-testid="input-loan-amount"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Credit Score</Label>
                      <span className="text-lg font-bold text-primary">{creditScore[0]}</span>
                    </div>
                    <Slider
                      value={creditScore}
                      onValueChange={setCreditScore}
                      min={660}
                      max={800}
                      step={5}
                      className="w-full"
                      data-testid="slider-credit-score"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>660</span>
                      <span>800</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>

            {/* Rate Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Rate:</span>
                    <span className="font-medium">{rateBreakdown.BASE_RATE.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credit ({rateBreakdown.creditLabel}):</span>
                    <span className={`font-medium ${rateBreakdown.creditAdj > 0 ? "text-red-600" : rateBreakdown.creditAdj < 0 ? "text-green-600" : ""}`}>
                      {rateBreakdown.creditAdj > 0 ? "+" : ""}{rateBreakdown.creditAdj.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LTV ({rateBreakdown.ltvLabel}):</span>
                    <span className={`font-medium ${rateBreakdown.ltvAdj > 0 ? "text-red-600" : rateBreakdown.ltvAdj < 0 ? "text-green-600" : ""}`}>
                      {rateBreakdown.ltvAdj > 0 ? "+" : ""}{rateBreakdown.ltvAdj.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DSCR ({rateBreakdown.dscrLabel}):</span>
                    <span className={`font-medium ${rateBreakdown.dscrAdj > 0 ? "text-red-600" : rateBreakdown.dscrAdj < 0 ? "text-green-600" : ""}`}>
                      {rateBreakdown.dscrAdj > 0 ? "+" : ""}{rateBreakdown.dscrAdj.toFixed(3)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property ({rateBreakdown.propLabel}):</span>
                    <span className={`font-medium ${rateBreakdown.propAdj > 0 ? "text-red-600" : ""}`}>
                      {rateBreakdown.propAdj > 0 ? "+" : ""}{rateBreakdown.propAdj.toFixed(2)}%
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>Your Estimated Rate:</span>
                    <span className="text-green-600">{results.calculatedRate.toFixed(3)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div>
            <Card 
              className={`sticky top-12 border transition-colors ${
                results.dscrRatio >= 1.0 
                  ? "bg-gradient-to-br from-green-500/20 to-green-500/10 border-green-500/30"
                  : results.dscrRatio >= 0.75
                  ? "bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 border-yellow-500/30"
                  : "bg-gradient-to-br from-red-500/20 to-red-500/10 border-red-500/30"
              }`}
              data-testid="card-results"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Results
                  </div>
                  <div className="flex items-center gap-1">
                    {results.dscrRatio >= 1.0 ? (
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                    ) : results.dscrRatio >= 0.75 ? (
                      <Minus className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Interest Rate and DSCR */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Interest Rate</p>
                      <p className="text-xl font-bold text-green-600" data-testid="result-interest-rate">
                        {results.calculatedRate.toFixed(3)}%
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">DSCR</p>
                      <p className={`text-xl font-bold ${results.dscrRatio >= 1.0 ? "text-green-600" : results.dscrRatio >= 0.75 ? "text-yellow-600" : "text-red-600"}`} data-testid="result-dscr">
                        {results.dscrRatio.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Estimated Value and Equity % */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estimated Value</p>
                      <p className="text-lg font-bold text-green-600" data-testid="result-estimated-value">
                        {formatCurrency(results.estimatedValue)}
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Equity %</p>
                      <p className="text-lg font-bold text-green-600" data-testid="result-equity">
                        {results.equityPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Loan Amount and LTV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Loan Amount</p>
                      <p className="text-lg font-semibold" data-testid="result-loan-amount">
                        {formatCurrency(results.loanAmount)}
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">LTV %</p>
                      <p className={`text-lg font-bold ${
                        results.ltv > maxLtv 
                          ? "text-red-600" 
                          : results.ltv > 70 
                          ? "text-yellow-600" 
                          : "text-green-600"
                      }`} data-testid="result-ltv">
                        {results.ltv.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Monthly Payment Breakdown */}
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Monthly Breakdown</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rent Income:</span>
                        <span className="font-medium text-green-600" data-testid="result-monthly-rent">
                          {formatCurrency(results.monthlyRent)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Principal & Interest:</span>
                        <span className="font-medium" data-testid="result-monthly-pi">
                          {formatCurrency(results.monthlyPI)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes/Ins/HOA:</span>
                        <span className="font-medium" data-testid="result-monthly-tia">
                          {formatCurrency(results.monthlyTIA)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t">
                        <span className="font-medium">Total PITIA:</span>
                        <span className="font-bold" data-testid="result-monthly-pitia">
                          {formatCurrency(results.monthlyPITIA)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t">
                        <span className="font-medium">Monthly Cash Flow:</span>
                        <span className={`font-bold ${results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="result-monthly-cashflow">
                          {formatCurrency(results.monthlyCashFlow)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Qualification Status */}
                  <div className={`p-3 rounded-lg border ${
                    results.dscrRatio >= 1.0 
                      ? "bg-green-500/10 border-green-500/30" 
                      : results.dscrRatio >= 0.75 
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}>
                    <div className="flex items-center gap-2">
                      {results.dscrRatio >= 1.0 ? (
                        <>
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">
                            {results.dscrRatio >= 1.25 ? "Excellent! Strong cash flow." : "Good! DSCR of 1.0+ qualifies."}
                          </span>
                        </>
                      ) : results.dscrRatio >= 0.75 ? (
                        <>
                          <Minus className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm font-semibold text-yellow-600">Marginal - We may have options.</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="h-5 w-5 text-red-600" />
                          <span className="text-sm font-semibold text-red-600">Contact us for alternatives.</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => createApplicationMutation.mutate()}
                    disabled={createApplicationMutation.isPending}
                    data-testid="button-get-term-sheet"
                  >
                    {createApplicationMutation.isPending ? (
                      "Creating Application..."
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Get Term Sheet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
