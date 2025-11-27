import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileLoanProductsOpen, setIsMobileLoanProductsOpen] = useState(false);

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
      className="bg-background border-b"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded-md -ml-2">
              <img 
                src={logoIcon} 
                alt="Secured Asset Funding" 
                className="h-16 w-auto object-contain"
              />
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
                  location === "/where-we-lend" ? "text-primary" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                Where We Lend
              </span>
            </Link>

            <Link href="/property-search" data-testid="link-nav-property-search">
              <span
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  location === "/property-search" ? "text-primary" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                Property Search
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
            <Link href="/portal" data-testid="link-nav-portal">
              <Button 
                size="default"
                className="bg-primary text-white hover:bg-primary/90"
              >
                Client Portal
              </Button>
            </Link>
            <Link href="/get-quote" data-testid="button-nav-getrate">
              <Button size="default" variant="outline">Get Funded</Button>
            </Link>
          </div>

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

            <Link href="/property-search" data-testid="link-mobile-property-search">
              <div
                className={`block py-2 text-base font-medium ${
                  location === "/property-search" ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Property Search
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
                <Button className="w-full bg-primary text-white hover:bg-primary/90" onClick={() => setIsMobileMenuOpen(false)}>
                  Client Portal
                </Button>
              </Link>
              <Link href="/get-quote" data-testid="button-mobile-getrate">
                <Button variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
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
