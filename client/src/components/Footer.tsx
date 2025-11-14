import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-xl">PrimeLend</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Specializing in non-QM mortgage solutions for real estate investors nationwide.
            </p>
            <div className="flex gap-3">
              <Button size="icon" variant="outline" data-testid="button-social-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" data-testid="button-social-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" data-testid="button-social-linkedin">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Loan Products</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dscr-loans" data-testid="link-footer-dscr">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    DSCR Loans
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/hard-money" data-testid="link-footer-hardmoney">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Hard Money Loans
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/calculator" data-testid="link-footer-calculator">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Loan Calculator
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" data-testid="link-footer-about">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact" data-testid="link-footer-contact">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Contact
                  </span>
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest rates and market insights.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button data-testid="button-newsletter-subscribe">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 PrimeLend. All rights reserved. NMLS #123456
            </p>
            <p className="text-muted-foreground text-sm">
              Licensed in all 50 states
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
