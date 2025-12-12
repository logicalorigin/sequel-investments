import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Briefcase,
  Eye,
  Upload,
  MessageSquare,
  CalendarIcon,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DocumentReviewPanel } from "@/components/DocumentReviewPanel";
import { SignatureRequestsSection } from "@/components/SignatureRequestsSection";
import { PhotoVerificationReview } from "@/components/PhotoVerificationReview";
import type { LoanApplication, Document, ApplicationTimelineEvent, User as UserType, ApplicationMessage } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Send, Paperclip } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type BrokerInfo = {
  id: string;
  companyName: string;
  nmlsNumber?: string | null;
  companyPhone?: string | null;
  companyEmail?: string | null;
  brokerName?: string | null;
  brokerEmail?: string | null;
};

type EnrichedApplication = LoanApplication & {
  borrowerName: string;
  borrowerEmail?: string;
  documents: Document[];
  timeline: ApplicationTimelineEvent[];
  brokerInfo?: BrokerInfo | null;
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  submitted: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  in_review: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  revisions_requested: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  approved: "bg-green-500/10 text-green-600 border-green-500/30",
  funded: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  denied: "bg-red-500/10 text-red-600 border-red-500/30",
  withdrawn: "bg-gray-500/10 text-gray-500 border-gray-500/30",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  revisions_requested: "Revisions Requested",
  approved: "Approved",
  funded: "Funded",
  denied: "Denied",
  withdrawn: "Withdrawn",
};

const processingStages = [
  { key: "app_submitted", label: "App Submitted" },
  { key: "account_review", label: "Account Review" },
  { key: "underwriting", label: "Underwriting" },
  { key: "term_sheet", label: "Term Sheet" },
  { key: "processing", label: "Processing" },
  { key: "docs_out", label: "Docs Out" },
  { key: "closed", label: "Closed" },
];

const documentStatusColors: Record<string, string> = {
  pending: "bg-yellow-500 text-white",
  uploaded: "bg-blue-500 text-white",
  approved: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
  request_changes: "bg-orange-500 text-white",
  if_applicable: "bg-gray-400 text-white",
};

const documentStatusLabels: Record<string, string> = {
  pending: "Outstanding",
  uploaded: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  request_changes: "Revision Required",
  if_applicable: "If Applicable",
};

const revisionSections = [
  { key: "property_info", label: "Property Info" },
  { key: "financials", label: "Financials" },
  { key: "documents", label: "Documents" },
  { key: "borrower_info", label: "Borrower Info" },
  { key: "entity_info", label: "Entity Info" },
  { key: "loan_terms", label: "Loan Terms" },
  { key: "other", label: "Other" },
] as const;

type RevisionSection = typeof revisionSections[number]["key"];

const revisionFormSchema = z.object({
  sections: z.array(z.object({
    section: z.string(),
    notes: z.string().min(1, "Notes are required for selected sections"),
  })).min(1, "Please select at least one section"),
});

type RevisionFormData = z.infer<typeof revisionFormSchema>;

