import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Building2,
  User,
  FileText,
  Clock,
  MapPin,
  DollarSign,
  Percent,
  Check,
  Loader2,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LoanApplication, Document, ApplicationTimelineEvent, User as UserType } from "@shared/schema";

type EnrichedApplication = LoanApplication & {
  borrowerName: string;
  borrowerEmail?: string;
  documents: Document[];
  timeline: ApplicationTimelineEvent[];
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

const processingStages = [
  { key: "account_review", label: "Account Review" },
  { key: "underwriting", label: "Underwriting" },
  { key: "term_sheet", label: "Term Sheet" },
  { key: "processing", label: "Processing" },
  { key: "docs_out", label: "Docs Out" },
  { key: "closed", label: "Closed" },
];

const documentStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  uploaded: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  approved: "bg-green-500/10 text-green-600 border-green-500/30",
  rejected: "bg-red-500/10 text-red-600 border-red-500/30",
  if_applicable: "bg-gray-500/10 text-gray-500 border-gray-500/30",
};

export default function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const { data: application, isLoading } = useQuery<EnrichedApplication>({
    queryKey: ["/api/admin/applications", id],
    enabled: !!id && (currentUser?.role === "staff" || currentUser?.role === "admin"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<LoanApplication>) => {
      const res = await apiRequest("PATCH", `/api/admin/applications/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({
        title: "Application updated",
        description: "Changes saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  if (!currentUser || (currentUser.role !== "staff" && currentUser.role !== "admin")) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Application Not Found</CardTitle>
            <CardDescription>
              The application you're looking for doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStageIndex = processingStages.findIndex(
    (s) => s.key === application.processingStage
  );

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-mono" data-testid="text-loan-id">
                  LOAN: {application.id.slice(0, 8).toUpperCase()}
                </h1>
                <Badge className={statusColors[application.status]}>
                  {statusLabels[application.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {application.loanType} • {application.borrowerName}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Processing Stage Stepper */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
                  {processingStages.map((stage, index) => {
                    const isCompleted = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    
                    return (
                      <button
                        key={stage.key}
                        onClick={() => updateMutation.mutate({ processingStage: stage.key as any })}
                        className="flex flex-col items-center relative z-10 flex-1"
                        data-testid={`button-stage-${stage.key}`}
                      >
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                          ${isCompleted ? "bg-green-500 border-green-500 text-white" : 
                            isCurrent ? "bg-primary border-primary text-white" : 
                            "bg-background border-muted-foreground/30 text-muted-foreground hover:border-primary/50"}
                        `}>
                          {isCompleted ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <span className={`text-xs mt-2 text-center ${isCurrent ? "font-semibold" : "text-muted-foreground"}`}>
                          {stage.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Status Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Status</CardTitle>
                <CardDescription>Update the loan application status</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={application.status}
                  onValueChange={(status) => updateMutation.mutate({ status: status as any })}
                >
                  <SelectTrigger className="w-full" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="funded">Funded</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Property & Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      Loan Type
                    </p>
                    <p className="font-medium">{application.loanType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Loan Amount
                    </p>
                    <p className="font-medium">{formatCurrency(application.loanAmount)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Purchase Price
                    </p>
                    <p className="font-medium">{formatCurrency(application.purchasePrice)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      Interest Rate
                    </p>
                    <p className="font-medium">{application.interestRate || "-"}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Property Address
                  </p>
                  <p className="font-medium">
                    {application.propertyAddress && `${application.propertyAddress}, `}
                    {application.propertyCity}, {application.propertyState} {application.propertyZip}
                  </p>
                </div>

                {(application.arv || application.rehabBudget) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      {application.arv && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">After Repair Value</p>
                          <p className="font-medium">{formatCurrency(application.arv)}</p>
                        </div>
                      )}
                      {application.rehabBudget && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Rehab Budget</p>
                          <p className="font-medium">{formatCurrency(application.rehabBudget)}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents ({application.documents?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.documents?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No documents uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {application.documents?.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{doc.fileName || "Untitled Document"}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Not uploaded"}
                          </p>
                        </div>
                        <Badge className={documentStatusColors[doc.status]}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.timeline?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No activity yet</p>
                ) : (
                  <div className="space-y-4">
                    {application.timeline?.map((event) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium">{event.title}</p>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Borrower Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Borrower Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{application.borrowerName}</p>
                </div>
                {application.borrowerEmail && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="font-medium">{application.borrowerEmail}</p>
                  </div>
                )}
                {application.guarantor && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Guarantor</p>
                    <p className="font-medium">{application.guarantor}</p>
                  </div>
                )}
                {application.entityName && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Entity</p>
                    <p className="font-medium">{application.entityName}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => updateMutation.mutate({ status: "in_review" })}
                  disabled={application.status === "in_review"}
                  data-testid="button-mark-review"
                >
                  Mark as In Review
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => updateMutation.mutate({ status: "approved" })}
                  disabled={application.status === "approved"}
                  data-testid="button-approve"
                >
                  Approve Application
                </Button>
                <Button 
                  className="w-full" 
                  onClick={() => updateMutation.mutate({ status: "funded" })}
                  disabled={application.status === "funded"}
                  data-testid="button-fund"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Mark as Funded
                </Button>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">
                    {application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : "-"}
                  </span>
                </div>
                {application.closingDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Closing</span>
                    <span className="font-medium">
                      {new Date(application.closingDate).toLocaleDateString()}
                    </span>
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
