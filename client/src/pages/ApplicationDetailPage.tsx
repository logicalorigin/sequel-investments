import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import type { LoanApplication, Document, DocumentType } from "@shared/schema";

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
  pending: { label: "Outstanding", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  uploaded: { label: "Uploaded", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  approved: { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  if_applicable: { label: "If Applicable", color: "bg-muted text-muted-foreground" },
};

export default function ApplicationDetailPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const applicationId = params.id;

  useEffect(() => {
    document.title = "Loan Application | Secured Asset Funding";
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
              <span className="font-bold text-lg">Secured Asset Funding</span>
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
            <a href="/api/logout">
              <Button variant="ghost" size="sm" data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </a>
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
          <Link href={`/portal/application/${applicationId}/documents`}>
            <Button data-testid="button-view-documents">
              <FileText className="h-4 w-4 mr-2" />
              View Documents
            </Button>
          </Link>
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
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Loan Info
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created {formatDate(application.createdAt)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Guarantor</p>
                      <p className="font-medium">{application.guarantor || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Renovation/Construction Budget</p>
                      <p className="font-medium">{formatCurrency(application.rehabBudget)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Purchase Price</p>
                      <p className="font-medium">{formatCurrency(application.purchasePrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Requested Closing Date</p>
                      <p className="font-medium">{formatDate(application.requestedClosingDate)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Entity</p>
                      <p className="font-medium">{application.entity || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Product</p>
                      <p className="font-medium">{application.loanType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Interest Type</p>
                      <p className="font-medium">{application.interestType || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Closing Date</p>
                      <p className="font-medium">{formatDate(application.closingDate)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Property Address</p>
                      <p className="font-medium">
                        {application.propertyAddress || "N/A"}
                        {application.propertyCity && `, ${application.propertyCity}`}
                        {application.propertyState && `, ${application.propertyState}`}
                        {application.propertyZip && ` ${application.propertyZip}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Interest Rate</p>
                      <p className="font-medium">{application.interestRate ? `${application.interestRate}%` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan to Cost Ratio (LTC)</p>
                      <p className="font-medium">{application.ltc ? `${application.ltc}%` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Interest Reserves</p>
                      <p className="font-medium">N/A</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Amount</p>
                    <p className="font-medium text-lg">{formatCurrency(application.loanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Loan Term</p>
                    <p className="font-medium text-lg">{application.loanTermMonths ? `${application.loanTermMonths} Months` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Rehab Funding</p>
                    <p className="font-medium text-lg">{formatCurrency(application.requestedRehabFunding)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Document Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="needs" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="needs" className="relative" data-testid="tab-needs">
                      Needs
                      {outstandingDocs > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {outstandingDocs}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="documents" data-testid="tab-documents">
                      Documents
                      {completedDocs > 0 && (
                        <span className="ml-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {completedDocs}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="needs" className="space-y-2">
                    {docsLoading ? (
                      <div className="animate-pulse space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-12 bg-muted rounded" />
                        ))}
                      </div>
                    ) : documents && documents.filter(d => d.status === "pending" || d.status === "rejected").length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Document Name</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Description</th>
                              <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {documents.filter(d => d.status === "pending" || d.status === "rejected").map((doc) => {
                              const status = docStatusConfig[doc.status] || docStatusConfig.pending;
                              return (
                                <tr key={doc.id} className="border-t">
                                  <td className="px-4 py-3 text-sm font-medium">{doc.documentType?.name || "Document"}</td>
                                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{doc.documentType?.description}</td>
                                  <td className="px-4 py-3 text-center">
                                    <Badge className={status.color}>{status.label}</Badge>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p>All documents submitted!</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-2">
                    {docsLoading ? (
                      <div className="animate-pulse space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-12 bg-muted rounded" />
                        ))}
                      </div>
                    ) : documents && documents.filter(d => d.status === "approved" || d.status === "uploaded").length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Document Name</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Description</th>
                              <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {documents.filter(d => d.status === "approved" || d.status === "uploaded").map((doc) => {
                              const status = docStatusConfig[doc.status] || docStatusConfig.pending;
                              return (
                                <tr key={doc.id} className="border-t">
                                  <td className="px-4 py-3 text-sm font-medium">{doc.documentType?.name || "Document"}</td>
                                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{doc.documentType?.description}</td>
                                  <td className="px-4 py-3 text-center">
                                    <Badge className={status.color}>{status.label}</Badge>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2" />
                        <p>No completed documents yet</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="mt-4 flex justify-center">
                  <Link href={`/portal/application/${applicationId}/documents`}>
                    <Button variant="outline" data-testid="button-upload-documents">
                      Upload Documents
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
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
                      <span>{application.accountExecutivePhone || "XXX-XXX-XXXX"}</span>
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
                      <span>{application.processorPhone || "XXX-XXX-XXXX"}</span>
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
          </div>
        </div>
      </main>
    </div>
  );
}
