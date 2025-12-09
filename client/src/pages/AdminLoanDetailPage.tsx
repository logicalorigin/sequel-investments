import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Loader2,
  Home,
  Hammer,
  HardHat,
  ArrowRightLeft,
  Receipt,
  FileText,
  User,
  Phone,
  Mail,
  Percent,
  Calculator,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ServicedLoan, LoanPayment, LoanDraw } from "@shared/schema";

type EnrichedServicedLoan = ServicedLoan & {
  borrowerName: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  payments: LoanPayment[];
  draws: LoanDraw[];
  escrowItems: any[];
  documents: any[];
  milestones: any[];
};

const loanTypeConfig = {
  dscr: { label: "DSCR Loan", icon: Home, color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  fix_flip: { label: "Fix & Flip", icon: Hammer, color: "bg-amber-600/10 text-amber-700 border-amber-600/30" },
  new_construction: { label: "Construction", icon: HardHat, color: "bg-yellow-600/10 text-yellow-700 border-yellow-600/30" },
  bridge: { label: "Bridge Loan", icon: ArrowRightLeft, color: "bg-amber-400/10 text-amber-500 border-amber-400/30" },
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

const drawStatusConfig = {
  draft: { label: "Draft", color: "bg-gray-500/10 text-gray-600 border-gray-500/30" },
  submitted: { label: "Submitted", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
  inspection_scheduled: { label: "Inspection", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  inspection_complete: { label: "Inspected", color: "bg-blue-700/10 text-blue-700 border-blue-700/30" },
  approved: { label: "Approved", color: "bg-green-500/10 text-green-600 border-green-500/30" },
  funded: { label: "Funded", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  denied: { label: "Denied", color: "bg-red-500/10 text-red-600 border-red-500/30" },
  cancelled: { label: "Cancelled", color: "bg-gray-500/10 text-gray-500 border-gray-500/30" },
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

export default function AdminLoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    principalAmount: 0,
    interestAmount: 0,
    escrowAmount: 0,
    lateFeesAmount: 0,
    paymentMethod: "ach",
    referenceNumber: "",
  });

  const [drawForm, setDrawForm] = useState({
    drawNumber: 1,
    requestedAmount: 0,
    description: "",
    workCompleted: "",
  });

  const [drawActionDialog, setDrawActionDialog] = useState<{
    open: boolean;
    action: "approve" | "deny" | null;
    draw: LoanDraw | null;
    approvedAmount: number;
    notes: string;
  }>({
    open: false,
    action: null,
    draw: null,
    approvedAmount: 0,
    notes: "",
  });

  const { data: loan, isLoading, error } = useQuery<EnrichedServicedLoan>({
    queryKey: ["/api/admin/serviced-loans", id],
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (data: typeof paymentForm) => {
      return await apiRequest("POST", `/api/admin/serviced-loans/${id}/payments`, {
        ...data,
        dueDate: new Date(data.paymentDate),
        paidDate: new Date(data.paymentDate),
        paymentNumber: (loan?.payments?.length || 0) + 1,
        scheduledAmount: data.principalAmount + data.interestAmount + data.escrowAmount + data.lateFeesAmount,
        paidAmount: data.principalAmount + data.interestAmount + data.escrowAmount + data.lateFeesAmount,
        lateFee: data.lateFeesAmount,
        status: "completed",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/serviced-loans", id] });
      toast({ title: "Payment recorded successfully" });
      setPaymentDialogOpen(false);
      setPaymentForm({
        paymentDate: new Date().toISOString().split('T')[0],
        principalAmount: 0,
        interestAmount: 0,
        escrowAmount: 0,
        lateFeesAmount: 0,
        paymentMethod: "ach",
        referenceNumber: "",
      });
    },
    onError: () => {
      toast({ title: "Failed to record payment", variant: "destructive" });
    },
  });

  const createDrawMutation = useMutation({
    mutationFn: async (data: typeof drawForm) => {
      return await apiRequest("POST", `/api/admin/serviced-loans/${id}/draws`, {
        ...data,
        status: "draft",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/serviced-loans", id] });
      toast({ title: "Draw request created" });
      setDrawDialogOpen(false);
      setDrawForm({
        drawNumber: (loan?.draws?.length || 0) + 2,
        requestedAmount: 0,
        description: "",
        workCompleted: "",
      });
    },
    onError: () => {
      toast({ title: "Failed to create draw", variant: "destructive" });
    },
  });

  const updateDrawMutation = useMutation({
    mutationFn: async ({ drawId, status, approvedAmount, notes, deniedReason }: { 
      drawId: string; 
      status: string; 
      approvedAmount?: number;
      notes?: string;
      deniedReason?: string;
    }) => {
      return await apiRequest("PATCH", `/api/servicing/${loan?.id}/draws/${drawId}`, { 
        status, 
        approvedAmount,
        notes,
        deniedReason,
        fundedDate: status === "funded" ? new Date() : undefined 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/serviced-loans", id] });
      toast({ title: "Draw updated successfully" });
      setDrawActionDialog({ open: false, action: null, draw: null, approvedAmount: 0, notes: "" });
    },
    onError: () => {
      toast({ title: "Failed to update draw", variant: "destructive" });
    },
  });

  const openDrawActionDialog = (action: "approve" | "deny", draw: LoanDraw) => {
    setDrawActionDialog({
      open: true,
      action,
      draw,
      approvedAmount: draw.requestedAmount,
      notes: "",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Loan Not Found</h2>
              <p className="text-muted-foreground mb-4">This loan could not be found.</p>
              <Button onClick={() => navigate("/admin/servicing")} data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Servicing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeConfig = loanTypeConfig[loan.loanType as keyof typeof loanTypeConfig] || loanTypeConfig.dscr;
  const statusCfg = statusConfig[loan.loanStatus as keyof typeof statusConfig] || statusConfig.current;
  const TypeIcon = typeConfig.icon;
  const isHardMoney = loan.loanType !== "dscr";
  
  const rehabRemaining = isHardMoney 
    ? (loan.totalRehabBudget || 0) - (loan.totalDrawsFunded || 0) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/servicing")} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono">{loan.loanNumber}</h1>
                <Badge variant="outline" className={typeConfig.color}>
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {typeConfig.label}
                </Badge>
                <Badge variant="outline" className={statusCfg.color}>
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{loan.propertyAddress}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current Balance</p>
                      <p className="text-lg font-bold" data-testid="stat-balance">{formatCurrency(loan.currentBalance)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Receipt className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Payment</p>
                      <p className="text-lg font-bold" data-testid="stat-payment">{formatCurrency(loan.monthlyPayment)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Percent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Interest Rate</p>
                      <p className="text-lg font-bold" data-testid="stat-rate">{loan.interestRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Next Due</p>
                      <p className="text-lg font-bold" data-testid="stat-next-due">{formatDate(loan.nextPaymentDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="payments" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="payments" data-testid="tab-payments">
                  Payments ({loan.payments?.length || 0})
                </TabsTrigger>
                {isHardMoney && (
                  <TabsTrigger value="draws" data-testid="tab-draws">
                    Draws ({loan.draws?.length || 0})
                  </TabsTrigger>
                )}
                <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="payments" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Payment History</CardTitle>
                    <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-record-payment">
                          <Plus className="h-4 w-4 mr-2" />
                          Record Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Payment</DialogTitle>
                          <DialogDescription>
                            Record a payment for loan {loan.loanNumber}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Payment Date</Label>
                            <Input
                              type="date"
                              value={paymentForm.paymentDate}
                              onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                              data-testid="input-payment-date"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Principal</Label>
                              <Input
                                type="number"
                                value={paymentForm.principalAmount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, principalAmount: Number(e.target.value) })}
                                data-testid="input-principal"
                              />
                            </div>
                            <div>
                              <Label>Interest</Label>
                              <Input
                                type="number"
                                value={paymentForm.interestAmount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, interestAmount: Number(e.target.value) })}
                                data-testid="input-interest"
                              />
                            </div>
                            <div>
                              <Label>Escrow</Label>
                              <Input
                                type="number"
                                value={paymentForm.escrowAmount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, escrowAmount: Number(e.target.value) })}
                                data-testid="input-escrow"
                              />
                            </div>
                            <div>
                              <Label>Late Fees</Label>
                              <Input
                                type="number"
                                value={paymentForm.lateFeesAmount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, lateFeesAmount: Number(e.target.value) })}
                                data-testid="input-late-fees"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Payment Method</Label>
                            <Select 
                              value={paymentForm.paymentMethod} 
                              onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMethod: v })}
                            >
                              <SelectTrigger data-testid="select-payment-method">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ach">ACH</SelectItem>
                                <SelectItem value="wire">Wire</SelectItem>
                                <SelectItem value="check">Check</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Reference Number</Label>
                            <Input
                              value={paymentForm.referenceNumber}
                              onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                              placeholder="Optional"
                              data-testid="input-reference"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => recordPaymentMutation.mutate(paymentForm)}
                            disabled={recordPaymentMutation.isPending}
                            data-testid="button-submit-payment"
                          >
                            {recordPaymentMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Record Payment
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {(loan.payments?.length || 0) === 0 ? (
                      <div className="text-center py-8">
                        <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No payments recorded yet</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Principal</TableHead>
                            <TableHead className="text-right">Interest</TableHead>
                            <TableHead className="text-right">Escrow</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Method</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loan.payments?.map((payment) => (
                            <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                              <TableCell>{formatDate(payment.paidDate)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(payment.principalAmount)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(payment.interestAmount)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(payment.escrowAmount)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(payment.paidAmount)}</TableCell>
                              <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {isHardMoney && (
                <TabsContent value="draws" className="mt-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Draw Management</CardTitle>
                        <CardDescription>
                          Rehab Budget: {formatCurrency(loan.totalRehabBudget)} | 
                          Funded: {formatCurrency(loan.totalDrawsFunded)} | 
                          Remaining: {formatCurrency(rehabRemaining)}
                        </CardDescription>
                      </div>
                      <Dialog open={drawDialogOpen} onOpenChange={setDrawDialogOpen}>
                        <DialogTrigger asChild>
                          <Button data-testid="button-create-draw">
                            <Plus className="h-4 w-4 mr-2" />
                            New Draw
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create Draw Request</DialogTitle>
                            <DialogDescription>
                              Available for draw: {formatCurrency(rehabRemaining)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Draw Number</Label>
                              <Input
                                type="number"
                                value={drawForm.drawNumber}
                                onChange={(e) => setDrawForm({ ...drawForm, drawNumber: Number(e.target.value) })}
                                data-testid="input-draw-number"
                              />
                            </div>
                            <div>
                              <Label>Requested Amount</Label>
                              <Input
                                type="number"
                                value={drawForm.requestedAmount}
                                onChange={(e) => setDrawForm({ ...drawForm, requestedAmount: Number(e.target.value) })}
                                data-testid="input-draw-amount"
                              />
                            </div>
                            <div>
                              <Label>Work Completed</Label>
                              <Input
                                value={drawForm.workCompleted}
                                onChange={(e) => setDrawForm({ ...drawForm, workCompleted: e.target.value })}
                                placeholder="e.g., Kitchen renovation, Roof replacement"
                                data-testid="input-work-completed"
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input
                                value={drawForm.description}
                                onChange={(e) => setDrawForm({ ...drawForm, description: e.target.value })}
                                placeholder="Additional notes"
                                data-testid="input-draw-description"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDrawDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => createDrawMutation.mutate(drawForm)}
                              disabled={createDrawMutation.isPending}
                              data-testid="button-submit-draw"
                            >
                              {createDrawMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Create Draw
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      {(loan.draws?.length || 0) === 0 ? (
                        <div className="text-center py-8">
                          <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No draws requested yet</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Draw #</TableHead>
                              <TableHead>Work</TableHead>
                              <TableHead className="text-right">Requested</TableHead>
                              <TableHead className="text-right">Approved</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loan.draws?.map((draw) => {
                              const drawStatus = drawStatusConfig[draw.status as keyof typeof drawStatusConfig] || drawStatusConfig.draft;
                              return (
                                <TableRow key={draw.id} data-testid={`row-draw-${draw.id}`}>
                                  <TableCell>#{draw.drawNumber}</TableCell>
                                  <TableCell>{draw.workCompleted || draw.description || "—"}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(draw.requestedAmount)}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(draw.approvedAmount)}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={drawStatus.color}>
                                      {drawStatus.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {(draw.status === "draft" || draw.status === "submitted") && (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-green-600 hover:text-green-700"
                                          onClick={() => openDrawActionDialog("approve", draw)}
                                          disabled={updateDrawMutation.isPending}
                                          data-testid={`button-approve-draw-${draw.id}`}
                                        >
                                          <Check className="h-3 w-3 mr-1" />
                                          Approve
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-red-600 hover:text-red-700"
                                          onClick={() => openDrawActionDialog("deny", draw)}
                                          disabled={updateDrawMutation.isPending}
                                          data-testid={`button-deny-draw-${draw.id}`}
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          Deny
                                        </Button>
                                      </div>
                                    )}
                                    {draw.status === "approved" && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateDrawMutation.mutate({
                                          drawId: draw.id,
                                          status: "funded",
                                        })}
                                        disabled={updateDrawMutation.isPending}
                                        data-testid={`button-fund-draw-${draw.id}`}
                                      >
                                        Fund
                                      </Button>
                                    )}
                                    {draw.status === "funded" && (
                                      <span className="text-sm text-muted-foreground">
                                        Funded {formatDate(draw.fundedDate)}
                                      </span>
                                    )}
                                    {draw.status === "denied" && (
                                      <span className="text-sm text-red-500">
                                        Denied
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Loan Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Loan Terms</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Original Amount</p>
                          <p className="font-medium">{formatCurrency(loan.originalLoanAmount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                          <p className="font-medium">{formatCurrency(loan.currentBalance)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Interest Rate</p>
                          <p className="font-medium">{loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Term</p>
                          <p className="font-medium">{loan.loanTermMonths} months</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Type</p>
                          <p className="font-medium">{loan.isInterestOnly ? "Interest Only" : "Amortizing"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Payment</p>
                          <p className="font-medium">{formatCurrency(loan.monthlyPayment)}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Important Dates</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Closing Date</p>
                          <p className="font-medium">{formatDate(loan.closingDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">First Payment</p>
                          <p className="font-medium">{formatDate(loan.firstPaymentDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Maturity Date</p>
                          <p className="font-medium">{formatDate(loan.maturityDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Payment</p>
                          <p className="font-medium">{formatDate(loan.lastPaymentDate)}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Payment Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Principal Paid</p>
                          <p className="font-medium">{formatCurrency(loan.totalPrincipalPaid)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Interest Paid</p>
                          <p className="font-medium">{formatCurrency(loan.totalInterestPaid)}</p>
                        </div>
                        {!isHardMoney && (
                          <div>
                            <p className="text-sm text-muted-foreground">Escrow Balance</p>
                            <p className="font-medium">{formatCurrency(loan.escrowBalance)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Borrower
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{loan.borrowerName}</p>
                </div>
                {loan.borrowerEmail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {loan.borrowerEmail}
                  </div>
                )}
                {loan.borrowerPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {loan.borrowerPhone}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{loan.propertyAddress}</p>
                {loan.propertyCity && (
                  <p className="text-sm text-muted-foreground">
                    {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}
                  </p>
                )}
              </CardContent>
            </Card>

            {isHardMoney && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hammer className="h-4 w-4" />
                    Rehab Budget
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span className="font-medium">{formatCurrency(loan.totalRehabBudget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Funded</span>
                    <span className="font-medium">{formatCurrency(loan.totalDrawsFunded)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Remaining</span>
                    <span className="font-bold text-primary">{formatCurrency(rehabRemaining)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(((loan.totalDrawsFunded || 0) / (loan.totalRehabBudget || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {!isHardMoney && loan.monthlyEscrowAmount && loan.monthlyEscrowAmount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Escrow Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Escrow</span>
                    <span className="font-medium">{formatCurrency(loan.monthlyEscrowAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className="font-medium">{formatCurrency(loan.escrowBalance)}</span>
                  </div>
                  <Separator />
                  {loan.annualTaxes && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual Taxes</span>
                      <span>{formatCurrency(loan.annualTaxes)}</span>
                    </div>
                  )}
                  {loan.annualInsurance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual Insurance</span>
                      <span>{formatCurrency(loan.annualInsurance)}</span>
                    </div>
                  )}
                  {loan.annualHOA && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual HOA</span>
                      <span>{formatCurrency(loan.annualHOA)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Dialog open={drawActionDialog.open} onOpenChange={(open) => {
          if (!open) setDrawActionDialog({ open: false, action: null, draw: null, approvedAmount: 0, notes: "" });
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {drawActionDialog.action === "approve" ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Approve Draw Request
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Deny Draw Request
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {drawActionDialog.action === "approve" 
                  ? `Approve draw #${drawActionDialog.draw?.drawNumber} for ${formatCurrency(drawActionDialog.draw?.requestedAmount || 0)}`
                  : `Deny draw #${drawActionDialog.draw?.drawNumber} with a reason`
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {drawActionDialog.action === "approve" && (
                <div>
                  <Label>Approved Amount</Label>
                  <Input
                    type="number"
                    value={drawActionDialog.approvedAmount}
                    onChange={(e) => setDrawActionDialog({
                      ...drawActionDialog,
                      approvedAmount: Number(e.target.value)
                    })}
                    data-testid="input-approved-amount"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Requested: {formatCurrency(drawActionDialog.draw?.requestedAmount || 0)}
                  </p>
                </div>
              )}
              <div>
                <Label>{drawActionDialog.action === "approve" ? "Notes (Optional)" : "Reason for Denial"}</Label>
                <Textarea
                  value={drawActionDialog.notes}
                  onChange={(e) => setDrawActionDialog({
                    ...drawActionDialog,
                    notes: e.target.value
                  })}
                  placeholder={drawActionDialog.action === "approve" 
                    ? "Add any notes for this approval..." 
                    : "Explain why this draw is being denied..."}
                  data-testid="input-draw-action-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDrawActionDialog({ open: false, action: null, draw: null, approvedAmount: 0, notes: "" })}
              >
                Cancel
              </Button>
              <Button 
                variant={drawActionDialog.action === "approve" ? "default" : "destructive"}
                onClick={() => {
                  if (drawActionDialog.draw && drawActionDialog.action) {
                    updateDrawMutation.mutate({
                      drawId: drawActionDialog.draw.id,
                      status: drawActionDialog.action === "approve" ? "approved" : "denied",
                      approvedAmount: drawActionDialog.action === "approve" ? drawActionDialog.approvedAmount : undefined,
                      notes: drawActionDialog.notes || undefined,
                      deniedReason: drawActionDialog.action === "deny" ? drawActionDialog.notes : undefined,
                    });
                  }
                }}
                disabled={updateDrawMutation.isPending || (drawActionDialog.action === "deny" && !drawActionDialog.notes)}
                data-testid="button-confirm-draw-action"
              >
                {updateDrawMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {drawActionDialog.action === "approve" ? "Approve Draw" : "Deny Draw"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
