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
  TrendingUp,
  Home,
  FileText,
  Hammer,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

const propertyTypes = [
  { id: "sfr", label: "SFR", icon: "sfr" },
  { id: "duplex", label: "2-Unit", icon: "duplex" },
  { id: "triplex", label: "3-Unit", icon: "triplex" },
  { id: "fourplex", label: "4-Unit", icon: "fourplex" },
  { id: "townhome", label: "Condo", icon: "townhome" },
];

const experienceLevels = [
  { id: "1", label: "1-2 Deals", rateAdj: 1.0, downPaymentAdj: 5 },
  { id: "3-5", label: "3-5 Deals", rateAdj: 0.5, downPaymentAdj: 2.5 },
  { id: "6-10", label: "6-10 Deals", rateAdj: 0.25, downPaymentAdj: 0 },
  { id: "10+", label: "10+ Deals", rateAdj: 0, downPaymentAdj: 0 },
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
  const [purchasePrice, setPurchasePrice] = useState("280000");
  const [rehabBudget, setRehabBudget] = useState("60000");
  const [arv, setArv] = useState("400000");
  const [downPayment, setDownPayment] = useState("28000");
  const [requestedRehabFunding, setRequestedRehabFunding] = useState("54000");
  const [totalClosingCosts, setTotalClosingCosts] = useState("8000");
  const [annualTaxes, setAnnualTaxes] = useState("4800");
  const [annualInsurance, setAnnualInsurance] = useState("2400");
  const [annualHOA, setAnnualHOA] = useState("0");
  const [holdTimeMonths, setHoldTimeMonths] = useState("6");
  const [creditScore, setCreditScore] = useState([720]);
  const [experience, setExperience] = useState("1");
  const [ltcSlider, setLtcSlider] = useState([90]);

  const maxLtc = 90;

  // Calculate interest rate based on FICO and experience
  const calculatedRate = useMemo(() => {
    const BASE_RATE = 9.9;
    let rate = BASE_RATE;
    
    // Credit score adjustment
    const score = creditScore[0];
    if (score >= 720) rate += 0;
    else if (score >= 700) rate += 0.5;
    else if (score >= 680) rate += 1.0;
    else rate += 1.5;
    
    // Experience adjustment
    const expLevel = experienceLevels.find(e => e.id === experience);
    rate += expLevel?.rateAdj || 0;
    
    return Math.max(8.9, Math.min(12.5, rate));
  }, [creditScore, experience]);

  // Calculate minimum down payment based on experience
  const minDownPaymentPercent = useMemo(() => {
    const expLevel = experienceLevels.find(e => e.id === experience);
    return 10 + (expLevel?.downPaymentAdj || 0);
  }, [experience]);

  const getCurrentScenarioData = useCallback(() => ({
    propertyType,
    propertyAddress,
    purchasePrice,
    rehabBudget,
    arv,
    downPayment,
    requestedRehabFunding,
    totalClosingCosts,
    annualTaxes,
    annualInsurance,
    annualHOA,
    holdTimeMonths,
    creditScore,
    experience,
  }), [propertyType, propertyAddress, purchasePrice, rehabBudget, arv, downPayment, requestedRehabFunding, totalClosingCosts, annualTaxes, annualInsurance, annualHOA, holdTimeMonths, creditScore, experience]);

  const handleLoadScenario = useCallback((data: Record<string, any>) => {
    if (data.propertyType) setPropertyType(data.propertyType);
    if (data.propertyAddress) setPropertyAddress(data.propertyAddress);
    if (data.purchasePrice) setPurchasePrice(data.purchasePrice);
    if (data.rehabBudget) setRehabBudget(data.rehabBudget);
    if (data.arv) setArv(data.arv);
    if (data.downPayment) setDownPayment(data.downPayment);
    if (data.requestedRehabFunding) setRequestedRehabFunding(data.requestedRehabFunding);
    if (data.totalClosingCosts) setTotalClosingCosts(data.totalClosingCosts);
    if (data.annualTaxes) setAnnualTaxes(data.annualTaxes);
    if (data.annualInsurance) setAnnualInsurance(data.annualInsurance);
    if (data.annualHOA) setAnnualHOA(data.annualHOA);
    if (data.holdTimeMonths) setHoldTimeMonths(data.holdTimeMonths);
    if (data.creditScore) setCreditScore(data.creditScore);
    if (data.experience) setExperience(data.experience);
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
    const rate = calculatedRate;

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
  }, [arv, purchasePrice, rehabBudget, downPayment, requestedRehabFunding, totalClosingCosts, annualTaxes, annualInsurance, annualHOA, holdTimeMonths, calculatedRate]);

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
              Fix & Flip Analyzer
            </h1>
            <p className="text-sm text-muted-foreground">
              Calculate your deal profitability and ROI
            </p>
          </div>
          <ScenarioManager
            analyzerType="fix_flip"
            currentData={getCurrentScenarioData()}
            onLoadScenario={handleLoadScenario}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Property Type - Condensed Single Row */}
            <Card>
              <CardContent className="pt-4">
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
              </CardContent>
            </Card>

            {/* Property Details - Purchase → Rehab → ARV Order */}
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
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="purchasePrice" className="text-sm">Purchase Price</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="purchasePrice"
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-purchase-price"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="rehabBudget" className="text-sm">Rehab Budget</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="rehabBudget"
                        type="number"
                        value={rehabBudget}
                        onChange={(e) => setRehabBudget(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-rehab-budget"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="arv" className="text-sm">After Repair Value</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="arv"
                        type="number"
                        value={arv}
                        onChange={(e) => setArv(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-arv"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Borrower Profile - FICO & Experience */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 space-y-4">
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
                  <div>
                    <Label className="text-sm mb-2 block">Experience Level</Label>
                    <div className="flex gap-1.5">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setExperience(level.id)}
                          className={`flex-1 py-2 px-2 rounded-md border text-xs font-medium transition-all ${
                            experience === level.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                          data-testid={`button-experience-${level.id}`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rate Breakdown */}
              <Card>
                <CardContent className="pt-4">
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Rate:</span>
                      <span className="font-medium">9.900%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credit ({creditScore[0]}):</span>
                      <span className={`font-medium ${creditScore[0] < 720 ? "text-red-600" : ""}`}>
                        +{creditScore[0] >= 720 ? "0.000" : creditScore[0] >= 700 ? "0.500" : creditScore[0] >= 680 ? "1.000" : "1.500"}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience ({experience} deals):</span>
                      <span className={`font-medium ${experienceLevels.find(e => e.id === experience)?.rateAdj ? "text-red-600" : ""}`}>
                        +{experienceLevels.find(e => e.id === experience)?.rateAdj.toFixed(3) || "0.000"}%
                      </span>
                    </div>
                    <div className="border-t pt-1.5 mt-1.5 flex justify-between font-semibold text-sm">
                      <span>Your Rate:</span>
                      <span className="text-primary">{calculatedRate.toFixed(3)}%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground pt-1">
                      Min Down Payment: {minDownPaymentPercent}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financing Details */}
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm">Loan-to-Cost (LTC)</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={ltcSlider[0]}
                        onChange={(e) => {
                          const val = Math.min(parseInt(e.target.value) || 0, maxLtc);
                          setLtcSlider([val]);
                        }}
                        className="w-14 h-7 text-center text-sm"
                        max={maxLtc}
                        data-testid="input-ltc"
                      />
                      <span className="text-sm font-medium text-primary">%</span>
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
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>0%</span>
                    <span>{maxLtc}% Max</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="downPayment" className="text-sm">Down Payment</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="downPayment"
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-down-payment"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="rehabFunding" className="text-sm">Rehab Funding (90%)</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="rehabFunding"
                        type="number"
                        value={requestedRehabFunding}
                        onChange={(e) => setRequestedRehabFunding(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-rehab-funding"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="closingCosts" className="text-sm">Closing Costs</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="closingCosts"
                        type="number"
                        value={totalClosingCosts}
                        onChange={(e) => setTotalClosingCosts(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-closing-costs"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Holding Costs - Condensed */}
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="holdTime" className="text-sm">Hold (Months)</Label>
                    <Input
                      id="holdTime"
                      type="number"
                      value={holdTimeMonths}
                      onChange={(e) => setHoldTimeMonths(e.target.value)}
                      className="mt-1 h-9"
                      data-testid="input-hold-time"
                    />
                  </div>
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

          {/* Results Panel */}
          <div>
            <Card 
              className={`sticky top-4 border transition-colors ${
                results.roi >= 20 
                  ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"
                  : results.roi >= 10
                  ? "bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20"
                  : "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20"
              }`}
              data-testid="card-results"
            >
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Deal Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                {/* ROI and Profit Margin */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">ROI</p>
                    <p className={`text-lg font-bold ${results.roi >= 20 ? "text-green-600" : results.roi >= 10 ? "text-yellow-600" : "text-red-600"}`} data-testid="result-roi">
                      {results.roi.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Profit Margin</p>
                    <p className={`text-lg font-bold ${results.profitMargin >= 15 ? "text-green-600" : results.profitMargin >= 10 ? "text-yellow-600" : "text-red-600"}`} data-testid="result-profit-margin">
                      {results.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Total Profit and Cash Invested */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Total Profit</p>
                    <p className={`text-sm font-bold ${results.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="result-total-profit">
                      {formatCurrency(results.totalProfit)}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Cash Invested</p>
                    <p className="text-sm font-semibold" data-testid="result-cash-invested">
                      {formatCurrency(results.cashInvested)}
                    </p>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Loan Amount</p>
                    <p className="text-sm font-semibold" data-testid="result-loan-amount">
                      {formatCurrency(results.loanAmount)}
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Interest Rate</p>
                    <p className="text-sm font-bold text-primary" data-testid="result-interest-rate">
                      {calculatedRate.toFixed(3)}%
                    </p>
                  </div>
                </div>

                {/* LTC and LTV */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">LTC</p>
                    <p className={`text-sm font-bold ${results.ltc > 90 ? "text-red-600" : "text-green-600"}`} data-testid="result-ltc">
                      {results.ltc.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">LTV (ARV)</p>
                    <p className={`text-sm font-bold ${results.ltv > 70 ? "text-red-600" : results.ltv > 65 ? "text-yellow-600" : "text-green-600"}`} data-testid="result-ltv">
                      {results.ltv.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-background rounded-lg p-2.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Cost Breakdown</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase:</span>
                      <span className="font-medium">{formatCurrency(results.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rehab:</span>
                      <span className="font-medium">{formatCurrency(results.rehabBudget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Closing:</span>
                      <span className="font-medium">{formatCurrency(results.closingCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Holding:</span>
                      <span className="font-medium">{formatCurrency(results.holdingCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest:</span>
                      <span className="font-medium">{formatCurrency(results.interestCost)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(results.totalProjectCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Qualification Status - No emoji */}
                <div className={`p-2.5 rounded-lg border text-xs ${
                  results.roi >= 20 
                    ? "bg-green-500/10 border-green-500/20" 
                    : results.roi >= 10 
                    ? "bg-yellow-500/10 border-yellow-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}>
                  <span className={`font-semibold ${
                    results.roi >= 20 ? "text-green-600" : results.roi >= 10 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {results.roi >= 30 
                      ? "Excellent deal! Strong profit potential." 
                      : results.roi >= 20 
                      ? "Good deal! Solid returns expected."
                      : results.roi >= 10 
                      ? "Marginal - review costs carefully."
                      : "Consider renegotiating terms."}
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
