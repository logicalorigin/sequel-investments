import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Save, 
  FolderOpen, 
  ChevronDown, 
  Trash2, 
  Clock,
  FileText,
  Loader2,
  FileDown,
  Printer,
  DollarSign,
  Home,
  Percent,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { SavedScenario } from "@shared/schema";
import { DSCREstimatePDF } from "./DSCREstimatePDF";

interface ScenarioManagerProps {
  analyzerType: "dscr" | "fix_flip" | "construction";
  currentData: Record<string, any>;
  onLoadScenario: (data: Record<string, any>) => void;
  resultsData?: Record<string, any>;
  userName?: string;
}

export function ScenarioManager({
  analyzerType,
  currentData,
  onLoadScenario,
  resultsData,
  userName,
}: ScenarioManagerProps) {
  const { toast } = useToast();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Map fix_flip to fixflip to match schema enum
  const schemaType = analyzerType === 'fix_flip' ? 'fixflip' : analyzerType;
  
  const { data: scenarios = [], isLoading } = useQuery<SavedScenario[]>({
    queryKey: [`/api/scenarios?type=${schemaType}`],
  });

  const saveMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/scenarios", {
        name,
        type: schemaType,
        data: currentData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/scenarios?type=${schemaType}`] });
      setSaveDialogOpen(false);
      setScenarioName("");
      toast({
        title: "Scenario Saved",
        description: "Your analysis has been saved to your library.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Could not save the scenario. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/scenarios/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scenarios", analyzerType] });
      toast({
        title: "Scenario Deleted",
        description: "The scenario has been removed from your library.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the scenario. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!scenarioName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your scenario.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(scenarioName.trim());
  };

  const handleLoad = (scenario: SavedScenario) => {
    try {
      const scenarioData = typeof scenario.data === 'string' 
        ? JSON.parse(scenario.data as string) 
        : scenario.data;
      onLoadScenario(scenarioData as Record<string, any>);
      setLoadDialogOpen(false);
      toast({
        title: "Scenario Loaded",
        description: `"${scenario.name}" has been loaded into the analyzer.`,
      });
    } catch {
      toast({
        title: "Load Failed",
        description: "Could not parse the saved scenario data.",
        variant: "destructive",
      });
    }
  };

  const analyzerTypeLabel = {
    dscr: "DSCR",
    fix_flip: "Fix & Flip",
    construction: "Construction",
  }[analyzerType];

  // Filter scenarios by the mapped schema type
  const filteredScenarios = scenarios.filter(s => s.type === schemaType);

  // Helper to format currency compactly
  const formatCompactCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null || Number.isNaN(value)) return "N/A";
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Extract loan info from scenario data for display
  const getScenarioLoanInfo = (scenario: SavedScenario) => {
    try {
      const data = typeof scenario.data === 'string' 
        ? JSON.parse(scenario.data) 
        : scenario.data;
      
      if (!data) return null;

      if (schemaType === 'dscr') {
        return {
          propertyValue: parseFloat(data.propertyValue) || 0,
          loanAmount: parseFloat(data.requestedLoanAmount) || 0,
          monthlyRent: parseFloat(data.monthlyRent) || 0,
          address: data.propertyAddress || "",
        };
      } else if (schemaType === 'fixflip') {
        return {
          purchasePrice: parseFloat(data.purchasePrice) || 0,
          arv: parseFloat(data.arv) || 0,
          rehabBudget: parseFloat(data.rehabBudget) || 0,
          address: data.propertyAddress || "",
        };
      } else if (schemaType === 'construction') {
        return {
          landCost: parseFloat(data.landCost) || 0,
          constructionBudget: parseFloat(data.constructionBudget) || 0,
          arv: parseFloat(data.arv) || 0,
          address: data.propertyAddress || "",
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleExportPDF = () => {
    if (analyzerType === "dscr" && resultsData) {
      setPdfDialogOpen(true);
    } else {
      window.print();
      toast({
        title: "PDF Export",
        description: "Use your browser's print dialog to save as PDF.",
      });
    }
  };

  const handlePrintPDF = () => {
    if (pdfRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>DSCR Estimate - Sequel Investments</title>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Inter', system-ui, sans-serif; }
                @page { size: letter; margin: 0.5in; }
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              ${pdfRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  // Prepare DSCR PDF data
  const dscrPdfData = analyzerType === "dscr" && resultsData ? {
    propertyAddress: currentData.propertyAddress || "",
    propertyType: currentData.propertyType || "sfr",
    transactionType: currentData.transactionType || "purchase",
    rentalType: currentData.rentalType || "long_term",
    propertyValue: parseFloat(currentData.propertyValue) || 0,
    loanAmount: resultsData.loanAmount || 0,
    ltv: resultsData.ltv || 0,
    monthlyRent: parseFloat(currentData.monthlyRent) || 0,
    annualTaxes: parseFloat(currentData.annualTaxes) || 0,
    annualInsurance: parseFloat(currentData.annualInsurance) || 0,
    annualHOA: parseFloat(currentData.annualHOA) || 0,
    creditScore: currentData.creditScore?.[0] || 740,
    calculatedRate: resultsData.calculatedRate || 0,
    dscrRatio: resultsData.dscrRatio || 0,
    monthlyPI: resultsData.monthlyPI || 0,
    monthlyTIA: resultsData.monthlyTIA || 0,
    monthlyPITIA: resultsData.monthlyPITIA || 0,
    monthlyCashFlow: resultsData.monthlyCashFlow || 0,
    cashToClose: resultsData.cashToClose || 0,
    cashToBorrower: resultsData.cashToBorrower || 0,
  } : null;

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-save-scenario">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Scenario</DialogTitle>
            <DialogDescription>
              Save this {analyzerTypeLabel} analysis to your library for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                placeholder="e.g., 123 Main St Analysis"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                data-testid="input-scenario-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending || !scenarioName.trim()}
              data-testid="button-confirm-save"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Scenario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-load-scenario">
            <FolderOpen className="h-4 w-4 mr-2" />
            Load
            {filteredScenarios.length > 0 && (
              <span className="ml-2 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {filteredScenarios.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Load Scenario</DialogTitle>
            <DialogDescription>
              Select a saved {analyzerTypeLabel} scenario to load.
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading scenarios...</p>
            </div>
          ) : filteredScenarios.length > 0 ? (
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-2">
                {filteredScenarios.map((scenario) => {
                  const loanInfo = getScenarioLoanInfo(scenario);
                  return (
                    <div
                      key={scenario.id}
                      className="p-3 rounded-lg border hover-elevate cursor-pointer group"
                      onClick={() => handleLoad(scenario)}
                      data-testid={`scenario-item-${scenario.id}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <p className="font-medium text-sm truncate">{scenario.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(scenario.id);
                          }}
                          data-testid={`button-delete-scenario-${scenario.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                      
                      {loanInfo && (
                        <div className="bg-muted/50 rounded-md p-2 mb-2">
                          {loanInfo.address && (
                            <p className="text-xs text-muted-foreground truncate mb-1 flex items-center gap-1">
                              <Home className="h-3 w-3" />
                              {loanInfo.address}
                            </p>
                          )}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {schemaType === 'dscr' && 'propertyValue' in loanInfo && (
                              <>
                                <div>
                                  <span className="text-muted-foreground">Value:</span>
                                  <span className="ml-1 font-medium">{formatCompactCurrency(loanInfo.propertyValue)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Loan:</span>
                                  <span className="ml-1 font-medium">{formatCompactCurrency(loanInfo.loanAmount)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Rent:</span>
                                  <span className="ml-1 font-medium">{formatCompactCurrency(loanInfo.monthlyRent)}/mo</span>
                                </div>
                              </>
                            )}
                            {schemaType === 'fixflip' && 'purchasePrice' in loanInfo && (
                              <>
                                <div>
                                  <span className="text-muted-foreground">Purchase:</span>
                                  <span className="ml-1 font-medium">{formatCompactCurrency(loanInfo.purchasePrice)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">ARV:</span>
                                  <span className="ml-1 font-medium">{formatCompactCurrency(loanInfo.arv)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Rehab:</span>
                                  <span className="ml-1 font-medium">{formatCompactCurrency(loanInfo.rehabBudget)}</span>
                                </div>
                              </>
                            )}
                            {schemaType === 'construction' && 'landCost' in loanInfo && (
                              <>
                                <div>
                                  <span className="text-muted-foreground">Land:</span>
                                  <span className="ml-1 font-medium">{formatCompactCurrency(loanInfo.landCost)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Build:</span>
                                  <span className="ml-1 font-medium">{formatCompactCurrency(loanInfo.constructionBudget)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">ARV:</span>
                                  <span className="ml-1 font-medium">{formatCompactCurrency(loanInfo.arv)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(scenario.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-8 text-center">
              <FolderOpen className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No saved scenarios yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Save your first analysis to build your library
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportPDF}
        data-testid="button-export-pdf"
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export PDF
      </Button>

      {/* PDF Preview Dialog for DSCR */}
      {analyzerType === "dscr" && dscrPdfData && (
        <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>DSCR Estimate Preview</DialogTitle>
              <DialogDescription>
                Preview your estimate before printing or saving as PDF.
              </DialogDescription>
            </DialogHeader>
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="transform scale-[0.7] origin-top-left w-[142%]">
                <DSCREstimatePDF ref={pdfRef} data={dscrPdfData} userName={userName} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPdfDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePrintPDF} data-testid="button-print-pdf">
                <Printer className="h-4 w-4 mr-2" />
                Print / Save as PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
