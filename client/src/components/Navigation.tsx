import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoIcon from "@assets/logo_saf_only_removed_bg (1)_1764095523171.png";

export function Navigation() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileLoanProductsOpen, setIsMobileLoanProductsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loanProducts = [
    { href: "/dscr-loans", label: "DSCR Loans" },
    { href: "/fix-flip", label: "Fix & Flip" },
    { href: "/new-construction", label: "New Construction" },
  ];

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/fundings", label: "Recent Fundings" },
    { href: "/where-we-lend", label: "Where We Lend" },
  ];

  const isLoanProductActive = loanProducts.some(p => location === p.href);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-b" : "bg-black/30 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded-md -ml-2">
              <img 
                src={logoIcon} 
                alt="SAF" 
                className={`h-12 w-12 object-contain transition-all duration-300 ${
                  isScrolled ? "" : "brightness-0 invert"
                }`}
              />
              <span className={`font-bold text-xl hidden sm:inline ${isScrolled ? "text-foreground" : "text-white"}`}>
                Secured Asset Funding
              </span>
              <span className={`font-bold text-xl sm:hidden ${isScrolled ? "text-foreground" : "text-white"}`}>SAF</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" data-testid="link-nav-home">
              <span
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  location === "/"
                    ? "text-primary"
                    : isScrolled 
                      ? "text-foreground/80 hover:text-foreground"
                      : "text-white/90 hover:text-white"
                }`}
              >
                Home
              </span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer ${
                    isLoanProductActive
                      ? "text-primary"
                      : isScrolled 
                        ? "text-foreground/80 hover:text-foreground"
                        : "text-white/90 hover:text-white"
                  }`}
                  data-testid="dropdown-loan-products"
                >
                  Loan Products
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {loanProducts.map((product) => (
                  <Link key={product.href} href={product.href}>
                    <DropdownMenuItem 
                      className={`cursor-pointer ${location === product.href ? "text-primary" : ""}`}
                      data-testid={`link-nav-${product.label.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                    >
                      {product.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/where-we-lend" data-testid="link-nav-where-we-lend">
              <span
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  location === "/where-we-lend"
                    ? "text-primary"
                    : isScrolled 
                      ? "text-foreground/80 hover:text-foreground"
                      : "text-white/90 hover:text-white"
                }`}
              >
                Where We Lend
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/portal" data-testid="link-nav-portal">
              <Button 
                variant="outline" 
                size="default"
                className={isScrolled ? "" : "border-white/40 text-white hover:bg-white/10 hover:text-white"}
              >
                Client Portal
              </Button>
            </Link>
            <Link href="/get-quote" data-testid="button-nav-getrate">
              <Button size="default">Get Funded</Button>
            </Link>
          </div>

          <button
            className={`lg:hidden ${isScrolled ? "text-foreground" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background border-t" data-testid="mobile-menu">
          <div className="px-6 py-6 space-y-4">
            <Link href="/" data-testid="link-mobile-home">
              <div
                className={`block py-2 text-base font-medium ${
                  location === "/" ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </div>
            </Link>

            <div>
              <button
                className="flex items-center justify-between w-full py-2 text-base font-medium text-foreground"
                onClick={() => setIsMobileLoanProductsOpen(!isMobileLoanProductsOpen)}
                data-testid="button-mobile-loan-products"
              >
                <span className={isLoanProductActive ? "text-primary" : ""}>Loan Products</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileLoanProductsOpen ? "rotate-180" : ""}`} />
              </button>
              {isMobileLoanProductsOpen && (
                <div className="pl-4 space-y-2 mt-2">
                  {loanProducts.map((product) => (
                    <Link key={product.href} href={product.href} data-testid={`link-mobile-${product.label.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}>
                      <div
                        className={`block py-2 text-sm ${
                          location === product.href ? "text-primary" : "text-muted-foreground"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {product.label}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/where-we-lend" data-testid="link-mobile-where-we-lend">
              <div
                className={`block py-2 text-base font-medium ${
                  location === "/where-we-lend" ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Where We Lend
              </div>
            </Link>

            <div className="flex flex-col gap-3 pt-2">
              <Link href="/portal" data-testid="link-mobile-portal">
                <Button variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  Client Portal
                </Button>
              </Link>
              <Link href="/get-quote" data-testid="button-mobile-getrate">
                <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  Get Funded
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
