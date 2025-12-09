import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  PenLine, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Eye,
  RefreshCw,
  Loader2,
  Send,
  User,
  FileText,
  Calendar,
  Mail
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { Document } from "@shared/schema";

interface SignatureRequest {
  id: string;
  documentId: string;
  signerName: string;
  signerEmail: string;
  status: "pending" | "viewed" | "signed" | "declined" | "expired";
  requestedAt: string;
  expiresAt: string;
  viewedAt?: string;
  signedAt?: string;
  declinedAt?: string;
  signatureImageUrl?: string;
  document?: {
    id: string;
    name: string;
    typeName?: string;
  };
  requestedBy?: {
    firstName?: string;
    lastName?: string;
  };
}

const statusConfig: Record<string, { icon: typeof Check; color: string; label: string }> = {
  pending: { icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", label: "Pending" },
  viewed: { icon: Eye, color: "bg-blue-500/10 text-blue-600 border-blue-500/30", label: "Viewed" },
  signed: { icon: Check, color: "bg-green-500/10 text-green-600 border-green-500/30", label: "Signed" },
  declined: { icon: X, color: "bg-red-500/10 text-red-600 border-red-500/30", label: "Declined" },
  expired: { icon: AlertCircle, color: "bg-gray-500/10 text-gray-500 border-gray-500/30", label: "Expired" },
};

interface SignatureRequestsSectionProps {
  applicationId: string;
  documents?: Document[];
  borrowerName?: string;
  borrowerEmail?: string;
}

interface RequestSignatureDialogProps {
  applicationId: string;
  documents: Document[];
  defaultSignerName?: string;
  defaultSignerEmail?: string;
  defaultDocumentId?: string;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function RequestSignatureDialog({
  applicationId,
  documents,
  defaultSignerName = "",
  defaultSignerEmail = "",
  defaultDocumentId = "",
  trigger,
  onSuccess,
}: RequestSignatureDialogProps) {
  const [open, setOpen] = useState(false);
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [signerEmail, setSignerEmail] = useState(defaultSignerEmail);
  const [selectedDocumentId, setSelectedDocumentId] = useState(defaultDocumentId);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/signature-requests", {
        loanApplicationId: applicationId,
        documentId: selectedDocumentId,
        signerName,
        signerEmail,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "signature-requests"] });
      toast({
        title: "Signature Request Sent",
        description: `An email has been sent to ${signerEmail} with a link to sign the document.`,
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName || !signerEmail || !selectedDocumentId) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" />
              Request Signature
            </DialogTitle>
            <DialogDescription>
              Send a signature request via email. The recipient will receive a secure link to sign the document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document">Document to Sign</Label>
              <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
                <SelectTrigger id="document" data-testid="select-document">
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name || doc.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signerName">Signer Name</Label>
              <Input
                id="signerName"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Full name of the person signing"
                data-testid="input-signer-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signerEmail">Signer Email</Label>
              <Input
                id="signerEmail"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="Email address to send signing link"
                data-testid="input-signer-email"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-send-request">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SignatureRequestsSection({
  applicationId,
  documents = [],
  borrowerName = "",
  borrowerEmail = "",
}: SignatureRequestsSectionProps) {
  const { toast } = useToast();

  const { data: requests = [], isLoading } = useQuery<SignatureRequest[]>({
    queryKey: ["/api/applications", applicationId, "signature-requests"],
  });

  const resendMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("POST", `/api/signature-requests/${requestId}/resend`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", applicationId, "signature-requests"] });
      toast({
        title: "Request Resent",
        description: "A new signing link has been emailed to the signer.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Resend",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5" />
            Signature Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5" />
              Signature Requests
            </CardTitle>
            <CardDescription>
              {requests.length} request{requests.length !== 1 ? "s" : ""} for this application
            </CardDescription>
          </div>
          {documents.length > 0 && (
            <RequestSignatureDialog
              applicationId={applicationId}
              documents={documents}
              defaultSignerName={borrowerName}
              defaultSignerEmail={borrowerEmail}
              trigger={
                <Button size="sm" data-testid="button-new-signature-request">
                  <PenLine className="h-4 w-4 mr-2" />
                  Request Signature
                </Button>
              }
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <PenLine className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No signature requests yet</p>
            <p className="text-xs mt-1">Request signatures from the borrower using the button above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const config = statusConfig[request.status] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 space-y-3"
                  data-testid={`signature-request-${request.id}`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {request.document?.typeName || request.document?.name || "Document"}
                      </span>
                    </div>
                    <Badge variant="outline" className={config.color} data-testid={`badge-status-${request.id}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Signer:</span>
                      <span>{request.signerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span>{request.signerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Requested:</span>
                      <span>{formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}</span>
                    </div>
                    {request.status === "signed" && request.signedAt && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-3.5 w-3.5" />
                        <span>Signed {format(new Date(request.signedAt), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    )}
                    {(request.status === "pending" || request.status === "viewed") && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Expires {format(new Date(request.expiresAt), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  {(request.status === "pending" || request.status === "viewed" || request.status === "expired") && (
                    <>
                      <Separator />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendMutation.mutate(request.id)}
                          disabled={resendMutation.isPending}
                          data-testid={`button-resend-${request.id}`}
                        >
                          {resendMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          {request.status === "expired" ? "Send New Request" : "Resend Email"}
                        </Button>
                      </div>
                    </>
                  )}

                  {request.status === "signed" && request.signatureImageUrl && (
                    <>
                      <Separator />
                      <div className="bg-white rounded-md p-2 max-w-xs">
                        <img
                          src={request.signatureImageUrl}
                          alt={`Signature by ${request.signerName}`}
                          className="max-h-16 w-auto"
                          data-testid={`img-signature-${request.id}`}
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
