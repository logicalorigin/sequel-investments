import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
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

type FundedViewStyle = "list" | "cards";

const ITEMS_PER_PAGE = 10;

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

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage,
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <p className="text-xs text-muted-foreground">
        Showing {startItem}-{endItem} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          data-testid="button-prev-page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm px-2 min-w-[80px] text-center">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          data-testid="button-next-page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [fundedViewStyle, setFundedViewStyle] = useState<FundedViewStyle>("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loanTypeFilter, setLoanTypeFilter] = useState<string>("all");
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [borrowerRoleFilter, setBorrowerRoleFilter] = useState<string>("all");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"staff" | "admin">("staff");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);
  
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [borrowersPage, setBorrowersPage] = useState(1);
  const [fundedPage, setFundedPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState<FundedDeal | null>(null);
  const [dealForm, setDealForm] = useState({
    location: "",
    state: "",
    propertyType: "Single Family",
    loanType: "DSCR",
    loanSubtype: "",
    loanAmount: "",
    rate: "",
    ltv: "",
    ltc: "",
    closeTime: "30 days",
    imageUrl: "",
    isVisible: true,
  });
  
  const loanSubtypeOptions: Record<string, string[]> = {
    "DSCR": ["Purchase", "Cash Out Refi", "Rate and Term Refi"],
    "Fix & Flip": ["Fix & Flip", "New Construction", "Bridge to Sale"],
    "New Construction": ["Ground Up", "ADU/Conversion", "Spec Build"],
  };
  
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    name: "",
    targetUrl: "",
    subscribedEvents: ["fundedDeal.created", "fundedDeal.updated", "fundedDeal.deleted"] as string[],
  });
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);

  const applicationsRef = useRef<HTMLElement>(null);
  const borrowersRef = useRef<HTMLElement>(null);
  const fundedRef = useRef<HTMLElement>(null);
  const staffRef = useRef<HTMLElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  const { data: borrowersList, isLoading: borrowersLoading } = useQuery<EnrichedUser[]>({
    queryKey: ["/api/admin/borrowers"],
    enabled: currentUser?.role === "staff" || currentUser?.role === "admin",
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
      loanSubtype: "",
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
      loanSubtype: deal.loanSubtype || "",
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
      loanSubtype: dealForm.loanSubtype || null,
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
  }) || [];

  const loanTypes = Array.from(new Set(applications?.map((app) => app.loanType) || []));

  const borrowers = borrowersList || [];
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

  const applicationsTotalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = filteredApplications.slice(
    (applicationsPage - 1) * ITEMS_PER_PAGE,
    applicationsPage * ITEMS_PER_PAGE
  );

  const borrowersTotalPages = Math.ceil(filteredBorrowers.length / ITEMS_PER_PAGE);
  const paginatedBorrowers = filteredBorrowers.slice(
    (borrowersPage - 1) * ITEMS_PER_PAGE,
    borrowersPage * ITEMS_PER_PAGE
  );

  const fundedTotalPages = Math.ceil((fundedDeals?.length || 0) / ITEMS_PER_PAGE);
  const paginatedDeals = fundedDeals?.slice(
    (fundedPage - 1) * ITEMS_PER_PAGE,
    fundedPage * ITEMS_PER_PAGE
  ) || [];

  const staffTotalPages = Math.ceil(staffMembers.length / ITEMS_PER_PAGE);
  const paginatedStaff = staffMembers.slice(
    (staffPage - 1) * ITEMS_PER_PAGE,
    staffPage * ITEMS_PER_PAGE
  );

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
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser.role === "admin" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1" data-testid="button-settings-dropdown">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">Settings</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Admin Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowWebhookDialog(true)}
                    data-testid="dropdown-webhooks"
                  >
                    <Webhook className="h-4 w-4 mr-2" />
                    Webhooks
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <div className="flex items-center gap-1.5 pl-2 border-l">
              <Badge variant="outline" className="capitalize text-xs">
                {currentUser.role}
              </Badge>
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                {currentUser.firstName} {currentUser.lastName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Jump Navigation */}
      <nav className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-[57px] sm:top-[65px] z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2 py-2 overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs shrink-0"
              onClick={() => scrollToSection(applicationsRef)}
              data-testid="jump-applications"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Applications
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">{stats.total}</Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs shrink-0"
              onClick={() => scrollToSection(borrowersRef)}
              data-testid="jump-borrowers"
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Borrowers
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">{stats.totalBorrowers}</Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs shrink-0"
              onClick={() => scrollToSection(fundedRef)}
              data-testid="jump-recently-funded"
            >
              <DollarSign className="h-3.5 w-3.5 mr-1.5" />
              Recently Funded
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">{stats.totalDeals}</Badge>
            </Button>
            {currentUser.role === "admin" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs shrink-0"
                onClick={() => scrollToSection(staffRef)}
                data-testid="jump-staff"
              >
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Staff & Invites
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">{staffMembers.length}</Badge>
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Card 
            className="cursor-pointer transition-all hover-elevate"
            onClick={() => { setStatusFilter("all"); setApplicationsPage(1); scrollToSection(applicationsRef); }}
            data-testid="stat-card-applications"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover-elevate"
            onClick={() => { setStatusFilter("in_review"); setApplicationsPage(1); scrollToSection(applicationsRef); }}
            data-testid="stat-card-in-review"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.inReview}</p>
                  <p className="text-xs text-muted-foreground">In Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover-elevate"
            onClick={() => { setStatusFilter("submitted"); setApplicationsPage(1); scrollToSection(applicationsRef); }}
            data-testid="stat-card-pending"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.submitted}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover-elevate"
            onClick={() => { setStatusFilter("approved"); setApplicationsPage(1); scrollToSection(applicationsRef); }}
            data-testid="stat-card-approved"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">{stats.approved}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Section */}
        <section ref={applicationsRef} id="applications" className="scroll-mt-32">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <CardTitle className="text-base sm:text-lg">Loan Applications</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">View and manage all loan applications</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setApplicationsPage(1); }}>
                    <SelectTrigger className="w-[110px] h-8 text-xs" data-testid="select-status-filter">
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
                  <Select value={loanTypeFilter} onValueChange={(v) => { setLoanTypeFilter(v); setApplicationsPage(1); }}>
                    <SelectTrigger className="w-[120px] h-8 text-xs" data-testid="select-type-filter">
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
            <CardContent className="p-0">
              {appsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No applications found
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Borrower</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Loan Type</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">Amount</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs hidden lg:table-cell">Stage</TableHead>
                          <TableHead className="text-xs hidden lg:table-cell">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedApplications.map((app) => (
                          <TableRow 
                            key={app.id} 
                            className="cursor-pointer hover-elevate"
                            onClick={() => navigate(`/admin/application/${app.id}`)}
                            data-testid={`row-app-${app.id}`}
                          >
                            <TableCell className="py-3">
                              <div>
                                <p className="font-medium text-sm">{app.borrowerName}</p>
                                <p className="text-[10px] text-muted-foreground hidden sm:block">{app.borrowerEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 hidden sm:table-cell">
                              <Badge variant="outline" className="text-[10px]">{app.loanType}</Badge>
                            </TableCell>
                            <TableCell className="py-3 hidden md:table-cell text-sm">
                              {app.loanAmount ? formatCurrency(app.loanAmount) : "—"}
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge className={`text-[10px] ${statusColors[app.status]}`}>
                                {statusLabels[app.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 hidden lg:table-cell">
                              <span className="text-xs text-muted-foreground">{app.processingStage ? stageLabels[app.processingStage] : "—"}</span>
                            </TableCell>
                            <TableCell className="py-3 hidden lg:table-cell">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{formatDate(app.createdAt)}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {applicationsTotalPages > 1 && (
                    <Pagination
                      currentPage={applicationsPage}
                      totalPages={applicationsTotalPages}
                      onPageChange={setApplicationsPage}
                      totalItems={filteredApplications.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Borrowers Section */}
        <section ref={borrowersRef} id="borrowers" className="scroll-mt-32">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg">Borrowers</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {stats.activeBorrowers} active, {stats.totalBorrowers} total
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-8 h-8 w-[150px] text-xs"
                      value={borrowerSearch}
                      onChange={(e) => { setBorrowerSearch(e.target.value); setBorrowersPage(1); }}
                      data-testid="input-borrower-search"
                    />
                  </div>
                  <Select value={borrowerRoleFilter} onValueChange={(v) => { setBorrowerRoleFilter(v); setBorrowersPage(1); }}>
                    <SelectTrigger className="w-[100px] h-8 text-xs" data-testid="select-borrower-filter">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="funded">Funded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {borrowersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredBorrowers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No borrowers found
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {paginatedBorrowers.map((user) => (
                      <div 
                        key={user.id} 
                        className="p-3 sm:p-4 flex items-center gap-3 hover-elevate cursor-pointer" 
                        onClick={() => navigate(`/admin/borrower/${user.id}`)}
                        data-testid={`row-borrower-${user.id}`}
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
                      </div>
                    ))}
                  </div>
                  {borrowersTotalPages > 1 && (
                    <Pagination
                      currentPage={borrowersPage}
                      totalPages={borrowersTotalPages}
                      onPageChange={setBorrowersPage}
                      totalItems={filteredBorrowers.length}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recently Funded Section */}
        <section ref={fundedRef} id="recently-funded" className="scroll-mt-32">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg">Recently Funded</CardTitle>
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
                      <Button size="sm" data-testid="button-add-deal">
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
                            <Select value={dealForm.loanType} onValueChange={(v) => setDealForm({ ...dealForm, loanType: v, loanSubtype: "", ltv: "", ltc: "" })}>
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
                        <div className="space-y-2">
                          <Label>Loan Subtype (from LendFlowPro)</Label>
                          <Select 
                            value={dealForm.loanSubtype} 
                            onValueChange={(v) => setDealForm({ ...dealForm, loanSubtype: v })}
                          >
                            <SelectTrigger data-testid="select-loan-subtype">
                              <SelectValue placeholder="Select subtype (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {loanSubtypeOptions[dealForm.loanType]?.map((subtype) => (
                                <SelectItem key={subtype} value={subtype}>{subtype}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Categorizes the loan for display (e.g., DSCR: Long-term Rental, Bridge: Bridge to Sale)
                          </p>
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
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedDeals.map((deal) => (
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
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <Badge className={`text-xs ${deal.loanType === "DSCR" ? "bg-blue-500" : deal.loanType === "Fix & Flip" ? "bg-amber-500" : "bg-green-500"}`}>
                              {deal.loanType}
                            </Badge>
                            {deal.loanSubtype && (
                              <Badge variant="secondary" className="text-[10px]">
                                {deal.loanSubtype}
                              </Badge>
                            )}
                          </div>
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-7 text-xs"
                              onClick={() => openEditDeal(deal)}
                              data-testid={`button-edit-deal-${deal.id}`}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {fundedTotalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={fundedPage}
                        totalPages={fundedTotalPages}
                        onPageChange={setFundedPage}
                        totalItems={fundedDeals?.length || 0}
                        itemsPerPage={ITEMS_PER_PAGE}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Location</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Amount</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">Rate</TableHead>
                          <TableHead className="text-xs hidden lg:table-cell">LTV/LTC</TableHead>
                          <TableHead className="text-xs hidden lg:table-cell">Close</TableHead>
                          <TableHead className="text-xs">Visible</TableHead>
                          <TableHead className="text-xs text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedDeals.map((deal) => (
                          <TableRow key={deal.id} data-testid={`row-deal-${deal.id}`}>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium">{deal.location}, {deal.state}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex flex-col gap-0.5">
                                <Badge variant="outline" className="text-[10px]">{deal.loanType}</Badge>
                                {deal.loanSubtype && (
                                  <span className="text-[10px] text-muted-foreground">{deal.loanSubtype}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-2 hidden sm:table-cell text-sm">
                              {formatCurrency(deal.loanAmount)}
                            </TableCell>
                            <TableCell className="py-2 hidden md:table-cell text-sm">
                              {deal.rate}
                            </TableCell>
                            <TableCell className="py-2 hidden lg:table-cell text-sm">
                              {deal.ltv ? `${deal.ltv}% LTV` : `${deal.ltc}% LTC`}
                            </TableCell>
                            <TableCell className="py-2 hidden lg:table-cell text-sm text-muted-foreground">
                              {deal.closeTime}
                            </TableCell>
                            <TableCell className="py-2">
                              {deal.isVisible ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
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
                  {fundedTotalPages > 1 && (
                    <Pagination
                      currentPage={fundedPage}
                      totalPages={fundedTotalPages}
                      onPageChange={setFundedPage}
                      totalItems={fundedDeals?.length || 0}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Staff Section (Admin Only) */}
        {currentUser.role === "admin" && (
          <section ref={staffRef} id="staff" className="scroll-mt-32 space-y-6">
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
                        <div key={user.id} className="p-3 flex items-center justify-between" data-testid={`row-user-${user.id}`}>
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
                    <>
                      <div className="divide-y">
                        {paginatedStaff.map((user) => (
                          <div key={user.id} className="p-4 flex items-center justify-between" data-testid={`row-staff-${user.id}`}>
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
                      {staffTotalPages > 1 && (
                        <Pagination
                          currentPage={staffPage}
                          totalPages={staffTotalPages}
                          onPageChange={setStaffPage}
                          totalItems={staffMembers.length}
                          itemsPerPage={ITEMS_PER_PAGE}
                        />
                      )}
                    </>
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
                        <div key={invite.id} className="p-4 flex items-center justify-between" data-testid={`row-invite-${invite.id}`}>
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
          </section>
        )}
      </main>

      {/* Webhook Dialog (Admin Only) */}
      {currentUser.role === "admin" && (
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Endpoints
              </DialogTitle>
              <DialogDescription>
                Configure webhooks for CRM/LOS integrations
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
                {webhooksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {webhookEndpoints && webhookEndpoints.length > 0 && (
                      <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto mb-4">
                        {webhookEndpoints.map((endpoint) => (
                          <div key={endpoint.id} className="p-3 flex items-center justify-between" data-testid={`row-webhook-${endpoint.id}`}>
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
                    <div className="space-y-4 border-t pt-4">
                      <p className="text-sm font-medium">Add New Endpoint</p>
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
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
