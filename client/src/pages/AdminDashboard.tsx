import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Loader2,
  Users,
  TrendingUp,
  MessageSquare,
  Calendar,
  ChevronRight,
  BarChart3,
  Briefcase,
} from "lucide-react";
import type { LoanApplication, User as UserType, CalendarAppointment } from "@shared/schema";

type EnrichedApplication = LoanApplication & {
  borrowerName: string;
  borrowerEmail?: string;
};

type EnrichedUser = UserType & {
  applicationCount: number;
  activeApplications: number;
  fundedLoans: number;
};

type DashboardStats = {
  totalApplications: number;
  submittedCount: number;
  inReviewCount: number;
  approvedCount: number;
  fundedCount: number;
  draftCount: number;
  deniedCount: number;
  totalBorrowers: number;
  activeBorrowers: number;
  totalLoanVolume: number;
  avgLoanSize: number;
  conversionRate: number;
  pendingMessages: number;
};

type RecentActivity = {
  id: string;
  type: "application_submitted" | "status_change" | "message" | "document_upload" | "payment";
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
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

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatFullCurrency(value: number): string {
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

function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminDashboard() {
  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const { data: applications, isLoading: appsLoading } = useQuery<EnrichedApplication[]>({
    queryKey: ["/api/admin/applications"],
    enabled: currentUser?.role === "staff" || currentUser?.role === "admin",
  });

  const { data: borrowersList } = useQuery<EnrichedUser[]>({
    queryKey: ["/api/admin/borrowers"],
    enabled: currentUser?.role === "staff" || currentUser?.role === "admin",
  });

  const { data: appointments } = useQuery<CalendarAppointment[]>({
    queryKey: ["/api/admin/appointments"],
    enabled: currentUser?.role === "staff" || currentUser?.role === "admin",
  });

  const stats: DashboardStats = {
    totalApplications: applications?.length || 0,
    submittedCount: applications?.filter((a) => a.status === "submitted").length || 0,
    inReviewCount: applications?.filter((a) => a.status === "in_review").length || 0,
    approvedCount: applications?.filter((a) => a.status === "approved").length || 0,
    fundedCount: applications?.filter((a) => a.status === "funded").length || 0,
    draftCount: applications?.filter((a) => a.status === "draft").length || 0,
    deniedCount: applications?.filter((a) => a.status === "denied").length || 0,
    totalBorrowers: borrowersList?.length || 0,
    activeBorrowers: borrowersList?.filter((b) => b.activeApplications > 0).length || 0,
    totalLoanVolume: applications?.filter((a) => a.status === "funded").reduce((sum, a) => sum + (a.loanAmount || 0), 0) || 0,
    avgLoanSize: (() => {
      const funded = applications?.filter((a) => a.status === "funded") || [];
      if (funded.length === 0) return 0;
      return funded.reduce((sum, a) => sum + (a.loanAmount || 0), 0) / funded.length;
    })(),
    conversionRate: (() => {
      const total = applications?.length || 0;
      const funded = applications?.filter((a) => a.status === "funded").length || 0;
      if (total === 0) return 0;
      return (funded / total) * 100;
    })(),
    pendingMessages: 0,
  };

  const pipelineActive = stats.submittedCount + stats.inReviewCount + stats.approvedCount;
  const pipelineTotal = stats.totalApplications - stats.draftCount;

  const recentApplications = applications
    ?.filter((a) => a.status !== "draft")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) || [];

  const urgentApplications = applications?.filter(
    (a) => a.status === "submitted" || a.status === "in_review"
  ).slice(0, 3) || [];

  const upcomingAppointments = appointments
    ?.filter((a) => new Date(a.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3) || [];

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (appsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      {/* Hero Strip */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" data-testid="text-dashboard-title">
                Welcome back, {currentUser?.firstName || "Admin"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1" data-testid="text-dashboard-date">
                {formattedDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/portfolio">
                <Button variant="outline" size="sm" data-testid="button-view-pipeline">
                  <Briefcase className="h-4 w-4 mr-2" />
                  View Pipeline
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button size="sm" data-testid="button-view-analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Primary Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pipeline Funnel Card */}
          <Card className="col-span-2" data-testid="card-pipeline-funnel">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-medium">Loan Pipeline</CardTitle>
                <Link href="/admin/portfolio">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    View All
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-blue-500/10">
                  <p className="text-lg sm:text-2xl font-bold text-blue-600" data-testid="text-submitted-count">
                    {stats.submittedCount}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Submitted</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-500/10">
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600" data-testid="text-review-count">
                    {stats.inReviewCount}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">In Review</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-green-500/10">
                  <p className="text-lg sm:text-2xl font-bold text-green-600" data-testid="text-approved-count">
                    {stats.approvedCount}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Approved</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                  <p className="text-lg sm:text-2xl font-bold text-emerald-600" data-testid="text-funded-count">
                    {stats.fundedCount}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Funded</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Active Pipeline</span>
                  <span className="font-medium">{pipelineActive} of {pipelineTotal} applications</span>
                </div>
                <Progress value={pipelineTotal > 0 ? (pipelineActive / pipelineTotal) * 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <Card data-testid="card-loan-volume">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Total Loan Volume</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1" data-testid="text-loan-volume">
                    {formatCurrency(stats.totalLoanVolume)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.fundedCount} funded loans
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-conversion-rate">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1" data-testid="text-conversion-rate">
                    {stats.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg loan: {formatCurrency(stats.avgLoanSize)}
                  </p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover-elevate"
            data-testid="card-total-applications"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-applications">
                    {stats.totalApplications}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover-elevate"
            data-testid="card-active-borrowers"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-active-borrowers">
                    {stats.activeBorrowers}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Borrowers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover-elevate"
            data-testid="card-pending-review"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-pending-review">
                    {stats.inReviewCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover-elevate"
            data-testid="card-new-submissions"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-new-submissions">
                    {stats.submittedCount}
                  </p>
                  <p className="text-xs text-muted-foreground">New Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lower Grid - 3 Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <Card className="lg:col-span-2" data-testid="card-recent-applications">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-medium">Recent Applications</CardTitle>
                  <CardDescription className="text-xs">Latest loan applications</CardDescription>
                </div>
                <Link href="/admin/portfolio">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    View All
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No recent applications
                </div>
              ) : (
                <ScrollArea className="h-[280px]">
                  <div className="divide-y">
                    {recentApplications.map((app) => (
                      <Link key={app.id} href={`/admin/application/${app.id}`}>
                        <div
                          className="p-4 flex items-center gap-4 hover-elevate cursor-pointer"
                          data-testid={`row-recent-app-${app.id}`}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(app.borrowerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{app.borrowerName}</p>
                              <Badge className={`text-[10px] shrink-0 ${statusColors[app.status]}`}>
                                {statusLabels[app.status]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px]">{app.loanType}</Badge>
                              {app.loanAmount && (
                                <span className="text-xs text-muted-foreground">
                                  {formatFullCurrency(app.loanAmount)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">{formatRelativeTime(app.createdAt)}</p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Upcoming */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card data-testid="card-quick-actions">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Link href="/admin/portfolio">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-qa-pipeline">
                    <Briefcase className="h-5 w-5" />
                    <span className="text-xs">Pipeline</span>
                  </Button>
                </Link>
                <Link href="/admin/messages">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-qa-messages">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-xs">Messages</span>
                  </Button>
                </Link>
                <Link href="/admin/calendar">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-qa-calendar">
                    <Calendar className="h-5 w-5" />
                    <span className="text-xs">Calendar</span>
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1" data-testid="button-qa-analytics">
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs">Analytics</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card data-testid="card-needs-attention">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Needs Attention
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    {urgentApplications.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {urgentApplications.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    All caught up!
                  </div>
                ) : (
                  <div className="divide-y">
                    {urgentApplications.map((app) => (
                      <Link key={app.id} href={`/admin/application/${app.id}`}>
                        <div
                          className="p-3 flex items-center gap-3 hover-elevate cursor-pointer"
                          data-testid={`row-urgent-app-${app.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{app.borrowerName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Badge className={`text-[9px] ${statusColors[app.status]}`}>
                                {statusLabels[app.status]}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {formatRelativeTime(app.createdAt)}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card data-testid="card-upcoming-appointments">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming
                  </CardTitle>
                  <Link href="/admin/calendar">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    No upcoming appointments
                  </div>
                ) : (
                  <div className="divide-y">
                    {upcomingAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3 flex items-center gap-3"
                        data-testid={`row-appointment-${apt.id}`}
                      >
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{apt.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(apt.startTime).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Summary Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-perf-drafts">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-gray-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.draftCount}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-perf-approved">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.approvedCount}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-perf-denied">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.deniedCount}</p>
                <p className="text-xs text-muted-foreground">Denied</p>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-perf-borrowers">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.totalBorrowers}</p>
                <p className="text-xs text-muted-foreground">Total Borrowers</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
