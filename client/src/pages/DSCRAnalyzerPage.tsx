import { useEffect, useState, useMemo, useCallback } from "react";
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
import { ScenarioManager } from "@/components/ScenarioManager";
import { 
  Calculator,
  TrendingUp,
  DollarSign,
  Percent,
  Home,
  FileText,
  Building2,
  Sun,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

const propertyTypes = [
  { id: "sfr", label: "SFR", icon: "sfr" },
  { id: "duplex", label: "2-Unit", icon: "duplex" },
  { id: "triplex", label: "3-Unit", icon: "triplex" },
  { id: "fourplex", label: "4-Unit", icon: "fourplex" },
  { id: "townhome", label: "Condo", icon: "townhome" },
];

const transactionTypes = [
  { id: "purchase", label: "Purchase", baseRate: 6.25 },
  { id: "rate_term", label: "Rate & Term", baseRate: 6.50 },
  { id: "cash_out", label: "Cash-Out", baseRate: 6.625 },
];

const rentalTypes = [
  { id: "long_term", label: "Long-Term Rental", icon: Building2 },
  { id: "short_term", label: "Short-Term (STR)", icon: Sun },
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
        <path d="M8 24L18 14L28 24" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M36 24L46 14L56 24" stroke="currentColor" strokeWidth="2" fill="none"/>
        <line x1="28" y1="14" x2="36" y2="14" stroke="currentColor" strokeWidth="2"/>
      </svg>
    );
  }
  
  return <Home className={baseClass} />;
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
  const [rentalType, setRentalType] = useState("long_term");
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
  const baseRate = transactionTypes.find(t => t.id === transactionType)?.baseRate || 6.25;

  // Auto-adjust LTV when transaction type changes
  useEffect(() => {
    if (ltvSlider[0] > maxLtv) {
      setLtvSlider([maxLtv]);
    }
  }, [transactionType, maxLtv]);

  const getCurrentScenarioData = useCallback(() => ({
    propertyType,
    transactionType,
    rentalType,
    propertyAddress,
    propertyValue,
    requestedLoanAmount,
    monthlyRent,
    annualTaxes,
    annualInsurance,
    annualHOA,
    creditScore,
  }), [propertyType, transactionType, rentalType, propertyAddress, propertyValue, requestedLoanAmount, monthlyRent, annualTaxes, annualInsurance, annualHOA, creditScore]);

  const handleLoadScenario = useCallback((data: Record<string, any>) => {
    if (data.propertyType) setPropertyType(data.propertyType);
    if (data.transactionType) setTransactionType(data.transactionType);
    if (data.rentalType) setRentalType(data.rentalType);
    if (data.propertyAddress) setPropertyAddress(data.propertyAddress);
    if (data.propertyValue) setPropertyValue(data.propertyValue);
    if (data.requestedLoanAmount) setRequestedLoanAmount(data.requestedLoanAmount);
    if (data.monthlyRent) setMonthlyRent(data.monthlyRent);
    if (data.annualTaxes) setAnnualTaxes(data.annualTaxes);
    if (data.annualInsurance) setAnnualInsurance(data.annualInsurance);
    if (data.annualHOA) setAnnualHOA(data.annualHOA);
    if (data.creditScore) setCreditScore(data.creditScore);
  }, []);

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
    
    // Calculate preliminary DSCR with estimated rate
    const estimatedMonthlyRate = 6.5 / 100 / 12;
    const loanTermInMonths = 30 * 12;
    const estimatedMonthlyPI = loanAmount > 0 
      ? (loanAmount * estimatedMonthlyRate * Math.pow(1 + estimatedMonthlyRate, loanTermInMonths)) / 
        (Math.pow(1 + estimatedMonthlyRate, loanTermInMonths) - 1)
      : 0;
    const estimatedMonthlyPITIA = estimatedMonthlyPI + monthlyTIA;
    const preliminaryDSCR = estimatedMonthlyPITIA > 0 ? monthlyRentVal / estimatedMonthlyPITIA : 0;
    
    // Calculate actual rate with all adjustments
    const score = creditScore[0];
    const dscr = preliminaryDSCR;
    
    // Base rate from transaction type
    let rate = baseRate;
    
    // Credit score adjustment
    if (score >= 760) rate += 0;
    else if (score >= 740) rate += 0.25;
    else if (score >= 720) rate += 0.375;
    else if (score >= 700) rate += 0.5;
    else if (score >= 680) rate += 0.75;
    else rate += 1.0;
    
    // LTV adjustment - NO negative adjustment for low LTV
    if (ltv <= 60) rate += 0;
    else if (ltv <= 65) rate += 0.125;
    else if (ltv <= 70) rate += 0.25;
    else if (ltv <= 75) rate += 0.375;
    else rate += 0.5;
    
    // DSCR adjustment - new brackets: <0.75, 0.75-1.0, 1.0-1.14, 1.15+
    if (dscr >= 1.15) rate += 0;
    else if (dscr >= 1.0) rate += 0.125;
    else if (dscr >= 0.75) rate += 0.25;
    else rate += 0.5;
    
    // Property type adjustment
    const isMultiUnit = propertyType !== "sfr" && propertyType !== "townhome";
    if (isMultiUnit) rate += 0.25;
    
    // Rental type adjustment - STR gets 0.5% premium
    if (rentalType === "short_term") rate += 0.5;
    
    // Clamp rate
    rate = Math.max(5.75, Math.min(9.5, rate));
    
    const actualMonthlyRate = rate / 100 / 12;
    const actualMonthlyPI = loanAmount > 0 
      ? (loanAmount * actualMonthlyRate * Math.pow(1 + actualMonthlyRate, loanTermInMonths)) / 
        (Math.pow(1 + actualMonthlyRate, loanTermInMonths) - 1)
      : 0;
    const totalMonthlyPITIA = actualMonthlyPI + monthlyTIA;
    const finalDSCR = totalMonthlyPITIA > 0 ? monthlyRentVal / totalMonthlyPITIA : 0;
    const monthlyCashFlow = monthlyRentVal - totalMonthlyPITIA;
    
    // Cash to close / cash to borrower calculation
    const downPayment = propertyVal - loanAmount;
    const estimatedClosingCosts = loanAmount * 0.02; // ~2% closing costs
    const cashToClose = transactionType === "purchase" 
      ? downPayment + estimatedClosingCosts 
      : 0;
    const cashToBorrower = transactionType !== "purchase" 
      ? loanAmount - estimatedClosingCosts 
      : 0;

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
      cashToClose,
      cashToBorrower,
      downPayment,
    };
  }, [propertyValue, requestedLoanAmount, annualTaxes, annualInsurance, annualHOA, monthlyRent, creditScore, propertyType, baseRate, rentalType, transactionType]);

  const rateBreakdown = useMemo(() => {
    const score = creditScore[0];
    const ltv = results.ltv;
    const dscr = results.dscrRatio;

    let creditAdj = 0;
    let creditLabel = "";
    if (score >= 760) { creditAdj = 0; creditLabel = "760+"; }
    else if (score >= 740) { creditAdj = 0.25; creditLabel = "740-759"; }
    else if (score >= 720) { creditAdj = 0.375; creditLabel = "720-739"; }
    else if (score >= 700) { creditAdj = 0.5; creditLabel = "700-719"; }
    else if (score >= 680) { creditAdj = 0.75; creditLabel = "680-699"; }
    else { creditAdj = 1.0; creditLabel = "660-679"; }

    let ltvAdj = 0;
    let ltvLabel = "";
    if (ltv <= 60) { ltvAdj = 0; ltvLabel = "≤60%"; }
    else if (ltv <= 65) { ltvAdj = 0.125; ltvLabel = "61-65%"; }
    else if (ltv <= 70) { ltvAdj = 0.25; ltvLabel = "66-70%"; }
    else if (ltv <= 75) { ltvAdj = 0.375; ltvLabel = "71-75%"; }
    else { ltvAdj = 0.5; ltvLabel = "76-80%"; }

    let dscrAdj = 0;
    let dscrLabel = "";
    if (dscr >= 1.15) { dscrAdj = 0; dscrLabel = "1.15+"; }
    else if (dscr >= 1.0) { dscrAdj = 0.125; dscrLabel = "1.00-1.14"; }
    else if (dscr >= 0.75) { dscrAdj = 0.25; dscrLabel = "0.75-0.99"; }
    else { dscrAdj = 0.5; dscrLabel = "<0.75"; }

    const isMultiUnit = propertyType !== "sfr" && propertyType !== "townhome";
    let propAdj = isMultiUnit ? 0.25 : 0;
    let propLabel = isMultiUnit ? "Multi-Unit" : "1-Unit";
    
    let rentalAdj = rentalType === "short_term" ? 0.5 : 0;
    let rentalLabel = rentalType === "short_term" ? "STR" : "LTR";

    const txLabel = transactionTypes.find(t => t.id === transactionType)?.label || "Purchase";

    return { baseRate, txLabel, creditAdj, creditLabel, ltvAdj, ltvLabel, dscrAdj, dscrLabel, propAdj, propLabel, rentalAdj, rentalLabel };
  }, [creditScore, results.ltv, results.dscrRatio, propertyType, baseRate, rentalType, transactionType]);

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

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">
              DSCR Loan Analyzer
            </h1>
            <p className="text-sm text-muted-foreground">
              Analyze rental property cash flow and loan qualification
            </p>
          </div>
          <ScenarioManager
            analyzerType="dscr"
            currentData={getCurrentScenarioData()}
            onLoadScenario={handleLoadScenario}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Property & Transaction Type - Condensed */}
            <Card>
              <CardContent className="pt-4 space-y-4">
                {/* Property Type - Single Row */}
                <div className="flex items-center gap-3">
                  <Label className="w-24 shrink-0 text-sm">Property</Label>
                  <div className="flex gap-1.5 flex-1">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setPropertyType(type.id)}
                        className={`flex-1 py-2 px-2 rounded-md border transition-all flex flex-col items-center gap-1 ${
                          propertyType === type.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`button-property-type-${type.id}`}
                      >
                        <PropertyTypeIcon type={type.icon} className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transaction Type - Single Row */}
                <div className="flex items-center gap-3">
                  <Label className="w-24 shrink-0 text-sm">Transaction</Label>
                  <div className="flex gap-1.5 flex-1">
                    {transactionTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setTransactionType(type.id)}
                        className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                          transactionType === type.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`button-transaction-type-${type.id}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rental Type - Single Row */}
                <div className="flex items-center gap-3">
                  <Label className="w-24 shrink-0 text-sm">Rental Type</Label>
                  <div className="flex gap-1.5 flex-1">
                    {rentalTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setRentalType(type.id)}
                          className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                            rentalType === type.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`button-rental-type-${type.id}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <Label className="text-sm">Property Address</Label>
                  <AddressAutocomplete
                    value={propertyAddress}
                    onChange={setPropertyAddress}
                    placeholder="Enter property address"
                    className="mt-1"
                    data-testid="input-property-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="propertyValue" className="text-sm">
                      {transactionType === "purchase" ? "Purchase Price" : "Property Value"}
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="propertyValue"
                        type="number"
                        value={propertyValue}
                        onChange={(e) => setPropertyValue(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-property-value"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="monthlyRent" className="text-sm">Expected Monthly Rent</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="monthlyRent"
                        type="number"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-monthly-rent"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Details & Rate Breakdown - Side by Side */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Loan Details */}
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-sm">LTV</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={ltvSlider[0]}
                          onChange={(e) => {
                            const val = Math.min(parseInt(e.target.value) || 0, maxLtv);
                            setLtvSlider([val]);
                          }}
                          className="w-14 h-7 text-center text-sm"
                          max={maxLtv}
                          data-testid="input-ltv"
                        />
                        <span className="text-sm font-medium text-primary">%</span>
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
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                      <span>0%</span>
                      <span>{maxLtv}% Max</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requestedLoanAmount" className="text-sm">Loan Amount</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="requestedLoanAmount"
                        type="number"
                        value={requestedLoanAmount}
                        onChange={(e) => setRequestedLoanAmount(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-loan-amount"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-sm">Credit Score</Label>
                      <span className="text-sm font-bold text-primary">{creditScore[0]}</span>
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
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                      <span>660</span>
                      <span>800</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rate Breakdown - Now side by side */}
              <Card>
                <CardContent className="pt-4">
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base ({rateBreakdown.txLabel}):</span>
                      <span className="font-medium">{rateBreakdown.baseRate.toFixed(3)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credit ({rateBreakdown.creditLabel}):</span>
                      <span className={`font-medium ${rateBreakdown.creditAdj > 0 ? "text-red-600" : ""}`}>
                        {rateBreakdown.creditAdj > 0 ? "+" : ""}{rateBreakdown.creditAdj.toFixed(3)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LTV ({rateBreakdown.ltvLabel}):</span>
                      <span className={`font-medium ${rateBreakdown.ltvAdj > 0 ? "text-red-600" : ""}`}>
                        {rateBreakdown.ltvAdj > 0 ? "+" : ""}{rateBreakdown.ltvAdj.toFixed(3)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DSCR ({rateBreakdown.dscrLabel}):</span>
                      <span className={`font-medium ${rateBreakdown.dscrAdj > 0 ? "text-red-600" : ""}`}>
                        {rateBreakdown.dscrAdj > 0 ? "+" : ""}{rateBreakdown.dscrAdj.toFixed(3)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property ({rateBreakdown.propLabel}):</span>
                      <span className={`font-medium ${rateBreakdown.propAdj > 0 ? "text-red-600" : ""}`}>
                        {rateBreakdown.propAdj > 0 ? "+" : ""}{rateBreakdown.propAdj.toFixed(3)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rental ({rateBreakdown.rentalLabel}):</span>
                      <span className={`font-medium ${rateBreakdown.rentalAdj > 0 ? "text-red-600" : ""}`}>
                        {rateBreakdown.rentalAdj > 0 ? "+" : ""}{rateBreakdown.rentalAdj.toFixed(3)}%
                      </span>
                    </div>
                    <div className="border-t pt-1.5 mt-1.5 flex justify-between font-semibold text-sm">
                      <span>Your Rate:</span>
                      <span className="text-primary">{results.calculatedRate.toFixed(3)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Operating Expenses - Condensed */}
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="annualTaxes" className="text-sm">Annual Taxes</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="annualTaxes"
                        type="number"
                        value={annualTaxes}
                        onChange={(e) => setAnnualTaxes(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-annual-taxes"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="annualInsurance" className="text-sm">Annual Insurance</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="annualInsurance"
                        type="number"
                        value={annualInsurance}
                        onChange={(e) => setAnnualInsurance(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-annual-insurance"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="annualHOA" className="text-sm">Annual HOA</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="annualHOA"
                        type="number"
                        value={annualHOA}
                        onChange={(e) => setAnnualHOA(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-annual-hoa"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel - Right Column */}
          <div>
            <Card 
              className={`sticky top-4 border transition-colors ${
                results.dscrRatio >= 1.0 
                  ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"
                  : results.dscrRatio >= 0.75
                  ? "bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20"
                  : "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20"
              }`}
              data-testid="card-results"
            >
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  DSCR Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                {/* Interest Rate and DSCR */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Interest Rate</p>
                    <p className="text-lg font-bold text-primary" data-testid="result-interest-rate">
                      {results.calculatedRate.toFixed(3)}%
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">DSCR</p>
                    <p className={`text-lg font-bold ${results.dscrRatio >= 1.0 ? "text-green-600" : results.dscrRatio >= 0.75 ? "text-yellow-600" : "text-red-600"}`} data-testid="result-dscr">
                      {results.dscrRatio.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Loan Amount and LTV */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Loan Amount</p>
                    <p className="text-sm font-semibold" data-testid="result-loan-amount">
                      {formatCurrency(results.loanAmount)}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">LTV</p>
                    <p className={`text-sm font-bold ${
                      results.ltv > maxLtv ? "text-red-600" : results.ltv > 70 ? "text-yellow-600" : "text-green-600"
                    }`} data-testid="result-ltv">
                      {results.ltv.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Cash to Close / Cash to Borrower */}
                <div className="bg-background rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                    {transactionType === "purchase" ? "Estimated Cash to Close" : "Estimated Cash to Borrower"}
                  </p>
                  <p className="text-lg font-bold text-primary" data-testid="result-cash">
                    {formatCurrency(transactionType === "purchase" ? results.cashToClose : results.cashToBorrower)}
                  </p>
                </div>

                {/* Monthly Breakdown */}
                <div className="bg-background rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Monthly Breakdown</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rent Income:</span>
                      <span className="font-medium text-green-600" data-testid="result-monthly-rent">
                        {formatCurrency(results.monthlyRent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">P&I:</span>
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
                    <div className="flex justify-between pt-1 border-t">
                      <span className="font-medium">Total PITIA:</span>
                      <span className="font-bold" data-testid="result-monthly-pitia">
                        {formatCurrency(results.monthlyPITIA)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="font-medium">Cash Flow:</span>
                      <span className={`font-bold ${results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="result-monthly-cashflow">
                        {formatCurrency(results.monthlyCashFlow)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Qualification Status - No emoji */}
                <div className={`p-2.5 rounded-lg border text-xs ${
                  results.dscrRatio >= 1.0 
                    ? "bg-green-500/10 border-green-500/20" 
                    : results.dscrRatio >= 0.75 
                    ? "bg-yellow-500/10 border-yellow-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}>
                  <span className={`font-semibold ${
                    results.dscrRatio >= 1.0 ? "text-green-600" : results.dscrRatio >= 0.75 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {results.dscrRatio >= 1.15 
                      ? "Excellent! Strong cash flow coverage." 
                      : results.dscrRatio >= 1.0 
                      ? "Good! DSCR qualifies for best rates."
                      : results.dscrRatio >= 0.75 
                      ? "Marginal - We may have options."
                      : "Contact us for alternatives."}
                  </span>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
