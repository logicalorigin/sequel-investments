import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Home, Lock, User, Loader2, UserPlus, Mail } from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@assets/logo_saf_only_removed_bg (1)_1764095523171.png";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showTestLogin, setShowTestLogin] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/portal");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleOAuthLogin = () => {
    window.location.href = "/api/login";
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/borrower/login", {
        username,
        password,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Login Successful",
        description: "Welcome to your Client Portal.",
      });
      setLocation("/portal");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleTestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email/username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <img src={logoIcon} alt="SAF" className="h-10 w-10 object-contain" />
          </div>
          <CardTitle className="text-2xl">Client Portal</CardTitle>
          <CardDescription>
            Sign in to access your loan applications, track deals, and analyze new investment opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showTestLogin ? (
            <>
              <Button
                onClick={handleOAuthLogin}
                className="w-full"
                data-testid="button-continue-signin"
              >
                <Lock className="mr-2 h-4 w-4" />
                Continue to Sign In
              </Button>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  or sign in with
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={handleOAuthLogin}
                  className="h-11"
                  data-testid="button-google-signin"
                >
                  <SiGoogle className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleOAuthLogin}
                  className="h-11"
                  data-testid="button-github-signin"
                >
                  <SiGithub className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleOAuthLogin}
                  className="h-11"
                  data-testid="button-apple-signin"
                >
                  <SiApple className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Don't have an account?</p>
                <Button
                  variant="outline"
                  onClick={handleOAuthLogin}
                  className="w-full"
                  data-testid="button-create-account"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setShowTestLogin(true)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  data-testid="button-show-test-login"
                >
                  Test account login
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleTestLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter email (or 'borrower' for test)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      data-testid="input-borrower-email"
                      autoComplete="username"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Test account: borrower / borrower
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      data-testid="input-borrower-password"
                      autoComplete="current-password"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                  data-testid="button-borrower-login"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <Separator />

              <Button
                variant="outline"
                onClick={() => setShowTestLogin(false)}
                className="w-full"
                data-testid="button-back-to-oauth"
              >
                Back to OAuth Login
              </Button>
            </>
          )}

          <div className="text-center">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-go-home">
                <Home className="h-4 w-4 mr-2" />
                Back to Homepage
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
