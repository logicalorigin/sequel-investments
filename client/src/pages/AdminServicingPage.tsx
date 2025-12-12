import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  DollarSign,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Loader2,
  Home,
  Hammer,
  HardHat,
  ArrowRightLeft,
  Wallet,
  FileCheck,
  Clock,
  Percent,
} from "lucide-react";
import { useState } from "react";
import type { ServicedLoan } from "@shared/schema";

type EnrichedServicedLoan = ServicedLoan & {
  borrowerName: string;
  borrowerEmail?: string;
};

const loanTypeConfig = {
  dscr: { label: "DSCR", icon: Home, color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  fix_flip: { label: "Fix & Flip", icon: Hammer, color: "bg-amber-600/10 text-amber-700 border-amber-600/30" },
  new_construction: { label: "Construction", icon: HardHat, color: "bg-yellow-600/10 text-yellow-700 border-yellow-600/30" },
  bridge: { label: "Bridge", icon: ArrowRightLeft, color: "bg-amber-400/10 text-amber-500 border-amber-400/30" },
};

const statusConfig = {
  current: { label: "Current", color: "bg-green-500/10 text-green-600 border-green-500/30" },
  grace_period: { label: "Grace Period", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  late: { label: "Late", color: "bg-red-500/10 text-red-600 border-red-500/30" },
  paid_off: { label: "Paid Off", color: "bg-gray-500/10 text-gray-600 border-gray-500/30" },
  default: { label: "Default", color: "bg-red-700/10 text-red-700 border-red-700/30" },
  foreclosure: { label: "Foreclosure", color: "bg-red-900/10 text-red-900 border-red-900/30" },
  matured: { label: "Matured", color: "bg-amber-600/10 text-amber-700 border-amber-600/30" },
};

function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DSCRTable({ 
  loans, 
  searchQuery, 
  statusFilter, 
  navigate, 
  isLoading 
}: { 
  loans: EnrichedServicedLoan[]; 
  searchQuery: string;
  statusFilter: string;
  navigate: (path: string) => void;
  isLoading: boolean;
}) {
  const filteredLoans = loans.filter((loan) => {
    const loanNumber = loan.loanNumber ?? "";
    const address = loan.propertyAddress ?? "";
    const borrower = loan.borrowerName ?? "";
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = 
      searchQuery === "" ||
      loanNumber.toLowerCase().includes(query) ||
      address.toLowerCase().includes(query) ||
      borrower.toLowerCase().includes(query);
    
    const matchesStatus = statusFilter === "all" || loan.loanStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filteredLoans.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No DSCR Loans Found</h3>
        <p className="text-muted-foreground">
          {loans.length === 0 
            ? "No DSCR loans have been funded yet."
            : "No loans match your current filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loan #</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-right">Payment</TableHead>
            <TableHead>Next Due</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLoans.map((loan) => {
            const statusCfg = statusConfig[loan.loanStatus as keyof typeof statusConfig] || statusConfig.current;
            
            return (
              <TableRow 
                key={loan.id} 
                className="hover-elevate cursor-pointer"
                onClick={() => navigate(`/admin/servicing/${loan.id}`)}
                data-testid={`row-dscr-loan-${loan.id}`}
              >
                <TableCell className="font-mono font-medium">{loan.loanNumber}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{loan.borrowerName}</p>
                    <p className="text-sm text-muted-foreground">{loan.borrowerEmail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-48 truncate" title={loan.propertyAddress}>
                    {loan.propertyAddress}
                  </div>
                  {loan.propertyCity && (
                    <p className="text-sm text-muted-foreground">
                      {loan.propertyCity}, {loan.propertyState}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusCfg.color}>
                    {statusCfg.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(loan.currentBalance)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(loan.monthlyPayment)}
                </TableCell>
                <TableCell>
                  {formatDate(loan.nextPaymentDate)}
                </TableCell>
                <TableCell className="text-right">
                  {loan.interestRate ? `${loan.interestRate}%` : "N/A"}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/servicing/${loan.id}`);
                    }}
                    data-testid={`button-view-dscr-loan-${loan.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function HardMoneyTable({ 
  loans, 
  searchQuery, 
  statusFilter, 
  loanTypeFilter,
  navigate, 
  isLoading 
}: { 
  loans: EnrichedServicedLoan[]; 
  searchQuery: string;
  statusFilter: string;
  loanTypeFilter: string;
  navigate: (path: string) => void;
  isLoading: boolean;
}) {
  const filteredLoans = loans.filter((loan) => {
    const loanNumber = loan.loanNumber ?? "";
    const address = loan.propertyAddress ?? "";
    const borrower = loan.borrowerName ?? "";
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = 
      searchQuery === "" ||
      loanNumber.toLowerCase().includes(query) ||
      address.toLowerCase().includes(query) ||
      borrower.toLowerCase().includes(query);
    
    const matchesStatus = statusFilter === "all" || loan.loanStatus === statusFilter;
    const matchesType = loanTypeFilter === "all" || loan.loanType === loanTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filteredLoans.length === 0) {
    return (
      <div className="text-center py-12">
        <Hammer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Hard Money Loans Found</h3>
        <p className="text-muted-foreground">
          {loans.length === 0 
            ? "No Fix & Flip or Construction loans have been funded yet."
            : "No loans match your current filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loan #</TableHead>
            <TableHead>Borrower</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Loan Amount</TableHead>
            <TableHead className="text-right">Rehab Budget</TableHead>
            <TableHead className="text-right">Draws</TableHead>
            <TableHead className="text-right">Holdback</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLoans.map((loan) => {
            const typeConfig = loanTypeConfig[loan.loanType as keyof typeof loanTypeConfig] || loanTypeConfig.fix_flip;
            const statusCfg = statusConfig[loan.loanStatus as keyof typeof statusConfig] || statusConfig.current;
            const TypeIcon = typeConfig.icon;
            
            const totalBudget = loan.totalRehabBudget || 0;
            const drawsFunded = loan.totalDrawsFunded || 0;
            const holdbackRemaining = totalBudget - drawsFunded;
            const drawProgress = totalBudget > 0 ? Math.round((drawsFunded / totalBudget) * 100) : 0;
            
            return (
              <TableRow 
                key={loan.id} 
                className="hover-elevate cursor-pointer"
                onClick={() => navigate(`/admin/servicing/${loan.id}`)}
                data-testid={`row-hardmoney-loan-${loan.id}`}
              >
                <TableCell className="font-mono font-medium">{loan.loanNumber}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{loan.borrowerName}</p>
                    <p className="text-sm text-muted-foreground">{loan.borrowerEmail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-40 truncate" title={loan.propertyAddress}>
                    {loan.propertyAddress}
                  </div>
                  {loan.propertyCity && (
                    <p className="text-sm text-muted-foreground">
                      {loan.propertyCity}, {loan.propertyState}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={typeConfig.color}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {typeConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusCfg.color}>
                    {statusCfg.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(loan.originalLoanAmount)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalBudget)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">{formatCurrency(drawsFunded)}</span>
                    <span className="text-xs text-muted-foreground">{drawProgress}% drawn</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={holdbackRemaining > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                    {formatCurrency(holdbackRemaining)}
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/servicing/${loan.id}`);
                    }}
                    data-testid={`button-view-hardmoney-loan-${loan.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminServicingPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("dscr");
  const [searchQuery, setSearchQuery] = useState("");
  const [loanTypeFilter, setLoanTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: loans = [], isLoading, error } = useQuery<EnrichedServicedLoan[]>({
    queryKey: ["/api/admin/serviced-loans"],
  });

  const dscrLoans = loans.filter(l => l.loanType === "dscr");
  const hardMoneyLoans = loans.filter(l => l.loanType !== "dscr");

  const dscrStats = {
    totalLoans: dscrLoans.length,
    totalBalance: dscrLoans.reduce((sum, l) => sum + (l.currentBalance || 0), 0),
    currentLoans: dscrLoans.filter(l => l.loanStatus === "current").length,
    lateLoans: dscrLoans.filter(l => l.loanStatus === "late" || l.loanStatus === "default").length,
  };

  const hardMoneyStats = {
    totalLoans: hardMoneyLoans.length,
    fixFlipCount: hardMoneyLoans.filter(l => l.loanType === "fix_flip").length,
    constructionCount: hardMoneyLoans.filter(l => l.loanType === "new_construction").length,
    totalRehabBudget: hardMoneyLoans.reduce((sum, l) => sum + (l.totalRehabBudget || 0), 0),
    totalDrawsFunded: hardMoneyLoans.reduce((sum, l) => sum + (l.totalDrawsFunded || 0), 0),
    totalHoldbackRemaining: hardMoneyLoans.reduce((sum, l) => {
      const budget = l.totalRehabBudget || 0;
      const funded = l.totalDrawsFunded || 0;
      return sum + (budget - funded);
    }, 0),
    pendingDraws: hardMoneyLoans.filter(l => (l.totalDrawsApproved || 0) > (l.totalDrawsFunded || 0)).length,
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">You don't have permission to view this page.</p>
              <Button onClick={() => navigate("/admin")} data-testid="button-back-admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dscr" className="gap-2" data-testid="tab-dscr">
              <Home className="h-4 w-4" />
              DSCR
              <Badge variant="secondary" className="ml-1">{dscrLoans.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="hardmoney" className="gap-2" data-testid="tab-hardmoney">
              <Hammer className="h-4 w-4" />
              Hard Money
              <Badge variant="secondary" className="ml-1">{hardMoneyLoans.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dscr" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Loans</p>
                      <p className="text-2xl font-bold" data-testid="stat-dscr-total">{dscrStats.totalLoans}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Balance</p>
                      <p className="text-2xl font-bold" data-testid="stat-dscr-balance">{formatCurrency(dscrStats.totalBalance)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-2xl font-bold" data-testid="stat-dscr-current">{dscrStats.currentLoans}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Late/Default</p>
                      <p className="text-2xl font-bold" data-testid="stat-dscr-late">{dscrStats.lateLoans}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <CardTitle>DSCR Loans</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search loans..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                        data-testid="input-search-dscr"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40" data-testid="select-status-dscr">
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
                </div>
              </CardHeader>
              <CardContent>
                <DSCRTable 
                  loans={dscrLoans}
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                  navigate={navigate}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hardmoney" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Hammer className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Loans</p>
                      <p className="text-2xl font-bold" data-testid="stat-hm-total">{hardMoneyStats.totalLoans}</p>
                      <p className="text-xs text-muted-foreground">
                        {hardMoneyStats.fixFlipCount} Fix & Flip, {hardMoneyStats.constructionCount} Construction
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Wallet className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Rehab Budget</p>
                      <p className="text-2xl font-bold" data-testid="stat-hm-budget">{formatCurrency(hardMoneyStats.totalRehabBudget)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <FileCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Draws Funded</p>
                      <p className="text-2xl font-bold" data-testid="stat-hm-funded">{formatCurrency(hardMoneyStats.totalDrawsFunded)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Holdback Remaining</p>
                      <p className="text-2xl font-bold" data-testid="stat-hm-holdback">{formatCurrency(hardMoneyStats.totalHoldbackRemaining)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <CardTitle>Hard Money Loans</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search loans..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                        data-testid="input-search-hardmoney"
                      />
                    </div>
                    <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
                      <SelectTrigger className="w-full sm:w-40" data-testid="select-type-hardmoney">
                        <SelectValue placeholder="Loan Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="fix_flip">Fix & Flip</SelectItem>
                        <SelectItem value="new_construction">Construction</SelectItem>
                        <SelectItem value="bridge">Bridge</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40" data-testid="select-status-hardmoney">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="matured">Matured</SelectItem>
                        <SelectItem value="paid_off">Paid Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <HardMoneyTable 
                  loans={hardMoneyLoans}
                  searchQuery={searchQuery}
                  statusFilter={statusFilter}
                  loanTypeFilter={loanTypeFilter}
                  navigate={navigate}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
