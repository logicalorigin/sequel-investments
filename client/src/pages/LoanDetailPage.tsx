import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { format, differenceInDays, addMonths } from "date-fns";
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  ArrowLeft,
  Home,
  HardHat,
  Hammer,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  Download,
  Percent,
  MapPin,
  Wallet,
  Calculator,
  Plus,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
  BarChart3,
  PiggyBank,
  TrendingDown,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PortalHeader } from "@/components/PortalHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { 
  ServicedLoan, 
  LoanPayment, 
  LoanDraw, 
  LoanEscrowItem, 
  LoanDocument, 
  LoanMilestone,
  AmortizationRow 
} from "@shared/schema";
import { calculateAmortizationSchedule, calculateInterestOnlyPayment } from "@shared/schema";

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCurrencyPrecise = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">Paid</Badge>;
    case "scheduled":
      return <Badge variant="outline">Scheduled</Badge>;
    case "late":
      return <Badge variant="destructive">Late</Badge>;
    case "partial":
      return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">Partial</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getDrawStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "submitted":
      return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Submitted</Badge>;
    case "inspection_scheduled":
      return <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">Inspection Scheduled</Badge>;
    case "inspection_complete":
      return <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">Inspected</Badge>;
    case "approved":
      return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">Approved</Badge>;
    case "funded":
      return <Badge variant="secondary" className="bg-green-500/20 text-green-400">Funded</Badge>;
    case "denied":
      return <Badge variant="destructive">Denied</Badge>;
    case "cancelled":
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const isHardMoneyLoan = (type: string): boolean => {
  return type === "fix_flip" || type === "new_construction" || type === "bridge";
};

interface LoanDetailsResponse extends ServicedLoan {
  payments: LoanPayment[];
  draws: LoanDraw[];
  escrowItems: LoanEscrowItem[];
  documents: LoanDocument[];
  milestones: LoanMilestone[];
}

