import { useState, useMemo } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HardHat,
  Plus,
  Save,
  Check,
  X,
  DollarSign,
  Loader2,
} from "lucide-react";
import type { 
  ApplicationScopeItem, 
  ScopeOfWorkCategory 
} from "@shared/schema";
import { 
  DEFAULT_SCOPE_OF_WORK_ITEMS, 
  SCOPE_OF_WORK_CATEGORY_NAMES 
} from "@shared/schema";

interface ApplicationScopeBuilderProps {
  applicationId: string;
  readOnly?: boolean;
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
  readOnly = false 
}: ApplicationScopeBuilderProps) {
  const { toast } = useToast();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editBudgetValue, setEditBudgetValue] = useState<string>("");

  const { data: scopeItems = [], isLoading } = useQuery<ApplicationScopeItem[]>({
    queryKey: ["/api/loan-applications", applicationId, "scope-items"],
    enabled: !!applicationId,
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      const promises = DEFAULT_SCOPE_OF_WORK_ITEMS.map((item) =>
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
      toast({
        title: "Scope Initialized",
        description: "Default scope of work items have been added.",
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <HardHat className="h-5 w-5 text-primary" />
          Scope of Work
        </CardTitle>
        {scopeItems.length > 0 && (
          <Badge variant="outline" className="text-sm">
            <DollarSign className="h-3 w-3 mr-1" />
            Total: {formatCurrency(grandTotalBudget)}
          </Badge>
        )}
      </CardHeader>
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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold" data-testid="text-total-budget">
                  {formatCurrency(grandTotalBudget)}
                </p>
                <p className="text-xs text-muted-foreground">Total Budget</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold" data-testid="text-line-items-count">
                  {scopeItems.filter(i => i.budgetAmount > 0).length} / {scopeItems.length}
                </p>
                <p className="text-xs text-muted-foreground">Items with Budget</p>
              </div>
            </div>

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
                        {SCOPE_OF_WORK_CATEGORY_NAMES[cs.category]}
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
                                  <Input
                                    type="text"
                                    value={editBudgetValue}
                                    onChange={(e) => setEditBudgetValue(e.target.value)}
                                    className="w-28 text-right h-8"
                                    placeholder="0"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveBudget(item.id);
                                      if (e.key === "Escape") handleCancelEdit();
                                    }}
                                    data-testid={`input-budget-${item.id}`}
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
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
                                    className="h-8 w-8"
                                    onClick={handleCancelEdit}
                                    data-testid={`button-cancel-edit-${item.id}`}
                                  >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </div>
                              ) : (
                                <span
                                  className={`cursor-pointer hover:text-primary ${
                                    readOnly ? "cursor-default hover:text-current" : ""
                                  }`}
                                  onClick={() => {
                                    if (!readOnly) {
                                      setEditingItemId(item.id);
                                      setEditBudgetValue(item.budgetAmount.toString());
                                    }
                                  }}
                                  data-testid={`text-budget-${item.id}`}
                                >
                                  {formatCurrency(item.budgetAmount)}
                                </span>
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
              <p className="text-xs text-muted-foreground text-center mt-4">
                Click on any budget amount to edit it
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
