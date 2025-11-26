import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { CheckCircle2, AlertCircle, ArrowRight, HardHat, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ConstructionCalculator() {
  const [landCost, setLandCost] = useState("150000");
  const [constructionCost, setConstructionCost] = useState("350000");
  const [completedValue, setCompletedValue] = useState("650000");
  const [buildDuration, setBuildDuration] = useState("12");
  const [projectType, setProjectType] = useState<"spec" | "presold">("spec");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateConstruction = () => {
    const land = parseFloat(landCost) || 0;
    const construction = parseFloat(constructionCost) || 0;
    const completed = parseFloat(completedValue) || 0;
    const months = parseInt(buildDuration) || 12;
    
    const totalProjectCost = land + construction;
    const ltc = completed > 0 ? (totalProjectCost / completed) * 100 : 0;
    const ltv = completed > 0 ? (totalProjectCost / completed) * 100 : 0;
    
    const maxLTC = projectType === "presold" ? 0.85 : 0.825;
    const loanAmountLand = Math.min(land * 0.75, completed * 0.65);
    const loanAmountConstruction = Math.min(construction, (completed * maxLTC) - loanAmountLand);
    const totalLoanAmount = loanAmountLand + Math.max(0, loanAmountConstruction);
    
    const effectiveLTC = totalProjectCost > 0 ? (totalLoanAmount / totalProjectCost) * 100 : 0;
    
    const rate = 9.9 / 100 / 12;
    const avgDrawnAmount = totalLoanAmount * 0.5;
    const interestPayments = avgDrawnAmount * rate * months;
    
    const downPaymentRequired = land - loanAmountLand;
    const constructionCashRequired = Math.max(0, construction - loanAmountConstruction);
    const closingCosts = totalProjectCost * 0.025;
    const sellingCosts = completed * 0.06;
    const cashToClose = downPaymentRequired + closingCosts;
    const totalCashRequired = cashToClose + constructionCashRequired;
    
    const totalCosts = land + construction + interestPayments + closingCosts + sellingCosts;
    const profit = completed - totalCosts;
    const roi = totalCashRequired > 0 ? (profit / totalCashRequired) * 100 : 0;
    const annualizedROI = months > 0 ? (roi / months) * 12 : 0;
    
    let qualificationStatus: "excellent" | "good" | "marginal" | "needs-review" = "needs-review";
    if (ltc <= 70) qualificationStatus = "excellent";
    else if (ltc <= 80) qualificationStatus = "good";
    else if (ltc <= 90) qualificationStatus = "marginal";
    
    return {
      totalProjectCost,
      ltc: ltc.toFixed(1),
      effectiveLTC: effectiveLTC.toFixed(1),
      loanAmountLand,
      loanAmountConstruction: Math.max(0, loanAmountConstruction),
      totalLoanAmount,
      interestPayments,
      downPaymentRequired,
      constructionCashRequired,
      closingCosts,
      sellingCosts,
      cashToClose,
      totalCashRequired,
      profit,
      roi: roi.toFixed(1),
      annualizedROI: annualizedROI.toFixed(1),
      qualificationStatus,
    };
  };

  const results = calculateConstruction();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardHat className="h-6 w-6 text-primary" />
          Construction Loan Calculator
        </CardTitle>
        <CardDescription>
          Estimate your ground-up construction financing and returns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="landCost" className="flex items-center gap-1">
                Land / Lot Cost ($)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">Purchase price of the land or lot</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="landCost"
                type="number"
                value={landCost}
                onChange={(e) => setLandCost(e.target.value)}
                placeholder="150000"
                data-testid="input-construction-land"
              />
            </div>

            <div>
              <Label htmlFor="constructionCost" className="flex items-center gap-1">
                Construction Budget ($)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">Total hard and soft costs for construction</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="constructionCost"
                type="number"
                value={constructionCost}
                onChange={(e) => setConstructionCost(e.target.value)}
                placeholder="350000"
                data-testid="input-construction-budget"
              />
            </div>

            <div>
              <Label className="flex items-center gap-1 mb-2">
                Project Type
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">Pre-sold homes may qualify for higher LTC</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select value={projectType} onValueChange={(v) => setProjectType(v as "spec" | "presold")}>
                <SelectTrigger data-testid="select-construction-type">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spec">Spec Home (For Sale)</SelectItem>
                  <SelectItem value="presold">Pre-Sold / Contract in Place</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="completedValue" className="flex items-center gap-1">
                Completed Value ($)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">Expected market value when construction is complete</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="completedValue"
                type="number"
                value={completedValue}
                onChange={(e) => setCompletedValue(e.target.value)}
                placeholder="650000"
                data-testid="input-construction-completed"
              />
            </div>

            <div>
              <Label htmlFor="buildDuration">Build Duration (months)</Label>
              <Input
                id="buildDuration"
                type="number"
                value={buildDuration}
                onChange={(e) => setBuildDuration(e.target.value)}
                placeholder="12"
                data-testid="input-construction-duration"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Typical range: 9-18 months
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Estimated Profit</p>
              <p className={`text-3xl font-bold ${results.profit >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-construction-profit">
                {formatCurrency(results.profit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Return on Investment</p>
              <p className={`text-3xl font-bold ${parseFloat(results.roi) >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-construction-roi">
                {results.roi}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Total Cash Required</p>
              <p className="text-lg font-semibold" data-testid="text-construction-cash">
                {formatCurrency(results.totalCashRequired)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Loan-to-Cost</p>
              <p className="text-lg font-semibold" data-testid="text-construction-ltc">
                {results.effectiveLTC}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Annualized ROI</p>
              <p className="text-lg font-semibold" data-testid="text-construction-annual-roi">
                {results.annualizedROI}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Project Cost:</span>
              <span className="font-medium">{formatCurrency(results.totalProjectCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Loan Amount:</span>
              <span className="font-medium">{formatCurrency(results.totalLoanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Land Financing:</span>
              <span className="font-medium">{formatCurrency(results.loanAmountLand)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Construction Financing:</span>
              <span className="font-medium">{formatCurrency(results.loanAmountConstruction)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Interest (avg drawn):</span>
              <span className="font-medium">{formatCurrency(results.interestPayments)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selling Costs (6%):</span>
              <span className="font-medium">{formatCurrency(results.sellingCosts)}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            {results.qualificationStatus === "excellent" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Excellent project metrics! Strong financing potential.</span>
              </div>
            )}
            {results.qualificationStatus === "good" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Good project! LTC within standard guidelines.</span>
              </div>
            )}
            {results.qualificationStatus === "marginal" && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Higher LTC - may require additional equity.</span>
              </div>
            )}
            {results.qualificationStatus === "needs-review" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Let's review your project together.</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">Loan Terms (Est.)</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest Rate:</span>
              <span className="font-medium">9.90%+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Term:</span>
              <span className="font-medium">12-18 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max LTC:</span>
              <span className="font-medium">{projectType === "presold" ? "85%" : "82.5%"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Draw Turnaround:</span>
              <span className="font-medium">48 hours</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/get-quote">
            <Button size="lg" data-testid="button-construction-calc-apply">
              Get Your Rate
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
