import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  FileText, 
  Calculator, 
  LogOut, 
  Building2,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Banknote,
  Calendar
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

  useEffect(() => {
    document.title = "Customer Portal | Secured Asset Funding";
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

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

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
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Secured Asset Funding</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/portal">
              <Button variant="ghost" size="sm" className="bg-primary/10" data-testid="link-portfolio">
                Portfolio
              </Button>
            </Link>
            <Link href="/portal/investment-analysis">
              <Button variant="ghost" size="sm" data-testid="link-investment-analysis">
                Investment Analysis
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {user?.firstName || user?.email || "User"}
              </span>
            </div>
            <a href="/api/logout">
              <Button variant="ghost" size="sm" data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-portal-title">
            Welcome back, {user?.firstName || "Investor"}
          </h1>
          <p className="text-muted-foreground">
            Manage your loan applications, closed loans, and analyze new investment opportunities.
          </p>
        </div>

        {/* Analyze a New Deal Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Analyze a New Deal</h2>
          <p className="text-muted-foreground mb-4">
            Select a loan type to begin analyzing your next investment opportunity.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/portal/investment-analysis")} data-testid="card-analyze-dscr">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  DSCR Loan
                </CardTitle>
                <CardDescription>Long-term rental property financing</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/portal/investment-analysis")} data-testid="card-analyze-fixflip">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Fix & Flip
                </CardTitle>
                <CardDescription>Short-term renovation financing</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/portal/investment-analysis")} data-testid="card-analyze-construction">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  New Construction
                </CardTitle>
                <CardDescription>Ground-up development financing</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Closed Loans Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Closed Loans</h2>
          
          {loansLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          ) : servicedLoans && servicedLoans.length > 0 ? (
            <div className="space-y-4">
              {servicedLoans.map((loan) => (
                <Link key={loan.id} href={`/portal/loan/${loan.id}`}>
                  <Card className="hover-elevate cursor-pointer" data-testid={`card-loan-${loan.id}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Banknote className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{loan.propertyAddress}</p>
                            <p className="text-sm text-muted-foreground">
                              {loan.loanType} • Loan #{loan.loanNumber}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm text-muted-foreground">Current Balance</p>
                            <p className="font-semibold">{formatCurrency(loan.currentBalance)}</p>
                          </div>
                          <div className="text-right hidden md:block">
                            <p className="text-sm text-muted-foreground">Monthly Payment</p>
                            <p className="font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
                          </div>
                          <div className="text-right hidden lg:block">
                            <p className="text-sm text-muted-foreground">Next Payment</p>
                            <p className="font-medium">{formatDate(loan.nextPaymentDate)}</p>
                          </div>
                          <Badge className={loanStatusColors[loan.loanStatus]}>
                            {loanStatusLabels[loan.loanStatus]}
                          </Badge>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Banknote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No closed loans yet</h3>
                <p className="text-muted-foreground mb-4">
                  Once your loan closes, you'll be able to view payment details, make payments, and access your loan documents here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Your Previous Applications Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Your Previous Applications</h2>
          
          {appsLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <Link key={app.id} href={`/portal/application/${app.id}`}>
                  <Card className="hover-elevate cursor-pointer" data-testid={`card-application-${app.id}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            {app.loanType === "DSCR" ? (
                              <Home className="h-5 w-5 text-primary" />
                            ) : app.loanType === "Fix & Flip" ? (
                              <FileText className="h-5 w-5 text-primary" />
                            ) : (
                              <Building2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{app.loanType} Loan</p>
                            <p className="text-sm text-muted-foreground">
                              {app.propertyAddress || "Property address not set"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge className={statusColors[app.status]}>
                            {statusLabels[app.status]}
                          </Badge>
                          <div className="text-sm text-muted-foreground hidden sm:block">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {new Date(app.createdAt).toLocaleDateString()}
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by analyzing a new deal above to begin your application process.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
