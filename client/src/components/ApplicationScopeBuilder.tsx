import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
          <div className="text-center py-8">
            <HardHat className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground mb-2">No scope of work items defined</p>
            <p className="text-xs text-muted-foreground mb-4">
              Initialize the scope of work to add budget line items for your project
            </p>
            {!readOnly && (
              <Button
                onClick={() => initializeMutation.mutate()}
                disabled={initializeMutation.isPending}
                data-testid="button-initialize-scope"
              >
                {initializeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Initialize Scope of Work
              </Button>
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
    </Card>
  );
}
