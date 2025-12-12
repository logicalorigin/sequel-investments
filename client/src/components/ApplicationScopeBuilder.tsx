import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HardHat,
  Plus,
  Save,
  Check,
  X,
  DollarSign,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Send,
  Pencil,
  Upload,
  FileSpreadsheet,
  Download,
  FileText,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import type { 
  ApplicationScopeItem, 
  ScopeOfWorkCategory 
} from "@shared/schema";
import { 
  DEFAULT_SCOPE_OF_WORK_ITEMS, 
  SCOPE_OF_WORK_CATEGORY_NAMES,
  getSOWTemplateForLoanType,
  getCategoryNamesForLoanType,
} from "@shared/schema";

interface ApplicationScopeBuilderProps {
  applicationId: string;
  readOnly?: boolean;
  desiredRehabBudget?: number | null;
  onUpdateRehabBudget?: (newBudget: number) => Promise<void>;
  loanType?: string;
}

interface SOWParsedItem {
  category: ScopeOfWorkCategory;
  itemName: string;
  description?: string;
  budgetAmount: number;
  laborCost?: number;
  materialCost?: number;
  quantity?: number;
  unit?: string;
}

interface SOWParseResult {
  success: boolean;
  items: SOWParsedItem[];
  totalBudget: number;
  parsingMethod: "template" | "ai";
  warnings: string[];
  errors: string[];
  fileName?: string;
}

const categoryOrder: ScopeOfWorkCategory[] = [
  "soft_costs",
  "demo_foundation",
  "hvac_plumbing_electrical",
  "interior",
  "exterior",
];

