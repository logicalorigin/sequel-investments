import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { LoanApplication, User, StaffInvite } from "@shared/schema";

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

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loanTypeFilter, setLoanTypeFilter] = useState<string>("all");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"staff" | "admin">("staff");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);

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
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard",
    });
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
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold" data-testid="text-admin-title">Company Backend</h1>
              <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">
                {currentUser.role === "admin" ? "Administrator" : "Staff"} Dashboard
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Card 
            className={`cursor-pointer transition-all hover-elevate ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setStatusFilter("all")}
            data-testid="stat-card-total"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover-elevate ${statusFilter === "submitted" ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setStatusFilter("submitted")}
            data-testid="stat-card-submitted"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
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
            className={`cursor-pointer transition-all hover-elevate ${statusFilter === "in_review" ? "ring-2 ring-yellow-500" : ""}`}
            onClick={() => setStatusFilter("in_review")}
            data-testid="stat-card-in-review"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
                <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.inReview}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover-elevate hidden md:block ${statusFilter === "approved" ? "ring-2 ring-green-500" : ""}`}
            onClick={() => setStatusFilter("approved")}
            data-testid="stat-card-approved"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
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
            className={`cursor-pointer transition-all hover-elevate hidden md:block ${statusFilter === "funded" ? "ring-2 ring-emerald-500" : ""}`}
            onClick={() => setStatusFilter("funded")}
            data-testid="stat-card-funded"
          >
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-3 text-center sm:text-left">
                <div className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold">{stats.funded}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Funded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pipeline" className="space-y-4 sm:space-y-6">
          <TabsList className="w-full sm:w-auto flex-wrap">
            <TabsTrigger value="pipeline" className="flex-1 sm:flex-none text-xs sm:text-sm" data-testid="tab-pipeline">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Pipeline
            </TabsTrigger>
            {currentUser.role === "admin" && (
              <>
                <TabsTrigger value="users" className="flex-1 sm:flex-none text-xs sm:text-sm" data-testid="tab-users">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="invites" className="flex-1 sm:flex-none text-xs sm:text-sm" data-testid="tab-invites">
                  <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Invites
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="pipeline" className="space-y-4">
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
          </TabsContent>

          {currentUser.role === "admin" && (
            <>
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Client Portal Accounts</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">View borrower accounts and their linked applications</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6 sm:pt-0">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap">Name</TableHead>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Email</TableHead>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap">Role</TableHead>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Portal Activity</TableHead>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">Joined</TableHead>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users?.map((user) => (
                              <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                                <TableCell>
                                  <div className="font-medium text-xs sm:text-sm">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  {user.username && (
                                    <div className="text-[10px] sm:text-xs text-muted-foreground">@{user.username}</div>
                                  )}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{user.email}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize text-[10px] sm:text-xs">
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex gap-1 sm:gap-2">
                                    <div className="text-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted rounded">
                                      <div className="text-xs sm:text-sm font-medium">{user.applicationCount || 0}</div>
                                      <div className="text-[10px] sm:text-xs text-muted-foreground">Total</div>
                                    </div>
                                    <div className="text-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-500/10 rounded">
                                      <div className="text-xs sm:text-sm font-medium text-blue-600">{user.activeApplications || 0}</div>
                                      <div className="text-[10px] sm:text-xs text-muted-foreground">Active</div>
                                    </div>
                                    <div className="text-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-500/10 rounded">
                                      <div className="text-xs sm:text-sm font-medium text-emerald-600">{user.fundedLoans || 0}</div>
                                      <div className="text-[10px] sm:text-xs text-muted-foreground">Funded</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={user.role}
                                    onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                                    disabled={user.id === currentUser.id}
                                  >
                                    <SelectTrigger className="w-[90px] sm:w-[120px] h-7 sm:h-9 text-xs sm:text-sm" data-testid={`select-role-${user.id}`}>
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invites" className="space-y-4">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base sm:text-lg">Staff Invitations</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Invite new team members</CardDescription>
                      </div>
                      <Dialog open={showInviteDialog} onOpenChange={(open) => {
                        setShowInviteDialog(open);
                        if (!open) setNewInviteLink(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button data-testid="button-new-invite">
                            <Plus className="h-4 w-4 mr-2" />
                            New Invite
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
                  <CardContent className="p-0 sm:p-6 sm:pt-0">
                    {invites?.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        No invitations sent yet
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap">Email</TableHead>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap">Role</TableHead>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap">Status</TableHead>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Expires</TableHead>
                              <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Created</TableHead>
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
                                <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                                  {new Date(invite.createdAt).toLocaleDateString()}
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
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}
