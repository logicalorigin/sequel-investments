import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  UserPlus,
  Mail,
  Shield,
  ShieldCheck,
  User,
  Briefcase,
  Calendar,
  FileText,
  Loader2,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

interface EnrichedUser extends UserType {
  applicationCount: number;
  activeApplications: number;
  fundedLoans: number;
}

const roleConfig = {
  admin: { label: "Admin", icon: ShieldCheck, color: "bg-red-500/10 text-red-600 border-red-500/30" },
  staff: { label: "Staff", icon: Shield, color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  borrower: { label: "Borrower", icon: User, color: "bg-green-500/10 text-green-600 border-green-500/30" },
};

const staffRoleLabels: Record<string, string> = {
  account_executive: "Account Executive",
  processor: "Processor",
  underwriter: "Underwriter",
  closer: "Closer",
  servicer: "Servicer",
};

function formatDate(dateString: string | Date | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(firstName: string | null, lastName: string | null): string {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("staff");

  const { data: users, isLoading } = useQuery<EnrichedUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Role Updated", description: "User role has been changed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user role.", variant: "destructive" });
    },
  });

  const updateStaffRoleMutation = useMutation({
    mutationFn: async ({ userId, staffRole }: { userId: string; staffRole: string }) => {
      return apiRequest("PATCH", `/api/admin/users/${userId}/staff-role`, { staffRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Staff Role Updated", description: "Staff role has been changed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update staff role.", variant: "destructive" });
    },
  });

  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.firstName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.lastName?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "staff" && (user.role === "staff" || user.role === "admin")) ||
      (activeTab === "borrowers" && user.role === "borrower");
    
    return matchesSearch && matchesRole && matchesTab;
  }) || [];

  const stats = {
    total: users?.length || 0,
    admins: users?.filter(u => u.role === "admin").length || 0,
    staff: users?.filter(u => u.role === "staff").length || 0,
    borrowers: users?.filter(u => u.role === "borrower").length || 0,
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage staff and borrower accounts</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 mb-4" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">User Management</h1>
            <p className="text-muted-foreground">Manage staff and borrower accounts</p>
          </div>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-invite-user">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
              <DialogDescription>
                Send an invitation to add a new staff member to the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  data-testid="input-invite-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
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
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  toast({ title: "Invitation Sent", description: `Invitation sent to ${inviteEmail}` });
                  setInviteDialogOpen(false);
                  setInviteEmail("");
                }}
                data-testid="button-send-invite"
              >
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-users">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <ShieldCheck className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.staff}</p>
                <p className="text-sm text-muted-foreground">Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.borrowers}</p>
                <p className="text-sm text-muted-foreground">Borrowers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">All Users</CardTitle>
            <CardDescription>View and manage user accounts</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-users"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-role-filter">
                <SelectValue placeholder="Filter role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="borrower">Borrower</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="staff">Staff & Admins ({stats.admins + stats.staff})</TabsTrigger>
              <TabsTrigger value="borrowers">Borrowers ({stats.borrowers})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      {activeTab !== "borrowers" && <TableHead>Staff Role</TableHead>}
                      <TableHead>Applications</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const roleInfo = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.borrower;
                      const RoleIcon = roleInfo.icon;
                      
                      return (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="text-xs">
                                  {getInitials(user.firstName, user.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={roleInfo.color}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {roleInfo.label}
                            </Badge>
                          </TableCell>
                          {activeTab !== "borrowers" && (
                            <TableCell>
                              {(user.role === "staff" || user.role === "admin") && user.staffRole ? (
                                <span className="text-sm">{staffRoleLabels[user.staffRole] || user.staffRole}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{user.applicationCount || 0}</span>
                              {(user.activeApplications || 0) > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {user.activeApplications} active
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-actions-${user.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {user.role === "borrower" && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/borrower/${user.id}`}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Profile
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                {user.role !== "admin" && (
                                  <DropdownMenuItem
                                    onClick={() => updateRoleMutation.mutate({ 
                                      userId: user.id, 
                                      role: user.role === "borrower" ? "staff" : "borrower" 
                                    })}
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    {user.role === "borrower" ? "Promote to Staff" : "Demote to Borrower"}
                                  </DropdownMenuItem>
                                )}
                                {(user.role === "staff" || user.role === "admin") && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => updateStaffRoleMutation.mutate({ 
                                        userId: user.id, 
                                        staffRole: "account_executive" 
                                      })}
                                    >
                                      <Briefcase className="h-4 w-4 mr-2" />
                                      Set as Account Executive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateStaffRoleMutation.mutate({ 
                                        userId: user.id, 
                                        staffRole: "processor" 
                                      })}
                                    >
                                      <Briefcase className="h-4 w-4 mr-2" />
                                      Set as Processor
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => updateStaffRoleMutation.mutate({ 
                                        userId: user.id, 
                                        staffRole: "underwriter" 
                                      })}
                                    >
                                      <Briefcase className="h-4 w-4 mr-2" />
                                      Set as Underwriter
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
