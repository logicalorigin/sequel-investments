import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalHeader } from "@/components/PortalHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Home, 
  FileText, 
  Calculator, 
  Building2,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Banknote,
  Calendar,
  Trash2,
  TrendingUp,
  AlertCircle,
  FileCheck
} from "lucide-react";
import type { LoanApplication, ServicedLoan } from "@shared/schema";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  funded: "bg-primary/20 text-primary",
  denied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  withdrawn: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  funded: "Funded",
  denied: "Denied",
  withdrawn: "Withdrawn",
};

const loanStatusColors: Record<string, string> = {
  current: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  late: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  paid_off: "bg-muted text-muted-foreground",
};

const loanStatusLabels: Record<string, string> = {
  current: "Current",
  late: "Past Due",
  paid_off: "Paid Off",
};

export default function PortalPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<LoanApplication | null>(null);

  useEffect(() => {
    document.title = "Customer Portal | Sequel Investments";
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

  const { data: applications, isLoading: appsLoading } = useQuery<LoanApplication[]>({
    queryKey: ["/api/applications"],
    enabled: isAuthenticated,
  });

  const { data: servicedLoans, isLoading: loansLoading } = useQuery<ServicedLoan[]>({
    queryKey: ["/api/serviced-loans"],
    enabled: isAuthenticated,
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (loanType: string) => {
      const res = await apiRequest("POST", "/api/applications", { loanType });
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

  const deleteApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      await apiRequest("DELETE", `/api/applications/${applicationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application removed",
        description: "The application has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, app: LoanApplication) => {
    e.preventDefault();
    e.stopPropagation();
    setApplicationToDelete(app);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (applicationToDelete) {
      deleteApplicationMutation.mutate(applicationToDelete.id);
    }
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader user={user} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" data-testid="text-portal-title">
            Welcome back, {user?.firstName || "Investor"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your loan applications, closed loans, and analyze new investment opportunities.
          </p>
        </div>

        {/* Deal Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10" data-testid="deal-status-summary">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300" data-testid="text-active-count">
                    {applications?.filter(a => ["submitted", "in_review"].includes(a.status)).length || 0}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-600/80 dark:text-blue-400/80">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
                <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-500/20">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300" data-testid="text-pending-count">
                    {applications?.filter(a => a.status === "draft").length || 0}
                  </p>
                  <p className="text-[10px] sm:text-xs text-yellow-600/80 dark:text-yellow-400/80">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
                <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300" data-testid="text-funded-count">
                    {servicedLoans?.length || 0}
                  </p>
                  <p className="text-[10px] sm:text-xs text-green-600/80 dark:text-green-400/80">Funded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30">
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-2xl font-bold text-primary" data-testid="text-total-volume">
                    {formatCurrency(servicedLoans?.reduce((sum, loan) => sum + loan.originalLoanAmount, 0) || 0)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-primary/80">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analyze a New Deal Section */}
        <div className="mb-6 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Analyze a New Deal</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Select a loan type to begin analyzing your next investment opportunity.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="hover-elevate cursor-pointer flex flex-col h-full" onClick={() => setLocation("/portal/dscr-analyzer")} data-testid="card-analyze-dscr">
              <CardHeader className="p-4 pb-2 flex-1">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  DSCR Loan
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">Long-term rental property financing</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer flex flex-col h-full" onClick={() => setLocation("/portal/fixflip-analyzer")} data-testid="card-analyze-fixflip">
              <CardHeader className="p-4 pb-2 flex-1">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  Fix & Flip
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">Short-term renovation financing</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer flex flex-col h-full" onClick={() => setLocation("/portal/construction-analyzer")} data-testid="card-analyze-construction">
              <CardHeader className="p-4 pb-2 flex-1">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  New Construction
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">Ground-up development financing</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Loans Section */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Active Loans</h2>
            {servicedLoans && servicedLoans.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setLocation("/portal/loans")} data-testid="button-view-all-loans">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
          
          {loansLoading ? (
            <div className="animate-pulse space-y-3 sm:space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-20 sm:h-24 bg-muted rounded-lg" />
              ))}
            </div>
          ) : servicedLoans && servicedLoans.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {servicedLoans.slice(0, 3).map((loan) => (
                <Link key={loan.id} href={`/portal/loans/${loan.id}`}>
                  <Card className="hover-elevate cursor-pointer" data-testid={`card-loan-${loan.id}`}>
                    <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
                      <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
                        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                            <Banknote className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">{loan.propertyAddress}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {loan.loanType} • #{loan.loanNumber}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs sm:text-sm text-muted-foreground">Balance</p>
                            <p className="font-semibold text-sm sm:text-base">{formatCurrency(loan.currentBalance)}</p>
                          </div>
                          <div className="text-right hidden md:block">
                            <p className="text-xs sm:text-sm text-muted-foreground">Monthly</p>
                            <p className="font-semibold text-sm sm:text-base">{formatCurrency(loan.monthlyPayment)}</p>
                          </div>
                          <div className="text-right hidden lg:block">
                            <p className="text-xs sm:text-sm text-muted-foreground">Next Payment</p>
                            <p className="font-medium text-sm sm:text-base">{formatDate(loan.nextPaymentDate)}</p>
                          </div>
                          <Badge className={`${loanStatusColors[loan.loanStatus]} text-[10px] sm:text-xs`}>
                            {loanStatusLabels[loan.loanStatus]}
                          </Badge>
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center px-3 sm:px-6">
                <Banknote className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">No closed loans yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Once your loan closes, you'll be able to view payment details, make payments, and access your loan documents here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Your Previous Applications Section */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Your Previous Applications</h2>
          
          {appsLoading ? (
            <div className="animate-pulse space-y-3 sm:space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-20 sm:h-24 bg-muted rounded-lg" />
              ))}
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="hover-elevate" data-testid={`card-application-${app.id}`}>
                  <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
                    <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
                      <Link href={`/portal/application/${app.id}`} className="flex items-center gap-2 sm:gap-4 flex-1 cursor-pointer min-w-0">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                          {app.loanType === "DSCR" ? (
                            <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          ) : app.loanType === "Fix & Flip" ? (
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          ) : (
                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base">{app.loanType} Loan</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {app.propertyAddress || "Property address not set"}
                          </p>
                        </div>
                      </Link>
                      
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <Badge className={`${statusColors[app.status]} text-[10px] sm:text-xs`}>
                          {statusLabels[app.status]}
                        </Badge>
                        <div className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline mr-1" />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteClick(e, app)}
                          className="text-muted-foreground hover:text-destructive h-7 w-7 sm:h-9 sm:w-9"
                          data-testid={`button-delete-application-${app.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Link href={`/portal/application/${app.id}`}>
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground cursor-pointer" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center px-3 sm:px-6">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">No applications yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Start by analyzing a new deal above to begin your application process.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this {applicationToDelete?.loanType} loan application
              {applicationToDelete?.propertyAddress ? ` for ${applicationToDelete.propertyAddress}` : ""}? 
              This action cannot be undone and all associated documents will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteApplicationMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
