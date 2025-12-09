import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ObjectUploader } from "@/components/ObjectUploader";
import { 
  ArrowLeft,
  Building2,
  LogOut,
  Paperclip,
  Upload,
  Check,
  Clock,
  AlertCircle,
  FileText,
  X,
  MessageSquare,
  PenTool,
  FileSignature,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { SignatureCanvas } from "@/components/SignatureCanvas";
import type { LoanApplication, Document, DocumentType, DocumentSignature } from "@shared/schema";

interface SignatureRequest {
  id: string;
  documentId: string;
  signerName: string;
  signerEmail: string;
  status: "pending" | "viewed" | "signed" | "declined" | "expired";
  requestedAt: string;
  expiresAt: string;
  token: string;
}

interface DocumentWithType extends Document {
  documentType?: DocumentType;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Check }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
  uploaded: { label: "Uploaded", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Upload },
  approved: { label: "Approved", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: Check },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: X },
  if_applicable: { label: "If Applicable", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

export default function ApplicationDocumentsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const applicationId = params.id;
  const [, navigate] = useLocation();
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithType | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [docToSign, setDocToSign] = useState<DocumentWithType | null>(null);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/borrower/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate("/login");
    },
  });

  useEffect(() => {
    document.title = "Document Checklist | Sequel Investments";
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

  const { data: signatures = [] } = useQuery<DocumentSignature[]>({
    queryKey: ["/api/applications", applicationId, "signatures"],
    enabled: isAuthenticated && !!applicationId,
  });

  const { data: signatureRequests = [] } = useQuery<SignatureRequest[]>({
    queryKey: ["/api/applications", applicationId, "signature-requests"],
    enabled: isAuthenticated && !!applicationId,
  });

  const signDocumentMutation = useMutation({
    mutationFn: async ({ documentId, signatureData }: { documentId: string; signatureData: string }) => {
      return apiRequest("POST", `/api/applications/${applicationId}/signatures`, {
        documentId,
        signatureData,
        signatureType: "drawn",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "signatures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "documents"] });
      setSignDialogOpen(false);
      setDocToSign(null);
      toast({
        title: "Document Signed",
        description: "Your signature has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Signing Failed",
        description: "Failed to record your signature. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ docId, data }: { docId: string; data: Partial<Document> }) => {
      const res = await apiRequest("PATCH", `/api/documents/${docId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "documents"] });
      toast({
        title: "Document updated",
        description: "Your changes have been saved.",
      });
      setCommentDialogOpen(false);
      setSelectedDoc(null);
      setComment("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateDocumentFileMutation = useMutation({
    mutationFn: async ({ docId, uploadURL, fileName, fileSize, mimeType }: { 
      docId: string; 
      uploadURL: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    }) => {
      const res = await apiRequest("PUT", `/api/documents/${docId}/file`, {
        uploadURL,
        fileName,
        fileSize,
        mimeType,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "documents"] });
      toast({
        title: "Document uploaded",
        description: "Your file has been successfully uploaded.",
      });
      setUploadingDocId(null);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
      setUploadingDocId(null);
    },
  });

  const getUploadParameters = (doc: DocumentWithType) => async (file: { name: string; size: number; type: string }) => {
    // Use application-specific upload URL for organized folder structure
    const res = await apiRequest("POST", `/api/documents/${doc.id}/upload-url`, {
      fileName: file.name,
    });
    const data = await res.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (doc: DocumentWithType) => (result: any) => {
    const uploadedFile = result.successful?.[0];
    if (uploadedFile) {
      updateDocumentFileMutation.mutate({
        docId: doc.id,
        uploadURL: uploadedFile.uploadURL,
        fileName: uploadedFile.name || "document",
        fileSize: uploadedFile.size || 0,
        mimeType: uploadedFile.type || "application/octet-stream",
      });
    }
  };

  const handleCommentSave = () => {
    if (selectedDoc) {
      updateDocumentMutation.mutate({
        docId: selectedDoc.id,
        data: { comment },
      });
    }
  };

  const openCommentDialog = (doc: DocumentWithType) => {
    setSelectedDoc(doc);
    setComment(doc.comment || "");
    setCommentDialogOpen(true);
  };

  const openSignDialog = (doc: DocumentWithType) => {
    setDocToSign(doc);
    setSignDialogOpen(true);
  };

  const handleSignatureComplete = (signatureDataUrl: string) => {
    if (docToSign) {
      signDocumentMutation.mutate({
        documentId: docToSign.id,
        signatureData: signatureDataUrl,
      });
    }
  };

  const isDocumentSigned = (docId: string) => {
    return signatures.some(sig => sig.documentId === docId);
  };

  const getDocumentSignature = (docId: string) => {
    return signatures.find(sig => sig.documentId === docId);
  };

  const getPendingSignatureRequest = (docId: string) => {
    return signatureRequests.find(
      req => req.documentId === docId && (req.status === "pending" || req.status === "viewed")
    );
  };

  const getSignatureRequestForDoc = (docId: string) => {
    return signatureRequests.find(req => req.documentId === docId);
  };

  if (authLoading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const groupedDocuments = documents?.reduce((acc, doc) => {
    const category = doc.documentType?.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, DocumentWithType[]>);

  const completedCount = documents?.filter(d => d.status === "uploaded" || d.status === "approved").length || 0;
  const totalRequired = documents?.filter(d => d.status !== "if_applicable").length || 0;

  return (
    <div className="min-h-screen bg-background">

      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Sequel Investments</span>
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
            <Button 
              variant="ghost" 
              size="sm" 
              data-testid="button-logout"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/portal">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-to-portal">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Button>
          </Link>
          
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
                {application?.loanType} Loan Application
              </h1>
              <p className="text-muted-foreground">
                {application?.propertyAddress || "Property address not set"} 
                {application?.propertyCity && `, ${application.propertyCity}`}
                {application?.propertyState && `, ${application.propertyState}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {completedCount}/{totalRequired}
              </div>
              <div className="text-sm text-muted-foreground">Documents Uploaded</div>
            </div>
          </div>
        </div>

        {docsLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        ) : groupedDocuments && Object.keys(groupedDocuments).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedDocuments).map(([category, docs]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Documentation</TableHead>
                        <TableHead className="w-32">Status</TableHead>
                        <TableHead className="w-16">Docs</TableHead>
                        <TableHead className="w-20">E-Sign</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead className="w-24 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {docs.sort((a, b) => (a.documentType?.sortOrder || 0) - (b.documentType?.sortOrder || 0)).map((doc, index) => {
                        const status = statusConfig[doc.status] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        
                        return (
                          <TableRow key={doc.id} data-testid={`row-document-${doc.id}`}>
                            <TableCell className="font-medium">{index + 1}.</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{doc.documentType?.name}</p>
                                {doc.documentType?.description && (
                                  <p className="text-xs text-muted-foreground">{doc.documentType.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={status.color} data-testid={`badge-status-${doc.id}`}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {doc.fileName ? (
                                <Paperclip className="h-4 w-4 text-primary" />
                              ) : (
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const pendingRequest = getPendingSignatureRequest(doc.id);
                                const signedRequest = getSignatureRequestForDoc(doc.id);
                                
                                if (isDocumentSigned(doc.id)) {
                                  return (
                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Signed
                                    </Badge>
                                  );
                                }
                                
                                if (signedRequest?.status === "signed") {
                                  return (
                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Signed
                                    </Badge>
                                  );
                                }
                                
                                if (pendingRequest) {
                                  return (
                                    <Link href={`/sign/${pendingRequest.token}`}>
                                      <Badge 
                                        className="bg-primary/10 text-primary border-primary/30 cursor-pointer hover-elevate"
                                        data-testid={`badge-sign-pending-${doc.id}`}
                                      >
                                        <PenTool className="h-3 w-3 mr-1" />
                                        Sign Now
                                      </Badge>
                                    </Link>
                                  );
                                }
                                
                                if (doc.documentType?.requiresSignature) {
                                  return (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openSignDialog(doc)}
                                      data-testid={`button-sign-${doc.id}`}
                                    >
                                      <PenTool className="h-3 w-3 mr-1" />
                                      Sign
                                    </Button>
                                  );
                                }
                                
                                return <span className="text-xs text-muted-foreground">N/A</span>;
                              })()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={doc.comment || ""}
                                  placeholder="Add a comment..."
                                  className="h-8 text-sm"
                                  readOnly
                                  onClick={() => openCommentDialog(doc)}
                                  data-testid={`input-comment-${doc.id}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={() => openCommentDialog(doc)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <ObjectUploader
                                maxNumberOfFiles={1}
                                maxFileSize={10485760}
                                onGetUploadParameters={getUploadParameters(doc)}
                                onComplete={handleUploadComplete(doc)}
                                buttonVariant="outline"
                                buttonSize="sm"
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Attach
                              </ObjectUploader>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground">
                There was an issue loading the document checklist.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Add a comment for {selectedDoc?.documentType?.name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment..."
            rows={4}
            data-testid="textarea-comment"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCommentSave}
              disabled={updateDocumentMutation.isPending}
              data-testid="button-save-comment"
            >
              Save Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              E-Sign Document
            </DialogTitle>
            <DialogDescription>
              Sign {docToSign?.documentType?.name} electronically
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg text-sm">
              <p className="font-medium mb-2">By signing below, you agree that:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>This electronic signature has the same legal effect as a handwritten signature</li>
                <li>You are authorized to sign this document</li>
                <li>All information provided is accurate and complete</li>
              </ul>
            </div>
            
            <SignatureCanvas
              onSignatureComplete={handleSignatureComplete}
              onClear={() => {}}
            />
            
            {signDocumentMutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Recording your signature...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
