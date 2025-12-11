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

const dealTypes = [
  { id: "rental", label: "DSCR" },
  { id: "rehab", label: "Fix & Flip" },
  { id: "new_construction", label: "New Construction" },
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

export default function InvestmentAnalysisPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("sfr");
  const [dealType, setDealType] = useState("rental");
  const [transactionType, setTransactionType] = useState("purchase");
  const [arv, setArv] = useState("500000");
  const [loanTermMonths, setLoanTermMonths] = useState("30");
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
  const [requestedLoanAmount, setRequestedLoanAmount] = useState("280000");
  
  const [creditScore, setCreditScore] = useState([720]);
  const [monthlyRent, setMonthlyRent] = useState("3500");

  useEffect(() => {
    document.title = "Investment Analysis | Sequel Investments";
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

  const getLoanType = () => {
    switch (dealType) {
      case "rental": return "dscr";
      case "rehab": return "fix_flip";
      case "new_construction": return "new_construction";
      default: return "dscr";
    }
  };

  const createApplicationMutation = useMutation({
    mutationFn: async ({ loanType, productVariant }: { loanType: string; productVariant?: string }) => {
      const res = await apiRequest("POST", "/api/applications", { loanType, productVariant });
      return await res.json() as LoanApplication;
    },
    onSuccess: (newApp: LoanApplication) => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setLocation(`/portal/application/${newApp.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateDSCRInterestRate = (ltv: number, dscr: number) => {
    const BASE_RATE = 6.25;
    
    let creditAdjustment = 0;
    const score = creditScore[0];
    if (score >= 760) creditAdjustment = 0;
    else if (score >= 740) creditAdjustment = 0.25;
    else if (score >= 720) creditAdjustment = 0.375;
    else if (score >= 700) creditAdjustment = 0.5;
    else if (score >= 680) creditAdjustment = 0.75;
    else creditAdjustment = 1.0;
    
    let ltvAdjustment = 0;
    if (ltv <= 50) ltvAdjustment = -0.5;
    else if (ltv <= 55) ltvAdjustment = -0.25;
    else if (ltv <= 60) ltvAdjustment = 0;
    else if (ltv <= 65) ltvAdjustment = 0.125;
    else if (ltv <= 70) ltvAdjustment = 0.25;
    else if (ltv <= 75) ltvAdjustment = 0.375;
    else ltvAdjustment = 0.5;
    
    let dscrAdjustment = 0;
    if (dscr >= 1.5) dscrAdjustment = -0.125;
    else if (dscr >= 1.25) dscrAdjustment = 0;
    else if (dscr >= 1.0) dscrAdjustment = 0.125;
    else if (dscr >= 0.75) dscrAdjustment = 0.25;
    else dscrAdjustment = 0.375;
    
    let propertyAdjustment = 0;
    if (propertyType !== "sfr" && propertyType !== "townhome") propertyAdjustment = 0.25;
    
    const finalRate = BASE_RATE + creditAdjustment + ltvAdjustment + dscrAdjustment + propertyAdjustment;
    return Math.max(5.75, Math.min(9.0, finalRate));
  };

  const results = useMemo(() => {
    const arvVal = parseFloat(arv) || 0;
    const purchasePriceVal = parseFloat(purchasePrice) || 0;
    const downPaymentVal = dealType !== "rental" ? (parseFloat(downPayment) || 0) : 0;
    const closingCostsVal = dealType !== "rental" ? (parseFloat(totalClosingCosts) || 0) : 0;
    const taxesVal = parseFloat(annualTaxes) || 0;
    const insuranceVal = parseFloat(annualInsurance) || 0;
    const hoaVal = parseFloat(annualHOA) || 0;
    const loanTermInputVal = dealType !== "rental" ? (parseFloat(loanTermMonths) || 12) : 30;
    const monthlyRentVal = parseFloat(monthlyRent) || 0;
    const requestedLoanVal = parseFloat(requestedLoanAmount) || 0;
    
    const loanTermInMonths = dealType === "rental" ? 30 * 12 : loanTermInputVal;
    
    const rehabBudgetVal = dealType !== "rental" ? (parseFloat(rehabBudget) || 0) : 0;
    const rehabFundingVal = dealType !== "rental" ? (parseFloat(requestedRehabFunding) || 0) : 0;
    const holdMonths = dealType !== "rental" ? (parseFloat(holdTimeMonths) || 9) : loanTermInMonths;

    // For DSCR, use the requested loan amount directly; for others, calculate from purchase price
    const loanAmount = dealType === "rental" 
      ? requestedLoanVal 
      : purchasePriceVal - downPaymentVal + rehabFundingVal;
    
    const ltv = arvVal > 0 ? (loanAmount / arvVal) * 100 : 0;
    
    const monthlyTaxes = taxesVal / 12;
    const monthlyInsurance = insuranceVal / 12;
    const monthlyHOA = hoaVal / 12;
    const monthlyTIA = monthlyTaxes + monthlyInsurance + monthlyHOA;
    
    const estimatedMonthlyRate = 6.5 / 100 / 12;
    const estimatedMonthlyPI = loanAmount > 0 && loanTermInMonths > 0
      ? (loanAmount * estimatedMonthlyRate * Math.pow(1 + estimatedMonthlyRate, loanTermInMonths)) / 
        (Math.pow(1 + estimatedMonthlyRate, loanTermInMonths) - 1)
      : 0;
    const estimatedMonthlyPITIA = estimatedMonthlyPI + monthlyTIA;
    const preliminaryDSCR = estimatedMonthlyPITIA > 0 ? monthlyRentVal / estimatedMonthlyPITIA : 0;
    
    const rate = dealType === "rental" 
      ? calculateDSCRInterestRate(ltv, preliminaryDSCR)
      : parseFloat(interestRate) || 9.9;
    
    const actualMonthlyRate = rate / 100 / 12;
    const actualMonthlyPI = loanAmount > 0 && loanTermInMonths > 0
      ? (loanAmount * actualMonthlyRate * Math.pow(1 + actualMonthlyRate, loanTermInMonths)) / 
        (Math.pow(1 + actualMonthlyRate, loanTermInMonths) - 1)
      : 0;
    const totalMonthlyPITIA = actualMonthlyPI + monthlyTIA;
    const finalDSCR = totalMonthlyPITIA > 0 ? monthlyRentVal / totalMonthlyPITIA : 0;
    
    const totalHoldingCosts = monthlyTIA * holdMonths;
    const interestCost = (loanAmount * (rate / 100)) * (holdMonths / 12);
    
    const totalProjectCost = purchasePriceVal + rehabBudgetVal + closingCostsVal + totalHoldingCosts + interestCost;
    
    const cashInvested = downPaymentVal + closingCostsVal + (rehabBudgetVal - rehabFundingVal);
    
    const totalProfit = arvVal - totalProjectCost;
    
    const roi = cashInvested > 0 ? (totalProfit / cashInvested) * 100 : 0;
    
    const profitMargin = arvVal > 0 ? (totalProfit / arvVal) * 100 : 0;
    
    const totalCost = purchasePriceVal + rehabBudgetVal;
    const ltc = totalCost > 0 ? (loanAmount / totalCost) * 100 : 0;
    
    // Equity calculations for DSCR
    const estimatedValue = dealType === "rental" ? purchasePriceVal : arvVal;
    const equity = estimatedValue - loanAmount;
    const equityPercent = estimatedValue > 0 ? (equity / estimatedValue) * 100 : 0;

    return {
      totalProjectCost,
      cashInvested,
      totalProfit,
      roi,
      profitMargin,
      ltv,
      ltc,
      loanAmount,
      dscrRatio: finalDSCR,
      calculatedRate: rate,
      estimatedValue,
      equity,
      equityPercent,
      monthlyPI: actualMonthlyPI,
      monthlyTIA,
      monthlyPITIA: totalMonthlyPITIA,
      monthlyRent: monthlyRentVal,
      purchasePrice: purchasePriceVal,
      rehabBudget: rehabBudgetVal,
      closingCosts: closingCostsVal,
      holdingCosts: totalHoldingCosts,
      interestCost,
      downPayment: downPaymentVal,
      rehabEquity: rehabBudgetVal - rehabFundingVal,
    };
  }, [arv, purchasePrice, rehabBudget, downPayment, totalClosingCosts, annualTaxes, annualInsurance, annualHOA, holdTimeMonths, interestRate, requestedRehabFunding, dealType, loanTermMonths, monthlyRent, creditScore, propertyType, requestedLoanAmount]);

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
      <PortalHeader user={user} />

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
              <CardContent className="space-y-8">
                {/* Deal Section - Now first */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">Deal</h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {dealTypes.map((dt) => (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => setDealType(dt.id)}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          dealType === dt.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                        data-testid={`button-deal-type-${dt.id}`}
                      >
                        {dt.label}
                      </button>
                    ))}
                  </div>

                  {/* DSCR-specific: Transaction Type */}
                  {dealType === "rental" && (
                    <div>
                      <Label className="mb-2 block">Transaction Type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {transactionTypes.map((tt) => (
                          <button
                            key={tt.id}
                            type="button"
                            onClick={() => setTransactionType(tt.id)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              transactionType === tt.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                            data-testid={`button-transaction-type-${tt.id}`}
                          >
                            {tt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Section - Now second, no duplicate headers */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">Property</h3>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {propertyTypes.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setPropertyType(pt.id)}
                        className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                          propertyType === pt.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                        data-testid={`button-property-type-${pt.id}`}
                      >
                        <PropertyTypeIcon type={pt.icon} className="w-8 h-8 mb-1 text-muted-foreground" />
                        <span className="text-[10px] text-center font-medium">{pt.label}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <div className="mt-1">
                      <AddressAutocomplete
                        value={address}
                        onChange={setAddress}
                        placeholder="Enter property address"
                        data-testid="input-address"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {dealType === "rental" ? (
                      <>
                        <div>
                          <Label htmlFor="purchasePrice">
                            {transactionType === "purchase" ? "Purchase Price" : "Property Value"}
                          </Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              id="purchasePrice"
                              type="number"
                              value={purchasePrice}
                              onChange={(e) => {
                                setPurchasePrice(e.target.value);
                                setArv(e.target.value);
                              }}
                              className="pl-7"
                              data-testid="input-purchase-price"
                            />
                          </div>
                        </div>
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
                              data-testid="input-requested-loan-amount"
                            />
                          </div>
                          {/* LTV Display with Max Limits */}
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">LTV:</span>
                            <span className={`font-semibold ${
                              results.ltv > (transactionType === "cash_out" ? 75 : 80) 
                                ? "text-red-600" 
                                : results.ltv > 70 
                                ? "text-yellow-600" 
                                : "text-green-600"
                            }`}>
                              {results.ltv.toFixed(1)}%
                              <span className="text-xs text-muted-foreground ml-1">
                                (max {transactionType === "cash_out" ? "75" : "80"}%)
                              </span>
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="arv">ARV</Label>
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
                      </>
                    )}
                  </div>
                </div>

                {/* Financing Section - Only for non-DSCR deals */}
                {dealType !== "rental" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">Financing</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
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

                    <div className="grid md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
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
                    </div>
                  </div>
                )}

                {/* Loan Factors Section - Combined for DSCR, or just Operating Expenses for others */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                    {dealType === "rental" ? "Loan Factors" : "Operating Expenses"}
                  </h3>
                  
                  {/* Credit Score and Monthly Rent - Only for DSCR */}
                  {dealType === "rental" && (
                    <div className="grid md:grid-cols-2 gap-4">
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
                  )}
                  
                  {/* Operating Expenses - All deal types */}
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
                </div>

                {/* Rate Breakdown - DSCR Only */}
                {dealType === "rental" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                      Rate Breakdown
                    </h3>
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
                            <span className="font-semibold text-green-600">
                              {results.dscrRatio >= 1.25 ? "Excellent! Strong cash flow qualification." : "Good! DSCR of 1.0+ typically qualifies."}
                            </span>
                          </>
                        ) : results.dscrRatio >= 0.75 ? (
                          <>
                            <Minus className="h-5 w-5 text-yellow-600" />
                            <span className="font-semibold text-yellow-600">Marginal - We may still have options for you.</span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="h-5 w-5 text-red-600" />
                            <span className="font-semibold text-red-600">Contact us to discuss alternative programs.</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card 
              className={`sticky top-12 border transition-colors ${
                dealType === "rental"
                  ? results.dscrRatio >= 1.0 
                    ? "bg-gradient-to-br from-green-500/20 to-green-500/10 border-green-500/30"
                    : results.dscrRatio >= 0.75
                    ? "bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 border-yellow-500/30"
                    : "bg-gradient-to-br from-red-500/20 to-red-500/10 border-red-500/30"
                  : results.roi >= 10 
                    ? "bg-gradient-to-br from-green-500/20 to-green-500/10 border-green-500/30"
                    : results.roi >= 5
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
                    {dealType === "rental" ? (
                      results.dscrRatio >= 1.0 ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      ) : results.dscrRatio >= 0.75 ? (
                        <Minus className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-red-600" />
                      )
                    ) : (
                      results.roi >= 10 ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      ) : results.roi >= 5 ? (
                        <Minus className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-red-600" />
                      )
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* DSCR Results Layout */}
                  {dealType === "rental" ? (
                    <>
                      {/* Interest Rate and DSCR */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background rounded-lg p-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Interest Rate</p>
                          <p className="text-xl font-bold text-green-600" data-testid="result-interest-rate">
                            {results.calculatedRate.toFixed(2)}%
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

                      {/* Loan Amount and LTV - inverse relationship */}
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
                            results.ltv > (transactionType === "cash_out" ? 75 : 80) 
                              ? "text-red-600" 
                              : results.ltv > 70 
                              ? "text-yellow-600" 
                              : "text-green-600"
                          }`} data-testid="result-ltv">
                            {results.ltv.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">(Equity: {results.equityPercent.toFixed(1)}%)</p>
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
                            <span className={`font-bold ${results.monthlyRent - results.monthlyPITIA >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="result-monthly-cashflow">
                              {formatCurrency(results.monthlyRent - results.monthlyPITIA)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Non-DSCR Results Layout */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background rounded-lg p-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Project Cost</p>
                          <p className="text-lg font-bold text-primary" data-testid="result-project-cost">
                            {formatCurrency(results.totalProjectCost)}
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cash Invested</p>
                          <p className="text-lg font-bold" data-testid="result-cash-invested">
                            {formatCurrency(results.cashInvested)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Profit</p>
                        <p className={`text-xl font-bold ${results.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="result-profit">
                          {formatCurrency(results.totalProfit)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background rounded-lg p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <Percent className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">ROI</p>
                          </div>
                          <p className={`text-lg font-bold ${
                            results.roi >= 10 
                              ? "text-green-600" 
                              : results.roi >= 5 
                              ? "text-yellow-600" 
                              : "text-red-600"
                          }`} data-testid="result-roi">
                            {results.roi.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <Percent className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Profit Margin</p>
                          </div>
                          <p className={`text-lg font-bold ${results.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="result-margin">
                            {results.profitMargin.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background rounded-lg p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">LTC</p>
                          </div>
                          <p className="text-lg font-bold" data-testid="result-ltc">
                            {results.ltc.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-background rounded-lg p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">LTV</p>
                          </div>
                          <p className="text-lg font-bold" data-testid="result-ltv">
                            {results.ltv.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Loan Amount</p>
                        <p className="text-lg font-semibold" data-testid="result-loan-amount">
                          {formatCurrency(results.loanAmount)}
                        </p>
                      </div>

                      {/* Costs Breakdown */}
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Costs Breakdown</p>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Purchase Price:</span>
                            <span className="font-medium" data-testid="result-purchase-price">
                              {formatCurrency(results.purchasePrice)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rehab Budget:</span>
                            <span className="font-medium" data-testid="result-rehab-budget">
                              {formatCurrency(results.rehabBudget)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Closing Costs:</span>
                            <span className="font-medium" data-testid="result-closing-costs">
                              {formatCurrency(results.closingCosts)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Holding Costs:</span>
                            <span className="font-medium" data-testid="result-holding-costs">
                              {formatCurrency(results.holdingCosts)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Interest Cost:</span>
                            <span className="font-medium" data-testid="result-interest-cost">
                              {formatCurrency(results.interestCost)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1.5 border-t">
                            <span className="font-medium">Total Project Cost:</span>
                            <span className="font-bold text-primary" data-testid="result-total-cost">
                              {formatCurrency(results.totalProjectCost)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cash to Close Breakdown */}
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Cash to Close</p>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Down Payment:</span>
                            <span className="font-medium" data-testid="result-down-payment">
                              {formatCurrency(results.downPayment)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rehab Equity:</span>
                            <span className="font-medium" data-testid="result-rehab-equity">
                              {formatCurrency(results.rehabEquity)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Closing Costs:</span>
                            <span className="font-medium">
                              {formatCurrency(results.closingCosts)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1.5 border-t">
                            <span className="font-medium">Total Cash Invested:</span>
                            <span className="font-bold" data-testid="result-cash-to-close">
                              {formatCurrency(results.cashInvested)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Button 
                    className="w-full"
                    onClick={() => createApplicationMutation.mutate({ 
                      loanType: getLoanType(), 
                      productVariant: dealType === "rental" ? transactionType : undefined 
                    })}
                    disabled={createApplicationMutation.isPending}
                    data-testid="button-get-term-sheet"
                  >
                    {createApplicationMutation.isPending ? (
                      "Creating Application..."
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Get a Term Sheet
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
