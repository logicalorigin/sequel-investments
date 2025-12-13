import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import { InlineSearch } from "@/components/InlineSearch";
import { SearchCommand } from "@/components/SearchCommand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWhiteLabel } from "@/context/WhiteLabelContext";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileLoanProductsOpen, setIsMobileLoanProductsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { settings, isDemoMode } = useWhiteLabel();
  
  const companyName = settings?.companyName || "SEQUEL INVESTMENTS";
  const logoUrl = settings?.logoUrl;
  const nameParts = companyName.split(" ");
  const firstName = nameParts[0];
  const restOfName = nameParts.slice(1).join(" ");

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
      className="bg-background border-b sticky top-0 z-50"
      data-testid="nav-main"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14 lg:h-20">
          <Link href="/" data-testid="link-logo">
            <div className="flex items-center cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded-md -ml-2" data-testid="nav-brand">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={companyName}
                  className="h-8 max-w-[150px] object-contain"
                  data-testid="img-nav-logo"
                />
              ) : (
                <>
                  <span className="text-xl font-bold text-primary" data-testid="text-nav-company-first">{firstName}</span>
                  {restOfName && <span className="text-xl font-light text-foreground ml-1" data-testid="text-nav-company-rest">{restOfName}</span>}
                </>
              )}
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" data-testid="link-nav-home">
              <span
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  location === "/" ? "text-primary" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                Home
              </span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer ${
                    isLoanProductActive ? "text-primary" : "text-foreground/80 hover:text-foreground"
                  }`}
                  data-testid="dropdown-loan-products"
                >
                  Loan Products
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48" data-testid="dropdown-loan-products-menu">
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
                  location === "/where-we-lend" ? "text-primary" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                Where We Lend
              </span>
            </Link>

            <Link href="/resources" data-testid="link-nav-resources">
              <span
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  location.startsWith("/resources") ? "text-primary" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                Resources
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <InlineSearch context="public" className="w-64" placeholder="Search..." />
            <Link href="/portal" data-testid="link-nav-portal">
              <Button 
                size="default"
                className="bg-primary text-white hover:bg-primary/90"
                data-testid="button-client-portal"
              >
                Client Portal
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden text-foreground p-1.5 rounded-md hover-elevate"
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Search"
            data-testid="button-mobile-search"
          >
            <Search className="h-5 w-5" />
          </button>
          <SearchCommand context="public" open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen} />
          <button
            className="lg:hidden text-foreground"
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
                <div className="pl-4 space-y-2 mt-2" data-testid="mobile-loan-products-menu">
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

            <Link href="/resources" data-testid="link-mobile-resources">
              <div
                className={`block py-2 text-base font-medium ${
                  location.startsWith("/resources") ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </div>
            </Link>

            <div className="flex flex-col gap-3 pt-2">
              <Link href="/portal" data-testid="link-mobile-portal">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsMobileMenuOpen(false)} data-testid="button-mobile-client-portal">
                  Client Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