export default function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Set<RevisionSection>>(new Set());
  const [sectionNotes, setSectionNotes] = useState<Record<RevisionSection, string>>({
    property_info: "",
    financials: "",
    documents: "",
    borrower_info: "",
    entity_info: "",
    loan_terms: "",
    other: "",
  });

  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const { data: application, isLoading } = useQuery<EnrichedApplication>({
    queryKey: ["/api/admin/applications", id],
    enabled: !!id && (currentUser?.role === "staff" || currentUser?.role === "admin"),
  });
  
  const { data: verificationPhotos = [] } = useQuery<any[]>({
    queryKey: ["/api/applications", id, "verification-photos"],
    enabled: !!id && (currentUser?.role === "staff" || currentUser?.role === "admin"),
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<ApplicationMessage[]>({
    queryKey: ["/api/applications", id, "messages"],
    enabled: !!id && (currentUser?.role === "staff" || currentUser?.role === "admin"),
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/applications", id, "messages", "unread-count"],
    enabled: !!id && (currentUser?.role === "staff" || currentUser?.role === "admin"),
  });

  const [newMessage, setNewMessage] = useState("");
  const [messagesExpanded, setMessagesExpanded] = useState(true);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/applications/${id}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", id, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications", id, "messages", "unread-count"] });
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to send",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
    },
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

  const revisionRequestMutation = useMutation({
    mutationFn: async (data: { sections: { section: string; notes: string }[] }) => {
      const res = await apiRequest("POST", `/api/admin/applications/${id}/revision-requests`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      setShowRevisionDialog(false);
      setSelectedSections(new Set());
      setSectionNotes({
        property_info: "",
        financials: "",
        documents: "",
        borrower_info: "",
        entity_info: "",
        loan_terms: "",
        other: "",
      });
      toast({
        title: "Revision requested",
        description: "The borrower has been notified about the required revisions.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleRevisionSubmit = () => {
    const sectionsToSubmit = Array.from(selectedSections)
      .filter(section => sectionNotes[section].trim())
      .map(section => ({
        section,
        notes: sectionNotes[section].trim(),
      }));
    
    if (sectionsToSubmit.length === 0) {
      toast({
        title: "Invalid request",
        description: "Please select at least one section and provide notes.",
        variant: "destructive",
      });
      return;
    }
    
    revisionRequestMutation.mutate({ sections: sectionsToSubmit });
  };

  const toggleSection = (section: RevisionSection) => {
    const newSections = new Set(selectedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setSelectedSections(newSections);
  };

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
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents ({application.documents?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {application.documents?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No documents uploaded</p>
                ) : (
                  <div className="divide-y">
                    {application.documents?.map((doc) => {
                      const displayStatus = doc.status;
                      return (
                        <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover-elevate" data-testid={`document-row-${doc.id}`}>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.fileName || "Untitled Document"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Awaiting upload"}
                            </p>
                          </div>
                          
                          <Badge 
                            className={`${documentStatusColors[displayStatus]} text-xs px-2.5 py-1 rounded-full shrink-0`}
                          >
                            {documentStatusLabels[displayStatus] || displayStatus}
                          </Badge>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            {doc.fileUrl ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => window.open(doc.fileUrl!, '_blank')}
                                title="Download"
                                data-testid={`button-download-doc-${doc.id}`}
                              >
                                <Upload className="h-4 w-4 rotate-180" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground"
                                disabled
                                title="No file uploaded"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => setSelectedDocument(doc)}
                              title="View & Review"
                              data-testid={`button-review-doc-${doc.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => setSelectedDocument(doc)}
                              title="Comments"
                              data-testid={`button-comments-doc-${doc.id}`}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Signature Requests */}
            <SignatureRequestsSection
              applicationId={id!}
              documents={application.documents || []}
              borrowerName={application.borrowerName}
              borrowerEmail={application.borrowerEmail}
            />
            
            {/* Photo Verification (only for Fix & Flip and Construction loans) */}
            {(application.loanType?.toLowerCase().includes("fix") || 
              application.loanType?.toLowerCase().includes("flip") || 
              application.loanType?.toLowerCase().includes("construction")) && (
              <PhotoVerificationReview
                photos={verificationPhotos}
                applicationId={id!}
                propertyAddress={[application.propertyAddress, application.propertyCity, application.propertyState].filter(Boolean).join(", ")}
              />
            )}

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
            {/* Compact Application Status */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <Select
                    value={application.status}
                    onValueChange={(status) => updateMutation.mutate({ status: status as any })}
                  >
                    <SelectTrigger className="w-40" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="revisions_requested">Revisions Requested</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="funded">Funded</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

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
                {application.entity && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Entity</p>
                    <p className="font-medium">{application.entity}</p>
                  </div>
                )}

                {/* Broker Info Section */}
                {application.brokerInfo && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-3">
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" />
                        Originating Broker
                      </p>
                      <div className="space-y-2 pl-5">
                        <div className="space-y-0.5">
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="font-medium">{application.brokerInfo.companyName}</p>
                        </div>
                        {application.brokerInfo.brokerName && (
                          <div className="space-y-0.5">
                            <p className="text-sm text-muted-foreground">Contact</p>
                            <p className="font-medium">{application.brokerInfo.brokerName}</p>
                          </div>
                        )}
                        {application.brokerInfo.companyEmail && (
                          <div className="space-y-0.5">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              Email
                            </p>
                            <p className="font-medium">{application.brokerInfo.companyEmail}</p>
                          </div>
                        )}
                        {application.brokerInfo.companyPhone && (
                          <div className="space-y-0.5">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              Phone
                            </p>
                            <p className="font-medium">{application.brokerInfo.companyPhone}</p>
                          </div>
                        )}
                        {application.brokerInfo.nmlsNumber && (
                          <div className="space-y-0.5">
                            <p className="text-sm text-muted-foreground">NMLS #</p>
                            <p className="font-medium">{application.brokerInfo.nmlsNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Messages - Prominent placement for team communication */}
            <Card data-testid="messages-section" className="border-l-4 border-l-primary">
              <Collapsible open={messagesExpanded} onOpenChange={setMessagesExpanded}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                  <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Messages
                    </CardTitle>
                    {unreadCount > 0 && (
                      <Badge 
                        className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center"
                        data-testid="badge-unread-messages"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${messagesExpanded ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {messagesLoading ? (
                      <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex gap-3">
                            <div className="h-8 w-8 bg-muted rounded-full" />
                            <div className="flex-1 space-y-1">
                              <div className="h-3 bg-muted rounded w-1/2" />
                              <div className="h-4 bg-muted rounded w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <ScrollArea className="h-[300px] pr-4 mb-4">
                          {messages.length > 0 ? (
                            <div className="space-y-4">
                              {[...messages].sort((a, b) => 
                                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                              ).map((message) => {
                                const isOwnMessage = message.senderUserId === currentUser?.id;
                                return (
                                  <div 
                                    key={message.id} 
                                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                    data-testid={`message-${message.id}`}
                                  >
                                    <div className={`max-w-[85%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                                      <div className="flex items-center gap-2 mb-1">
                                        {!isOwnMessage && (
                                          <span className="text-xs font-medium">{message.senderName}</span>
                                        )}
                                        <Badge 
                                          className={`text-[10px] px-1.5 py-0 ${
                                            message.senderRole === "admin" 
                                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" 
                                              : message.senderRole === "staff" 
                                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                              : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                          }`}
                                        >
                                          {message.senderRole === "admin" ? "Admin" : message.senderRole === "staff" ? "Staff" : "Borrower"}
                                        </Badge>
                                        {isOwnMessage && (
                                          <span className="text-xs font-medium">You</span>
                                        )}
                                      </div>
                                      <div className={`rounded-lg px-3 py-2 ${
                                        isOwnMessage 
                                          ? "bg-primary text-primary-foreground" 
                                          : "bg-muted"
                                      }`}>
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
                                          <div className="mt-2 pt-2 border-t border-current/20 space-y-1">
                                            {message.attachments.map((attachment, idx) => (
                                              <a 
                                                key={idx}
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs hover:underline"
                                              >
                                                <Paperclip className="h-3 w-3" />
                                                {attachment.name}
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                              <p className="text-sm text-muted-foreground">No messages yet</p>
                              <p className="text-xs text-muted-foreground mt-1">Start a conversation with the borrower</p>
                            </div>
                          )}
                        </ScrollArea>

                        <div className="space-y-2">
                          <Textarea
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="resize-none min-h-[80px]"
                            data-testid="input-message"
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={() => {
                                if (newMessage.trim()) {
                                  sendMessageMutation.mutate(newMessage.trim());
                                }
                              }}
                              disabled={!newMessage.trim() || sendMessageMutation.isPending}
                              data-testid="button-send-message"
                            >
                              {sendMessageMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4 mr-2" />
                              )}
                              Send
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
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
                {(application.status === "in_review" || application.status === "submitted") && (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowRevisionDialog(true)}
                    data-testid="button-request-revisions"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Request Revisions
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">
                    {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">
                    {application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : "-"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Requested Close</span>
                  <span className="text-sm font-medium">
                    {application.requestedClosingDate 
                      ? new Date(application.requestedClosingDate).toLocaleDateString() 
                      : <span className="text-muted-foreground/60">Not set</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Close of Escrow</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 justify-start text-left font-normal"
                        data-testid="button-edit-closing-date"
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {application.closingDate 
                          ? format(new Date(application.closingDate), "MMM d, yyyy")
                          : <span className="text-muted-foreground">Set date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={application.closingDate ? new Date(application.closingDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            updateMutation.mutate({ closingDate: date.toISOString() as any });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Request Revisions Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Revisions</DialogTitle>
            <DialogDescription>
              Select the sections that need revisions and provide notes for the borrower.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {revisionSections.map((section) => (
              <div key={section.key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`checkbox-${section.key}`}
                    checked={selectedSections.has(section.key)}
                    onCheckedChange={() => toggleSection(section.key)}
                    data-testid={`checkbox-section-${section.key}`}
                  />
                  <Label 
                    htmlFor={`checkbox-${section.key}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {section.label}
                  </Label>
                </div>
                {selectedSections.has(section.key) && (
                  <Textarea
                    placeholder={`Notes for ${section.label}...`}
                    value={sectionNotes[section.key]}
                    onChange={(e) => setSectionNotes(prev => ({
                      ...prev,
                      [section.key]: e.target.value
                    }))}
                    className="min-h-[80px]"
                    data-testid={`textarea-notes-${section.key}`}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRevisionDialog(false)}
              data-testid="button-cancel-revisions"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRevisionSubmit}
              disabled={revisionRequestMutation.isPending || selectedSections.size === 0}
              data-testid="button-submit-revisions"
            >
              {revisionRequestMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Submit Revision Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Review Panel */}
      <Sheet open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Document Review</SheetTitle>
          </SheetHeader>
          {selectedDocument && (
            <div className="mt-4 h-[calc(100vh-100px)]">
              <DocumentReviewPanel
                document={selectedDocument}
                isAdmin={true}
                onClose={() => setSelectedDocument(null)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
