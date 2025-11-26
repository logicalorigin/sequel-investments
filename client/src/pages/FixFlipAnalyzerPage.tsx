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
  ArrowDown,
  ArrowUpRight,
  Minus,
  Hammer,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

const propertyTypes = [
  { id: "sfr", label: "Single Family", icon: "sfr" },
  { id: "duplex", label: "Duplex", icon: "duplex" },
  { id: "triplex", label: "Triplex", icon: "triplex" },
  { id: "fourplex", label: "Fourplex", icon: "fourplex" },
  { id: "townhome", label: "Townhome/Condo", icon: "townhome" },
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

export default function FixFlipAnalyzerPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [propertyType, setPropertyType] = useState("sfr");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [arv, setArv] = useState("400000");
  const [purchasePrice, setPurchasePrice] = useState("280000");
  const [rehabBudget, setRehabBudget] = useState("60000");
  const [downPayment, setDownPayment] = useState("28000");
  const [requestedRehabFunding, setRequestedRehabFunding] = useState("54000");
  const [totalClosingCosts, setTotalClosingCosts] = useState("8000");
  const [annualTaxes, setAnnualTaxes] = useState("4800");
  const [annualInsurance, setAnnualInsurance] = useState("2400");
  const [annualHOA, setAnnualHOA] = useState("0");
  const [holdTimeMonths, setHoldTimeMonths] = useState("6");
  const [interestRate, setInterestRate] = useState("10.5");
  const [ltcSlider, setLtcSlider] = useState([90]);

  const maxLtc = 90;

  const getCurrentScenarioData = useCallback(() => ({
    propertyType,
    propertyAddress,
    arv,
    purchasePrice,
    rehabBudget,
    downPayment,
    requestedRehabFunding,
    totalClosingCosts,
    annualTaxes,
    annualInsurance,
    annualHOA,
    holdTimeMonths,
    interestRate,
  }), [propertyType, propertyAddress, arv, purchasePrice, rehabBudget, downPayment, requestedRehabFunding, totalClosingCosts, annualTaxes, annualInsurance, annualHOA, holdTimeMonths, interestRate]);

  const handleLoadScenario = useCallback((data: Record<string, any>) => {
    if (data.propertyType) setPropertyType(data.propertyType);
    if (data.propertyAddress) setPropertyAddress(data.propertyAddress);
    if (data.arv) setArv(data.arv);
    if (data.purchasePrice) setPurchasePrice(data.purchasePrice);
    if (data.rehabBudget) setRehabBudget(data.rehabBudget);
    if (data.downPayment) setDownPayment(data.downPayment);
    if (data.requestedRehabFunding) setRequestedRehabFunding(data.requestedRehabFunding);
    if (data.totalClosingCosts) setTotalClosingCosts(data.totalClosingCosts);
    if (data.annualTaxes) setAnnualTaxes(data.annualTaxes);
    if (data.annualInsurance) setAnnualInsurance(data.annualInsurance);
    if (data.annualHOA) setAnnualHOA(data.annualHOA);
    if (data.holdTimeMonths) setHoldTimeMonths(data.holdTimeMonths);
    if (data.interestRate) setInterestRate(data.interestRate);
  }, []);

  useEffect(() => {
    const purchase = parseFloat(purchasePrice) || 0;
    const rehab = parseFloat(rehabBudget) || 0;
    const totalCost = purchase + rehab;
    const targetLoan = totalCost * (ltcSlider[0] / 100);
    const newDown = Math.max(0, purchase - (targetLoan - rehab * 0.9));
    setDownPayment(Math.round(newDown).toString());
    setRequestedRehabFunding(Math.round(rehab * 0.9).toString());
  }, [ltcSlider, purchasePrice, rehabBudget]);

  const createApplicationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/applications", {
        loanType: "Fix & Flip",
        propertyAddress: propertyAddress || "TBD",
        propertyValue: parseFloat(arv) || 0,
        loanAmount: results.loanAmount,
      });
      return response.json();
    },
    onSuccess: (data: LoanApplication) => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Created",
        description: "Your Fix & Flip loan application has been started.",
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
    const arvVal = parseFloat(arv) || 0;
    const purchasePriceVal = parseFloat(purchasePrice) || 0;
    const rehabBudgetVal = parseFloat(rehabBudget) || 0;
    const downPaymentVal = parseFloat(downPayment) || 0;
    const rehabFundingVal = parseFloat(requestedRehabFunding) || 0;
    const closingCostsVal = parseFloat(totalClosingCosts) || 0;
    const taxesVal = parseFloat(annualTaxes) || 0;
    const insuranceVal = parseFloat(annualInsurance) || 0;
    const hoaVal = parseFloat(annualHOA) || 0;
    const holdMonths = parseFloat(holdTimeMonths) || 6;
    const rate = parseFloat(interestRate) || 10.5;

    const loanAmount = purchasePriceVal - downPaymentVal + rehabFundingVal;
    const ltv = arvVal > 0 ? (loanAmount / arvVal) * 100 : 0;

    const monthlyTaxes = taxesVal / 12;
    const monthlyInsurance = insuranceVal / 12;
    const monthlyHOA = hoaVal / 12;
    const monthlyTIA = monthlyTaxes + monthlyInsurance + monthlyHOA;

    const holdingCosts = monthlyTIA * holdMonths;
    const interestCost = (loanAmount * (rate / 100)) * (holdMonths / 12);

    const totalProjectCost = purchasePriceVal + rehabBudgetVal + closingCostsVal + holdingCosts + interestCost;
    const cashInvested = downPaymentVal + closingCostsVal + (rehabBudgetVal - rehabFundingVal);
    const totalProfit = arvVal - totalProjectCost;
    const roi = cashInvested > 0 ? (totalProfit / cashInvested) * 100 : 0;
    const profitMargin = arvVal > 0 ? (totalProfit / arvVal) * 100 : 0;

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
      purchasePrice: purchasePriceVal,
      rehabBudget: rehabBudgetVal,
      closingCosts: closingCostsVal,
      holdingCosts,
      interestCost,
      downPayment: downPaymentVal,
      rehabEquity: rehabBudgetVal - rehabFundingVal,
    };
  }, [arv, purchasePrice, rehabBudget, downPayment, requestedRehabFunding, totalClosingCosts, annualTaxes, annualInsurance, annualHOA, holdTimeMonths, interestRate]);

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
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
              Fix & Flip Analyzer
            </h1>
            <p className="text-muted-foreground">
              Calculate your fix and flip deal profitability and ROI
            </p>
          </div>
          <ScenarioManager
            analyzerType="fix_flip"
            currentData={getCurrentScenarioData()}
            onLoadScenario={handleLoadScenario}
          />
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
                    <Label htmlFor="arv">After Repair Value (ARV)</Label>
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
                </div>
              </CardContent>
            </Card>

            {/* Rehab & Financing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hammer className="h-5 w-5 text-primary" />
                  Rehab & Financing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rehabBudget">Rehab Budget</Label>
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
                    <Label htmlFor="rehabFunding">Requested Rehab Funding (90%)</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="rehabFunding"
                        type="number"
                        value={requestedRehabFunding}
                        onChange={(e) => setRequestedRehabFunding(e.target.value)}
                        className="pl-7"
                        data-testid="input-rehab-funding"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Loan-to-Cost (LTC)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={ltcSlider[0]}
                        onChange={(e) => {
                          const val = Math.min(parseInt(e.target.value) || 0, maxLtc);
                          setLtcSlider([val]);
                        }}
                        className="w-20 h-8 text-center"
                        max={maxLtc}
                        data-testid="input-ltc"
                      />
                      <span className="text-lg font-bold text-primary">%</span>
                    </div>
                  </div>
                  <Slider
                    value={ltcSlider}
                    onValueChange={setLtcSlider}
                    min={0}
                    max={maxLtc}
                    step={1}
                    className="w-full"
                    data-testid="slider-ltc"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>{maxLtc}% Max</span>
                  </div>
                </div>

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
                    <Label htmlFor="closingCosts">Closing Costs</Label>
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
              </CardContent>
            </Card>

            {/* Loan Terms & Holding Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Terms & Holding Costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="holdTime">Hold Time (months)</Label>
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
          </div>

          {/* Results Panel */}
          <div>
            <Card 
              className={`sticky top-12 border transition-colors ${
                results.roi >= 10 
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
                    {results.roi >= 10 ? (
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                    ) : results.roi >= 5 ? (
                      <Minus className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Main Results */}
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
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">LTC</p>
                      <p className="text-lg font-bold" data-testid="result-ltc">
                        {results.ltc.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">LTV</p>
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
                        <span className="font-medium">{formatCurrency(results.purchasePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rehab Budget:</span>
                        <span className="font-medium">{formatCurrency(results.rehabBudget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Closing Costs:</span>
                        <span className="font-medium">{formatCurrency(results.closingCosts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Holding Costs:</span>
                        <span className="font-medium">{formatCurrency(results.holdingCosts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interest Cost:</span>
                        <span className="font-medium">{formatCurrency(results.interestCost)}</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t">
                        <span className="font-medium">Total Project Cost:</span>
                        <span className="font-bold text-primary">{formatCurrency(results.totalProjectCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cash to Close */}
                  <div className="bg-background rounded-lg p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Cash to Close</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Down Payment:</span>
                        <span className="font-medium">{formatCurrency(results.downPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rehab Equity:</span>
                        <span className="font-medium">{formatCurrency(results.rehabEquity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Closing Costs:</span>
                        <span className="font-medium">{formatCurrency(results.closingCosts)}</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t">
                        <span className="font-medium">Total Cash Invested:</span>
                        <span className="font-bold">{formatCurrency(results.cashInvested)}</span>
                      </div>
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
