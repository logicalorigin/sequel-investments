import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Home, Lock, User, Loader2, UserPlus } from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";
import logoIcon from "@assets/logo_saf_only_removed_bg (1)_1764095523171.png";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/portal");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
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
          <Button
            onClick={handleLogin}
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
              onClick={handleLogin}
              className="h-11"
              data-testid="button-google-signin"
            >
              <SiGoogle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleLogin}
              className="h-11"
              data-testid="button-github-signin"
            >
              <SiGithub className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleLogin}
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
              onClick={handleLogin}
              className="w-full"
              data-testid="button-create-account"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>

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
