import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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
  Wallet,
  Send,
  Trash2,
  Camera,
  MapPin,
  Image,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Navigation,
  CircleAlert,
  HelpCircle,
  Maximize2,
} from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ServicedLoan, LoanPayment, LoanDraw, ScopeOfWorkItem, DrawLineItem, ScopeOfWorkCategory, DrawPhoto, PropertyLocation, PhotoVerificationStatus } from "@shared/schema";
import { SCOPE_OF_WORK_CATEGORY_NAMES, NEW_CONSTRUCTION_CATEGORY_NAMES } from "@shared/schema";

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

interface ScopeOfWorkWithFunding extends ScopeOfWorkItem {
  totalFunded: number;
}

interface CategorySummary {
  category: ScopeOfWorkCategory;
  totalBudget: number;
  totalFunded: number;
  items: ScopeOfWorkWithFunding[];
}

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

const photoVerificationStatusConfig: Record<PhotoVerificationStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "bg-gray-500/10 text-gray-600 border-gray-500/30" },
  verified: { label: "Verified", icon: CheckCircle2, color: "bg-green-500/10 text-green-600 border-green-500/30" },
  gps_match: { label: "GPS Match", icon: CheckCircle2, color: "bg-green-500/10 text-green-600 border-green-500/30" },
  gps_mismatch: { label: "GPS Mismatch", icon: AlertTriangle, color: "bg-red-500/10 text-red-600 border-red-500/30" },
  outside_geofence: { label: "Outside Geofence", icon: Navigation, color: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
  stale_timestamp: { label: "Stale Photo", icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
  metadata_missing: { label: "No Location Data", icon: HelpCircle, color: "bg-gray-500/10 text-gray-500 border-gray-500/30" },
  browser_gps_only: { label: "Browser GPS Only", icon: MapPin, color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  exif_gps_only: { label: "EXIF GPS Only", icon: Image, color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  no_gps_data: { label: "No GPS Data", icon: HelpCircle, color: "bg-gray-500/10 text-gray-500 border-gray-500/30" },
  manual_approved: { label: "Manually Approved", icon: ThumbsUp, color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  manual_rejected: { label: "Manually Rejected", icon: ThumbsDown, color: "bg-red-500/10 text-red-600 border-red-500/30" },
};

type EnrichedDrawPhoto = DrawPhoto & {
  loanDrawId: string; // Explicitly typed for filtering
  drawNumber: number;
  drawStatus: string;
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
  
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    principalAmount: 0,
    interestAmount: 0,
    escrowAmount: 0,
    lateFeesAmount: 0,
    paymentMethod: "ach",
    referenceNumber: "",
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

  const [activeDrawTab, setActiveDrawTab] = useState<"scope" | "draws">("scope");
  const [newDrawOpen, setNewDrawOpen] = useState(false);
  const [newDrawDescription, setNewDrawDescription] = useState("");
  const [drawLineAmounts, setDrawLineAmounts] = useState<Record<string, number>>({});
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editBudgetValue, setEditBudgetValue] = useState("");

  const { data: loan, isLoading, error } = useQuery<EnrichedServicedLoan>({
    queryKey: ["/api/admin/serviced-loans", id],
  });

  const { data: scopeOfWorkItems = [], isLoading: scopeLoading } = useQuery<ScopeOfWorkItem[]>({
    queryKey: ["/api/serviced-loans", loan?.id, "scope-of-work"],
    enabled: !!loan?.id,
  });

  const { data: allDrawLineItems = [] } = useQuery<DrawLineItem[]>({
    queryKey: ["/api/serviced-loans", loan?.id, "all-draw-line-items"],
    enabled: !!loan?.id && (loan?.draws?.length || 0) > 0,
  });

  const { data: allPhotos = [], isLoading: photosLoading } = useQuery<EnrichedDrawPhoto[]>({
    queryKey: ["/api/serviced-loans", loan?.id, "all-photos"],
    enabled: !!loan?.id && loan?.loanType !== "dscr",
  });

  const { data: propertyLocation } = useQuery<PropertyLocation>({
    queryKey: ["/api/serviced-loans", loan?.id, "property-location"],
    enabled: !!loan?.id,
  });

  const [selectedPhoto, setSelectedPhoto] = useState<EnrichedDrawPhoto | null>(null);
  const [photoReviewDialog, setPhotoReviewDialog] = useState<{
    open: boolean;
    photo: EnrichedDrawPhoto | null;
    action: "approve" | "reject" | null;
    reason: string;
  }>({
    open: false,
    photo: null,
    action: null,
    reason: "",
  });

  const photoVerifyMutation = useMutation({
    mutationFn: async ({ photoId, newStatus, reason }: { photoId: string; newStatus: PhotoVerificationStatus; reason: string }) => {
      return await apiRequest("PATCH", `/api/draw-photos/${photoId}/verify`, { newStatus, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan?.id, "all-photos"] });
      toast({ title: "Photo verification updated" });
      setPhotoReviewDialog({ open: false, photo: null, action: null, reason: "" });
    },
    onError: () => {
      toast({ title: "Failed to update verification", variant: "destructive" });
    },
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
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan?.id, "scope-of-work"] });
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan?.id, "all-draw-line-items"] });
      toast({ title: "Draw updated successfully" });
      setDrawActionDialog({ open: false, action: null, draw: null, approvedAmount: 0, notes: "" });
    },
    onError: (error: any) => {
      // Check for photo verification error
      if (error?.message?.includes("Photo verification required") || error?.message?.includes("photo")) {
        toast({ 
          title: "Photo Verification Required", 
          description: error?.message || "All photos must be verified or manually approved before funding.",
          variant: "destructive" 
        });
      } else {
        toast({ title: "Failed to update draw", variant: "destructive" });
      }
    },
  });

  // Helper to get photo verification status for a draw
  const getDrawPhotoStatus = (drawId: string) => {
    const drawPhotos = allPhotos.filter(p => p.loanDrawId === drawId);
    if (drawPhotos.length === 0) {
      return { hasPhotos: false, allVerified: true, verifiedCount: 0, totalCount: 0, needsReviewCount: 0, rejectedCount: 0 };
    }
    const verifiedPhotos = drawPhotos.filter(p => ["verified", "manual_approved"].includes(p.verificationStatus));
    const rejectedPhotos = drawPhotos.filter(p => p.verificationStatus === "manual_rejected");
    const needsReview = drawPhotos.filter(p => 
      ["pending", "outside_geofence", "stale_timestamp", "metadata_missing"].includes(p.verificationStatus)
    );
    return {
      hasPhotos: true,
      allVerified: verifiedPhotos.length === drawPhotos.length,
      verifiedCount: verifiedPhotos.length,
      totalCount: drawPhotos.length,
      needsReviewCount: needsReview.length,
      rejectedCount: rejectedPhotos.length,
    };
  };

  const initializeScopeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/serviced-loans/${loan?.id}/scope-of-work/initialize`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan?.id, "scope-of-work"] });
      toast({ title: "Scope of work initialized with default line items" });
    },
    onError: () => {
      toast({ title: "Failed to initialize scope of work", variant: "destructive" });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ itemId, budgetAmount }: { itemId: string; budgetAmount: number }) => {
      return apiRequest("PATCH", `/api/scope-of-work-items/${itemId}`, { budgetAmount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan?.id, "scope-of-work"] });
      setEditingBudget(null);
      setEditBudgetValue("");
      toast({ title: "Budget updated" });
    },
    onError: () => {
      toast({ title: "Failed to update budget", variant: "destructive" });
    },
  });

  const createDrawWithLineItemsMutation = useMutation({
    mutationFn: async (data: { requestedAmount: number; description: string }) => {
      return await apiRequest("POST", `/api/serviced-loans/${loan?.id}/draws`, data);
    },
    onSuccess: async (draw: any) => {
      const lineItemPromises = Object.entries(drawLineAmounts)
        .filter(([_, amount]) => amount > 0)
        .map(([scopeOfWorkItemId, requestedAmount]) =>
          apiRequest("POST", `/api/loan-draws/${draw.id}/line-items`, {
            scopeOfWorkItemId,
            requestedAmount,
          })
        );
      await Promise.all(lineItemPromises);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/serviced-loans", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan?.id, "scope-of-work"] });
      queryClient.invalidateQueries({ queryKey: ["/api/serviced-loans", loan?.id, "all-draw-line-items"] });
      setNewDrawOpen(false);
      setNewDrawDescription("");
      setDrawLineAmounts({});
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/serviced-loans", id] });
      toast({ title: "Draw submitted for review" });
    },
  });

  const deleteDrawMutation = useMutation({
    mutationFn: async (drawId: string) => {
      return apiRequest("DELETE", `/api/loan-draws/${drawId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/serviced-loans", id] });
      toast({ title: "Draw deleted" });
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
  const categoryNames = loan.loanType === "new_construction" ? NEW_CONSTRUCTION_CATEGORY_NAMES : SCOPE_OF_WORK_CATEGORY_NAMES;
  
  const rehabRemaining = isHardMoney 
    ? (loan.totalRehabBudget || 0) - (loan.totalDrawsFunded || 0) 
    : 0;

  const fundedDrawIds = loan.draws?.filter(d => d.status === "funded").map(d => d.id) || [];
  const fundedLineItems = allDrawLineItems.filter(li => fundedDrawIds.includes(li.loanDrawId));

  const scopeWithFunding: ScopeOfWorkWithFunding[] = scopeOfWorkItems.map(item => {
    const totalFunded = fundedLineItems
      .filter(li => li.scopeOfWorkItemId === item.id)
      .reduce((sum, li) => sum + (li.fundedAmount || 0), 0);
    return { ...item, totalFunded };
  });

  const categoryOrder: ScopeOfWorkCategory[] = ["soft_costs", "demo_foundation", "hvac_plumbing_electrical", "interior", "exterior"];
  const categorySummaries: CategorySummary[] = categoryOrder.map(category => {
    const items = scopeWithFunding.filter(i => i.category === category).sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      category,
      totalBudget: items.reduce((sum, i) => sum + i.budgetAmount, 0),
      totalFunded: items.reduce((sum, i) => sum + i.totalFunded, 0),
      items,
    };
  }).filter(cs => cs.items.length > 0);

  const grandTotalBudget = categorySummaries.reduce((sum, cs) => sum + cs.totalBudget, 0);
  const grandTotalFunded = categorySummaries.reduce((sum, cs) => sum + cs.totalFunded, 0);

  const fundedDraws = loan.draws?.filter(d => d.status === "funded") || [];
  const pendingDraws = loan.draws?.filter(d => ["submitted", "inspection_scheduled", "inspection_complete", "approved"].includes(d.status)) || [];
  const totalFunded = fundedDraws.reduce((sum, d) => sum + (d.fundedAmount || 0), 0);
  const remaining = (loan.totalRehabBudget || 0) - totalFunded;
  const progressPercent = loan.totalRehabBudget ? (totalFunded / loan.totalRehabBudget) * 100 : 0;

  const newDrawTotal = Object.values(drawLineAmounts).reduce((sum, amt) => sum + amt, 0);

  const handleSaveBudget = (itemId: string) => {
    const value = parseInt(editBudgetValue) || 0;
    updateBudgetMutation.mutate({ itemId, budgetAmount: value });
  };

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-xl font-bold font-mono">{loan.loanNumber}</h1>
          <Badge variant="outline" className={typeConfig.color}>
            <TypeIcon className="h-3 w-3 mr-1" />
            {typeConfig.label}
          </Badge>
          <Badge variant="outline" className={statusCfg.color}>
            {statusCfg.label}
          </Badge>
          <span className="text-sm text-muted-foreground ml-2">{loan.propertyAddress}</span>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Property Location Card */}
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{loan.propertyAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}
                      </p>
                      {propertyLocation && propertyLocation.latitude && propertyLocation.longitude && (
                        <div className="mt-2 text-xs text-muted-foreground font-mono">
                          GPS: {parseFloat(propertyLocation.latitude).toFixed(6)}, {parseFloat(propertyLocation.longitude).toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                {isHardMoney && (
                  <TabsTrigger value="photos" data-testid="tab-photos">
                    <Camera className="h-4 w-4 mr-1" />
                    Photos ({allPhotos.length})
                  </TabsTrigger>
                )}
                <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
                <TabsTrigger value="documents" data-testid="tab-documents">
                  <FileText className="h-4 w-4 mr-1" />
                  Documents ({loan.documents?.length || 0})
                </TabsTrigger>
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
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="h-5 w-5" />
                          Draw Management
                        </CardTitle>
                        <CardDescription>Scope of work budget and draw requests</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tabs value={activeDrawTab} onValueChange={(v) => setActiveDrawTab(v as "scope" | "draws")}>
                          <TabsList>
                            <TabsTrigger value="scope" data-testid="tab-scope-of-work">Scope of Work</TabsTrigger>
                            <TabsTrigger value="draws" data-testid="tab-draw-requests">Draw Requests</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-2xl font-bold text-emerald-400" data-testid="text-total-funded">{formatCurrency(totalFunded)}</p>
                          <p className="text-xs text-muted-foreground">Total Funded</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <p className="text-2xl font-bold text-amber-400" data-testid="text-pending-amount">{formatCurrency(pendingDraws.reduce((s, d) => s + d.requestedAmount, 0))}</p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold" data-testid="text-remaining">{formatCurrency(remaining)}</p>
                          <p className="text-xs text-muted-foreground">Remaining</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Budget Progress</span>
                          <span>{progressPercent.toFixed(0)}% drawn</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" data-testid="progress-budget" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(totalFunded)} of {formatCurrency(loan.totalRehabBudget)} budget
                        </p>
                      </div>

                      <Separator className="my-4" />

                      {activeDrawTab === "scope" && (
                        <div className="space-y-4">
                          {scopeLoading ? (
                            <div className="space-y-2">
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                              <Skeleton className="h-12 w-full" />
                            </div>
                          ) : scopeOfWorkItems.length === 0 ? (
                            <div className="text-center py-8">
                              <HardHat className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                              <p className="text-muted-foreground mb-2">No scope of work items defined</p>
                              <p className="text-xs text-muted-foreground mb-4">Initialize the scope of work to create default line items</p>
                              <Button
                                onClick={() => initializeScopeMutation.mutate()}
                                disabled={initializeScopeMutation.isPending}
                                data-testid="button-initialize-scope"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Initialize Scope of Work
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-4">
                                <div className="grid grid-cols-4 gap-4 flex-1">
                                  <div className="text-center p-2 rounded-lg bg-muted/50">
                                    <p className="text-lg font-bold" data-testid="text-grand-total-budget">{formatCurrency(grandTotalBudget)}</p>
                                    <p className="text-xs text-muted-foreground">Total Budget</p>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <p className="text-lg font-bold text-emerald-400" data-testid="text-grand-total-funded">{formatCurrency(grandTotalFunded)}</p>
                                    <p className="text-xs text-muted-foreground">Total Funded</p>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-muted/50">
                                    <p className="text-lg font-bold" data-testid="text-grand-remaining">{formatCurrency(grandTotalBudget - grandTotalFunded)}</p>
                                    <p className="text-xs text-muted-foreground">Remaining</p>
                                  </div>
                                  <div className="text-center p-2 rounded-lg bg-muted/50">
                                    <p className="text-lg font-bold">{grandTotalBudget > 0 ? ((grandTotalFunded / grandTotalBudget) * 100).toFixed(0) : 0}%</p>
                                    <p className="text-xs text-muted-foreground">% Complete</p>
                                  </div>
                                </div>
                              </div>

                              <Accordion type="multiple" defaultValue={categoryOrder} className="space-y-2">
                                {categorySummaries.map((cs) => {
                                  const categoryPercent = cs.totalBudget > 0 ? (cs.totalFunded / cs.totalBudget) * 100 : 0;
                                  return (
                                    <AccordionItem key={cs.category} value={cs.category} className="border rounded-lg">
                                      <AccordionTrigger className="px-4 hover:no-underline" data-testid={`accordion-category-${cs.category}`}>
                                        <div className="flex items-center justify-between w-full pr-4">
                                          <span className="font-medium">{categoryNames[cs.category]}</span>
                                          <div className="flex items-center gap-4">
                                            <div className="w-32">
                                              <Progress value={categoryPercent} className="h-2" />
                                            </div>
                                            <span className="text-sm text-muted-foreground min-w-[100px] text-right">
                                              {formatCurrency(cs.totalFunded)} / {formatCurrency(cs.totalBudget)}
                                            </span>
                                          </div>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="px-0 pb-0">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="pl-4">Item</TableHead>
                                              <TableHead className="text-right">Budget</TableHead>
                                              <TableHead className="text-right">Funded</TableHead>
                                              <TableHead className="text-right pr-4">Remaining</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {cs.items.map((item) => (
                                              <TableRow key={item.id} data-testid={`row-scope-item-${item.id}`}>
                                                <TableCell className="pl-4 font-medium">{item.itemName}</TableCell>
                                                <TableCell className="text-right">
                                                  {editingBudget === item.id ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                      <Input
                                                        type="number"
                                                        value={editBudgetValue}
                                                        onChange={(e) => setEditBudgetValue(e.target.value)}
                                                        className="w-24 h-8 text-right"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                          if (e.key === "Enter") handleSaveBudget(item.id);
                                                          if (e.key === "Escape") {
                                                            setEditingBudget(null);
                                                            setEditBudgetValue("");
                                                          }
                                                        }}
                                                        data-testid={`input-budget-${item.id}`}
                                                      />
                                                      <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleSaveBudget(item.id)}
                                                        disabled={updateBudgetMutation.isPending}
                                                      >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                  ) : (
                                                    <span
                                                      className="cursor-pointer hover:underline"
                                                      onClick={() => {
                                                        setEditingBudget(item.id);
                                                        setEditBudgetValue(item.budgetAmount.toString());
                                                      }}
                                                      data-testid={`text-budget-${item.id}`}
                                                    >
                                                      {formatCurrency(item.budgetAmount)}
                                                    </span>
                                                  )}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-500" data-testid={`text-funded-${item.id}`}>
                                                  {formatCurrency(item.totalFunded)}
                                                </TableCell>
                                                <TableCell className="text-right pr-4" data-testid={`text-remaining-${item.id}`}>
                                                  {formatCurrency(item.budgetAmount - item.totalFunded)}
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                            <TableRow className="bg-muted/30 font-medium">
                                              <TableCell className="pl-4">Category Total</TableCell>
                                              <TableCell className="text-right">{formatCurrency(cs.totalBudget)}</TableCell>
                                              <TableCell className="text-right text-emerald-500">{formatCurrency(cs.totalFunded)}</TableCell>
                                              <TableCell className="text-right pr-4">{formatCurrency(cs.totalBudget - cs.totalFunded)}</TableCell>
                                            </TableRow>
                                          </TableBody>
                                        </Table>
                                      </AccordionContent>
                                    </AccordionItem>
                                  );
                                })}
                              </Accordion>

                              <div className="flex justify-end mt-4">
                                <Dialog open={newDrawOpen} onOpenChange={setNewDrawOpen}>
                                  <DialogTrigger asChild>
                                    <Button data-testid="button-new-draw">
                                      <Plus className="h-4 w-4 mr-2" />
                                      New Draw Request
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Request New Draw</DialogTitle>
                                      <DialogDescription>
                                        Enter amounts for each scope item to include in this draw. Maximum available: {formatCurrency(remaining)}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="drawDescription">Description (optional)</Label>
                                        <Textarea
                                          id="drawDescription"
                                          value={newDrawDescription}
                                          onChange={(e) => setNewDrawDescription(e.target.value)}
                                          placeholder="Describe the work completed for this draw..."
                                          data-testid="input-draw-description"
                                        />
                                      </div>

                                      <Separator />

                                      <div className="space-y-4">
                                        {categorySummaries.map((cs) => (
                                          <div key={cs.category}>
                                            <h4 className="font-medium text-sm mb-2">{categoryNames[cs.category]}</h4>
                                            <div className="space-y-2">
                                              {cs.items.map((item) => {
                                                const itemRemaining = item.budgetAmount - item.totalFunded;
                                                return (
                                                  <div key={item.id} className="flex items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                      <span className="text-sm">{item.itemName}</span>
                                                      <span className="text-xs text-muted-foreground ml-2">
                                                        (Remaining: {formatCurrency(itemRemaining)})
                                                      </span>
                                                    </div>
                                                    <Input
                                                      type="number"
                                                      min={0}
                                                      max={itemRemaining}
                                                      value={drawLineAmounts[item.id] || ""}
                                                      onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setDrawLineAmounts(prev => ({
                                                          ...prev,
                                                          [item.id]: Math.min(val, itemRemaining)
                                                        }));
                                                      }}
                                                      placeholder="0"
                                                      className="w-28 text-right"
                                                      data-testid={`input-draw-line-${item.id}`}
                                                    />
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      <Separator />

                                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <span className="font-medium">Draw Total:</span>
                                        <span className="text-xl font-bold text-primary" data-testid="text-draw-total">
                                          {formatCurrency(newDrawTotal)}
                                        </span>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {
                                        setNewDrawOpen(false);
                                        setDrawLineAmounts({});
                                        setNewDrawDescription("");
                                      }}>Cancel</Button>
                                      <Button 
                                        onClick={() => createDrawWithLineItemsMutation.mutate({
                                          requestedAmount: newDrawTotal,
                                          description: newDrawDescription,
                                        })}
                                        disabled={newDrawTotal === 0 || createDrawWithLineItemsMutation.isPending}
                                        data-testid="button-create-draw"
                                      >
                                        Create Draw Request
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {activeDrawTab === "draws" && (
                        <>
                          {(loan.draws?.length || 0) === 0 ? (
                            <div className="text-center py-8">
                              <Wallet className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                              <p className="text-muted-foreground">No draws yet</p>
                              <p className="text-xs text-muted-foreground">Create a draw request from the Scope of Work tab</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {loan.draws?.map((draw) => {
                                const drawStatus = drawStatusConfig[draw.status as keyof typeof drawStatusConfig] || drawStatusConfig.draft;
                                return (
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
                                          <Badge variant="outline" className={drawStatus.color}>
                                            {drawStatus.label}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                          {draw.description || draw.workCompleted || "No description"}
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
                                      {(draw.status === "submitted" || draw.status === "inspection_scheduled" || draw.status === "inspection_complete") && (
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
                                      {draw.status === "approved" && (() => {
                                        const photoStatus = getDrawPhotoStatus(draw.id);
                                        const canFund = photoStatus.allVerified;
                                        
                                        return (
                                          <div className="flex items-center gap-2">
                                            {photoStatus.hasPhotos && !canFund && (
                                              <div className="flex items-center gap-1 text-xs">
                                                {photoStatus.needsReviewCount > 0 && (
                                                  <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-xs">
                                                    <CircleAlert className="h-3 w-3 mr-1" />
                                                    {photoStatus.needsReviewCount} needs review
                                                  </Badge>
                                                )}
                                                {photoStatus.rejectedCount > 0 && (
                                                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">
                                                    <ThumbsDown className="h-3 w-3 mr-1" />
                                                    {photoStatus.rejectedCount} rejected
                                                  </Badge>
                                                )}
                                              </div>
                                            )}
                                            {photoStatus.hasPhotos && canFund && (
                                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                {photoStatus.verifiedCount}/{photoStatus.totalCount} verified
                                              </Badge>
                                            )}
                                            <Button
                                              size="sm"
                                              onClick={() => updateDrawMutation.mutate({
                                                drawId: draw.id,
                                                status: "funded",
                                              })}
                                              disabled={updateDrawMutation.isPending || !canFund}
                                              data-testid={`button-fund-draw-${draw.id}`}
                                            >
                                              {updateDrawMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <>
                                                  {!canFund && photoStatus.hasPhotos && <Camera className="h-3 w-3 mr-1" />}
                                                  Fund
                                                </>
                                              )}
                                            </Button>
                                          </div>
                                        );
                                      })()}
                                      {draw.status === "funded" && draw.fundedDate && (
                                        <span className="text-xs text-muted-foreground">
                                          {format(new Date(draw.fundedDate), "MMM d, yyyy")}
                                        </span>
                                      )}
                                      {draw.status === "denied" && (
                                        <span className="text-sm text-red-500">
                                          Denied
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {isHardMoney && (
                <TabsContent value="photos" className="mt-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-2">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Camera className="h-5 w-5" />
                          Photo Verification
                        </CardTitle>
                        <CardDescription>
                          Review construction progress photos with GPS and timestamp verification
                        </CardDescription>
                      </div>
                      {propertyLocation && (
                        <div className="text-right text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Geofence: {propertyLocation.geofenceRadiusMeters}m radius
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {photosLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : allPhotos.length === 0 ? (
                        <div className="text-center py-12">
                          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No photos uploaded yet</p>
                          <p className="text-sm text-muted-foreground">Borrowers can upload progress photos when submitting draw requests</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              <span className="text-sm">Verified ({allPhotos.filter(p => p.verificationStatus === "verified").length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <span className="text-sm">Manually Approved ({allPhotos.filter(p => p.verificationStatus === "manual_approved").length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-orange-500" />
                              <span className="text-sm">Needs Review ({allPhotos.filter(p => ["outside_geofence", "stale_timestamp", "metadata_missing", "pending"].includes(p.verificationStatus)).length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <span className="text-sm">Rejected ({allPhotos.filter(p => p.verificationStatus === "manual_rejected").length})</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allPhotos.map((photo) => {
                              const statusConfig = photoVerificationStatusConfig[photo.verificationStatus];
                              const StatusIcon = statusConfig.icon;
                              const needsReview = ["outside_geofence", "stale_timestamp", "metadata_missing", "pending"].includes(photo.verificationStatus);
                              
                              return (
                                <div
                                  key={photo.id}
                                  className="relative group border rounded-lg overflow-hidden cursor-pointer hover-elevate"
                                  onClick={() => setSelectedPhoto(photo)}
                                  data-testid={`photo-card-${photo.id}`}
                                >
                                  <div className="aspect-square bg-muted relative">
                                    <img
                                      src={photo.fileKey.startsWith('http') ? photo.fileKey : `/api/uploads/${photo.fileKey}`}
                                      alt={photo.caption || `Draw ${photo.drawNumber} photo`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Maximize2 className="h-6 w-6 text-white" />
                                    </div>
                                  </div>
                                  
                                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                                    <Badge variant="outline" className={`${statusConfig.color} text-xs`}>
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {statusConfig.label}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      Draw #{photo.drawNumber}
                                    </Badge>
                                  </div>
                                  
                                  {needsReview && (
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="flex-1 h-7 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPhotoReviewDialog({
                                              open: true,
                                              photo,
                                              action: "approve",
                                              reason: "",
                                            });
                                          }}
                                          data-testid={`button-approve-photo-${photo.id}`}
                                        >
                                          <ThumbsUp className="h-3 w-3 mr-1" />
                                          Approve
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="flex-1 h-7 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPhotoReviewDialog({
                                              open: true,
                                              photo,
                                              action: "reject",
                                              reason: "",
                                            });
                                          }}
                                          data-testid={`button-reject-photo-${photo.id}`}
                                        >
                                          <ThumbsDown className="h-3 w-3 mr-1" />
                                          Reject
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
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

              <TabsContent value="documents" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Loan Documents
                    </CardTitle>
                    <CardDescription>
                      Documents from loan processing/closing and servicing phases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loan.documents && loan.documents.length > 0 ? (
                      <div className="space-y-6">
                        {/* Processing/Closing Documents */}
                        {loan.documents.filter((d: any) => d.phase === 'processing').length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-3">
                              Loan Processing & Closing ({loan.documents.filter((d: any) => d.phase === 'processing').length})
                            </h4>
                            <div className="space-y-2">
                              {loan.documents.filter((d: any) => d.phase === 'processing').map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium text-sm">{doc.title || doc.documentType}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {doc.fileName} {doc.documentStatus && <Badge variant="outline" className="ml-2 text-xs">{doc.documentStatus}</Badge>}
                                      </p>
                                    </div>
                                  </div>
                                  {doc.fileUrl && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                        View
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Servicing Documents */}
                        {loan.documents.filter((d: any) => d.phase === 'servicing').length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-3">
                              Loan Servicing ({loan.documents.filter((d: any) => d.phase === 'servicing').length})
                            </h4>
                            <div className="space-y-2">
                              {loan.documents.filter((d: any) => d.phase === 'servicing').map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium text-sm">{doc.title || doc.documentType}</p>
                                      <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                                    </div>
                                  </div>
                                  {doc.fileUrl && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                        View
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Documents without phase (legacy) */}
                        {loan.documents.filter((d: any) => !d.phase).length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-3">
                              Other Documents ({loan.documents.filter((d: any) => !d.phase).length})
                            </h4>
                            <div className="space-y-2">
                              {loan.documents.filter((d: any) => !d.phase).map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium text-sm">{doc.title || doc.documentType}</p>
                                      <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                                    </div>
                                  </div>
                                  {doc.fileUrl && (
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                        View
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No documents available</p>
                      </div>
                    )}
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
                {propertyLocation && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">Coordinates</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Lat:</span>
                        <span className="ml-1 font-mono">{parseFloat(propertyLocation.latitude).toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lng:</span>
                        <span className="ml-1 font-mono">{parseFloat(propertyLocation.longitude).toFixed(6)}</span>
                      </div>
                    </div>
                    {propertyLocation.geofenceRadiusMeters && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Geofence: {propertyLocation.geofenceRadiusMeters}m radius
                      </p>
                    )}
                  </div>
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

        <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            {selectedPhoto && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Photo Details - Draw #{selectedPhoto.drawNumber}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={selectedPhoto.fileKey.startsWith('http') ? selectedPhoto.fileKey : `/api/uploads/${selectedPhoto.fileKey}`}
                      alt={selectedPhoto.caption || "Progress photo"}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Verification Status</Label>
                      <div className="mt-1">
                        {(() => {
                          const cfg = photoVerificationStatusConfig[selectedPhoto.verificationStatus];
                          const Icon = cfg.icon;
                          return (
                            <Badge variant="outline" className={cfg.color}>
                              <Icon className="h-4 w-4 mr-1" />
                              {cfg.label}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                    
                    {selectedPhoto.caption && (
                      <div>
                        <Label className="text-muted-foreground">Caption</Label>
                        <p className="mt-1">{selectedPhoto.caption}</p>
                      </div>
                    )}
                    
                    <div>
                      <Label className="text-muted-foreground">Location Verification</Label>
                      <div className="mt-2 space-y-3 text-sm">
                        {propertyLocation && (
                          <div className="p-3 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="font-medium">Property Location</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {parseFloat(propertyLocation.latitude).toFixed(6)}, {parseFloat(propertyLocation.longitude).toFixed(6)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Geofence: {propertyLocation.geofenceRadiusMeters}m radius
                            </p>
                          </div>
                        )}
                        
                        <div className={`p-3 rounded-lg border ${
                          selectedPhoto.exifLatitude && selectedPhoto.exifLongitude
                            ? selectedPhoto.distanceFromPropertyMeters !== null && selectedPhoto.distanceFromPropertyMeters <= (propertyLocation?.geofenceRadiusMeters || 100)
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-orange-500/10 border-orange-500/30"
                            : "bg-gray-500/10 border-gray-500/30"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Camera className="h-4 w-4" />
                            <span className="font-medium">Photo Location (EXIF)</span>
                          </div>
                          {selectedPhoto.exifLatitude && selectedPhoto.exifLongitude ? (
                            <>
                              <p className="text-xs">
                                {parseFloat(selectedPhoto.exifLatitude).toFixed(6)}, {parseFloat(selectedPhoto.exifLongitude).toFixed(6)}
                              </p>
                              {selectedPhoto.distanceFromPropertyMeters !== null && (
                                <p className={`text-xs font-medium mt-1 ${
                                  selectedPhoto.distanceFromPropertyMeters <= (propertyLocation?.geofenceRadiusMeters || 100)
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }`}>
                                  {selectedPhoto.distanceFromPropertyMeters <= (propertyLocation?.geofenceRadiusMeters || 100)
                                    ? `Within geofence (${selectedPhoto.distanceFromPropertyMeters}m from property)`
                                    : `Outside geofence (${selectedPhoto.distanceFromPropertyMeters}m from property)`
                                  }
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">No GPS data embedded in photo</p>
                          )}
                        </div>
                        
                        {selectedPhoto.browserLatitude && selectedPhoto.browserLongitude && (
                          <div className="p-3 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-2 mb-1">
                              <Navigation className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-muted-foreground">Browser Location (Fallback)</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {parseFloat(selectedPhoto.browserLatitude).toFixed(6)}, {parseFloat(selectedPhoto.browserLongitude).toFixed(6)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground">Timestamp</Label>
                      <div className="mt-1 text-sm">
                        {selectedPhoto.exifTimestamp ? (
                          <p>EXIF: {formatDate(selectedPhoto.exifTimestamp)}</p>
                        ) : (
                          <p className="text-muted-foreground">No timestamp in photo metadata</p>
                        )}
                        <p className="text-muted-foreground">Uploaded: {formatDate(selectedPhoto.createdAt)}</p>
                      </div>
                    </div>
                    
                    {selectedPhoto.exifCameraModel && (
                      <div>
                        <Label className="text-muted-foreground">Camera</Label>
                        <p className="mt-1 text-sm">{selectedPhoto.exifCameraModel}</p>
                      </div>
                    )}
                    
                    {["outside_geofence", "stale_timestamp", "metadata_missing", "pending"].includes(selectedPhoto.verificationStatus) && (
                      <div className="pt-4 border-t flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedPhoto(null);
                            setPhotoReviewDialog({
                              open: true,
                              photo: selectedPhoto,
                              action: "approve",
                              reason: "",
                            });
                          }}
                          data-testid="button-modal-approve-photo"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Approve Photo
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-600"
                          onClick={() => {
                            setSelectedPhoto(null);
                            setPhotoReviewDialog({
                              open: true,
                              photo: selectedPhoto,
                              action: "reject",
                              reason: "",
                            });
                          }}
                          data-testid="button-modal-reject-photo"
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject Photo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={photoReviewDialog.open} onOpenChange={(open) => {
          if (!open) setPhotoReviewDialog({ open: false, photo: null, action: null, reason: "" });
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {photoReviewDialog.action === "approve" ? (
                  <>
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    Approve Photo
                  </>
                ) : (
                  <>
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    Reject Photo
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {photoReviewDialog.action === "approve"
                  ? "Manually approve this photo despite verification issues"
                  : "Reject this photo and require a new submission"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{photoReviewDialog.action === "approve" ? "Reason for Approval (Optional)" : "Reason for Rejection"}</Label>
                <Textarea
                  value={photoReviewDialog.reason}
                  onChange={(e) => setPhotoReviewDialog({
                    ...photoReviewDialog,
                    reason: e.target.value
                  })}
                  placeholder={photoReviewDialog.action === "approve"
                    ? "Why are you approving this photo despite issues?"
                    : "Explain why this photo is being rejected..."}
                  data-testid="input-photo-review-reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPhotoReviewDialog({ open: false, photo: null, action: null, reason: "" })}
              >
                Cancel
              </Button>
              <Button
                variant={photoReviewDialog.action === "approve" ? "default" : "destructive"}
                onClick={() => {
                  if (photoReviewDialog.photo && photoReviewDialog.action) {
                    photoVerifyMutation.mutate({
                      photoId: photoReviewDialog.photo.id,
                      newStatus: photoReviewDialog.action === "approve" ? "manual_approved" : "manual_rejected",
                      reason: photoReviewDialog.reason,
                    });
                  }
                }}
                disabled={photoVerifyMutation.isPending || (photoReviewDialog.action === "reject" && !photoReviewDialog.reason)}
                data-testid="button-confirm-photo-review"
              >
                {photoVerifyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {photoReviewDialog.action === "approve" ? "Approve Photo" : "Reject Photo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
