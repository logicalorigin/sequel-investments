import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft,
  Mail,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Loader2,
  MapPin,
} from "lucide-react";
import type { LoanApplication, User as UserType } from "@shared/schema";

type EnrichedBorrower = UserType & {
  applicationCount: number;
  activeApplications: number;
  fundedLoans: number;
  totalLoanVolume: number;
  applications: (LoanApplication & {
    borrowerName: string;
    borrowerEmail?: string;
  })[];
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

export default function BorrowerProfilePage() {
  const params = useParams<{ id: string }>();
  const borrowerId = params.id;

  useEffect(() => {
    document.title = "Borrower Profile | Admin Dashboard";
  }, []);

  const { data: borrower, isLoading, error } = useQuery<EnrichedBorrower>({
    queryKey: ["/api/admin/borrowers", borrowerId],
    enabled: !!borrowerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !borrower) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Borrower Not Found
            </CardTitle>
            <CardDescription>
              The borrower you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button variant="outline" className="w-full" data-testid="button-back-admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = `${borrower.firstName?.[0] || ""}${borrower.lastName?.[0] || ""}`.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" data-testid="button-back-admin">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold" data-testid="text-borrower-title">
                Borrower Profile
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">
                ID: {borrowerId?.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {borrower.firstName} {borrower.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Borrower</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{borrower.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Member since {borrower.createdAt ? formatDate(borrower.createdAt) : "N/A"}</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{borrower.applicationCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Apps</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{borrower.activeApplications || 0}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{borrower.fundedLoans || 0}</p>
                    <p className="text-xs text-muted-foreground">Funded</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-primary">
                      {borrower.totalLoanVolume ? formatCurrency(borrower.totalLoanVolume) : "$0"}
                    </p>
                    <p className="text-xs text-muted-foreground">Volume</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>Pending Review</span>
                  </div>
                  <Badge variant="outline">
                    {borrower.applications?.filter(a => a.status === "submitted" || a.status === "in_review").length || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Approved</span>
                  </div>
                  <Badge variant="outline">
                    {borrower.applications?.filter(a => a.status === "approved").length || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Drafts</span>
                  </div>
                  <Badge variant="outline">
                    {borrower.applications?.filter(a => a.status === "draft").length || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Loan Applications
                    </CardTitle>
                    <CardDescription>
                      {borrower.applications?.length || 0} application{borrower.applications?.length !== 1 ? "s" : ""} total
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!borrower.applications || borrower.applications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No applications yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="divide-y">
                      {borrower.applications.map((app) => (
                        <Link key={app.id} href={`/admin/application/${app.id}`}>
                          <div
                            className="p-4 hover-elevate cursor-pointer"
                            data-testid={`app-row-${app.id}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-xs text-muted-foreground">
                                    {app.id.slice(0, 8).toUpperCase()}
                                  </span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {app.loanType}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  {app.propertyAddress || app.propertyCity ? (
                                    <div className="flex items-center gap-1 text-muted-foreground truncate">
                                      <MapPin className="h-3 w-3 shrink-0" />
                                      <span className="truncate">
                                        {app.propertyAddress ? `${app.propertyAddress}, ` : ""}
                                        {app.propertyCity}, {app.propertyState}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">No address specified</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <p className="font-medium">
                                  {app.loanAmount ? formatCurrency(app.loanAmount) : 
                                   app.purchasePrice ? formatCurrency(app.purchasePrice) : "-"}
                                </p>
                                <Badge className={`${statusColors[app.status]} text-[10px]`}>
                                  {statusLabels[app.status]}
                                </Badge>
                                {app.processingStage && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {stageLabels[app.processingStage]}
                                  </span>
                                )}
                              </div>
                            </div>
                            {app.createdAt && (
                              <p className="text-[10px] text-muted-foreground mt-2">
                                Created {formatDate(app.createdAt)}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
