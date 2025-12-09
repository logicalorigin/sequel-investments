import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AmortizationChart } from "@/components/AmortizationChart";
import { PropertyValueChart } from "@/components/PropertyValueChart";
import { DocumentCommentsDialog } from "@/components/DocumentCommentsDialog";
import { 
  ArrowLeft,
  Building2,
  LogOut,
  Check,
  Clock,
  FileText,
  Mail,
  Phone,
  User,
  DollarSign,
  Calendar,
  Home,
  CheckCircle2,
  History,
  Upload,
  Download,
  Users,
  AlertCircle,
  UserPlus,
  X,
  Loader2,
  Calculator,
  TrendingUp,
  MessageSquare,
  Trash2,
  Send,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { useLocation } from "wouter";
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
import { formatDistanceToNow } from "date-fns";
import type { LoanApplication, Document, DocumentType, ApplicationTimelineEvent, CoBorrower } from "@shared/schema";

interface DocumentWithType extends Document {
  documentType?: DocumentType;
}

const processingStages = [
  { key: "account_review", label: "Account Executive\nReview", shortLabel: "AE Review" },
  { key: "underwriting", label: "Underwriting", shortLabel: "Underwriting" },
  { key: "term_sheet", label: "Term Sheet Issued", shortLabel: "Term Sheet" },
  { key: "processing", label: "Processing", shortLabel: "Processing" },
  { key: "docs_out", label: "Docs Out", shortLabel: "Docs Out" },
  { key: "closed", label: "Closed", shortLabel: "Closed" },
];

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  funded: "Funded",
  denied: "Denied",
  withdrawn: "Withdrawn",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  funded: "bg-primary/20 text-primary",
  denied: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  withdrawn: "bg-muted text-muted-foreground",
};

const docStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Outstanding", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  uploaded: { label: "Pending Review", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300" },
  approved: { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
  rejected: { label: "Revision Required", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300" },
  if_applicable: { label: "If Applicable", color: "bg-muted text-muted-foreground" },
};

export default function ApplicationDetailPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const applicationId = params.id;

  useEffect(() => {
    document.title = "Loan Application | Sequel Investments";
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

  const { data: application, isLoading: appLoading } = useQuery<LoanApplication>({
    queryKey: ["/api/applications", applicationId],
    enabled: isAuthenticated && !!applicationId,
  });

  const { data: documents, isLoading: docsLoading } = useQuery<DocumentWithType[]>({
    queryKey: ["/api/applications", applicationId, "documents"],
    enabled: isAuthenticated && !!applicationId,
  });

  const { data: timelineEvents = [], isLoading: timelineLoading } = useQuery<ApplicationTimelineEvent[]>({
    queryKey: ["/api/applications", applicationId, "timeline"],
    enabled: isAuthenticated && !!applicationId,
  });

  const { data: coBorrowers = [], isLoading: coBorrowersLoading } = useQuery<CoBorrower[]>({
    queryKey: ["/api/applications", applicationId, "co-borrowers"],
    enabled: isAuthenticated && !!applicationId,
  });

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("co_borrower");

  const inviteMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; role: string }) => {
      return apiRequest("POST", `/api/applications/${applicationId}/co-borrowers`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "co-borrowers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "timeline"] });
      setShowInviteDialog(false);
      setInviteEmail("");
      setInviteName("");
      toast({
        title: "Invitation Sent",
        description: "Co-borrower has been invited to collaborate.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Send Invitation",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const removeCoBorrowerMutation = useMutation({
    mutationFn: async (coBorrowerId: string) => {
      return apiRequest("DELETE", `/api/co-borrowers/${coBorrowerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "co-borrowers"] });
      toast({
        title: "Co-Borrower Removed",
        description: "The co-borrower has been removed from this application.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Remove",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const [, navigate] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/borrower/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate("/login");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/applications/${applicationId}/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setShowSubmitDialog(false);
      toast({
        title: "Application Submitted!",
        description: "Your loan application has been submitted for review. Our team will contact you shortly.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Could not submit the application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/applications/${applicationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Deleted",
        description: "The loan application has been deleted.",
      });
      navigate("/portal");
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [payingFeeType, setPayingFeeType] = useState<string | null>(null);

  const checkoutMutation = useMutation({
    mutationFn: async (feeType: string) => {
      const response = await apiRequest("POST", "/api/stripe/checkout", {
        applicationId,
        feeType,
      });
      return response.json();
    },
    onMutate: (feeType) => {
      setPayingFeeType(feeType);
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Checkout Error",
          description: "Could not create checkout session. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setPayingFeeType(null);
      toast({
        title: "Payment Error",
        description: "Could not initiate payment. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setPayingFeeType(null);
    },
  });

  const getTimelineIcon = (eventType: string) => {
    switch (eventType) {
      case "status_change":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "document_uploaded":
        return <Upload className="h-4 w-4 text-green-500" />;
      case "document_approved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "co_borrower_added":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "stage_advanced":
        return <Check className="h-4 w-4 text-primary" />;
      case "application_created":
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (authLoading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !application) {
    return null;
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const currentStageIndex = processingStages.findIndex(
    (s) => s.key === (application.processingStage || "account_review")
  );

  const completedDocs = documents?.filter(d => d.status === "approved" || d.status === "uploaded").length || 0;
  const outstandingDocs = documents?.filter(d => d.status === "pending" || d.status === "rejected").length || 0;

  const totalFees = (application.originationFee || 0) + 
                    (application.documentPrepFee || 0) + 
                    (application.escrowFee || 0) + 
                    (application.dailyInterestCharges || 0);

  const totalFundsToClose = (application.downPayment || 0) + 
                            (application.rehabEquity || 0) + 
                            (application.debtServicing || 0) + 
                            totalFees;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Sequel Investments</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/portal">
              <Button variant="ghost" size="sm" data-testid="link-portfolio">
                Portfolio
              </Button>
            </Link>
            <Link href="/portal">
              <Button variant="ghost" size="sm" data-testid="link-analyzers">
                Analyzers
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
            <Button 
              variant="ghost" 
              size="sm" 
              data-testid="button-logout"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/portal">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold" data-testid="text-loan-id">
                  LOAN ID: {application.id.slice(0, 6).toUpperCase()}
                </h1>
                <Badge className={statusColors[application.status]} data-testid="badge-status">
                  {statusLabels[application.status]}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {application.analyzerType && application.analyzerData && (
              <Link href={`/portal/${
                application.analyzerType === "dscr" ? "dscr-analyzer" : 
                application.analyzerType === "fixflip" ? "fixflip-analyzer" : 
                "construction-analyzer"
              }?applicationId=${application.id}`}>
                <Button variant="outline" data-testid="button-view-analyzer">
                  <Calculator className="h-4 w-4 mr-2" />
                  View Analysis
                </Button>
              </Link>
            )}
            <Link href={`/portal/application/${applicationId}/documents`}>
              <Button data-testid="button-view-documents">
                <FileText className="h-4 w-4 mr-2" />
                View Documents
              </Button>
            </Link>
            {application.status === "draft" && (
              <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-submit-application">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Application</DialogTitle>
                    <DialogDescription>
                      Are you ready to submit this loan application? Once submitted, our team will begin reviewing your application and may reach out for additional information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Your loan details have been saved</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>You can still upload additional documents after submission</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>You cannot edit loan details after submission</span>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => submitMutation.mutate()}
                      disabled={submitMutation.isPending}
                      data-testid="button-confirm-submit"
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Submit for Review
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" data-testid="button-delete-application">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Application</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this loan application? This action cannot be undone and will remove all associated documents and data.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    data-testid="button-confirm-delete"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Application
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-8">
            <div className="flex items-center justify-between relative">
              {processingStages.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                
                return (
                  <div key={stage.key} className="flex flex-col items-center relative z-10 flex-1">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2
                      ${isCompleted ? "bg-green-500 border-green-500 text-white" : 
                        isCurrent ? "bg-primary border-primary text-white" : 
                        "bg-background border-muted-foreground/30 text-muted-foreground"}
                    `}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <p className={`text-xs mt-2 text-center whitespace-pre-line max-w-[80px] ${
                      isCurrent ? "font-semibold text-primary" : 
                      isCompleted ? "text-green-600" : "text-muted-foreground"
                    }`}>
                      {stage.shortLabel}
                    </p>
                    {index < processingStages.length - 1 && (
                      <div className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 ${
                        isCompleted ? "bg-green-500" : "bg-muted-foreground/20"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    Loan Info
                  </CardTitle>
                  <Badge 
                    className={`text-xs font-semibold ${
                      application.loanType?.toLowerCase().includes("dscr") 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                        : application.loanType?.toLowerCase().includes("flip") 
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                        : application.loanType?.toLowerCase().includes("construction")
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                    data-testid="badge-loan-type"
                  >
                    {application.loanType || "Loan"}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created {formatDate(application.createdAt)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Property Address</p>
                  <p className="font-medium text-base">
                    {application.propertyAddress || "N/A"}
                    {application.propertyCity && `, ${application.propertyCity}`}
                    {application.propertyState && `, ${application.propertyState}`}
                    {application.propertyZip && ` ${application.propertyZip}`}
                  </p>
                </div>

                <Separator className="my-4" />

                {(() => {
                  const rawAnalyzerData = application.analyzerData as { inputs?: Record<string, unknown>; results?: Record<string, unknown> } | null;
                  const inputs = rawAnalyzerData?.inputs || {};
                  const results = rawAnalyzerData?.results || {};
                  // Prefer analyzerType for accurate detection, fallback to loanType
                  const isDSCR = application.analyzerType === "dscr" || application.loanType?.toLowerCase().includes("dscr");
                  const isFlip = application.analyzerType === "fixflip" || application.loanType?.toLowerCase().includes("flip");
                  const isConstruction = application.analyzerType === "construction" || application.loanType?.toLowerCase().includes("construction");

                  // Helper to get value from inputs, falling back to application field
                  const getInputValue = (key: string, appField?: number | string | null) => {
                    const inputVal = inputs[key];
                    if (inputVal !== undefined && inputVal !== null && inputVal !== "") {
                      return typeof inputVal === "string" ? parseFloat(inputVal) || inputVal : inputVal;
                    }
                    return appField;
                  };

                  const getResultValue = (key: string) => {
                    const val = results[key];
                    return val !== undefined && val !== null ? val : null;
                  };
                  
                  if (isDSCR) {
                    const monthlyRent = getInputValue("monthlyRent") as number | null;
                    const dscrRatio = getResultValue("dscrRatio") as number | null;
                    const rawPropertyType = (inputs.propertyType as string) || "sfr";
                    const propertyTypeLabels: Record<string, string> = {
                      sfr: "SFR",
                      duplex: "2-Unit",
                      triplex: "3-Unit",
                      fourplex: "4-Unit",
                      townhome: "Condo",
                    };
                    const propertyTypeLabel = propertyTypeLabels[rawPropertyType] || rawPropertyType.toUpperCase();
                    const prepaymentPenalty = (inputs.prepaymentPenalty as string) || "5-4-3-2-1";
                    const loanAmount = getResultValue("loanAmount") as number | null || application.loanAmount;
                    const calculatedRate = getResultValue("calculatedRate") as number | null;
                    const monthlyPITIA = getResultValue("monthlyPITIA") as number | null;
                    const transactionType = (inputs.transactionType as string) || "purchase";
                    const rentalType = (inputs.rentalType as string) || "long_term";

                    return (
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Property Value</p>
                            <p className="font-medium">{formatCurrency(application.purchasePrice)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly Rent</p>
                            <p className="font-medium">{formatCurrency(monthlyRent)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Property Type</p>
                            <p className="font-medium">{propertyTypeLabel}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Credit Score</p>
                            <p className="font-medium">{(inputs.creditScore as number[])?.[0] || "N/A"}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Interest Rate</p>
                            <p className="font-medium">{calculatedRate ? `${Number(calculatedRate).toFixed(3)}%` : application.interestRate ? `${application.interestRate}%` : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">DSCR Ratio</p>
                            <p className="font-medium">{dscrRatio ? Number(dscrRatio).toFixed(2) : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">LTV Ratio</p>
                            <p className="font-medium">{application.ltv ? `${application.ltv}%` : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Prepayment Penalty</p>
                            <p className="font-medium">{prepaymentPenalty === "0" ? "None" : prepaymentPenalty}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Transaction Type</p>
                            <p className="font-medium capitalize">{transactionType.replace(/_/g, " ")}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Rental Type</p>
                            <p className="font-medium capitalize">{rentalType.replace(/_/g, " ")}</p>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (isFlip) {
                    const experience = inputs.experience as string;
                    const experienceLabel = experience === "10+" ? "10+ Deals" : experience === "6-10" ? "6-10 Deals" : experience === "3-5" ? "3-5 Deals" : experience === "0" ? "0 Deals" : "1-2 Deals";
                    const roi = getResultValue("roi") as number | null;
                    const profitMargin = getResultValue("profitMargin") as number | null;
                    const loanAmount = getResultValue("loanAmount") as number | null || application.loanAmount;
                    const loanTermMonths = (inputs.loanTermMonths as number) || application.holdTimeMonths;

                    return (
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Purchase Price</p>
                            <p className="font-medium">{formatCurrency(application.purchasePrice)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">After Repair Value (ARV)</p>
                            <p className="font-medium">{formatCurrency(application.arv)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Rehab Budget</p>
                            <p className="font-medium">{formatCurrency(application.rehabBudget)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Amount</p>
                            <p className="font-medium">{formatCurrency(loanAmount)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Interest Rate</p>
                            <p className="font-medium">{application.interestRate ? `${application.interestRate}%` : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan to Cost (LTC)</p>
                            <p className="font-medium">{application.ltc ? `${application.ltc}%` : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Projected ROI</p>
                            <p className="font-medium">{roi ? `${Number(roi).toFixed(1)}%` : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Term</p>
                            <p className="font-medium">{loanTermMonths ? `${loanTermMonths} Months` : "N/A"}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Credit Score</p>
                            <p className="font-medium">{(inputs.creditScore as number[])?.[0] || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Experience Level</p>
                            <p className="font-medium">{experienceLabel}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Profit Margin</p>
                            <p className="font-medium">{profitMargin ? `${Number(profitMargin).toFixed(1)}%` : "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (isConstruction) {
                    const experience = inputs.experience as string;
                    const experienceLabel = experience === "10+" ? "10+ Builds" : experience === "6-10" ? "6-10 Builds" : experience === "3-5" ? "3-5 Builds" : experience === "0" ? "0 Builds" : "1-2 Builds";
                    const roi = getResultValue("roi") as number | null;
                    const loanAmount = getResultValue("loanAmount") as number | null || application.loanAmount;
                    const landOwned = inputs.landOwned as boolean;
                    const loanTermMonths = (inputs.loanTermMonths as number) || application.holdTimeMonths;

                    return (
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Land Cost</p>
                            <p className="font-medium">{formatCurrency(application.purchasePrice)} {landOwned && <span className="text-xs text-green-600">(Owned)</span>}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Construction Budget</p>
                            <p className="font-medium">{formatCurrency(application.rehabBudget)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">After Completion Value</p>
                            <p className="font-medium">{formatCurrency(application.arv)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Amount</p>
                            <p className="font-medium">{formatCurrency(loanAmount)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Interest Rate</p>
                            <p className="font-medium">{application.interestRate ? `${application.interestRate}%` : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan to Cost (LTC)</p>
                            <p className="font-medium">{application.ltc ? `${application.ltc}%` : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Projected ROI</p>
                            <p className="font-medium">{roi ? `${Number(roi).toFixed(1)}%` : "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Term</p>
                            <p className="font-medium">{loanTermMonths ? `${loanTermMonths} Months` : "N/A"}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Credit Score</p>
                            <p className="font-medium">{(inputs.creditScore as number[])?.[0] || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Experience Level</p>
                            <p className="font-medium">{experienceLabel}</p>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Purchase Price</p>
                            <p className="font-medium">{formatCurrency(application.purchasePrice)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Interest Rate</p>
                            <p className="font-medium">{application.interestRate ? `${application.interestRate}%` : "N/A"}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Entity</p>
                            <p className="font-medium">{application.entity || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Guarantor</p>
                            <p className="font-medium">{application.guarantor || "N/A"}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Closing Date</p>
                            <p className="font-medium">{formatDate(application.closingDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Requested Closing</p>
                            <p className="font-medium">{formatDate(application.requestedClosingDate)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}

                <Separator className="my-6" />

                {(() => {
                  const isDSCRLoan = application.analyzerType === "dscr" || application.loanType?.toLowerCase().includes("dscr");
                  const isFlipLoan = application.analyzerType === "fixflip" || application.loanType?.toLowerCase().includes("flip");
                  const isConstructionLoan = application.analyzerType === "construction" || application.loanType?.toLowerCase().includes("construction");
                  const rawAnalyzer = application.analyzerData as { inputs?: Record<string, unknown>; results?: Record<string, unknown> } | null;
                  const analyzerResults = rawAnalyzer?.results || {};
                  
                  if (isDSCRLoan) {
                    const monthlyPITIA = analyzerResults.monthlyPITIA as number | null;
                    return (
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Amount</p>
                          <p className="font-bold text-xl text-primary" data-testid="text-loan-amount">{formatCurrency(application.loanAmount)}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Term</p>
                          <p className="font-semibold text-lg">30-Year Fixed</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Estimated Monthly Payment</p>
                          <p className="font-semibold text-lg">
                            {monthlyPITIA ? formatCurrency(monthlyPITIA) : (() => {
                              const rate = parseFloat(application.interestRate || "0");
                              const term = 360; // 30 years
                              const principal = application.loanAmount || 0;
                              if (rate && principal) {
                                const monthlyRate = rate / 100 / 12;
                                const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) /
                                              (Math.pow(1 + monthlyRate, term) - 1);
                                return formatCurrency(payment);
                              }
                              return "N/A";
                            })()}
                          </p>
                        </div>
                      </div>
                    );
                  } else if (isFlipLoan || isConstructionLoan) {
                    // Calculate daily interest for F&F and Construction
                    const rate = parseFloat(application.interestRate || "0");
                    const principal = application.loanAmount || 0;
                    const dailyInterest = rate && principal ? (principal * (rate / 100)) / 365 : null;
                    
                    return (
                      <div className="grid md:grid-cols-4 gap-6">
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Amount</p>
                          <p className="font-bold text-xl text-primary" data-testid="text-loan-amount">{formatCurrency(application.loanAmount)}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Term</p>
                          <p className="font-semibold text-lg">{application.loanTermMonths ? `${application.loanTermMonths} Months` : application.holdTimeMonths ? `${application.holdTimeMonths} Months` : "N/A"}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">{isConstructionLoan ? "Construction Funding" : "Rehab Funding"}</p>
                          <p className="font-semibold text-lg">{formatCurrency(application.requestedRehabFunding)}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Daily Interest</p>
                          <p className="font-semibold text-lg">{dailyInterest ? formatCurrency(dailyInterest) : "N/A"}</p>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Amount</p>
                          <p className="font-bold text-xl text-primary" data-testid="text-loan-amount">{formatCurrency(application.loanAmount)}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Term</p>
                          <p className="font-semibold text-lg">{application.loanTermMonths ? `${application.loanTermMonths} Months` : "N/A"}</p>
                        </div>
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Document Checklist
                </CardTitle>
                <div className="flex items-center gap-2">
                  {outstandingDocs > 0 && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                      {outstandingDocs} Outstanding
                    </Badge>
                  )}
                  {completedDocs > 0 && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                      {completedDocs} Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {docsLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-12 bg-muted rounded" />
                    ))}
                  </div>
                ) : documents && documents.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-primary uppercase tracking-wide">Document Name</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Description</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documents</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Comments</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map((doc) => {
                            const status = docStatusConfig[doc.status] || docStatusConfig.pending;
                            const hasFile = doc.status === "uploaded" || doc.status === "approved";
                            return (
                              <tr key={doc.id} className="border-t hover-elevate" data-testid={`doc-row-${doc.id}`}>
                                <td className="px-4 py-3">
                                  <span className="text-sm font-medium">{doc.documentType?.name || "Document"}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell max-w-xs">
                                  <span className="line-clamp-2">{doc.documentType?.description || "-"}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Badge className={status.color} data-testid={`doc-status-${doc.id}`}>
                                    {status.label}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-1">
                                    <Link href={`/portal/application/${applicationId}/documents`}>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                                        data-testid={`button-upload-${doc.id}`}
                                      >
                                        <Upload className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className={`h-8 w-8 ${hasFile ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30" : "text-muted-foreground/40 cursor-not-allowed"}`}
                                      disabled={!hasFile}
                                      data-testid={`button-download-${doc.id}`}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <DocumentCommentsDialog
                                    documentId={doc.id}
                                    documentName={doc.documentType?.name || "Document"}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="font-medium">No documents required yet</p>
                    <p className="text-sm mt-1">Documents will appear here as your application progresses</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {application.status === "funded" && application.loanType?.toLowerCase().includes("dscr") && (
              <>
                <PropertyValueChart
                  propertyAddress={application.propertyAddress || ""}
                  propertyCity={application.propertyCity || undefined}
                  propertyState={application.propertyState || undefined}
                  propertyZip={application.propertyZip || undefined}
                  purchasePrice={application.purchasePrice || undefined}
                />
                <AmortizationChart
                  loanAmount={application.loanAmount || 0}
                  interestRate={parseFloat(application.interestRate || "7.5")}
                  termMonths={application.loanTermMonths || 360}
                  interestType={application.interestType || "fixed"}
                  interestOnlyMonths={(application.analyzerData as Record<string, unknown> | null)?.interestOnlyMonths as number || 0}
                />
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timelineLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3">
                        <div className="h-6 w-6 bg-muted rounded-full" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-muted rounded w-3/4" />
                          <div className="h-2 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : timelineEvents.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-4">
                      {timelineEvents.slice(0, 5).map((event) => (
                        <div key={event.id} className="relative flex gap-3" data-testid={`timeline-event-${event.id}`}>
                          <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border">
                            {getTimelineIcon(event.eventType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">No activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-semibold mb-2">Account Executive</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{application.accountExecutiveEmail || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{application.accountExecutivePhone || "Not assigned"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-semibold mb-2">Processor</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{application.processorEmail || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{application.processorPhone || "Not assigned"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Daily Interest Charges</span>
                    <span className="font-medium">{formatCurrency(application.dailyInterestCharges)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Origination Fee</span>
                    <span className="font-medium">{formatCurrency(application.originationFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Document Preparation Fee</span>
                    <span className="font-medium">{formatCurrency(application.documentPrepFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Escrow Fee</span>
                    <span className="font-medium">{formatCurrency(application.escrowFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(totalFees)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Pay Application Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Application Fee</p>
                      <p className="text-xs text-muted-foreground">$295.00 - Processing fee</p>
                    </div>
                    {application.applicationFeePaid ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => checkoutMutation.mutate("application_fee")}
                        disabled={checkoutMutation.isPending && payingFeeType === "application_fee"}
                        data-testid="button-pay-application-fee"
                      >
                        {checkoutMutation.isPending && payingFeeType === "application_fee" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Pay
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Commitment Fee</p>
                      <p className="text-xs text-muted-foreground">$495.00 - Loan commitment</p>
                    </div>
                    {application.commitmentFeePaid ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => checkoutMutation.mutate("commitment_fee")}
                        disabled={checkoutMutation.isPending && payingFeeType === "commitment_fee"}
                        data-testid="button-pay-commitment-fee"
                      >
                        {checkoutMutation.isPending && payingFeeType === "commitment_fee" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Pay
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Appraisal Fee</p>
                      <p className="text-xs text-muted-foreground">$650.00 - Property appraisal</p>
                    </div>
                    {application.appraisalFeePaid ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => checkoutMutation.mutate("appraisal_fee")}
                        disabled={checkoutMutation.isPending && payingFeeType === "appraisal_fee"}
                        data-testid="button-pay-appraisal-fee"
                      >
                        {checkoutMutation.isPending && payingFeeType === "appraisal_fee" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Pay
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Funds to Close
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Down Payment</span>
                    <span className="font-medium">{formatCurrency(application.downPayment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rehab Equity</span>
                    <span className="font-medium">{formatCurrency(application.rehabEquity)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Debt Servicing</span>
                    <span className="font-medium">{formatCurrency(application.debtServicing)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-medium">{formatCurrency(totalFees)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(totalFundsToClose)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Co-Borrowers
                </CardTitle>
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" data-testid="button-invite-coborrower">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Co-Borrower</DialogTitle>
                      <DialogDescription>
                        Send an invitation to collaborate on this loan application.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          data-testid="input-coborrower-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          data-testid="input-coborrower-email"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowInviteDialog(false)}
                        data-testid="button-cancel-invite"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => inviteMutation.mutate({ 
                          name: inviteName, 
                          email: inviteEmail, 
                          role: inviteRole 
                        })}
                        disabled={!inviteEmail || !inviteName || inviteMutation.isPending}
                        data-testid="button-send-invite"
                      >
                        {inviteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4 mr-2" />
                        )}
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {coBorrowersLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-muted rounded-full" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-muted rounded w-1/2" />
                          <div className="h-2 bg-muted rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : coBorrowers.length > 0 ? (
                  <div className="space-y-3">
                    {coBorrowers.map((coBorrower) => (
                      <div key={coBorrower.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/30" data-testid={`coborrower-${coBorrower.id}`}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {coBorrower.invitedEmail.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{coBorrower.invitedEmail}</p>
                            <p className="text-xs text-muted-foreground capitalize">{coBorrower.role.replace("_", " ")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            coBorrower.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                            coBorrower.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                            "bg-muted text-muted-foreground"
                          }>
                            {coBorrower.status === "accepted" ? "Active" : 
                             coBorrower.status === "pending" ? "Pending" : coBorrower.status}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => removeCoBorrowerMutation.mutate(coBorrower.id)}
                            disabled={removeCoBorrowerMutation.isPending}
                            data-testid={`button-remove-coborrower-${coBorrower.id}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No co-borrowers yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Invite partners or co-investors to collaborate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
