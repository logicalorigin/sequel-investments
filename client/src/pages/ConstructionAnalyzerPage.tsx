import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePropertyAutofill } from "@/hooks/usePropertyAutofill";
import { useLocation, useSearch } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LoanApplication } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { PropertyMapPreview } from "@/components/PropertyMapPreview";
import { PortalHeader } from "@/components/PortalHeader";
import { ScenarioManager } from "@/components/ScenarioManager";
import { 
  TrendingUp,
  Home,
  FileText,
  HardHat,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import { Slider } from "@/components/ui/slider";

const propertyTypes = [
  { id: "sfr", label: "SFR", icon: "sfr" },
  { id: "duplex", label: "2-Unit", icon: "duplex" },
  { id: "triplex", label: "3-Unit", icon: "triplex" },
  { id: "fourplex", label: "4-Unit", icon: "fourplex" },
  { id: "townhome", label: "Condo", icon: "townhome" },
];

const experienceLevels = [
  { id: "0", label: "0 Builds", rateAdj: 0 },
  { id: "1", label: "1-2 Builds", rateAdj: 0 },
  { id: "3-5", label: "3-5 Builds", rateAdj: 0 },
  { id: "6-10", label: "6-10 Builds", rateAdj: 0 },
  { id: "10+", label: "10+ Builds", rateAdj: 0 },
];

const loanTermOptions = [9, 12, 15, 18, 21, 24];

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

export default function ConstructionAnalyzerPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();

  const applicationId = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get("applicationId");
  }, [searchString]);

  const { data: linkedApplication } = useQuery<LoanApplication>({
    queryKey: ["/api/applications", applicationId],
    enabled: !!applicationId && isAuthenticated,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [propertyType, setPropertyType] = useState("sfr");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyLatitude, setPropertyLatitude] = useState(0);
  const [propertyLongitude, setPropertyLongitude] = useState(0);
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [valueSource, setValueSource] = useState<string>("");
  const [propertyState, setPropertyState] = useState("");
  const [landCost, setLandCost] = useState("100000");
  const [constructionBudget, setConstructionBudget] = useState("350000");
  const [arv, setArv] = useState("550000");
  const [annualTaxes, setAnnualTaxes] = useState("6000");
  const [annualInsurance, setAnnualInsurance] = useState("3600");
  const [loanTermMonths, setLoanTermMonths] = useState(9);
  const [creditScore, setCreditScore] = useState([720]);
  const [experience, setExperience] = useState("0");
  const [ltcSlider, setLtcSlider] = useState([90]);
  const [landOwned, setLandOwned] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { fetchPropertyData, isLoading: isAutofilling } = usePropertyAutofill({
    onDataLoaded: (data) => {
      if (data.propertyValue) {
        const estimatedLandCost = Math.round(data.propertyValue * 0.25);
        setLandCost(estimatedLandCost.toString());
        const estimatedArv = Math.round(data.propertyValue * 1.4);
        setArv(estimatedArv.toString());
        setEstimatedValue(data.propertyValue);
        setValueSource(data.source === "rentcast" ? "RentCast" : "Estimated");
      }
      if (data.annualTaxes) {
        setAnnualTaxes(data.annualTaxes.toString());
      }
      if (data.annualInsurance) {
        setAnnualInsurance(data.annualInsurance.toString());
      }
    },
  });

  const handleAddressSelect = useCallback(async (place: { 
    formatted_address?: string; 
    address_components?: Array<{ long_name: string; short_name: string; types: string[] }>;
    geometry?: { location?: { lat: () => number; lng: () => number } };
  }) => {
    let city = "";
    let state = "";
    let zip = "";
    let streetAddress = place.formatted_address || "";

    if (place.address_components) {
      for (const component of place.address_components) {
        if (component.types.includes("locality")) {
          city = component.long_name;
        } else if (component.types.includes("administrative_area_level_1")) {
          state = component.short_name;
        } else if (component.types.includes("postal_code")) {
          zip = component.long_name;
        }
      }
    }

    if (place.geometry?.location) {
      setPropertyLatitude(place.geometry.location.lat());
      setPropertyLongitude(place.geometry.location.lng());
    }

    if (state) {
      setPropertyState(state);
    }

    if (streetAddress) {
      await fetchPropertyData(streetAddress, city, state, zip);
    }
  }, [fetchPropertyData]);

  const maxLtc = 90;

  const handleLtcSliderChange = useCallback((value: number[]) => {
    const clampedValue = Math.max(0, Math.min(value[0], maxLtc));
    setLtcSlider([clampedValue]);
  }, [maxLtc]);

  const isCaliforniaProperty = propertyState === "CA";
  const baseRate = isCaliforniaProperty ? 8.9 : 9.9;

  const calculatedRate = useMemo(() => {
    let rate = baseRate;
    
    const score = creditScore[0];
    if (score >= 720) rate += 0;
    else if (score >= 700) rate += 0.5;
    else if (score >= 680) rate += 1.0;
    else rate += 1.5;
    
    return Math.max(baseRate, Math.min(12.9, rate));
  }, [creditScore, baseRate]);

  // Origination points: 1% for most qualified (lowest rate), 3% for least qualified (highest rate)
  const originationPoints = useMemo(() => {
    const minRate = baseRate;
    const maxRate = 12.9;
    const minPoints = 1.0; // Best borrowers get 1%
    const maxPoints = 3.0; // Least qualified get 3%
    
    if (calculatedRate <= minRate) return minPoints;
    if (calculatedRate >= maxRate) return maxPoints;
    
    const rateRange = maxRate - minRate;
    const ratePosition = (calculatedRate - minRate) / rateRange;
    return minPoints + (ratePosition * (maxPoints - minPoints));
  }, [calculatedRate, baseRate]);

  const getCurrentScenarioData = useCallback(() => ({
    propertyType,
    propertyAddress,
    propertyState,
    landCost,
    constructionBudget,
    arv,
    annualTaxes,
    annualInsurance,
    loanTermMonths,
    creditScore,
    experience,
    ltcSlider,
    landOwned,
  }), [propertyType, propertyAddress, propertyState, landCost, constructionBudget, arv, annualTaxes, annualInsurance, loanTermMonths, creditScore, experience, ltcSlider, landOwned]);

  const handleLoadScenario = useCallback((data: Record<string, any>) => {
    if (data.propertyType) setPropertyType(data.propertyType);
    if (data.propertyAddress) setPropertyAddress(data.propertyAddress);
    if (data.propertyState) setPropertyState(data.propertyState);
    if (data.landCost) setLandCost(data.landCost);
    if (data.constructionBudget) setConstructionBudget(data.constructionBudget);
    if (data.arv) setArv(data.arv);
    if (data.annualTaxes) setAnnualTaxes(data.annualTaxes);
    if (data.annualInsurance) setAnnualInsurance(data.annualInsurance);
    if (data.loanTermMonths) setLoanTermMonths(data.loanTermMonths);
    if (data.creditScore) setCreditScore(data.creditScore);
    if (data.experience) setExperience(data.experience);
    if (data.ltcSlider) setLtcSlider(data.ltcSlider);
    if (typeof data.landOwned === 'boolean') setLandOwned(data.landOwned);
  }, []);

  useEffect(() => {
    if (linkedApplication?.analyzerData && !dataLoaded) {
      const data = linkedApplication.analyzerData as { inputs?: Record<string, any> };
      if (data.inputs) {
        handleLoadScenario(data.inputs);
        setDataLoaded(true);
        toast({
          title: "Analysis Loaded",
          description: "Your saved analysis data has been loaded.",
        });
      }
    }
  }, [linkedApplication, dataLoaded, handleLoadScenario, toast]);

  const createApplicationMutation = useMutation({
    mutationFn: async () => {
      const analyzerData = {
        inputs: getCurrentScenarioData(),
        results: results,
      };
      const response = await apiRequest("POST", "/api/applications", {
        loanType: "New Construction",
        propertyAddress: propertyAddress || "TBD",
        arv: parseFloat(arv) || 0,
        purchasePrice: parseFloat(landCost) || 0,
        rehabBudget: parseFloat(constructionBudget) || 0,
        loanAmount: results.loanAmount,
        interestRate: calculatedRate.toFixed(3),
        ltc: results.ltc.toFixed(1),
        annualTaxes: parseFloat(annualTaxes) || 0,
        annualInsurance: parseFloat(annualInsurance) || 0,
        holdTimeMonths: loanTermMonths,
        analyzerType: "construction",
        analyzerData: analyzerData,
      });
      return response.json();
    },
    onSuccess: (data: LoanApplication) => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Created",
        description: "Your New Construction loan application has been started.",
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
    const landCostVal = parseFloat(landCost) || 0;
    const constructionBudgetVal = parseFloat(constructionBudget) || 0;
    const taxesVal = parseFloat(annualTaxes) || 0;
    const insuranceVal = parseFloat(annualInsurance) || 0;
    const holdMonths = loanTermMonths;
    const rate = calculatedRate;

    const totalCost = landCostVal + constructionBudgetVal;
    const targetLtc = ltcSlider[0] / 100;
    
    const closingCostsVal = Math.round(totalCost * 0.025);
    
    let loanAmount: number;
    let downPaymentVal: number;
    let constructionFundingVal: number;
    let landLoanPortion: number;
    let constructionEquityVal: number;
    let landEquityVal: number;
    
    let cashInvested: number;
    
    if (landOwned) {
      constructionFundingVal = Math.round(constructionBudgetVal * targetLtc);
      constructionEquityVal = constructionBudgetVal - constructionFundingVal;
      landLoanPortion = 0;
      downPaymentVal = constructionEquityVal;
      loanAmount = constructionFundingVal;
      landEquityVal = landCostVal;
      cashInvested = closingCostsVal + constructionEquityVal;
    } else {
      landLoanPortion = Math.round(landCostVal * targetLtc);
      constructionFundingVal = Math.round(constructionBudgetVal * targetLtc);
      loanAmount = landLoanPortion + constructionFundingVal;
      const landDownPayment = landCostVal - landLoanPortion;
      constructionEquityVal = constructionBudgetVal - constructionFundingVal;
      downPaymentVal = landDownPayment;
      landEquityVal = 0;
      cashInvested = downPaymentVal + closingCostsVal + constructionEquityVal;
    }
    
    const ltv = arvVal > 0 ? (loanAmount / arvVal) * 100 : 0;

    const monthlyTaxes = taxesVal / 12;
    const monthlyInsurance = insuranceVal / 12;
    const monthlyTIA = monthlyTaxes + monthlyInsurance;

    const holdingCosts = monthlyTIA * holdMonths;
    const interestCost = (loanAmount * (rate / 100)) * (holdMonths / 12);

    const totalProjectCost = landCostVal + constructionBudgetVal + closingCostsVal + holdingCosts + interestCost;
    
    const totalCapitalDeployed = cashInvested + landEquityVal + holdingCosts + interestCost;
    
    const totalProfit = arvVal - totalProjectCost;
    // ROI = Profit / Total Cost - reflects deal quality independent of leverage
    const roi = totalProjectCost > 0 ? (totalProfit / totalProjectCost) * 100 : 0;
    const profitMargin = arvVal > 0 ? (totalProfit / arvVal) * 100 : 0;

    const ltc = totalCost > 0 ? (loanAmount / totalCost) * 100 : 0;

    return {
      totalProjectCost,
      cashInvested,
      totalCapitalDeployed,
      totalProfit,
      roi,
      profitMargin,
      ltv,
      ltc,
      loanAmount,
      landCost: landCostVal,
      constructionBudget: constructionBudgetVal,
      closingCosts: closingCostsVal,
      holdingCosts,
      interestCost,
      downPayment: downPaymentVal,
      constructionFunding: constructionFundingVal,
      constructionEquity: constructionEquityVal,
      landEquity: landEquityVal,
    };
  }, [arv, landCost, constructionBudget, annualTaxes, annualInsurance, loanTermMonths, calculatedRate, ltcSlider, landOwned]);

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
      <PortalHeader 
        user={user} 
        title="Construction Analyzer"
        backHref={applicationId ? `/portal/application/${applicationId}` : undefined}
        titleExtra={
          <ScenarioManager
            analyzerType="construction"
            currentData={getCurrentScenarioData()}
            onLoadScenario={handleLoadScenario}
          />
        }
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Inputs column - order-last on mobile so results appears first */}
          <div className="lg:col-span-2 space-y-4 order-last lg:order-first">
            {/* Property Type - Condensed Single Row */}
            <Card>
              <CardContent className="pt-3 sm:pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Label className="sm:w-24 shrink-0 text-xs sm:text-sm">Property</Label>
                  <div className="flex gap-1 sm:gap-1.5 flex-1">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setPropertyType(type.id)}
                        className={`flex-1 min-w-[48px] py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-md border transition-all flex flex-col items-center gap-0.5 sm:gap-1 ${
                          propertyType === type.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`button-property-type-${type.id}`}
                      >
                        <PropertyTypeIcon type={type.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-[8px] sm:text-[10px] font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details - Land → Construction → ARV, then Loan Term & Holding Costs */}
            <Card>
              <CardContent className="pt-3 sm:pt-4 space-y-3">
                <div>
                  <Label className="text-xs sm:text-sm">Property Address {isAutofilling && <Loader2 className="inline-block h-3 w-3 ml-1 animate-spin" />}</Label>
                  <AddressAutocomplete
                    value={propertyAddress}
                    onChange={setPropertyAddress}
                    onPlaceSelect={handleAddressSelect}
                    placeholder="Enter property address"
                    className="mt-1"
                    data-testid="input-property-address"
                  />
                  {isAutofilling && (
                    <p className="text-xs text-muted-foreground mt-1">Loading property data...</p>
                  )}
                  {propertyLatitude !== 0 && propertyLongitude !== 0 && (
                    <div className="mt-3">
                      <PropertyMapPreview
                        latitude={propertyLatitude}
                        longitude={propertyLongitude}
                        address={propertyAddress}
                        estimatedValue={estimatedValue || undefined}
                        isLoadingValue={isAutofilling}
                        valueSource={valueSource}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="landCost" className="text-xs sm:text-sm">Land Cost</Label>
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          id="landOwned"
                          checked={landOwned}
                          onCheckedChange={(checked) => setLandOwned(checked as boolean)}
                          className="h-3 w-3"
                          data-testid="checkbox-land-owned"
                        />
                        <label htmlFor="landOwned" className="text-[10px] text-muted-foreground cursor-pointer">
                          Owned
                        </label>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="landCost"
                        type="number"
                        value={landCost}
                        onChange={(e) => setLandCost(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-land-cost"
                      />
                    </div>
                    {landOwned && (
                      <p className="text-[10px] text-green-600 mt-0.5">As equity</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="constructionBudget" className="text-xs sm:text-sm">Construction Budget</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        id="constructionBudget"
                        type="number"
                        value={constructionBudget}
                        onChange={(e) => setConstructionBudget(e.target.value)}
                        className="pl-7 h-9"
                        data-testid="input-construction-budget"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="arv" className="text-xs sm:text-sm">After Completion Value</Label>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="loanTerm" className="text-xs sm:text-sm">Loan Term</Label>
                    <select
                      id="loanTerm"
                      value={loanTermMonths}
                      onChange={(e) => setLoanTermMonths(parseInt(e.target.value))}
                      className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      data-testid="select-loan-term"
                    >
                      {loanTermOptions.map((months) => (
                        <option key={months} value={months}>
                          {months} Mo
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="annualTaxes" className="text-xs sm:text-sm">Annual Taxes</Label>
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
                    <Label htmlFor="annualInsurance" className="text-xs sm:text-sm">Insurance</Label>
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
                </div>
              </CardContent>
            </Card>

            {/* Borrower Profile - FICO, Experience & LTC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-3 sm:pt-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-xs sm:text-sm">Credit Score</Label>
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
                    <Label className="text-xs sm:text-sm mb-2 block">Build Experience</Label>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setExperience(level.id)}
                          className={`flex-1 min-w-[55px] py-1.5 sm:py-2 px-1 rounded-md border text-[9px] sm:text-[10px] font-medium transition-all ${
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
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="text-xs sm:text-sm">Loan-to-Cost (LTC)</Label>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={ltcSlider[0]}
                          onChange={(e) => {
                            const val = Math.min(parseInt(e.target.value) || 0, maxLtc);
                            setLtcSlider([val]);
                          }}
                          className="w-12 sm:w-14 h-7 text-center text-xs sm:text-sm"
                          max={maxLtc}
                          data-testid="input-ltc"
                        />
                        <span className="text-xs sm:text-sm font-medium text-primary">%</span>
                      </div>
                    </div>
                    <Slider
                      value={ltcSlider}
                      onValueChange={handleLtcSliderChange}
                      min={0}
                      max={maxLtc}
                      step={5}
                      className="w-full"
                      data-testid="slider-ltc"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                      <span>0%</span>
                      <span>{maxLtc}% Max</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rate Breakdown */}
              <Card>
                <CardContent className="pt-3 sm:pt-4">
                  <div className="bg-muted/50 rounded-lg p-2.5 sm:p-3 space-y-1.5 text-[10px] sm:text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Base Rate{isCaliforniaProperty ? " (CA)" : ""}:</span>
                      <span className="font-medium">{baseRate.toFixed(3)}%</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Credit ({creditScore[0]}):</span>
                      <span className={`font-medium ${creditScore[0] < 720 ? "text-red-600" : ""}`}>
                        +{creditScore[0] >= 720 ? "0.000" : creditScore[0] >= 700 ? "0.500" : creditScore[0] >= 680 ? "1.000" : "1.500"}%
                      </span>
                    </div>
                    <div className="border-t pt-1.5 mt-1.5 flex justify-between gap-2 font-semibold text-xs sm:text-sm">
                      <span>Estimated Rate:</span>
                      <span className="text-primary">{calculatedRate.toFixed(3)}%</span>
                    </div>
                    <div className="flex justify-between gap-2 pt-1.5 border-t mt-1.5">
                      <span className="text-muted-foreground">Origination Points:</span>
                      <span className="font-semibold text-primary">{originationPoints.toFixed(2)}%</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-muted-foreground pt-1 italic text-center">
                      Contact your rep for accurate estimate
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Results Panel */}
          <div>
            <Card 
              className={`sticky top-4 border transition-colors ${
                results.roi >= 15 
                  ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"
                  : results.roi >= 10
                  ? "bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20"
                  : "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20"
              }`}
              data-testid="card-results"
            >
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Build Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-3">
                {/* Return on Investment */}
                <div className="bg-background rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Return on Investment</p>
                  <p className={`text-2xl font-bold ${results.roi >= 15 ? "text-green-600" : results.roi >= 10 ? "text-yellow-600" : "text-red-600"}`} data-testid="result-roi">{results.roi.toFixed(1)}%</p>
                </div>

                {/* Loan Details */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Loan Amount</p>
                    <p className="text-sm font-semibold" data-testid="result-loan-amount">{formatCurrency(results.loanAmount)}</p>
                  </div>
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Interest Rate</p>
                    <p className="text-sm font-bold text-primary" data-testid="result-interest-rate">{calculatedRate.toFixed(3)}%</p>
                  </div>
                </div>

                {/* LTC / LTV Combined */}
                <div className="bg-background rounded-lg p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">LTC</p>
                      <p className={`text-sm font-bold ${results.ltc > 90 ? "text-red-600" : "text-green-600"}`} data-testid="result-ltc">{results.ltc.toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase">LTV (ACV)</p>
                      <p className={`text-sm font-bold ${results.ltv > 70 ? "text-red-600" : results.ltv > 65 ? "text-yellow-600" : "text-green-600"}`} data-testid="result-ltv">{results.ltv.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                {/* Deal Breakdown */}
                <div className="bg-background rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Deal Breakdown</p>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Land{landOwned ? " (Equity)" : ""}:</span>
                      <span className="font-medium">{formatCurrency(results.landCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Construction:</span>
                      <span className="font-medium">{formatCurrency(results.constructionBudget)}</span>
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
                      <span>Total Cost:</span>
                      <span>{formatCurrency(results.totalProjectCost)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">ACV (Sale):</span>
                      <span className="font-medium">{formatCurrency(parseFloat(arv) || 0)}</span>
                    </div>
                    <div className={`flex justify-between pt-1 border-t font-bold ${results.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      <span>Est. Profit:</span>
                      <span data-testid="result-total-profit">{formatCurrency(results.totalProfit)}</span>
                    </div>
                  </div>
                </div>

                {/* Qualification Status */}
                <div className={`p-2 rounded-lg border text-xs ${
                  results.roi >= 15 ? "bg-green-500/10 border-green-500/20" : results.roi >= 10 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20"
                }`}>
                  <span className={`font-semibold ${results.roi >= 15 ? "text-green-600" : results.roi >= 10 ? "text-yellow-600" : "text-red-600"}`}>
                    {results.roi >= 20 ? "Excellent deal! Strong profit potential." : results.roi >= 15 ? "Good deal! Solid returns expected." : results.roi >= 10 ? "Marginal - review costs carefully." : "Consider renegotiating terms."}
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