function AmortizationCalculator({ loan }: { loan: ServicedLoan }) {
  const [extraPayment, setExtraPayment] = useState(0);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  
  const schedule = useMemo(() => {
    if (!loan.originalLoanAmount || !loan.interestRate || !loan.amortizationMonths || !loan.firstPaymentDate) {
      return [];
    }
    return calculateAmortizationSchedule(
      loan.originalLoanAmount,
      parseFloat(loan.interestRate),
      loan.amortizationMonths,
      new Date(loan.firstPaymentDate)
    );
  }, [loan]);
  
  const paidPayments = loan.totalPrincipalPaid && loan.originalLoanAmount
    ? Math.floor((loan.totalPrincipalPaid / loan.originalLoanAmount) * schedule.length)
    : 0;
  
  const remainingSchedule = schedule.slice(paidPayments);
  const displaySchedule = showFullSchedule ? remainingSchedule : remainingSchedule.slice(0, 12);
  
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const remainingInterest = remainingSchedule.reduce((sum, row) => sum + row.interest, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Amortization Schedule
        </CardTitle>
        <CardDescription>
          {loan.amortizationMonths ? `${loan.amortizationMonths / 12}-year` : ''} amortization at {loan.interestRate}% interest
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{formatCurrency(loan.monthlyPayment)}</p>
            <p className="text-xs text-muted-foreground">Monthly P&I</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{formatCurrency(loan.totalPrincipalPaid)}</p>
            <p className="text-xs text-muted-foreground">Principal Paid</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{formatCurrency(loan.totalInterestPaid)}</p>
            <p className="text-xs text-muted-foreground">Interest Paid</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{formatCurrency(remainingInterest)}</p>
            <p className="text-xs text-muted-foreground">Remaining Interest</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Loan Progress</span>
            <span>{((1 - (loan.currentBalance / loan.originalLoanAmount)) * 100).toFixed(1)}% paid</span>
          </div>
          <Progress value={(1 - (loan.currentBalance / loan.originalLoanAmount)) * 100} className="h-2" />
        </div>
        
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Payment</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displaySchedule.map((row, idx) => (
                <TableRow key={row.paymentNumber} data-testid={`row-amortization-${row.paymentNumber}`}>
                  <TableCell className="font-mono text-xs">{row.paymentNumber}</TableCell>
                  <TableCell className="text-sm">{format(row.paymentDate, "MMM yyyy")}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.payment)}</TableCell>
                  <TableCell className="text-right text-emerald-500">{formatCurrency(row.principal)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(row.interest)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {remainingSchedule.length > 12 && (
          <Button 
            variant="ghost" 
            className="w-full mt-2"
            onClick={() => setShowFullSchedule(!showFullSchedule)}
          >
            {showFullSchedule ? (
              <>Show Less <ChevronUp className="ml-2 h-4 w-4" /></>
            ) : (
              <>Show All {remainingSchedule.length} Payments <ChevronDown className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function DrawManagement({ loan, draws }: { loan: ServicedLoan; draws: LoanDraw[] }) {
  const { toast } = useToast();
  const [newDrawOpen, setNewDrawOpen] = useState(false);
  const [newDrawAmount, setNewDrawAmount] = useState("");
  const [newDrawDescription, setNewDrawDescription] = useState("");
  
  const createDrawMutation = useMutation({
    mutationFn: async (data: { requestedAmount: number; description: string }) => {
      return apiRequest("POST", `/api/serviced-loans/${loan.id}/draws`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan.id, "details"] });
      setNewDrawOpen(false);
      setNewDrawAmount("");
      setNewDrawDescription("");
      toast({ title: "Draw request created" });
    },
    onError: () => {
      toast({ title: "Failed to create draw request", variant: "destructive" });
    },
  });
  
  const submitDrawMutation = useMutation({
    mutationFn: async (drawId: string) => {
      return apiRequest("POST", `/api/loan-draws/${drawId}/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan.id, "details"] });
      toast({ title: "Draw submitted for review" });
    },
  });
  
  const deleteDrawMutation = useMutation({
    mutationFn: async (drawId: string) => {
      return apiRequest("DELETE", `/api/loan-draws/${drawId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan.id, "details"] });
      toast({ title: "Draw deleted" });
    },
  });
  
  const fundedDraws = draws.filter(d => d.status === "funded");
  const pendingDraws = draws.filter(d => ["submitted", "inspection_scheduled", "inspection_complete", "approved"].includes(d.status));
  const draftDraws = draws.filter(d => d.status === "draft");
  
  const totalFunded = fundedDraws.reduce((sum, d) => sum + (d.fundedAmount || 0), 0);
  const remaining = (loan.totalRehabBudget || 0) - totalFunded;
  const progressPercent = loan.totalRehabBudget ? (totalFunded / loan.totalRehabBudget) * 100 : 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Draw Management
          </CardTitle>
          <CardDescription>Request and track construction/rehab draws</CardDescription>
        </div>
        <Dialog open={newDrawOpen} onOpenChange={setNewDrawOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-new-draw">
              <Plus className="h-4 w-4 mr-2" />
              New Draw
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request New Draw</DialogTitle>
              <DialogDescription>
                Submit a draw request for completed work. Maximum available: {formatCurrency(remaining)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="drawAmount">Amount Requested</Label>
                <Input
                  id="drawAmount"
                  type="number"
                  value={newDrawAmount}
                  onChange={(e) => setNewDrawAmount(e.target.value)}
                  placeholder="0"
                  data-testid="input-draw-amount"
                />
              </div>
              <div>
                <Label htmlFor="drawDescription">Work Completed</Label>
                <Textarea
                  id="drawDescription"
                  value={newDrawDescription}
                  onChange={(e) => setNewDrawDescription(e.target.value)}
                  placeholder="Describe the work completed for this draw..."
                  data-testid="input-draw-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewDrawOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createDrawMutation.mutate({
                  requestedAmount: parseInt(newDrawAmount) || 0,
                  description: newDrawDescription,
                })}
                disabled={!newDrawAmount || createDrawMutation.isPending}
                data-testid="button-create-draw"
              >
                Create Draw Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalFunded)}</p>
            <p className="text-xs text-muted-foreground">Total Funded</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-2xl font-bold text-amber-400">{formatCurrency(pendingDraws.reduce((s, d) => s + d.requestedAmount, 0))}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{formatCurrency(remaining)}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Budget Progress</span>
            <span>{progressPercent.toFixed(0)}% drawn</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(totalFunded)} of {formatCurrency(loan.totalRehabBudget)} budget
          </p>
        </div>
        
        <Separator className="my-4" />
        
        {draws.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No draws yet</p>
            <p className="text-xs text-muted-foreground">Request your first draw when work is completed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {draws.map((draw) => (
              <div 
                key={draw.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
                data-testid={`card-draw-${draw.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <span className="text-sm font-bold text-primary">#{draw.drawNumber}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{formatCurrency(draw.requestedAmount)}</p>
                      {getDrawStatusBadge(draw.status)}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {draw.description || "No description"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {draw.status === "draft" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => submitDrawMutation.mutate(draw.id)}
                        disabled={submitDrawMutation.isPending}
                        data-testid={`button-submit-draw-${draw.id}`}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Submit
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => deleteDrawMutation.mutate(draw.id)}
                        disabled={deleteDrawMutation.isPending}
                        data-testid={`button-delete-draw-${draw.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                  {draw.status === "funded" && draw.fundedDate && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(draw.fundedDate), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InterestPaymentTracker({ loan, payments }: { loan: ServicedLoan; payments: LoanPayment[] }) {
  const monthlyInterest = calculateInterestOnlyPayment(loan.currentBalance, parseFloat(loan.interestRate));
  
  const completedPayments = payments.filter(p => p.status === "completed");
  const scheduledPayments = payments.filter(p => p.status === "scheduled");
  const overduePayments = payments.filter(p => p.status === "late");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Interest Payments
        </CardTitle>
        <CardDescription>Interest-only payment tracking (no principal paydown)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyInterest)}</p>
            <p className="text-xs text-muted-foreground">Monthly Interest</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-2xl font-bold text-emerald-400">{completedPayments.length}</p>
            <p className="text-xs text-muted-foreground">Payments Made</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{scheduledPayments.length}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
          {overduePayments.length > 0 && (
            <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">{overduePayments.length}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          )}
        </div>
        
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.slice(0, 12).map((payment) => (
                <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                  <TableCell>{format(new Date(payment.dueDate), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(payment.scheduledAmount)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.paidDate ? format(new Date(payment.paidDate), "MMM d, yyyy") : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentHistory({ payments }: { payments: LoanPayment[] }) {
  const completedPayments = payments.filter(p => p.status === "completed" || p.status === "partial");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Payment History
        </CardTitle>
        <CardDescription>{completedPayments.length} payments on record</CardDescription>
      </CardHeader>
      <CardContent>
        {completedPayments.length === 0 ? (
          <div className="text-center py-8">
            <PiggyBank className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No payment history yet</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Date Paid</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.paymentNumber}</TableCell>
                    <TableCell>{payment.paidDate ? format(new Date(payment.paidDate), "MMM d, yyyy") : "-"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(payment.paidAmount)}</TableCell>
                    <TableCell className="text-right text-emerald-500">{formatCurrency(payment.principalAmount)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(payment.interestAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payment.balanceAfterPayment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EscrowSummary({ loan, escrowItems }: { loan: ServicedLoan; escrowItems: LoanEscrowItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Escrow Account
        </CardTitle>
        <CardDescription>Taxes, insurance, and HOA reserves</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xl font-bold text-primary">{formatCurrency(loan.escrowBalance)}</p>
            <p className="text-xs text-muted-foreground">Current Balance</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xl font-bold">{formatCurrency(loan.monthlyEscrowAmount)}</p>
            <p className="text-xs text-muted-foreground">Monthly Collection</p>
          </div>
        </div>
        
        {escrowItems.length > 0 ? (
          <div className="space-y-2">
            {escrowItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded border">
                <div>
                  <p className="font-medium capitalize">{item.itemType.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{item.vendorName || item.notes}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.monthlyAmount)}/mo</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.annualAmount)}/yr</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 rounded bg-muted/30">
              <p className="text-muted-foreground">Taxes</p>
              <p className="font-medium">{formatCurrency(loan.annualTaxes)}/yr</p>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="text-muted-foreground">Insurance</p>
              <p className="font-medium">{formatCurrency(loan.annualInsurance)}/yr</p>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <p className="text-muted-foreground">HOA</p>
              <p className="font-medium">{formatCurrency(loan.annualHOA)}/yr</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LoanDetailPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/portal/loans/:id");
  const [, setLocation] = useLocation();
  const loanId = params?.id;
  
  const { data: loanDetails, isLoading, error } = useQuery<LoanDetailsResponse>({
    queryKey: ["/api/serviced-loans", loanId, "details"],
    queryFn: async () => {
      const res = await fetch(`/api/serviced-loans/${loanId}/details`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch loan details");
      return res.json();
    },
    enabled: !!loanId,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PortalHeader user={user} title="Loading..." backHref="/portal/loans" />
        <main className="container max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !loanDetails) {
    return (
      <div className="min-h-screen bg-background">
        <PortalHeader user={user} title="Loan Not Found" backHref="/portal/loans" />
        <main className="container max-w-7xl mx-auto px-4 py-6">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loan Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The loan you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => setLocation("/portal/loans")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Active Loans
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  const loan = loanDetails;
  const isHardMoney = isHardMoneyLoan(loan.loanType);
  const LoanIcon = getLoanTypeIcon(loan.loanType);
  
  const daysToMaturity = loan.maturityDate 
    ? differenceInDays(new Date(loan.maturityDate), new Date())
    : null;

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader 
        user={user}
        title={loan.propertyAddress} 
        backHref="/portal/loans"
      />
      
      <main className="container max-w-7xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <LoanIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold">{loan.propertyAddress}</h1>
                    {getStatusBadge(loan.loanStatus)}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Loan #{loan.loanNumber} • {getLoanTypeLabel(loan.loanType)}
                    {loan.isInterestOnly && " • Interest Only"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="text-center md:text-right">
                  <p className="text-2xl font-bold text-primary">{formatCurrency(loan.currentBalance)}</p>
                  <p className="text-xs text-muted-foreground">Current Balance</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-2xl font-bold">{formatCurrency(loan.monthlyPayment)}</p>
                  <p className="text-xs text-muted-foreground">Monthly Payment</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-2xl font-bold">{loan.interestRate}%</p>
                  <p className="text-xs text-muted-foreground">Interest Rate</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-2xl font-bold">{loan.loanTermMonths}mo</p>
                  <p className="text-xs text-muted-foreground">Term</p>
                </div>
              </div>
            </div>
            
            {daysToMaturity !== null && daysToMaturity <= 90 && daysToMaturity > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-amber-400 font-medium">
                  {daysToMaturity} days until maturity ({format(new Date(loan.maturityDate!), "MMM d, yyyy")})
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        
        {isHardMoney ? (
          <Tabs defaultValue="draws" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="draws" data-testid="tab-draws">Draws</TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments">Payments</TabsTrigger>
              <TabsTrigger value="milestones" data-testid="tab-milestones">Milestones</TabsTrigger>
              <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="draws">
              <DrawManagement loan={loan} draws={loanDetails.draws} />
            </TabsContent>
            
            <TabsContent value="payments">
              <InterestPaymentTracker loan={loan} payments={loanDetails.payments} />
            </TabsContent>
            
            <TabsContent value="milestones">
              <Card>
                <CardHeader>
                  <CardTitle>Project Milestones</CardTitle>
                  <CardDescription>Track construction/renovation progress</CardDescription>
                </CardHeader>
                <CardContent>
                  {loanDetails.milestones.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">No milestones defined</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {loanDetails.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <div className={`p-2 rounded-full ${
                            milestone.status === "completed" ? "bg-emerald-500/20" : "bg-muted"
                          }`}>
                            {milestone.status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{milestone.title}</p>
                            {milestone.description && (
                              <p className="text-xs text-muted-foreground">{milestone.description}</p>
                            )}
                          </div>
                          {milestone.budgetAmount && (
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(milestone.budgetAmount)}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Documents</CardTitle>
                  <CardDescription>Closing docs, inspection reports, and correspondence</CardDescription>
                </CardHeader>
                <CardContent>
                  {loanDetails.documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {loanDetails.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentType} • {format(new Date(doc.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="amortization" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="amortization" data-testid="tab-amortization">Amortization</TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments">Payment History</TabsTrigger>
              <TabsTrigger value="escrow" data-testid="tab-escrow">Escrow</TabsTrigger>
              <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="amortization">
              <AmortizationCalculator loan={loan} />
            </TabsContent>
            
            <TabsContent value="payments">
              <PaymentHistory payments={loanDetails.payments} />
            </TabsContent>
            
            <TabsContent value="escrow">
              <EscrowSummary loan={loan} escrowItems={loanDetails.escrowItems} />
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Documents</CardTitle>
                  <CardDescription>Closing docs, statements, and correspondence</CardDescription>
                </CardHeader>
                <CardContent>
                  {loanDetails.documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground">No documents uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {loanDetails.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentType} • {format(new Date(doc.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