function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ApplicationScopeBuilder({ 
  applicationId, 
  readOnly = false,
  desiredRehabBudget,
  onUpdateRehabBudget,
  loanType = "Fix & Flip",
}: ApplicationScopeBuilderProps) {
  const { toast } = useToast();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editBudgetValue, setEditBudgetValue] = useState<string>("");
  const [showMismatchDialog, setShowMismatchDialog] = useState(false);
  const [newBudgetValue, setNewBudgetValue] = useState<string>("");
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
  const [isScopeExpanded, setIsScopeExpanded] = useState(true);
  const [isScopeSubmitted, setIsScopeSubmitted] = useState(false);
  
  // SOW Upload state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<SOWParsedItem[]>([]);
  const [parseResult, setParseResult] = useState<SOWParseResult | null>(null);
  const [isApplyingItems, setIsApplyingItems] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: scopeItems = [], isLoading } = useQuery<ApplicationScopeItem[]>({
    queryKey: ["/api/loan-applications", applicationId, "scope-items"],
    enabled: !!applicationId,
  });

  const sowTemplate = getSOWTemplateForLoanType(loanType);
  const categoryNames = getCategoryNamesForLoanType(loanType);

  const initializeMutation = useMutation({
    mutationFn: async () => {
      const promises = sowTemplate.map((item) =>
        apiRequest("POST", `/api/loan-applications/${applicationId}/scope-items`, {
          loanApplicationId: applicationId,
          category: item.category,
          itemName: item.itemName,
          sortOrder: item.sortOrder,
          budgetAmount: 0,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/loan-applications", applicationId, "scope-items"] 
      });
      const templateName = loanType === "New Construction" ? "New Construction" : "Fix & Flip";
      toast({
        title: "Scope Initialized",
        description: `${templateName} scope of work items have been added.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize scope of work.",
        variant: "destructive",
      });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ itemId, budgetAmount }: { itemId: string; budgetAmount: number }) => {
      return apiRequest("PATCH", `/api/application-scope-items/${itemId}`, { 
        budgetAmount 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/loan-applications", applicationId, "scope-items"] 
      });
      setEditingItemId(null);
      setEditBudgetValue("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update budget amount.",
        variant: "destructive",
      });
    },
  });

  // SOW file upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("loanType", loanType === "New Construction" ? "new_construction" : "fix_flip");
      
      const response = await fetch("/api/sow/parse", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to parse file");
      }
      
      return response.json() as Promise<SOWParseResult>;
    },
    onSuccess: (result) => {
      setParseResult(result);
      setParsedItems(result.items);
      if (result.warnings.length > 0) {
        toast({
          title: "File Parsed with Warnings",
          description: result.warnings[0],
          variant: "default",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadedFile(null);
    },
  });

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel, PDF, or Word document.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setUploadedFile(file);
    uploadMutation.mutate(file);
  }, [uploadMutation, toast]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Apply parsed items to scope
  const handleApplyParsedItems = async () => {
    if (parsedItems.length === 0) return;
    
    setIsApplyingItems(true);
    try {
      // Create scope items from parsed data
      const promises = parsedItems.map((item, index) =>
        apiRequest("POST", `/api/loan-applications/${applicationId}/scope-items`, {
          loanApplicationId: applicationId,
          category: item.category,
          itemName: item.itemName,
          sortOrder: index + 1,
          budgetAmount: Math.round(item.budgetAmount),
        })
      );
      
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ 
        queryKey: ["/api/loan-applications", applicationId, "scope-items"] 
      });
      
      toast({
        title: "Scope Applied",
        description: `${parsedItems.length} items imported successfully.`,
      });
      
      // Reset upload state
      setShowUploadDialog(false);
      setUploadedFile(null);
      setParsedItems([]);
      setParseResult(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply scope items.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingItems(false);
    }
  };

  // Download template
  const handleDownloadTemplate = () => {
    window.open("/api/sow/template", "_blank");
  };

  const categorySummaries = useMemo(() => {
    const grouped = categoryOrder.map((category) => {
      const items = scopeItems
        .filter((item) => item.category === category)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const totalBudget = items.reduce((sum, item) => sum + (item.budgetAmount || 0), 0);
      return {
        category,
        items,
        totalBudget,
      };
    });
    return grouped.filter((g) => g.items.length > 0);
  }, [scopeItems]);

  const grandTotalBudget = useMemo(() => {
    return scopeItems.reduce((sum, item) => sum + (item.budgetAmount || 0), 0);
  }, [scopeItems]);

  const hasMismatch = useMemo(() => {
    if (desiredRehabBudget === null || desiredRehabBudget === undefined) return false;
    if (scopeItems.length === 0) return false;
    return grandTotalBudget !== desiredRehabBudget;
  }, [grandTotalBudget, desiredRehabBudget, scopeItems.length]);

  const mismatchAmount = useMemo(() => {
    if (desiredRehabBudget === null || desiredRehabBudget === undefined) return 0;
    return grandTotalBudget - desiredRehabBudget;
  }, [grandTotalBudget, desiredRehabBudget]);

  const handleOpenMismatchDialog = () => {
    setNewBudgetValue(grandTotalBudget.toString());
    setShowMismatchDialog(true);
  };

  const handleUpdateRehabBudget = async () => {
    if (!onUpdateRehabBudget) return;
    
    const numValue = parseFloat(newBudgetValue.replace(/[^0-9.-]/g, ""));
    if (isNaN(numValue) || numValue < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdatingBudget(true);
    try {
      await onUpdateRehabBudget(Math.round(numValue));
      setShowMismatchDialog(false);
      toast({
        title: "Budget Updated",
        description: "The desired rehab budget has been updated to match the scope total.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the rehab budget.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBudget(false);
    }
  };

  const handleSaveBudget = (itemId: string) => {
    const numValue = parseFloat(editBudgetValue.replace(/[^0-9.-]/g, ""));
    if (isNaN(numValue) || numValue < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    updateBudgetMutation.mutate({ itemId, budgetAmount: Math.round(numValue) });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditBudgetValue("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-primary" />
            Scope of Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const handleSubmitScope = () => {
    if (hasMismatch) {
      toast({
        title: "Budget Mismatch",
        description: "Please resolve the budget mismatch before submitting the scope of work.",
        variant: "destructive",
      });
      return;
    }
    if (grandTotalBudget === 0) {
      toast({
        title: "No Budget Set",
        description: "Please add budget amounts to at least one item before submitting.",
        variant: "destructive",
      });
      return;
    }
    setIsScopeSubmitted(true);
    setIsScopeExpanded(false);
    toast({
      title: "Scope of Work Submitted",
      description: "Your scope of work has been submitted. You can reopen it to make changes if needed.",
    });
  };

  const handleEditScope = () => {
    setIsScopeExpanded(true);
    setIsScopeSubmitted(false);
  };

  return (
    <Card>
      <Collapsible open={isScopeExpanded} onOpenChange={setIsScopeExpanded}>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto hover:bg-transparent" data-testid="button-toggle-scope">
              {isScopeExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
              <CardTitle className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-primary" />
                Scope of Work
              </CardTitle>
            </Button>
          </CollapsibleTrigger>
          <div className="flex items-center gap-2">
            {isScopeSubmitted && !isScopeExpanded && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                <Check className="h-3 w-3 mr-1" />
                Submitted
              </Badge>
            )}
            {scopeItems.length > 0 && (
              <Badge variant="outline" className="text-sm">
                <DollarSign className="h-3 w-3 mr-1" />
                Total: {formatCurrency(grandTotalBudget)}
              </Badge>
            )}
            {isScopeSubmitted && !isScopeExpanded && !readOnly && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEditScope}
                data-testid="button-edit-scope"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
        {scopeItems.length === 0 ? (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <HardHat className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground mb-2">No scope of work items defined</p>
              <p className="text-xs text-muted-foreground mb-4">
                Start with a template or upload your own scope of work
              </p>
            </div>
            
            {!readOnly && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Option 1: Start from template */}
                <Card className="p-4 hover-elevate cursor-pointer" onClick={() => initializeMutation.mutate()}>
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Start from Template</p>
                      <p className="text-xs text-muted-foreground">
                        Use our {loanType === "New Construction" ? "New Construction" : "Fix & Flip"} template
                      </p>
                    </div>
                    {initializeMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </Card>

                {/* Option 2: Upload file */}
                <Card 
                  className="p-4 hover-elevate cursor-pointer"
                  onClick={() => setShowUploadDialog(true)}
                  data-testid="button-upload-sow"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Upload Your SOW</p>
                      <p className="text-xs text-muted-foreground">
                        Import from Excel, PDF, or Word
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {!readOnly && (
              <div className="flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="text-xs"
                  data-testid="button-download-template"
                >
                  <Download className="h-3 w-3 mr-2" />
                  Download Template
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold" data-testid="text-total-budget">
                  {formatCurrency(grandTotalBudget)}
                </p>
                <p className="text-xs text-muted-foreground">Scope Total</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold" data-testid="text-desired-budget">
                  {desiredRehabBudget !== null && desiredRehabBudget !== undefined 
                    ? formatCurrency(desiredRehabBudget) 
                    : "Not Set"}
                </p>
                <p className="text-xs text-muted-foreground">Desired Budget</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold" data-testid="text-line-items-count">
                  {scopeItems.filter(i => i.budgetAmount > 0).length} / {scopeItems.length}
                </p>
                <p className="text-xs text-muted-foreground">Items with Budget</p>
              </div>
            </div>

            {hasMismatch && !readOnly && (
              <div 
                className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                data-testid="alert-budget-mismatch"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Budget Mismatch
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Scope total is {formatCurrency(Math.abs(mismatchAmount))} {mismatchAmount > 0 ? "over" : "under"} the desired budget
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenMismatchDialog}
                  className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50"
                  data-testid="button-update-desired-budget"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Budget
                </Button>
              </div>
            )}

            <Accordion type="multiple" defaultValue={categoryOrder} className="space-y-2">
              {categorySummaries.map((cs) => (
                <AccordionItem 
                  key={cs.category} 
                  value={cs.category} 
                  className="border rounded-lg"
                >
                  <AccordionTrigger 
                    className="px-4 hover:no-underline" 
                    data-testid={`accordion-category-${cs.category}`}
                  >
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium">
                        {categoryNames[cs.category]}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(cs.totalBudget)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-4">Item</TableHead>
                          <TableHead className="text-right pr-4">Budget</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cs.items.map((item) => (
                          <TableRow key={item.id} data-testid={`row-scope-item-${item.id}`}>
                            <TableCell className="pl-4 font-medium">
                              {item.itemName}
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              {editingItemId === item.id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <div className="relative">
                                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type="text"
                                      value={editBudgetValue}
                                      onChange={(e) => setEditBudgetValue(e.target.value)}
                                      className="w-32 text-right h-9 pl-7 pr-2 font-medium"
                                      placeholder="0"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveBudget(item.id);
                                        if (e.key === "Escape") handleCancelEdit();
                                      }}
                                      data-testid={`input-budget-${item.id}`}
                                    />
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleSaveBudget(item.id)}
                                    disabled={updateBudgetMutation.isPending}
                                    data-testid={`button-save-budget-${item.id}`}
                                  >
                                    {updateBudgetMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4 text-green-500" />
                                    )}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                    data-testid={`button-cancel-edit-${item.id}`}
                                  >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </div>
                              ) : (
                                <div
                                  className={`inline-flex items-center justify-end gap-1 px-3 py-1.5 rounded-md border transition-colors min-w-[6.5rem] ${
                                    readOnly 
                                      ? "bg-muted/30 border-transparent cursor-default" 
                                      : "bg-background border-input hover:border-primary hover:bg-muted/50 cursor-pointer"
                                  }`}
                                  onClick={() => {
                                    if (!readOnly) {
                                      setEditingItemId(item.id);
                                      setEditBudgetValue(item.budgetAmount.toString());
                                    }
                                  }}
                                  data-testid={`text-budget-${item.id}`}
                                >
                                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="font-medium tabular-nums">
                                    {item.budgetAmount.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {!readOnly && (
              <div className="flex flex-col items-center gap-3 mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Click on any budget amount to edit it
                </p>
                <Button
                  onClick={handleSubmitScope}
                  disabled={grandTotalBudget === 0}
                  className="w-full sm:w-auto"
                  data-testid="button-submit-scope"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Scope of Work
                </Button>
              </div>
            )}
          </div>
        )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <Dialog open={showMismatchDialog} onOpenChange={setShowMismatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Desired Rehab Budget</DialogTitle>
            <DialogDescription>
              Your scope of work items total <span className="font-semibold">{formatCurrency(grandTotalBudget)}</span>, 
              but your desired rehab budget is <span className="font-semibold">{formatCurrency(desiredRehabBudget || 0)}</span>.
              Would you like to update your desired budget to match the scope total?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">New Desired Budget</label>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={newBudgetValue}
                onChange={(e) => setNewBudgetValue(e.target.value)}
                placeholder="Enter amount"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateRehabBudget();
                }}
                data-testid="input-new-budget"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click "Match Scope Total" to set to {formatCurrency(grandTotalBudget)}
            </p>
          </div>

          <DialogFooter className="flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMismatchDialog(false)}
              disabled={isUpdatingBudget}
              data-testid="button-cancel-budget-update"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => setNewBudgetValue(grandTotalBudget.toString())}
              disabled={isUpdatingBudget}
              data-testid="button-match-scope-total"
            >
              Match Scope Total
            </Button>
            <Button
              onClick={handleUpdateRehabBudget}
              disabled={isUpdatingBudget || !onUpdateRehabBudget}
              data-testid="button-confirm-budget-update"
            >
              {isUpdatingBudget ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Update Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SOW Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={(open) => {
        setShowUploadDialog(open);
        if (!open) {
          setUploadedFile(null);
          setParsedItems([]);
          setParseResult(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Scope of Work
            </DialogTitle>
            <DialogDescription>
              Upload your scope of work file to automatically import line items. 
              Supports Excel, PDF, and Word documents.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File upload zone */}
            {!parseResult && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  data-testid="input-sow-file"
                />
                
                {uploadMutation.isPending ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Analyzing your document...</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      Using AI to extract scope items
                    </div>
                  </div>
                ) : (
                  <>
                    <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground mb-2">
                      Drag and drop your file here, or{" "}
                      <button
                        className="text-primary underline hover:no-underline"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="button-browse-files"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Excel (.xlsx, .xls), PDF, or Word (.doc, .docx) - Max 10MB
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Parse results */}
            {parseResult && (
              <div className="space-y-4">
                {/* Result summary */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {parseResult.success ? (
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {parseResult.success 
                          ? `Found ${parsedItems.length} items`
                          : "Parsing failed"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {parseResult.fileName} • Parsed using {parseResult.parsingMethod === "ai" ? "AI" : "template matching"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(parseResult.totalBudget)}</p>
                    <p className="text-xs text-muted-foreground">Total Budget</p>
                  </div>
                </div>

                {/* Warnings */}
                {parseResult.warnings.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Warnings</p>
                    </div>
                    <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1">
                      {parseResult.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Parsed items preview */}
                {parsedItems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Preview Items</p>
                    <ScrollArea className="h-[250px] rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Budget</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {categoryNames[item.category] || item.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{item.itemName}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.budgetAmount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}

                {/* Try again button */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      setParsedItems([]);
                      setParseResult(null);
                    }}
                    data-testid="button-try-again"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Upload Different File
                  </Button>
                </div>
              </div>
            )}

            {/* Download template link */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadTemplate}
                data-testid="button-download-template-dialog"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              
              {parsedItems.length > 0 && (
                <Button
                  onClick={handleApplyParsedItems}
                  disabled={isApplyingItems}
                  data-testid="button-apply-sow"
                >
                  {isApplyingItems ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Apply {parsedItems.length} Items
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
