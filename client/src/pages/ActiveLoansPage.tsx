import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { format, differenceInDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  ArrowRight, 
  Home,
  HardHat,
  Hammer,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Filter,
  LayoutGrid,
  LayoutList,
  ChevronRight,
  Wallet,
  Percent,
  MapPin
} from "lucide-react";
import { PortalHeader } from "@/components/PortalHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServicedLoan } from "@shared/schema";

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getLoanTypeLabel = (type: string): string => {
  switch (type) {
    case "dscr": return "DSCR";
    case "fix_flip": return "Fix & Flip";
    case "new_construction": return "New Construction";
    case "bridge": return "Bridge";
    default: return type;
  }
};

const getLoanTypeIcon = (type: string) => {
  switch (type) {
    case "dscr": return Building2;
    case "fix_flip": return Hammer;
    case "new_construction": return HardHat;
    case "bridge": return TrendingUp;
    default: return Home;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "current":
      return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Current</Badge>;
    case "grace_period":
      return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="h-3 w-3 mr-1" /> Grace Period</Badge>;
    case "late":
      return <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30"><AlertTriangle className="h-3 w-3 mr-1" /> Late</Badge>;
    case "default":
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Default</Badge>;
    case "paid_off":
      return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Paid Off</Badge>;
    case "matured":
      return <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Clock className="h-3 w-3 mr-1" /> Matured</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const isHardMoneyLoan = (type: string): boolean => {
  return type === "fix_flip" || type === "new_construction" || type === "bridge";
};

function LoanCard({ loan }: { loan: ServicedLoan }) {
  const [, setLocation] = useLocation();
  const LoanIcon = getLoanTypeIcon(loan.loanType);
  const isHardMoney = isHardMoneyLoan(loan.loanType);
  
  const daysToMaturity = loan.maturityDate 
    ? differenceInDays(new Date(loan.maturityDate), new Date())
    : null;
  
  const payoffProgress = loan.originalLoanAmount 
    ? ((loan.originalLoanAmount - loan.currentBalance) / loan.originalLoanAmount) * 100
    : 0;
  
  const drawProgress = loan.totalRehabBudget && loan.totalDrawsFunded
    ? (loan.totalDrawsFunded / loan.totalRehabBudget) * 100
    : 0;

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all"
      onClick={() => setLocation(`/portal/loans/${loan.id}`)}
      data-testid={`card-loan-${loan.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <LoanIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base line-clamp-1">
                {loan.propertyAddress}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                {loan.propertyCity}, {loan.propertyState}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(loan.loanStatus)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Loan Number</span>
          <span className="font-mono font-medium">{loan.loanNumber}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Loan Type</span>
          <Badge variant="outline">{getLoanTypeLabel(loan.loanType)}</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Balance</p>
            <p className="text-lg font-semibold text-primary">{formatCurrency(loan.currentBalance)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly Payment</p>
            <p className="text-lg font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Percent className="h-3 w-3" /> Interest Rate
          </span>
          <span className="font-medium">{loan.interestRate}%</span>
        </div>
        
        {!isHardMoney && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Principal Paid</span>
              <span>{payoffProgress.toFixed(1)}%</span>
            </div>
            <Progress value={payoffProgress} className="h-1.5" />
          </div>
        )}
        
        {isHardMoney && loan.totalRehabBudget && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Draws Funded</span>
              <span>{formatCurrency(loan.totalDrawsFunded)} / {formatCurrency(loan.totalRehabBudget)}</span>
            </div>
            <Progress value={drawProgress} className="h-1.5" />
          </div>
        )}
        
        <div className="pt-2 border-t flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {loan.nextPaymentDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Next: {format(new Date(loan.nextPaymentDate), "MMM d, yyyy")}
              </span>
            )}
          </div>
          {daysToMaturity !== null && daysToMaturity <= 90 && daysToMaturity > 0 && (
            <Badge variant="outline" className="text-amber-400 border-amber-500/30">
              {daysToMaturity} days to maturity
            </Badge>
          )}
        </div>
        
        <Button variant="ghost" className="w-full justify-between" size="sm">
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function LoanListItem({ loan }: { loan: ServicedLoan }) {
  const [, setLocation] = useLocation();
  const LoanIcon = getLoanTypeIcon(loan.loanType);
  const isHardMoney = isHardMoneyLoan(loan.loanType);

  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover-elevate cursor-pointer"
      onClick={() => setLocation(`/portal/loans/${loan.id}`)}
      data-testid={`row-loan-${loan.id}`}
    >
      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
        <LoanIcon className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium truncate">{loan.propertyAddress}</h4>
          {getStatusBadge(loan.loanStatus)}
        </div>
        <p className="text-sm text-muted-foreground">
          {loan.loanNumber} • {getLoanTypeLabel(loan.loanType)} • {loan.propertyCity}, {loan.propertyState}
        </p>
      </div>
      
      <div className="hidden md:block text-right shrink-0">
        <p className="font-semibold text-primary">{formatCurrency(loan.currentBalance)}</p>
        <p className="text-xs text-muted-foreground">Balance</p>
      </div>
      
      <div className="hidden lg:block text-right shrink-0">
        <p className="font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
        <p className="text-xs text-muted-foreground">Payment</p>
      </div>
      
      <div className="hidden lg:block text-right shrink-0">
        <p className="font-medium">{loan.interestRate}%</p>
        <p className="text-xs text-muted-foreground">Rate</p>
      </div>
      
      {isHardMoney && loan.totalRehabBudget && (
        <div className="hidden xl:flex flex-col items-end shrink-0 w-32">
          <Progress value={(loan.totalDrawsFunded || 0) / loan.totalRehabBudget * 100} className="h-1.5 w-full" />
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(loan.totalDrawsFunded)} / {formatCurrency(loan.totalRehabBudget)}
          </p>
        </div>
      )}
      
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </div>
  );
}

function SummaryCards({ loans }: { loans: ServicedLoan[] }) {
  const totalBalance = loans.reduce((sum, loan) => sum + (loan.currentBalance || 0), 0);
  const totalMonthlyPayments = loans.reduce((sum, loan) => sum + (loan.monthlyPayment || 0), 0);
  const dscrLoans = loans.filter(l => l.loanType === "dscr");
  const hardMoneyLoans = loans.filter(l => isHardMoneyLoan(l.loanType));
  const currentLoans = loans.filter(l => l.loanStatus === "current");

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Total Balance</span>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
          <p className="text-xs text-muted-foreground mt-1">{loans.length} active loan{loans.length !== 1 ? 's' : ''}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Monthly Payments</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalMonthlyPayments)}</p>
          <p className="text-xs text-muted-foreground mt-1">Combined monthly</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">DSCR Loans</span>
          </div>
          <p className="text-2xl font-bold">{dscrLoans.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatCurrency(dscrLoans.reduce((s, l) => s + (l.currentBalance || 0), 0))} balance</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <HardHat className="h-4 w-4" />
            <span className="text-sm">Hard Money Loans</span>
          </div>
          <p className="text-2xl font-bold">{hardMoneyLoans.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatCurrency(hardMoneyLoans.reduce((s, l) => s + (l.currentBalance || 0), 0))} balance</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ActiveLoansPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const { data: loans = [], isLoading } = useQuery<ServicedLoan[]>({
    queryKey: ["/api/serviced-loans"],
  });
  
  const filteredLoans = loans.filter(loan => {
    if (filterType !== "all" && loan.loanType !== filterType) return false;
    if (filterStatus !== "all" && loan.loanStatus !== filterStatus) return false;
    return true;
  });
  
  const dscrLoans = filteredLoans.filter(l => l.loanType === "dscr");
  const hardMoneyLoans = filteredLoans.filter(l => isHardMoneyLoan(l.loanType));

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader 
        user={user}
        title="Active Loans" 
        backHref="/portal"
      />
      
      <main className="container max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : loans.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Loans</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any active loans yet. Once your loan is funded, it will appear here.
              </p>
              <Button asChild>
                <Link href="/portal/applications">View Applications</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <SummaryCards loans={loans} />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]" data-testid="select-filter-type">
                    <SelectValue placeholder="Loan Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="dscr">DSCR</SelectItem>
                    <SelectItem value="fix_flip">Fix & Flip</SelectItem>
                    <SelectItem value="new_construction">New Construction</SelectItem>
                    <SelectItem value="bridge">Bridge</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                    <SelectItem value="grace_period">Grace Period</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="paid_off">Paid Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-view-grid"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  data-testid="button-view-list"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all" data-testid="tab-all-loans">
                  All ({filteredLoans.length})
                </TabsTrigger>
                <TabsTrigger value="dscr" data-testid="tab-dscr-loans">
                  DSCR ({dscrLoans.length})
                </TabsTrigger>
                <TabsTrigger value="hardmoney" data-testid="tab-hardmoney-loans">
                  Hard Money ({hardMoneyLoans.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {viewMode === "grid" ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLoans.map(loan => (
                      <LoanCard key={loan.id} loan={loan} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredLoans.map(loan => (
                      <LoanListItem key={loan.id} loan={loan} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="dscr">
                {viewMode === "grid" ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dscrLoans.map(loan => (
                      <LoanCard key={loan.id} loan={loan} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dscrLoans.map(loan => (
                      <LoanListItem key={loan.id} loan={loan} />
                    ))}
                  </div>
                )}
                {dscrLoans.length === 0 && (
                  <Card className="text-center py-8">
                    <CardContent>
                      <Building2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No DSCR loans found</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="hardmoney">
                {viewMode === "grid" ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hardMoneyLoans.map(loan => (
                      <LoanCard key={loan.id} loan={loan} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {hardMoneyLoans.map(loan => (
                      <LoanListItem key={loan.id} loan={loan} />
                    ))}
                  </div>
                )}
                {hardMoneyLoans.length === 0 && (
                  <Card className="text-center py-8">
                    <CardContent>
                      <HardHat className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No Hard Money loans found</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
