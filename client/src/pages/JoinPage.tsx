import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  CheckCircle2, 
  XCircle,
  Loader2,
  LogIn,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface InviteInfo {
  email: string;
  role: string;
  expiresAt: string;
}

export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: currentUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: inviteInfo, isLoading: inviteLoading, error: inviteError } = useQuery<InviteInfo>({
    queryKey: ["/api/invites", token],
    enabled: !!token,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/invites/${token}/accept`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome to the team!",
        description: `You now have ${data.role} access.`,
      });
      navigate("/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to accept invite",
        description: error.message || "Please try again or contact an administrator",
        variant: "destructive",
      });
    },
  });

  if (inviteLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (inviteError || !inviteInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/")}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(inviteInfo.expiresAt) < new Date();
  const emailMatches = currentUser?.email?.toLowerCase() === inviteInfo.email.toLowerCase();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            You've been invited to join Secured Asset Funding as a team member
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Invited Email</span>
              <span className="font-medium">{inviteInfo.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant="outline" className="capitalize">
                <Shield className="h-3 w-3 mr-1" />
                {inviteInfo.role}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expires</span>
              <span className={isExpired ? "text-red-500" : "text-muted-foreground"}>
                {isExpired ? "Expired" : new Date(inviteInfo.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {isExpired ? (
            <div className="text-center text-red-500 text-sm">
              This invitation has expired. Please request a new invitation.
            </div>
          ) : !currentUser ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please sign in with <strong>{inviteInfo.email}</strong> to accept this invitation.
              </p>
              <Button 
                className="w-full" 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Accept
              </Button>
            </div>
          ) : !emailMatches ? (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  You're signed in as <strong>{currentUser.email}</strong>, but this invitation is for <strong>{inviteInfo.email}</strong>.
                </p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Please sign out and sign in with the correct email address.
              </p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  You're signed in with the correct email. Click below to accept your invitation.
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending}
                data-testid="button-accept"
              >
                {acceptMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Accept Invitation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
