import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Calculator, ChevronDown, Home, Hammer, HardHat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import safLogo from "@assets/ChatGPT Image Jun 25, 2025, 12_32_43 PM_1764028581255.png";

interface PortalHeaderProps {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profileImageUrl?: string | null;
  } | null | undefined;
}

export function PortalHeader({ user }: PortalHeaderProps) {
  const [location] = useLocation();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const isPortfolio = location === "/portal";
  const isAnalysis = location === "/portal/investment-analysis" || 
    location === "/portal/dscr-analyzer" || 
    location === "/portal/fixflip-analyzer" || 
    location === "/portal/construction-analyzer";
  const isProfile = location === "/portal/profile";

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={safLogo} alt="SAF" className="h-8 w-8 object-contain" />
            <span className="font-bold text-lg hidden sm:inline">Secured Asset Funding</span>
            <span className="font-bold text-lg sm:hidden">SAF</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/portal">
            <Button 
              variant="ghost" 
              size="sm" 
              className={isPortfolio ? "bg-primary/10" : ""} 
              data-testid="link-portfolio"
            >
              Portfolio
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1 ${isAnalysis ? "bg-primary/10" : ""}`}
                data-testid="link-investment-analysis"
              >
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Analyzers</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/portal/dscr-analyzer" className="flex items-center gap-2 cursor-pointer" data-testid="link-dscr-analyzer">
                  <Home className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">DSCR Analyzer</p>
                    <p className="text-xs text-muted-foreground">Rental property cash flow</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/portal/fixflip-analyzer" className="flex items-center gap-2 cursor-pointer" data-testid="link-fixflip-analyzer">
                  <Hammer className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-medium">Fix & Flip Analyzer</p>
                    <p className="text-xs text-muted-foreground">Rehab deal profitability</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/portal/construction-analyzer" className="flex items-center gap-2 cursor-pointer" data-testid="link-construction-analyzer">
                  <HardHat className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Construction Analyzer</p>
                    <p className="text-xs text-muted-foreground">Ground-up build analysis</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 p-1" data-testid="button-user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline">
                  {user?.firstName || user?.email || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/portal/profile" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api/logout" className="flex items-center gap-2 cursor-pointer text-destructive">
                  <LogOut className="h-4 w-4" />
                  Logout
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
