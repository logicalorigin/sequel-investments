import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import logoIcon from "@assets/logo_saf_only_removed_bg (1)_1764095523171.png";

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <img 
                src={logoIcon} 
                alt="Secured Asset Funding" 
                className="h-10 sm:h-14 w-auto object-contain"
              />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
              Investor-focused financing solutions for DSCR, Fix & Flip, and New Construction loans nationwide.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9" data-testid="button-social-facebook">
                <Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9" data-testid="button-social-twitter">
                <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9" data-testid="button-social-linkedin">
                <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Loan Products</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/dscr-loans" data-testid="link-footer-dscr">
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    DSCR Loans
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/fix-flip" data-testid="link-footer-fixflip">
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Fix & Flip Loans
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/new-construction" data-testid="link-footer-construction">
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    New Construction
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/calculator" data-testid="link-footer-calculator">
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Loan Calculator
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/about" data-testid="link-footer-about">
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/where-we-lend" data-testid="link-footer-where-we-lend">
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Where We Lend
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact" data-testid="link-footer-contact">
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Contact
                  </span>
                </Link>
              </li>
              <li>
                <span className="text-xs sm:text-sm md:text-base text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <Link href="/admin/login" data-testid="link-footer-staff-login">
                  <span className="text-xs sm:text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Staff Login
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Stay Updated</h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-3 sm:mb-4">
              Subscribe to our newsletter for the latest rates and market insights.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1 h-9 text-sm"
                data-testid="input-newsletter-email"
              />
              <Button size="default" className="h-9" data-testid="button-newsletter-subscribe">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-4">
            <p className="text-muted-foreground text-xs sm:text-sm text-center md:text-left">
              © 2024 Secured Asset Funding. All rights reserved. NMLS #123456
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Licensed in 48 states + DC
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
