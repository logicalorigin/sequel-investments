import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import type { LoanApplication, Document, DocumentType } from "@shared/schema";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentWithType | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    document.title = "Document Checklist | Secured Asset Funding";
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

  const handleFileUpload = async (doc: DocumentWithType, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    updateDocumentMutation.mutate({
      docId: doc.id,
      data: {
        status: "uploaded",
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date(),
      },
    });
  };

  const handleAttachClick = (doc: DocumentWithType) => {
    setSelectedDoc(doc);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedDoc) {
      handleFileUpload(selectedDoc, file);
    }
    e.target.value = "";
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
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />

      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Secured Asset Funding</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAttachClick(doc)}
                                disabled={updateDocumentMutation.isPending}
                                data-testid={`button-attach-${doc.id}`}
                              >
                                Attach
                              </Button>
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
    </div>
  );
}
