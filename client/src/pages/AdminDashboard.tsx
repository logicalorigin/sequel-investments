import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Settings,
  LayoutGrid,
  List,
  MapPin,
  Search,
  User,
  Briefcase,
  Phone,
  Calendar,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { LoanApplication, User as UserType, StaffInvite, FundedDeal, WebhookEndpoint } from "@shared/schema";

type EnrichedUser = UserType & {
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

type AdminTab = "applications" | "borrowers" | "funded" | "staff" | "settings";
type FundedViewStyle = "list" | "cards";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("applications");
  const [fundedViewStyle, setFundedViewStyle] = useState<FundedViewStyle>("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loanTypeFilter, setLoanTypeFilter] = useState<string>("all");
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [borrowerRoleFilter, setBorrowerRoleFilter] = useState<string>("all");
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"staff" | "admin">("staff");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);
  
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

  const { data: currentUser } = useQuery<UserType>({
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

  const borrowers = users?.filter(u => u.role === "borrower") || [];
  const staffMembers = users?.filter(u => u.role === "staff" || u.role === "admin") || [];

  const filteredBorrowers = borrowers.filter((user) => {
    const searchLower = borrowerSearch.toLowerCase();
    const matchesSearch = !borrowerSearch || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower);
    
    if (borrowerRoleFilter === "active") {
      return matchesSearch && user.activeApplications > 0;
    }
    if (borrowerRoleFilter === "funded") {
      return matchesSearch && user.fundedLoans > 0;
    }
    return matchesSearch;
  });

  const selectedBorrower = selectedBorrowerId ? users?.find(u => u.id === selectedBorrowerId) : null;
  const borrowerApplications = selectedBorrowerId ? applications?.filter(a => a.userId === selectedBorrowerId) : [];

  const stats = {
    total: applications?.length || 0,
    submitted: applications?.filter((a) => a.status === "submitted").length || 0,
    inReview: applications?.filter((a) => a.status === "in_review").length || 0,
    approved: applications?.filter((a) => a.status === "approved").length || 0,
    funded: applications?.filter((a) => a.status === "funded").length || 0,
    totalDeals: fundedDeals?.length || 0,
    totalBorrowers: borrowers.length,
    activeBorrowers: borrowers.filter(b => b.activeApplications > 0).length,
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
      <header className="border-b bg-card sticky top-0 z-50">
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

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Card 
            className={`cursor-pointer transition-all hover-elevate ${activeTab === "applications" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setActiveTab("applications")}
            data-testid="stat-card-applications"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover-elevate ${activeTab === "borrowers" ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setActiveTab("borrowers")}
            data-testid="stat-card-borrowers"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.totalBorrowers}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Borrowers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover-elevate ${activeTab === "funded" ? "ring-2 ring-emerald-500" : ""}`}
            onClick={() => setActiveTab("funded")}
            data-testid="stat-card-funded"
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

          <Card 
            className="cursor-pointer transition-all hover-elevate"
            onClick={() => { setActiveTab("applications"); setStatusFilter("submitted"); }}
            data-testid="stat-card-submitted"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.submitted}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover-elevate hidden sm:block"
            onClick={() => { setActiveTab("applications"); setStatusFilter("in_review"); }}
            data-testid="stat-card-in-review"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-1.5 sm:p-2 bg-orange-500/10 rounded-lg">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.inReview}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">In Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover-elevate hidden lg:block"
            onClick={() => { setActiveTab("applications"); setStatusFilter("approved"); }}
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
        </div>

        {/* Tabbed Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="applications" className="gap-1 sm:gap-2" data-testid="tab-applications">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger value="borrowers" className="gap-1 sm:gap-2" data-testid="tab-borrowers">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Borrowers</span>
            </TabsTrigger>
            <TabsTrigger value="funded" className="gap-1 sm:gap-2" data-testid="tab-funded">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Funded</span>
            </TabsTrigger>
            {currentUser.role === "admin" && (
              <>
                <TabsTrigger value="staff" className="gap-1 sm:gap-2" data-testid="tab-staff">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Staff</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1 sm:gap-2" data-testid="tab-settings">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
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
                                <button 
                                  className="font-medium text-xs sm:text-sm text-primary hover:underline text-left"
                                  onClick={() => {
                                    setSelectedBorrowerId(app.userId);
                                    setActiveTab("borrowers");
                                  }}
                                  data-testid={`link-borrower-${app.userId}`}
                                >
                                  {app.borrowerName}
                                </button>
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
                                formatCurrency(app.loanAmount)
                              ) : app.purchasePrice ? (
                                formatCurrency(app.purchasePrice)
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
          </TabsContent>

          {/* Borrowers Tab */}
          <TabsContent value="borrowers" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Borrower List */}
              <div className={selectedBorrowerId ? "lg:col-span-1" : "lg:col-span-3"}>
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base sm:text-lg">Borrower Profiles</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {filteredBorrowers.length} borrower{filteredBorrowers.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or email..."
                          value={borrowerSearch}
                          onChange={(e) => setBorrowerSearch(e.target.value)}
                          className="pl-9 h-8 sm:h-9 text-xs sm:text-sm"
                          data-testid="input-borrower-search"
                        />
                      </div>
                      <Select value={borrowerRoleFilter} onValueChange={setBorrowerRoleFilter}>
                        <SelectTrigger className="w-[100px] sm:w-[120px] h-8 sm:h-9 text-xs sm:text-sm" data-testid="select-borrower-filter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="funded">Funded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredBorrowers.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        No borrowers found
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px] lg:h-[500px]">
                        <div className="divide-y">
                          {filteredBorrowers.map((user) => (
                            <button
                              key={user.id}
                              className={`w-full p-3 sm:p-4 text-left hover-elevate flex items-center gap-3 ${selectedBorrowerId === user.id ? "bg-accent" : ""}`}
                              onClick={() => setSelectedBorrowerId(user.id)}
                              data-testid={`borrower-row-${user.id}`}
                            >
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex gap-1">
                                  <Badge variant="outline" className="text-[10px]">{user.applicationCount || 0} apps</Badge>
                                  {(user.fundedLoans || 0) > 0 && (
                                    <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                      {user.fundedLoans} funded
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Borrower Detail Panel */}
              {selectedBorrowerId && selectedBorrower && (
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">
                              {selectedBorrower.firstName} {selectedBorrower.lastName}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Mail className="h-3.5 w-3.5" />
                              {selectedBorrower.email}
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedBorrowerId(null)}
                          className="h-8 w-8"
                          data-testid="button-close-detail"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold">{selectedBorrower.applicationCount || 0}</p>
                          <p className="text-xs text-muted-foreground">Total Apps</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold">{selectedBorrower.activeApplications || 0}</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                        <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-emerald-600">{selectedBorrower.fundedLoans || 0}</p>
                          <p className="text-xs text-muted-foreground">Funded</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Member since {selectedBorrower.createdAt ? formatDate(selectedBorrower.createdAt) : "N/A"}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Borrower's Applications */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Applications ({borrowerApplications?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {borrowerApplications?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No applications yet
                        </div>
                      ) : (
                        <div className="divide-y">
                          {borrowerApplications?.map((app) => (
                            <Link key={app.id} href={`/admin/application/${app.id}`}>
                              <div className="p-4 hover-elevate cursor-pointer" data-testid={`borrower-app-${app.id}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                      <span className="font-mono text-xs text-muted-foreground">
                                        {app.id.slice(0, 8).toUpperCase()}
                                      </span>
                                      <span className="font-medium text-sm">{app.loanType}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <p className="font-medium text-sm">
                                        {app.loanAmount ? formatCurrency(app.loanAmount) : "-"}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {app.propertyCity}, {app.propertyState}
                                      </p>
                                    </div>
                                    <Badge className={`${statusColors[app.status]} text-[10px]`}>
                                      {statusLabels[app.status]}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Funded Deals Tab */}
          <TabsContent value="funded" className="space-y-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Recently Funded Deals</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Manage deals displayed on the homepage and state pages</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
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
                              <Building2 className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          )}
                          <Badge className={`absolute top-2 left-2 text-xs ${deal.loanType === "DSCR" ? "bg-blue-500" : deal.loanType === "Fix & Flip" ? "bg-amber-500" : "bg-green-500"}`}>
                            {deal.loanType}
                          </Badge>
                          {!deal.isVisible && (
                            <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-1 text-muted-foreground mb-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-sm font-medium">{deal.location}, {deal.state}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground text-xs">Amount</p>
                              <p className="font-semibold">{formatCurrency(deal.loanAmount)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Rate</p>
                              <p className="font-semibold">{deal.rate}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">{deal.ltv ? "LTV" : "LTC"}</p>
                              <p className="font-semibold">{deal.ltv || deal.ltc}%</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditDeal(deal)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this deal?")) {
                                  deleteDealMutation.mutate(deal.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Location</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Type</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Amount</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Rate</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">LTV/LTC</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Status</TableHead>
                          <TableHead className="text-xs sm:text-sm whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fundedDeals?.map((deal) => (
                          <TableRow key={deal.id} data-testid={`row-deal-${deal.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs sm:text-sm">{deal.location}, {deal.state}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px] sm:text-xs">{deal.loanType}</Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm font-medium">
                              {formatCurrency(deal.loanAmount)}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{deal.rate}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs sm:text-sm">{deal.ltv || deal.ltc}%</TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] sm:text-xs ${deal.isVisible ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-gray-500/10 text-gray-600 border-gray-500/30"}`}>
                                {deal.isVisible ? "Visible" : "Hidden"}
                              </Badge>
                            </TableCell>
                            <TableCell>
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
          </TabsContent>

          {/* Staff Tab (Admin Only) */}
          {currentUser.role === "admin" && (
            <TabsContent value="staff" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Staff Members */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Staff Members
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {staffMembers.length} staff member{staffMembers.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="divide-y">
                        {staffMembers.map((user) => (
                          <div key={user.id} className="p-4 flex items-center justify-between" data-testid={`staff-row-${user.id}`}>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <Select
                              value={user.role}
                              onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                              disabled={user.id === currentUser.id}
                            >
                              <SelectTrigger className="w-[100px] h-8 text-xs" data-testid={`select-role-${user.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Staff Invites */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <UserPlus className="h-5 w-5" />
                          Invitations
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Invite new team members
                        </CardDescription>
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
                  </CardHeader>
                  <CardContent className="p-0">
                    {invites?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No invitations sent yet
                      </div>
                    ) : (
                      <div className="divide-y">
                        {invites?.map((invite) => (
                          <div key={invite.id} className="p-4 flex items-center justify-between" data-testid={`invite-row-${invite.id}`}>
                            <div>
                              <p className="text-sm font-medium">{invite.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="capitalize text-[10px]">{invite.role}</Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  Expires {new Date(invite.expiresAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Badge
                              className={`text-[10px] ${
                                invite.status === "pending"
                                  ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                                  : invite.status === "accepted"
                                  ? "bg-green-500/10 text-green-600 border-green-500/30"
                                  : "bg-red-500/10 text-red-600 border-red-500/30"
                              }`}
                            >
                              {invite.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Settings Tab (Admin Only) */}
          {currentUser.role === "admin" && (
            <TabsContent value="settings" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                {/* All Accounts */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      All Accounts
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Manage user roles and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px]">
                        <div className="divide-y">
                          {users?.map((user) => (
                            <div key={user.id} className="p-3 flex items-center justify-between" data-testid={`user-row-${user.id}`}>
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                  {user.role === "admin" ? (
                                    <Shield className="h-4 w-4 text-primary" />
                                  ) : user.role === "staff" ? (
                                    <Briefcase className="h-4 w-4 text-blue-500" />
                                  ) : (
                                    <User className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                              </div>
                              <Select
                                value={user.role}
                                onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                                disabled={user.id === currentUser.id}
                              >
                                <SelectTrigger className="w-[90px] h-7 text-xs shrink-0" data-testid={`select-user-role-${user.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="borrower">Borrower</SelectItem>
                                  <SelectItem value="staff">Staff</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>

                {/* Webhooks */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <Webhook className="h-5 w-5" />
                          Webhooks
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          CRM/LOS integrations
                        </CardDescription>
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
                            Add
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
                  </CardHeader>
                  <CardContent className="p-0">
                    {webhooksLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : webhookEndpoints?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No webhook endpoints configured
                      </div>
                    ) : (
                      <div className="divide-y">
                        {webhookEndpoints?.map((endpoint) => (
                          <div key={endpoint.id} className="p-4 flex items-center justify-between" data-testid={`webhook-row-${endpoint.id}`}>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{endpoint.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{endpoint.targetUrl}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`text-[10px] ${
                                  endpoint.isActive
                                    ? "bg-green-500/10 text-green-600 border-green-500/30"
                                    : "bg-gray-500/10 text-gray-600 border-gray-500/30"
                                }`}
                              >
                                {endpoint.isActive ? "Active" : "Inactive"}
                              </Badge>
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
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
