import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link, Switch, Route } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Send,
  Building2,
  DollarSign,
  Loader2,
  Copy,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  LogOut,
  Settings,
  Home,
  Briefcase,
  Calendar,
  ChevronRight,
  ChevronDown,
  User,
  UserPlus,
  KeyRound,
  LinkIcon,
  Palette,
  LayoutDashboard,
  Undo2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import type { User as UserType, LoanApplication } from "@shared/schema";
import { format } from "date-fns";

const brokerLoginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type BrokerLoginFormData = z.infer<typeof brokerLoginSchema>;

function BrokerLoginForm() {
  const { toast } = useToast();

  const form = useForm<BrokerLoginFormData>({
    resolver: zodResolver(brokerLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: BrokerLoginFormData) => {
      const response = await apiRequest("POST", "/api/broker/login", {
        username: data.email,
        password: data.password,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome to your Broker Portal",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/broker/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BrokerLoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter email (or 'broker' for test)"
                  data-testid="input-broker-email"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                Test account: broker / broker
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  data-testid="input-broker-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loginMutation.isPending}
          data-testid="button-broker-login"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
}

type BrokerProfile = {
  id: string;
  userId: string;
  companyName: string;
  companySlug: string;
  phone: string | null;
  licenseNumber: string | null;
  website: string | null;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  branding: {
    logoUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    accentColor: string | null;
    isPublished: boolean;
  } | null;
};

type EnrichedBorrower = {
  id: string;
  brokerId: string;
  borrowerId: string;
  status: string;
  isPrimaryBroker: boolean;
  referralSource: string | null;
  createdAt: string;
  borrower: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  applicationCount: number;
  activeApplications: number;
  fundedLoans: number;
};

type EnrichedDeal = LoanApplication & {
  borrowerName: string;
  borrowerEmail: string;
};

type BrokerInvite = {
  id: string;
  brokerId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
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

const ITEMS_PER_PAGE = 10;

function BrokerDashboard({ profile }: { profile: BrokerProfile }) {
  const { data: borrowers } = useQuery<EnrichedBorrower[]>({
    queryKey: ["/api/broker/borrowers"],
  });

  const { data: deals } = useQuery<EnrichedDeal[]>({
    queryKey: ["/api/broker/deals"],
  });

  const { data: invites } = useQuery<BrokerInvite[]>({
    queryKey: ["/api/broker/invites"],
  });

  const stats = {
    totalBorrowers: borrowers?.length || 0,
    totalDeals: deals?.length || 0,
    activeDeals: deals?.filter(d => d.status !== 'funded' && d.status !== 'denied' && d.status !== 'withdrawn').length || 0,
    fundedDeals: deals?.filter(d => d.status === 'funded').length || 0,
    pendingInvites: invites?.filter(i => i.status === 'pending').length || 0,
  };

  const recentDeals = (deals || []).slice(0, 5);
  const recentBorrowers = (borrowers || []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" data-testid="text-broker-welcome">
          Welcome, {profile.user.firstName || profile.companyName}
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your borrowers and deals from your white-label portal
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card data-testid="stat-total-borrowers">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBorrowers}</p>
                <p className="text-xs text-muted-foreground">Borrowers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-active-deals">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeDeals}</p>
                <p className="text-xs text-muted-foreground">Active Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-funded-deals">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.fundedDeals}</p>
                <p className="text-xs text-muted-foreground">Funded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-pending-invites">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Send className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingInvites}</p>
                <p className="text-xs text-muted-foreground">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Deals</CardTitle>
              <Link href="/broker/deals">
                <Button variant="ghost" size="sm" data-testid="link-view-all-deals">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentDeals.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No deals yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentDeals.map((deal) => (
                  <div key={deal.id} className="px-4 py-3 flex items-center justify-between" data-testid={`recent-deal-${deal.id}`}>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{deal.propertyAddress || "No address"}</p>
                      <p className="text-xs text-muted-foreground">{deal.borrowerName}</p>
                    </div>
                    <Badge variant="outline" className={statusColors[deal.status] || ""}>
                      {statusLabels[deal.status] || deal.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Borrowers</CardTitle>
              <Link href="/broker/borrowers">
                <Button variant="ghost" size="sm" data-testid="link-view-all-borrowers">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentBorrowers.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No borrowers yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentBorrowers.map((rel) => (
                  <div key={rel.id} className="px-4 py-3 flex items-center justify-between" data-testid={`recent-borrower-${rel.id}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {rel.borrower.firstName} {rel.borrower.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{rel.borrower.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{rel.applicationCount} deals</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Portal Branding</CardTitle>
          <CardDescription>
            Your white-label portal URL: <span className="font-medium">{profile.companySlug}.securedassetfunding.com</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
              {profile.branding?.logoUrl ? (
                <img src={profile.branding.logoUrl} alt="Logo" className="h-12 w-12 object-contain" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{profile.companyName}</p>
              <p className="text-sm text-muted-foreground">
                {profile.branding?.isPublished ? "Branding is live" : "Branding not published yet"}
              </p>
            </div>
            <Link href="/broker/settings">
              <Button variant="outline" size="sm" data-testid="link-branding-settings">
                <Palette className="h-4 w-4 mr-1.5" />
                Customize
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BrokerBorrowers() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: borrowers, isLoading } = useQuery<EnrichedBorrower[]>({
    queryKey: ["/api/broker/borrowers"],
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (borrowerId: string) => {
      const res = await apiRequest("POST", `/api/broker/borrowers/${borrowerId}/reset-password`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Password reset triggered",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to trigger password reset",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const filteredBorrowers = (borrowers || []).filter((rel) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      rel.borrower.email.toLowerCase().includes(searchLower) ||
      (rel.borrower.firstName?.toLowerCase() || "").includes(searchLower) ||
      (rel.borrower.lastName?.toLowerCase() || "").includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredBorrowers.length / ITEMS_PER_PAGE);
  const paginatedBorrowers = filteredBorrowers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Borrowers</h2>
          <p className="text-muted-foreground">
            Manage your linked borrowers and their accounts
          </p>
        </div>
        <Link href="/broker/invites">
          <Button data-testid="button-invite-borrower">
            <Plus className="h-4 w-4 mr-1.5" />
            Invite Borrower
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search borrowers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                data-testid="input-search-borrowers"
              />
            </div>
            <Badge variant="secondary">{filteredBorrowers.length} borrowers</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : paginatedBorrowers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? "No borrowers match your search" : "No borrowers linked yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead className="text-center">Applications</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-center">Funded</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBorrowers.map((rel) => (
                  <TableRow key={rel.id} data-testid={`row-borrower-${rel.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {rel.borrower.firstName} {rel.borrower.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{rel.borrower.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{rel.applicationCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                        {rel.activeApplications}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/30">
                        {rel.fundedLoans}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline"
                        className={rel.status === "active" 
                          ? "bg-green-500/10 text-green-600 border-green-500/30" 
                          : "bg-gray-500/10 text-gray-500 border-gray-500/30"
                        }
                      >
                        {rel.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" data-testid={`button-borrower-actions-${rel.id}`}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => resetPasswordMutation.mutate(rel.borrowerId)}
                            disabled={resetPasswordMutation.isPending}
                          >
                            <KeyRound className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BrokerDeals() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: deals, isLoading } = useQuery<EnrichedDeal[]>({
    queryKey: ["/api/broker/deals"],
  });

  const filteredDeals = (deals || []).filter((deal) => {
    if (statusFilter !== "all" && deal.status !== statusFilter) return false;
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      deal.borrowerName.toLowerCase().includes(searchLower) ||
      deal.borrowerEmail?.toLowerCase().includes(searchLower) ||
      deal.propertyAddress?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredDeals.length / ITEMS_PER_PAGE);
  const paginatedDeals = filteredDeals.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Deals</h2>
        <p className="text-muted-foreground">
          Track and manage your borrowers' loan applications
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Input
                placeholder="Search deals..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                data-testid="input-search-deals"
              />
            </div>
            <div className="flex items-center gap-2">
              {["all", "submitted", "in_review", "approved", "funded"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  data-testid={`filter-status-${status}`}
                >
                  {status === "all" ? "All" : statusLabels[status] || status}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : paginatedDeals.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== "all" 
                  ? "No deals match your filters" 
                  : "No deals yet"
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Loan Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDeals.map((deal) => (
                  <TableRow key={deal.id} data-testid={`row-deal-${deal.id}`}>
                    <TableCell>
                      <p className="font-medium text-sm">{deal.propertyAddress || "No address"}</p>
                      <p className="text-xs text-muted-foreground">{deal.propertyCity}, {deal.propertyState}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{deal.borrowerName}</p>
                      <p className="text-xs text-muted-foreground">{deal.borrowerEmail}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{deal.loanType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {deal.loanAmount ? `$${Number(deal.loanAmount).toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={statusColors[deal.status] || ""}>
                        {statusLabels[deal.status] || deal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {deal.createdAt ? format(new Date(deal.createdAt), "MMM d, yyyy") : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BrokerInvites() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);

  const { data: invites, isLoading } = useQuery<BrokerInvite[]>({
    queryKey: ["/api/broker/invites"],
  });

  const createInviteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/broker/invites", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/invites"] });
      setNewInviteLink(window.location.origin + data.invite.inviteLink);
      resetForm();
      toast({
        title: "Invite created",
        description: "Share the link with your borrower",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create invite",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const revokeInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/broker/invites/${id}/revoke`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/invites"] });
      toast({
        title: "Invite revoked",
        description: "The invite link is no longer valid",
      });
    },
  });

  const resetForm = () => {
    setInviteForm({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
    });
  };

  const handleSubmit = () => {
    createInviteMutation.mutate({
      email: inviteForm.email,
      firstName: inviteForm.firstName || null,
      lastName: inviteForm.lastName || null,
      phone: inviteForm.phone || null,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Invite link has been copied",
    });
  };

  const pendingInvites = (invites || []).filter(i => i.status === "pending");
  const otherInvites = (invites || []).filter(i => i.status !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Invites</h2>
          <p className="text-muted-foreground">
            Invite new borrowers to your white-label portal
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setNewInviteLink(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-invite">
              <Plus className="h-4 w-4 mr-1.5" />
              New Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Borrower</DialogTitle>
              <DialogDescription>
                Send an invitation link to a new borrower
              </DialogDescription>
            </DialogHeader>
            {newInviteLink ? (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-600">Invite Created!</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Share this link with your borrower to complete their signup:
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newInviteLink}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(newInviteLink)}
                      data-testid="button-copy-invite-link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowDialog(false);
                    setNewInviteLink(null);
                  }}
                  data-testid="button-done-invite"
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email *</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="borrower@example.com"
                      data-testid="input-invite-email"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="invite-firstName">First Name</Label>
                      <Input
                        id="invite-firstName"
                        value={inviteForm.firstName}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                        data-testid="input-invite-firstname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-lastName">Last Name</Label>
                      <Input
                        id="invite-lastName"
                        value={inviteForm.lastName}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Smith"
                        data-testid="input-invite-lastname"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-phone">Phone</Label>
                    <Input
                      id="invite-phone"
                      value={inviteForm.phone}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      data-testid="input-invite-phone"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    data-testid="button-cancel-invite"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!inviteForm.email || createInviteMutation.isPending}
                    data-testid="button-send-invite"
                  >
                    {createInviteMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Send Invite
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.id} data-testid={`row-invite-${invite.id}`}>
                    <TableCell>
                      <p className="font-medium text-sm">{invite.email}</p>
                    </TableCell>
                    <TableCell>
                      {invite.firstName || invite.lastName
                        ? `${invite.firstName || ""} ${invite.lastName || ""}`.trim()
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invite.expiresAt), "MMM d, yyyy")}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(window.location.origin + `/broker-invite/${invite.token}`)}
                          data-testid={`button-copy-invite-${invite.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => {
                            if (confirm("Are you sure you want to revoke this invite?")) {
                              revokeInviteMutation.mutate(invite.id);
                            }
                          }}
                          data-testid={`button-revoke-invite-${invite.id}`}
                        >
                          <Undo2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {otherInvites.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invite History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherInvites.map((invite) => (
                  <TableRow key={invite.id} data-testid={`row-invite-history-${invite.id}`}>
                    <TableCell>
                      <p className="font-medium text-sm">{invite.email}</p>
                    </TableCell>
                    <TableCell>
                      {invite.firstName || invite.lastName
                        ? `${invite.firstName || ""} ${invite.lastName || ""}`.trim()
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          invite.status === "accepted"
                            ? "bg-green-500/10 text-green-600 border-green-500/30"
                            : invite.status === "expired"
                            ? "bg-gray-500/10 text-gray-500 border-gray-500/30"
                            : "bg-red-500/10 text-red-600 border-red-500/30"
                        }
                      >
                        {invite.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invite.createdAt), "MMM d, yyyy")}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!isLoading && invites?.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Send className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No invites sent yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create an invite to onboard new borrowers
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

type BrokerBrandingData = {
  id: string;
  brokerProfileId: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string | null;
  foregroundColor: string | null;
  mutedColor: string | null;
  fontFamily: string | null;
  customDomain: string | null;
  customDomainVerified: boolean;
  footerText: string | null;
  privacyPolicyUrl: string | null;
  termsOfServiceUrl: string | null;
  isPublished: boolean;
};

const brandingFormSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
  footerText: z.string().optional(),
  privacyPolicyUrl: z.string().url().optional().or(z.literal("")),
  termsOfServiceUrl: z.string().url().optional().or(z.literal("")),
});

type BrandingFormData = z.infer<typeof brandingFormSchema>;

function BrokerSettings({ profile }: { profile: BrokerProfile }) {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { data: branding, isLoading } = useQuery<BrokerBrandingData>({
    queryKey: ["/api/broker/branding"],
  });

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      primaryColor: branding?.primaryColor || "",
      secondaryColor: branding?.secondaryColor || "",
      accentColor: branding?.accentColor || "",
      fontFamily: branding?.fontFamily || "Inter",
      footerText: branding?.footerText || "",
      privacyPolicyUrl: branding?.privacyPolicyUrl || "",
      termsOfServiceUrl: branding?.termsOfServiceUrl || "",
    },
  });

  useEffect(() => {
    if (branding) {
      form.reset({
        primaryColor: branding.primaryColor || "",
        secondaryColor: branding.secondaryColor || "",
        accentColor: branding.accentColor || "",
        fontFamily: branding.fontFamily || "Inter",
        footerText: branding.footerText || "",
        privacyPolicyUrl: branding.privacyPolicyUrl || "",
        termsOfServiceUrl: branding.termsOfServiceUrl || "",
      });
      if (branding.logoUrl && !logoPreview) {
        setLogoPreview(branding.logoUrl);
      }
    }
  }, [branding]);

  const updateBrandingMutation = useMutation({
    mutationFn: async (data: Partial<BrandingFormData & { logoUrl?: string; isPublished?: boolean }>) => {
      const res = await apiRequest("PATCH", "/api/broker/branding", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broker/branding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/broker/profile"] });
      toast({
        title: "Branding updated",
        description: "Your portal branding has been saved",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update branding",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo must be under 2MB",
          variant: "destructive",
        });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: BrandingFormData) => {
    updateBrandingMutation.mutate(data);
  };

  const handlePublishToggle = () => {
    updateBrandingMutation.mutate({ isPublished: !branding?.isPublished });
  };

  const previewColors = {
    primary: form.watch("primaryColor") || branding?.primaryColor || "222 47% 31%",
    secondary: form.watch("secondaryColor") || branding?.secondaryColor || "171 77% 36%",
    accent: form.watch("accentColor") || branding?.accentColor || "171 77% 36%",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings & Branding</h2>
        <p className="text-muted-foreground">
          Customize your white-label portal appearance for your borrowers
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Portal Information</CardTitle>
              <CardDescription>
                Your white-label portal URL: <span className="font-medium text-foreground">{profile.companySlug}.securedassetfunding.com</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Company Name</Label>
                  <p className="text-sm mt-1">{profile.companyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact Phone</Label>
                  <p className="text-sm mt-1">{profile.phone || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">License Number</Label>
                  <p className="text-sm mt-1">{profile.licenseNumber || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Website</Label>
                  <p className="text-sm mt-1">{profile.website || "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Logo</CardTitle>
              <CardDescription>
                Upload your company logo to display on your white-label portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div 
                  className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/20 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                  data-testid="logo-upload-area"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoChange}
                  data-testid="input-logo-file"
                />
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    data-testid="button-upload-logo"
                  >
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG or SVG. Max 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Color Scheme</CardTitle>
                  <CardDescription>
                    Customize your portal colors (HSL format: H S% L%)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <div
                                className="h-9 w-9 rounded border shrink-0"
                                style={{ backgroundColor: `hsl(${field.value || previewColors.primary})` }}
                              />
                              <Input
                                placeholder="222 47% 31%"
                                data-testid="input-primary-color"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <div
                                className="h-9 w-9 rounded border shrink-0"
                                style={{ backgroundColor: `hsl(${field.value || previewColors.secondary})` }}
                              />
                              <Input
                                placeholder="171 77% 36%"
                                data-testid="input-secondary-color"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accent Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <div
                                className="h-9 w-9 rounded border shrink-0"
                                style={{ backgroundColor: `hsl(${field.value || previewColors.accent})` }}
                              />
                              <Input
                                placeholder="171 77% 36%"
                                data-testid="input-accent-color"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Typography</CardTitle>
                  <CardDescription>
                    Select the font family for your portal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="fontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Family</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            data-testid="select-font-family"
                            {...field}
                          >
                            <option value="Inter">Inter (Default)</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Poppins">Poppins</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Footer & Legal</CardTitle>
                  <CardDescription>
                    Add custom footer text and legal links
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="footerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="© 2024 Your Company. All rights reserved."
                            data-testid="input-footer-text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="privacyPolicyUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Privacy Policy URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://yoursite.com/privacy"
                              data-testid="input-privacy-url"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="termsOfServiceUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terms of Service URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://yoursite.com/terms"
                              data-testid="input-terms-url"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button
                  type="submit"
                  disabled={updateBrandingMutation.isPending}
                  data-testid="button-save-branding"
                >
                  {updateBrandingMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Live Preview</CardTitle>
              <CardDescription>
                See how your branding looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="p-3 flex items-center gap-2"
                  style={{ backgroundColor: `hsl(${previewColors.primary})` }}
                >
                  <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-6 w-6 object-contain" />
                    ) : (
                      <Building2 className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="text-white text-sm font-medium">{profile.companyName}</span>
                </div>
                <div className="p-4 bg-background space-y-3">
                  <div className="h-3 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <Button
                    size="sm"
                    className="mt-2"
                    style={{ 
                      backgroundColor: `hsl(${previewColors.secondary})`,
                      borderColor: `hsl(${previewColors.secondary})`,
                    }}
                  >
                    Sample Button
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardContent className="pt-0 space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Publish Branding</p>
                  <p className="text-xs text-muted-foreground">
                    {branding?.isPublished 
                      ? "Your branding is live" 
                      : "Make your branding visible to borrowers"
                    }
                  </p>
                </div>
                <Button
                  variant={branding?.isPublished ? "outline" : "default"}
                  size="sm"
                  onClick={handlePublishToggle}
                  disabled={updateBrandingMutation.isPending}
                  data-testid="button-toggle-publish"
                >
                  {branding?.isPublished ? "Unpublish" : "Publish"}
                </Button>
              </div>
              {branding?.isPublished && (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Branding is published and visible</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BrokerPortal() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const { data: currentUser, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const { data: profile, isLoading: profileLoading } = useQuery<BrokerProfile>({
    queryKey: ["/api/broker/profile"],
    enabled: currentUser?.role === "broker" || currentUser?.role === "admin",
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/broker/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate("/broker");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
  });

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== "broker" && currentUser.role !== "admin") || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Broker Portal</CardTitle>
            <CardDescription>
              Sign in to access your broker dashboard, manage borrowers, and track deals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BrokerLoginForm />
            <Separator />
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Don't have an account?</p>
              <Link href="/broker/register">
                <Button variant="outline" className="w-full" data-testid="button-get-access">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Get Access
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-go-home">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navItems = [
    { href: "/broker", label: "Dashboard", icon: LayoutDashboard },
    { href: "/broker/borrowers", label: "Borrowers", icon: Users },
    { href: "/broker/deals", label: "Deals", icon: FileText },
    { href: "/broker/invites", label: "Invites", icon: Send },
    { href: "/broker/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/broker") return location === "/broker";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              {profile.branding?.logoUrl ? (
                <img src={profile.branding.logoUrl} alt="Logo" className="h-7 w-7 object-contain" />
              ) : (
                <Building2 className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h1 className="font-bold" data-testid="text-broker-company-name">{profile.companyName}</h1>
              <p className="text-xs text-muted-foreground">Broker Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {currentUser.firstName} {currentUser.lastName}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-broker-menu">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Main Site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <nav className="border-b bg-card/95 sticky top-[57px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 py-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="h-3.5 w-3.5 mr-1.5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Switch>
          <Route path="/broker" component={() => <BrokerDashboard profile={profile} />} />
          <Route path="/broker/borrowers" component={BrokerBorrowers} />
          <Route path="/broker/deals" component={BrokerDeals} />
          <Route path="/broker/invites" component={BrokerInvites} />
          <Route path="/broker/settings" component={() => <BrokerSettings profile={profile} />} />
        </Switch>
      </main>
    </div>
  );
}
