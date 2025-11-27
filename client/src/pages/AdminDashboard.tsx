import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Plus,
  Mail,
  Shield,
  UserPlus,
  Building2,
  DollarSign,
  Loader2,
  Copy,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Webhook,
  RefreshCw,
  Send,
  Home,
  Settings,
  ChevronDown,
  LayoutGrid,
  List,
  MapPin,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { LoanApplication, User, StaffInvite, FundedDeal, WebhookEndpoint } from "@shared/schema";

type EnrichedUser = User & {
  applicationCount: number;
  activeApplications: number;
  fundedLoans: number;
};

type EnrichedApplication = LoanApplication & {
  borrowerName: string;
  borrowerEmail?: string;
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  submitted: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  in_review: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  approved: "bg-green-500/10 text-green-600 border-green-500/30",
  funded: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  denied: "bg-red-500/10 text-red-600 border-red-500/30",
  withdrawn: "bg-gray-500/10 text-gray-500 border-gray-500/30",
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

const stageLabels: Record<string, string> = {
  account_review: "Account Review",
  underwriting: "Underwriting",
  term_sheet: "Term Sheet",
  processing: "Processing",
  docs_out: "Docs Out",
  closed: "Closed",
};

type ViewMode = "pipeline" | "funded";
type FundedViewStyle = "list" | "cards";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("pipeline");
  const [fundedViewStyle, setFundedViewStyle] = useState<FundedViewStyle>("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loanTypeFilter, setLoanTypeFilter] = useState<string>("all");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"staff" | "admin">("staff");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState<FundedDeal | null>(null);
  const [dealForm, setDealForm] = useState({
    location: "",
    state: "",
    propertyType: "Single Family",
    loanType: "DSCR",
    loanAmount: "",
    rate: "",
    ltv: "",
    ltc: "",
    closeTime: "30 days",
    imageUrl: "",
    isVisible: true,
  });
  
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    name: "",
    targetUrl: "",
    subscribedEvents: ["fundedDeal.created", "fundedDeal.updated", "fundedDeal.deleted"] as string[],
  });
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: applications, isLoading: appsLoading } = useQuery<EnrichedApplication[]>({
    queryKey: ["/api/admin/applications"],
    enabled: currentUser?.role === "staff" || currentUser?.role === "admin",
  });

  const { data: users, isLoading: usersLoading } = useQuery<EnrichedUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: currentUser?.role === "admin",
  });

  const { data: invites } = useQuery<StaffInvite[]>({
    queryKey: ["/api/admin/invites"],
    enabled: currentUser?.role === "admin",
  });

  const { data: fundedDeals, isLoading: dealsLoading } = useQuery<FundedDeal[]>({
    queryKey: ["/api/admin/funded-deals"],
    enabled: currentUser?.role === "staff" || currentUser?.role === "admin",
  });

  const { data: webhookEndpoints, isLoading: webhooksLoading } = useQuery<WebhookEndpoint[]>({
    queryKey: ["/api/admin/webhooks/endpoints"],
    enabled: currentUser?.role === "admin",
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/funded-deals", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/funded-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/funded-deals"] });
      setShowDealDialog(false);
      resetDealForm();
      toast({
        title: "Deal added",
        description: "The funded deal has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add deal",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/funded-deals/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/funded-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/funded-deals"] });
      setShowDealDialog(false);
      setEditingDeal(null);
      resetDealForm();
      toast({
        title: "Deal updated",
        description: "The funded deal has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update deal",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/funded-deals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/funded-deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/funded-deals"] });
      toast({
        title: "Deal deleted",
        description: "The funded deal has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete deal",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/webhooks/endpoints", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks/endpoints"] });
      setNewWebhookSecret(data.secret);
      toast({
        title: "Webhook created",
        description: "Don't forget to save the secret!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create webhook",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/webhooks/endpoints/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/webhooks/endpoints"] });
      toast({
        title: "Webhook deleted",
        description: "The webhook endpoint has been removed",
      });
    },
  });

  const resetDealForm = () => {
    setDealForm({
      location: "",
      state: "",
      propertyType: "Single Family",
      loanType: "DSCR",
      loanAmount: "",
      rate: "",
      ltv: "",
      ltc: "",
      closeTime: "30 days",
      imageUrl: "",
      isVisible: true,
    });
  };

  const openEditDeal = (deal: FundedDeal) => {
    setEditingDeal(deal);
    setDealForm({
      location: deal.location,
      state: deal.state,
      propertyType: deal.propertyType,
      loanType: deal.loanType,
      loanAmount: deal.loanAmount.toString(),
      rate: deal.rate,
      ltv: deal.ltv?.toString() || "",
      ltc: deal.ltc?.toString() || "",
      closeTime: deal.closeTime,
      imageUrl: deal.imageUrl || "",
      isVisible: deal.isVisible,
    });
    setShowDealDialog(true);
  };

  const handleDealSubmit = () => {
    const data = {
      location: dealForm.location,
      state: dealForm.state,
      propertyType: dealForm.propertyType,
      loanType: dealForm.loanType,
      loanAmount: parseInt(dealForm.loanAmount),
      rate: dealForm.rate,
      ltv: dealForm.ltv ? parseInt(dealForm.ltv) : null,
      ltc: dealForm.ltc ? parseInt(dealForm.ltc) : null,
      closeTime: dealForm.closeTime,
      imageUrl: dealForm.imageUrl || null,
      isVisible: dealForm.isVisible,
    };

    if (editingDeal) {
      updateDealMutation.mutate({ id: editingDeal.id, data });
    } else {
      createDealMutation.mutate(data);
    }
  };

  const handleWebhookSubmit = () => {
    createWebhookMutation.mutate({
      name: webhookForm.name,
      targetUrl: webhookForm.targetUrl,
      subscribedEvents: webhookForm.subscribedEvents,
    });
  };

  const createInviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await apiRequest("POST", "/api/admin/invites", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/invites"] });
      setNewInviteLink(window.location.origin + data.invite.inviteLink);
      setInviteEmail("");
      toast({
        title: "Invite sent!",
        description: `Invitation sent to ${data.invite.email}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invite",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
      });
    },
  });

  if (!currentUser || (currentUser.role !== "staff" && currentUser.role !== "admin")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page. Please sign in with a staff account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/login">
              <Button className="w-full" data-testid="button-staff-login">
                <Shield className="h-4 w-4 mr-2" />
                Staff Login
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredApplications = applications?.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (loanTypeFilter !== "all" && app.loanType !== loanTypeFilter) return false;
    return true;
  });

  const loanTypes = Array.from(new Set(applications?.map((app) => app.loanType) || []));

  const stats = {
    total: applications?.length || 0,
    submitted: applications?.filter((a) => a.status === "submitted").length || 0,
    inReview: applications?.filter((a) => a.status === "in_review").length || 0,
    approved: applications?.filter((a) => a.status === "approved").length || 0,
    funded: applications?.filter((a) => a.status === "funded").length || 0,
    totalDeals: fundedDeals?.length || 0,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  const renderDynamicDealFields = () => {
    if (dealForm.loanType === "DSCR") {
      return (
        <div className="space-y-2">
          <Label>LTV (%) - Loan-to-Value</Label>
          <Input
            type="number"
            placeholder="75"
            value={dealForm.ltv}
            onChange={(e) => setDealForm({ ...dealForm, ltv: e.target.value })}
            data-testid="input-ltv"
          />
          <p className="text-xs text-muted-foreground">Standard metric for DSCR rental property loans</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <Label>LTC (%) - Loan-to-Cost</Label>
        <Input
          type="number"
          placeholder="85"
          value={dealForm.ltc}
          onChange={(e) => setDealForm({ ...dealForm, ltc: e.target.value })}
          data-testid="input-ltc"
        />
        <p className="text-xs text-muted-foreground">
          {dealForm.loanType === "Fix & Flip" 
            ? "Standard metric for fix & flip renovation loans"
            : "Standard metric for ground-up construction loans"
          }
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
              <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">
                {currentUser.role === "admin" ? "Administrator" : "Staff"} Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="outline" className="capitalize text-xs">
              {currentUser.role}
            </Badge>
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
              {currentUser.firstName} {currentUser.lastName}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* View Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {/* Pipeline Card - Main View Selector */}
          <Card 
            className={`cursor-pointer transition-all hover-elevate col-span-1 ${viewMode === "pipeline" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setViewMode("pipeline")}
            data-testid="view-card-pipeline"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Pipeline</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funded Deals Card - Main View Selector */}
          <Card 
            className={`cursor-pointer transition-all hover-elevate col-span-1 ${viewMode === "funded" ? "ring-2 ring-emerald-500" : ""}`}
            onClick={() => setViewMode("funded")}
            data-testid="view-card-funded"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.totalDeals}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Funded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Status Cards */}
          <Card 
            className={`cursor-pointer transition-all hover-elevate ${viewMode === "pipeline" && statusFilter === "submitted" ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => { setViewMode("pipeline"); setStatusFilter("submitted"); }}
            data-testid="stat-card-submitted"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.submitted}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover-elevate ${viewMode === "pipeline" && statusFilter === "in_review" ? "ring-2 ring-yellow-500" : ""}`}
            onClick={() => { setViewMode("pipeline"); setStatusFilter("in_review"); }}
            data-testid="stat-card-in-review"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.inReview}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">In Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover-elevate hidden sm:block ${viewMode === "pipeline" && statusFilter === "approved" ? "ring-2 ring-green-500" : ""}`}
            onClick={() => { setViewMode("pipeline"); setStatusFilter("approved"); }}
            data-testid="stat-card-approved"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.approved}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover-elevate hidden lg:block ${viewMode === "pipeline" && statusFilter === "funded" ? "ring-2 ring-emerald-500" : ""}`}
            onClick={() => { setViewMode("pipeline"); setStatusFilter("funded"); }}
            data-testid="stat-card-pipeline-funded"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.funded}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="space-y-4 sm:space-y-6">
          {/* Pipeline View */}
          {viewMode === "pipeline" && (
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Loan Applications</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">View and manage all loan applications</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[110px] sm:w-[140px] h-8 sm:h-9 text-xs sm:text-sm" data-testid="select-status-filter">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                        <SelectItem value="denied">Denied</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
                      <SelectTrigger className="w-[110px] sm:w-[160px] h-8 sm:h-9 text-xs sm:text-sm" data-testid="select-type-filter">
                        <SelectValue placeholder="Loan Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {loanTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-0">
                {appsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredApplications?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No applications found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Loan ID</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Borrower</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Type</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Property</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Amount</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Status</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">Stage</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications?.map((app) => (
                          <TableRow key={app.id} data-testid={`row-app-${app.id}`}>
                            <TableCell className="font-mono text-xs sm:text-sm">
                              {app.id.slice(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-xs sm:text-sm">{app.borrowerName}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{app.borrowerEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] sm:text-xs">{app.loanType}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="max-w-[200px] truncate text-xs sm:text-sm">
                                {app.propertyAddress || app.propertyCity ? (
                                  <>
                                    {app.propertyAddress && <span>{app.propertyAddress}, </span>}
                                    {app.propertyCity}, {app.propertyState}
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">No address</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {app.loanAmount ? (
                                `$${app.loanAmount.toLocaleString()}`
                              ) : app.purchasePrice ? (
                                `$${app.purchasePrice.toLocaleString()}`
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${statusColors[app.status]} text-[10px] sm:text-xs`}>
                                {statusLabels[app.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <span className="text-xs sm:text-sm">
                                {app.processingStage ? stageLabels[app.processingStage] : "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Link href={`/admin/application/${app.id}`}>
                                <Button size="sm" variant="outline" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3" data-testid={`button-view-${app.id}`}>
                                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Funded Deals View */}
          {viewMode === "funded" && (
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Recently Funded Deals</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Manage deals displayed on the homepage and state pages</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex items-center bg-muted rounded-lg p-1">
                      <Button
                        variant={fundedViewStyle === "list" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setFundedViewStyle("list")}
                        data-testid="button-view-list"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={fundedViewStyle === "cards" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setFundedViewStyle("cards")}
                        data-testid="button-view-cards"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </div>
                    <Dialog open={showDealDialog} onOpenChange={(open) => {
                      setShowDealDialog(open);
                      if (!open) {
                        setEditingDeal(null);
                        resetDealForm();
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-deal">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Deal
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingDeal ? "Edit Funded Deal" : "Add Funded Deal"}</DialogTitle>
                          <DialogDescription>
                            {editingDeal ? "Update the deal information" : "Add a new funded deal to showcase"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Location</Label>
                              <Input
                                placeholder="Los Angeles, CA"
                                value={dealForm.location}
                                onChange={(e) => setDealForm({ ...dealForm, location: e.target.value })}
                                data-testid="input-deal-location"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>State</Label>
                              <Input
                                placeholder="CA"
                                maxLength={2}
                                value={dealForm.state}
                                onChange={(e) => setDealForm({ ...dealForm, state: e.target.value.toUpperCase() })}
                                data-testid="input-deal-state"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Property Type</Label>
                              <Select value={dealForm.propertyType} onValueChange={(v) => setDealForm({ ...dealForm, propertyType: v })}>
                                <SelectTrigger data-testid="select-property-type">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Single Family">Single Family</SelectItem>
                                  <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                                  <SelectItem value="Mixed Use">Mixed Use</SelectItem>
                                  <SelectItem value="Commercial">Commercial</SelectItem>
                                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                                  <SelectItem value="Condo">Condo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Loan Type</Label>
                              <Select value={dealForm.loanType} onValueChange={(v) => setDealForm({ ...dealForm, loanType: v, ltv: "", ltc: "" })}>
                                <SelectTrigger data-testid="select-loan-type">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="DSCR">DSCR</SelectItem>
                                  <SelectItem value="Fix & Flip">Fix & Flip</SelectItem>
                                  <SelectItem value="New Construction">New Construction</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Loan Amount ($)</Label>
                              <Input
                                type="number"
                                placeholder="500000"
                                value={dealForm.loanAmount}
                                onChange={(e) => setDealForm({ ...dealForm, loanAmount: e.target.value })}
                                data-testid="input-loan-amount"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Rate (%)</Label>
                              <Input
                                placeholder="7.25%"
                                value={dealForm.rate}
                                onChange={(e) => setDealForm({ ...dealForm, rate: e.target.value })}
                                data-testid="input-rate"
                              />
                            </div>
                          </div>
                          
                          {/* Dynamic fields based on loan type */}
                          {renderDynamicDealFields()}

                          <div className="space-y-2">
                            <Label>Close Time</Label>
                            <Input
                              placeholder="30 days"
                              value={dealForm.closeTime}
                              onChange={(e) => setDealForm({ ...dealForm, closeTime: e.target.value })}
                              data-testid="input-close-time"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Image URL (optional)</Label>
                            <Input
                              placeholder="https://..."
                              value={dealForm.imageUrl}
                              onChange={(e) => setDealForm({ ...dealForm, imageUrl: e.target.value })}
                              data-testid="input-image-url"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={dealForm.isVisible}
                              onCheckedChange={(checked) => setDealForm({ ...dealForm, isVisible: checked })}
                              data-testid="switch-visible"
                            />
                            <Label>Visible on website</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleDealSubmit}
                            disabled={!dealForm.location || !dealForm.state || !dealForm.loanAmount || !dealForm.rate || createDealMutation.isPending || updateDealMutation.isPending}
                            data-testid="button-submit-deal"
                          >
                            {(createDealMutation.isPending || updateDealMutation.isPending) && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            {editingDeal ? "Update Deal" : "Add Deal"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 sm:pt-0">
                {dealsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : fundedDeals?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No funded deals yet. Add your first deal to showcase on the website.
                  </div>
                ) : fundedViewStyle === "cards" ? (
                  /* Card View */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fundedDeals?.map((deal) => (
                      <Card key={deal.id} className="overflow-hidden" data-testid={`card-deal-${deal.id}`}>
                        <div className="aspect-video relative bg-muted">
                          {deal.imageUrl ? (
                            <img
                              src={deal.imageUrl}
                              alt={`${deal.location} property`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1">
                            {deal.isVisible ? (
                              <Badge className="bg-green-500/90 text-white text-xs">Visible</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Hidden</Badge>
                            )}
                          </div>
                          <Badge className="absolute top-2 left-2 text-xs">{deal.loanType}</Badge>
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-semibold text-sm flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {deal.location}, {deal.state}
                              </p>
                              <p className="text-xs text-muted-foreground">{deal.propertyType}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => openEditDeal(deal)}
                                data-testid={`button-edit-deal-${deal.id}`}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this deal?")) {
                                    deleteDealMutation.mutate(deal.id);
                                  }
                                }}
                                data-testid={`button-delete-deal-${deal.id}`}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Loan Amount</p>
                              <p className="font-medium">${deal.loanAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Rate</p>
                              <p className="font-medium">{deal.rate}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{deal.ltv ? "LTV" : "LTC"}</p>
                              <p className="font-medium">{deal.ltv || deal.ltc || "-"}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Closed In</p>
                              <p className="font-medium">{deal.closeTime}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* List View */
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Location</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Type</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Loan</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Amount</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">Rate</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Visible</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fundedDeals?.map((deal) => (
                          <TableRow key={deal.id} data-testid={`row-deal-${deal.id}`}>
                            <TableCell>
                              <div className="font-medium text-xs sm:text-sm">{deal.location}</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground">{deal.propertyType}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] sm:text-xs">{deal.loanType}</Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              ${deal.loanAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                              {deal.ltv && <span>LTV: {deal.ltv}%</span>}
                              {deal.ltc && <span className="ml-2">LTC: {deal.ltc}%</span>}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                              {deal.rate}
                            </TableCell>
                            <TableCell>
                              {deal.isVisible ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openEditDeal(deal)}
                                  data-testid={`button-edit-deal-${deal.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this deal?")) {
                                      deleteDealMutation.mutate(deal.id);
                                    }
                                  }}
                                  data-testid={`button-delete-deal-${deal.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Settings Section */}
          {currentUser.role === "admin" && (
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="p-3 sm:p-6 cursor-pointer hover-elevate">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-base sm:text-lg">Settings</CardTitle>
                          <CardDescription className="text-xs sm:text-sm">Users, Invites & Integrations</CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-3 sm:p-6 pt-0 space-y-6">
                    {/* Users Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-sm">Client Portal Accounts</h3>
                      </div>
                      {usersLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="overflow-x-auto border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Name</TableHead>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Email</TableHead>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Role</TableHead>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Activity</TableHead>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users?.slice(0, 5).map((user) => (
                                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                                  <TableCell>
                                    <div className="font-medium text-xs sm:text-sm">
                                      {user.firstName} {user.lastName}
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{user.email}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize text-[10px] sm:text-xs">
                                      {user.role}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <div className="flex gap-1">
                                      <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{user.applicationCount || 0} apps</span>
                                      <span className="text-xs px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">{user.fundedLoans || 0} funded</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={user.role}
                                      onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                                      disabled={user.id === currentUser.id}
                                    >
                                      <SelectTrigger className="w-[90px] sm:w-[100px] h-7 text-xs" data-testid={`select-role-${user.id}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="borrower">Borrower</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {users && users.length > 5 && (
                            <div className="p-2 text-center border-t">
                              <span className="text-xs text-muted-foreground">Showing 5 of {users.length} users</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Invites Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold text-sm">Staff Invitations</h3>
                        </div>
                        <Dialog open={showInviteDialog} onOpenChange={(open) => {
                          setShowInviteDialog(open);
                          if (!open) setNewInviteLink(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" data-testid="button-new-invite">
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Invite
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Invite Team Member</DialogTitle>
                              <DialogDescription>
                                Send an invitation to join your team
                              </DialogDescription>
                            </DialogHeader>
                            {newInviteLink ? (
                              <div className="space-y-4">
                                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                                  <p className="text-sm text-green-700 mb-2">Invitation created successfully!</p>
                                  <p className="text-xs text-muted-foreground mb-2">Share this link with the invitee:</p>
                                  <div className="flex items-center gap-2">
                                    <Input value={newInviteLink} readOnly className="text-xs" />
                                    <Button size="icon" variant="outline" onClick={() => copyToClipboard(newInviteLink)}>
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <Button className="w-full" onClick={() => {
                                  setShowInviteDialog(false);
                                  setNewInviteLink(null);
                                }}>
                                  Done
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                      type="email"
                                      placeholder="colleague@company.com"
                                      value={inviteEmail}
                                      onChange={(e) => setInviteEmail(e.target.value)}
                                      data-testid="input-invite-email"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "staff" | "admin")}>
                                      <SelectTrigger data-testid="select-invite-role">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={() => createInviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                                    disabled={!inviteEmail || createInviteMutation.isPending}
                                    data-testid="button-send-invite"
                                  >
                                    {createInviteMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Mail className="h-4 w-4 mr-2" />
                                    )}
                                    Send Invite
                                  </Button>
                                </DialogFooter>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                      {invites?.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg">
                          No invitations sent yet
                        </div>
                      ) : (
                        <div className="overflow-x-auto border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Email</TableHead>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Role</TableHead>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Status</TableHead>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Expires</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invites?.map((invite) => (
                                <TableRow key={invite.id} data-testid={`row-invite-${invite.id}`}>
                                  <TableCell className="text-xs sm:text-sm">{invite.email}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize text-[10px] sm:text-xs">
                                      {invite.role}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`text-[10px] sm:text-xs ${
                                        invite.status === "pending"
                                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                                          : invite.status === "accepted"
                                          ? "bg-green-500/10 text-green-600 border-green-500/30"
                                          : "bg-red-500/10 text-red-600 border-red-500/30"
                                      }`}
                                    >
                                      {invite.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                                    {new Date(invite.expiresAt).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>

                    {/* Webhooks Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Webhook className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold text-sm">Webhook Endpoints</h3>
                        </div>
                        <Dialog open={showWebhookDialog} onOpenChange={(open) => {
                          setShowWebhookDialog(open);
                          if (!open) {
                            setNewWebhookSecret(null);
                            setWebhookForm({
                              name: "",
                              targetUrl: "",
                              subscribedEvents: ["fundedDeal.created", "fundedDeal.updated", "fundedDeal.deleted"],
                            });
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" data-testid="button-add-webhook">
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add Endpoint
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Add Webhook Endpoint</DialogTitle>
                              <DialogDescription>
                                Configure a new webhook to receive real-time updates
                              </DialogDescription>
                            </DialogHeader>
                            {newWebhookSecret ? (
                              <div className="space-y-4">
                                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                                  <p className="text-sm text-green-700 font-medium mb-2">Webhook Created!</p>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Save this secret - it won't be shown again:
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Input value={newWebhookSecret} readOnly className="font-mono text-xs" />
                                    <Button size="icon" variant="outline" onClick={() => copyToClipboard(newWebhookSecret)}>
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <Button className="w-full" onClick={() => {
                                  setShowWebhookDialog(false);
                                  setNewWebhookSecret(null);
                                }}>
                                  Done
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Endpoint Name</Label>
                                    <Input
                                      placeholder="LendFlowPro Production"
                                      value={webhookForm.name}
                                      onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                                      data-testid="input-webhook-name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Webhook URL</Label>
                                    <Input
                                      placeholder="https://api.lendflowpro.com/webhooks/saf"
                                      value={webhookForm.targetUrl}
                                      onChange={(e) => setWebhookForm({ ...webhookForm, targetUrl: e.target.value })}
                                      data-testid="input-webhook-url"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm">Subscribed Events</Label>
                                    <div className="space-y-2">
                                      {["fundedDeal.created", "fundedDeal.updated", "fundedDeal.deleted"].map((event) => (
                                        <div key={event} className="flex items-center gap-2">
                                          <Checkbox
                                            id={event}
                                            checked={webhookForm.subscribedEvents.includes(event)}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                setWebhookForm({
                                                  ...webhookForm,
                                                  subscribedEvents: [...webhookForm.subscribedEvents, event],
                                                });
                                              } else {
                                                setWebhookForm({
                                                  ...webhookForm,
                                                  subscribedEvents: webhookForm.subscribedEvents.filter((e) => e !== event),
                                                });
                                              }
                                            }}
                                          />
                                          <Label htmlFor={event} className="text-sm font-normal">
                                            {event}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={handleWebhookSubmit}
                                    disabled={!webhookForm.name || !webhookForm.targetUrl || createWebhookMutation.isPending}
                                    data-testid="button-create-webhook"
                                  >
                                    {createWebhookMutation.isPending && (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Create Endpoint
                                  </Button>
                                </DialogFooter>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                      {webhooksLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : webhookEndpoints?.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg">
                          No webhook endpoints configured
                        </div>
                      ) : (
                        <div className="overflow-x-auto border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Name</TableHead>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">URL</TableHead>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Status</TableHead>
                                <TableHead className="text-xs sm:text-sm whitespace-nowrap">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {webhookEndpoints?.map((endpoint) => (
                                <TableRow key={endpoint.id} data-testid={`row-webhook-${endpoint.id}`}>
                                  <TableCell className="text-xs sm:text-sm font-medium">{endpoint.name}</TableCell>
                                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                                    {endpoint.targetUrl}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`text-[10px] sm:text-xs ${
                                        endpoint.isActive
                                          ? "bg-green-500/10 text-green-600 border-green-500/30"
                                          : "bg-gray-500/10 text-gray-600 border-gray-500/30"
                                      }`}
                                    >
                                      {endpoint.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        if (confirm("Delete this webhook endpoint?")) {
                                          deleteWebhookMutation.mutate(endpoint.id);
                                        }
                                      }}
                                      data-testid={`button-delete-webhook-${endpoint.id}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>
      </main>
    </div>
  );
}
