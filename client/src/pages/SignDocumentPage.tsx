import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SignatureCapture } from "@/components/SignatureCapture";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Check, Clock, FileText, User, Calendar, MapPin, X, Loader2, ShieldCheck, Ban } from "lucide-react";
import { format } from "date-fns";

interface SignatureRequestDetails {
  id: string;
  signerName: string;
  signerEmail: string;
  status: "pending" | "viewed" | "signed" | "declined" | "expired";
  requestedAt: string;
  expiresAt: string;
  viewedAt?: string;
  signedAt?: string;
  declinedAt?: string;
  document?: {
    id: string;
    name: string;
    typeName?: string;
    description?: string;
  };
  application?: {
    id: string;
    propertyAddress?: string;
    loanType?: string;
  };
  requestedBy?: {
    firstName?: string;
    lastName?: string;
  };
}

export default function SignDocumentPage() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signatureType, setSignatureType] = useState<"draw" | "type" | "upload">("draw");
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);

  const { data: request, isLoading, error } = useQuery<SignatureRequestDetails>({
    queryKey: ["/api/signature-requests/token", token],
    queryFn: async () => {
      const res = await fetch(`/api/signature-requests/token/${token}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load signature request");
      }
      return res.json();
    },
    enabled: !!token,
  });

  const signMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/signature-requests/token/${token}/sign`, {
        signatureData,
        signatureType,
        agreedToTerms,
      });
      return response.json();
    },
    onSuccess: () => {
      setIsSigned(true);
      toast({
        title: "Document Signed",
        description: "Your signature has been successfully recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Signing Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/signature-requests/token/${token}/decline`, {
        reason: declineReason,
      });
      return response.json();
    },
    onSuccess: () => {
      setIsDeclined(true);
      setShowDeclineDialog(false);
      toast({
        title: "Signature Declined",
        description: "Your response has been recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Decline",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSignatureComplete = (data: string, type: "draw" | "type" | "upload") => {
    setSignatureData(data);
    setSignatureType(type);
  };

  const handleSubmitSignature = () => {
    if (!agreedToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to sign electronically before submitting.",
        variant: "destructive",
      });
      return;
    }
    if (!signatureData) {
      toast({
        title: "Signature Required",
        description: "Please provide your signature before submitting.",
        variant: "destructive",
      });
      return;
    }
    signMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground" data-testid="text-loading">Loading signature request...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2" data-testid="text-error-title">Unable to Load Request</h2>
            <p className="text-muted-foreground mb-4" data-testid="text-error-message">
              {(error as Error)?.message || "The signature request could not be found or the link has expired."}
            </p>
            <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-go-home">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSigned || request.status === "signed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2" data-testid="text-signed-title">Document Signed</h2>
            <p className="text-muted-foreground mb-4" data-testid="text-signed-message">
              Thank you, {request.signerName}! Your signature has been successfully recorded.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Document:</strong> {request.document?.typeName || request.document?.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong className="text-foreground">Signed:</strong> {format(new Date(request.signedAt || new Date()), "PPpp")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to {request.signerEmail}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isDeclined || request.status === "declined") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2" data-testid="text-declined-title">Signature Declined</h2>
            <p className="text-muted-foreground mb-4" data-testid="text-declined-message">
              You have declined to sign this document. The requesting party has been notified.
            </p>
            <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-go-home-declined">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (request.status === "expired") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2" data-testid="text-expired-title">Request Expired</h2>
            <p className="text-muted-foreground mb-4" data-testid="text-expired-message">
              This signature request expired on {format(new Date(request.expiresAt), "PPP")}. Please contact the sender for a new signing link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requestedByName = request.requestedBy
    ? `${request.requestedBy.firstName || ""} ${request.requestedBy.lastName || ""}`.trim()
    : "Sequel Investments";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-primary" data-testid="text-brand-name">SEQUEL INVESTMENTS</h1>
          <p className="text-sm text-muted-foreground">Electronic Document Signing</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2" data-testid="text-document-title">
                      <FileText className="h-5 w-5 text-primary" />
                      {request.document?.typeName || request.document?.name || "Document"}
                    </CardTitle>
                    {request.document?.description && (
                      <CardDescription className="mt-1" data-testid="text-document-description">
                        {request.document.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="secondary" data-testid="badge-status">
                    {request.status === "viewed" ? "Ready to Sign" : request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Requested by:</span>
                    <span className="font-medium" data-testid="text-requested-by">{requestedByName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Requested:</span>
                    <span className="font-medium" data-testid="text-requested-date">
                      {format(new Date(request.requestedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="font-medium" data-testid="text-expires-date">
                      {format(new Date(request.expiresAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  {request.application?.propertyAddress && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Property:</span>
                      <span className="font-medium" data-testid="text-property-address">
                        {request.application.propertyAddress}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle data-testid="text-signature-section-title">Your Signature</CardTitle>
                <CardDescription>
                  Please provide your signature below. You can draw, type, or upload your signature.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SignatureCapture
                  onSignatureComplete={handleSignatureComplete}
                  signerName={request.signerName}
                />

                <Separator />

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agree-terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                    data-testid="checkbox-agree-terms"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="agree-terms" className="text-sm font-medium cursor-pointer">
                      I agree to sign this document electronically
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      By checking this box, I agree that my electronic signature is legally binding and has the same 
                      effect as a handwritten signature. I confirm that I am {request.signerName}.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSubmitSignature}
                    disabled={!agreedToTerms || !signatureData || signMutation.isPending}
                    className="flex-1"
                    data-testid="button-submit-signature"
                  >
                    {signMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Sign Document
                      </>
                    )}
                  </Button>
                  <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" data-testid="button-decline-open">
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Decline to Sign</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to decline signing this document? You may provide an optional reason.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="decline-reason">Reason (optional)</Label>
                        <Textarea
                          id="decline-reason"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="Please explain why you are declining..."
                          className="mt-2"
                          data-testid="textarea-decline-reason"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeclineDialog(false)} data-testid="button-cancel-decline">
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => declineMutation.mutate()}
                          disabled={declineMutation.isPending}
                          data-testid="button-confirm-decline"
                        >
                          {declineMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Declining...
                            </>
                          ) : (
                            "Confirm Decline"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Signing for</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium" data-testid="text-signer-name">{request.signerName}</p>
                <p className="text-sm text-muted-foreground" data-testid="text-signer-email">{request.signerEmail}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Security Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Your signature is protected with bank-level encryption.</p>
                <p>We record your IP address and browser information for audit purposes.</p>
                <p>This document cannot be altered after signing.</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 text-sm">
                <p className="font-medium text-primary mb-1">Need Help?</p>
                <p className="text-muted-foreground">
                  If you have questions about this document, please contact {requestedByName} directly or call our team at 302.388.8860.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
