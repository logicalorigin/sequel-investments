import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Mail, Lock, KeyRound } from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <img src={logoIcon} alt="SAF" className="h-16 w-16 object-contain brightness-0 invert" />
          <span className="text-white/60">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" data-testid="link-logo-home">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={logoIcon} alt="SAF" className="h-10 w-10 object-contain brightness-0 invert" />
              <span className="font-bold text-xl text-white hidden sm:inline">Secured Asset Funding</span>
            </div>
          </Link>
          <Link href="/" data-testid="link-back-home">
            <Button variant="ghost" className="text-white/70 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <img src={logoIcon} alt="SAF" className="h-12 w-12 object-contain brightness-0 invert" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/60">Sign in to access your Client Portal</p>
          </div>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl text-white">Sign In</CardTitle>
              <CardDescription className="text-white/60">
                Choose your preferred sign-in method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleLogin}
                className="w-full bg-[#e55c2b] hover:bg-[#d44d1f] text-white h-12 text-base"
                data-testid="button-continue-signin"
              >
                <Lock className="mr-2 h-5 w-5" />
                Continue to Sign In
              </Button>

              <div className="relative">
                <Separator className="bg-white/10" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800/80 px-3 text-xs text-white/40">
                  Available sign-in options
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="border-white/20 text-white hover:bg-white/10 h-11"
                  data-testid="button-google-signin"
                >
                  <SiGoogle className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="border-white/20 text-white hover:bg-white/10 h-11"
                  data-testid="button-github-signin"
                >
                  <SiGithub className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="border-white/20 text-white hover:bg-white/10 h-11"
                  data-testid="button-apple-signin"
                >
                  <SiApple className="mr-2 h-4 w-4" />
                  Apple
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="border-white/20 text-white hover:bg-white/10 h-11"
                  data-testid="button-x-signin"
                >
                  <FaXTwitter className="mr-2 h-4 w-4" />
                  X (Twitter)
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleLogin}
                className="w-full border-white/20 text-white hover:bg-white/10 h-11"
                data-testid="button-email-signin"
              >
                <Mail className="mr-2 h-4 w-4" />
                Sign in with Email
              </Button>

              <div className="pt-4 border-t border-white/10">
                <p className="text-center text-sm text-white/40 mb-3">
                  Don't have an account?
                </p>
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="w-full border-[#e55c2b]/50 text-[#e55c2b] hover:bg-[#e55c2b]/10 h-11"
                  data-testid="button-create-account"
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <button
              onClick={handleLogin}
              className="text-sm text-white/60 hover:text-[#e55c2b] transition-colors flex items-center justify-center gap-2 mx-auto"
              data-testid="link-forgot-password"
            >
              <KeyRound className="h-4 w-4" />
              Forgot your password?
            </button>
            
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-[#e55c2b] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#e55c2b] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-4 text-sm text-white/40">
          <span>© 2025 Secured Asset Funding. All rights reserved.</span>
          <span className="hidden sm:inline">|</span>
          <Link href="/contact" className="hover:text-white">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
}
