import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoFull from "@assets/ChatGPT Image Jun 25, 2025, 12_56_17 PM_1764028561921.png";
import logoIcon from "@assets/ChatGPT Image Jun 25, 2025, 12_32_43 PM_1764028581255.png";

export function Navigation() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dscr-loans", label: "DSCR Loans" },
    { href: "/fix-flip", label: "Fix & Flip" },
    { href: "/new-construction", label: "New Construction" },
    { href: "/calculator", label: "Calculator" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md border-b" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded-md -ml-2">
              <img 
                src={logoIcon} 
                alt="SAF" 
                className="h-10 w-10 object-contain"
              />
              <span className="font-bold text-xl text-foreground hidden sm:inline">Secured Asset Funding</span>
              <span className="font-bold text-xl text-foreground sm:hidden">SAF</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replace(/ /g, "-")}`}>
                <span
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    location === link.href
                      ? "text-primary"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="hidden lg:block">
            <Link href="/get-quote" data-testid="button-nav-getrate">
              <Button size="default">Get Your Rate</Button>
            </Link>
          </div>

          <button
            className="lg:hidden"
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
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-mobile-${link.label.toLowerCase().replace(/ /g, "-")}`}>
                <div
                  className={`block py-2 text-base font-medium ${
                    location === link.href ? "text-primary" : "text-foreground"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </div>
              </Link>
            ))}
            <Link href="/get-quote" data-testid="button-mobile-getrate">
              <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                Get Your Rate
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
