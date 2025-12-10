import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import { GeometricPattern } from "@/components/GeometricPattern";
import { useWhiteLabel } from "@/context/WhiteLabelContext";

export function Footer() {
  const { settings, isDemoMode } = useWhiteLabel();
  
  const companyName = settings?.companyName || "SEQUEL INVESTMENTS";
  const logoUrl = settings?.logoUrl;
  const contactPhone = settings?.contactPhone || "302.388.8860";
  const contactEmail = settings?.contactEmail || "josh@fundwithsequel.com";
  const contactAddress = settings?.contactAddress || "800 5th Avenue, Suite 4100, Miami Beach, FL 33139";
  const footerText = settings?.footerText;
  
  const nameParts = companyName.split(" ");
  const firstName = nameParts[0];
  const restOfName = nameParts.slice(1).join(" ");
  
  const addressParts = contactAddress.split(", ");
  const addressLine1 = addressParts.slice(0, 2).join(", ");
  const addressLine2 = addressParts.slice(2).join(", ");

  return (
    <footer className="bg-card border-t relative overflow-hidden">
      <GeometricPattern 
        variant="dots" 
        className="text-muted-foreground" 
        opacity={0.1}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 md:py-16">
        {/* Mobile: Compact layout */}
        <div className="sm:hidden space-y-4 mb-4">
          <div className="flex items-center justify-between">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={companyName}
                className="h-6 max-w-[120px] object-contain"
                data-testid="img-footer-logo"
              />
            ) : (
              <div className="flex items-center">
                <span className="text-base font-bold text-primary" data-testid="text-footer-company-first">{firstName}</span>
                {restOfName && <span className="text-base font-light text-foreground ml-1" data-testid="text-footer-company-rest">{restOfName}</span>}
              </div>
            )}
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-social-facebook">
                <Facebook className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-social-twitter">
                <Twitter className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-social-linkedin">
                <Linkedin className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-xs mb-2">Products</h3>
              <ul className="space-y-1">
                <li><Link href="/dscr-loans"><span className="text-xs text-muted-foreground">DSCR Loans</span></Link></li>
                <li><Link href="/fix-flip"><span className="text-xs text-muted-foreground">Fix & Flip</span></Link></li>
                <li><Link href="/new-construction"><span className="text-xs text-muted-foreground">Construction</span></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs mb-2">Company</h3>
              <ul className="space-y-1">
                <li><Link href="/about"><span className="text-xs text-muted-foreground">About</span></Link></li>
                <li><Link href="/contact"><span className="text-xs text-muted-foreground">Contact</span></Link></li>
                <li><Link href="/admin/login"><span className="text-xs text-muted-foreground">Staff Login</span></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-0.5" data-testid="footer-contact-info">
            <p data-testid="text-footer-phone">{contactPhone}</p>
            <p data-testid="text-footer-email">{contactEmail}</p>
          </div>
        </div>

        {/* Desktop: Full layout */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 sm:mb-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4 sm:mb-6">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={companyName}
                  className="h-8 max-w-[150px] object-contain"
                  data-testid="img-footer-logo-desktop"
                />
              ) : (
                <>
                  <span className="text-lg font-bold text-primary">{firstName}</span>
                  {restOfName && <span className="text-lg font-light text-foreground ml-1">{restOfName}</span>}
                </>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
              Private financing solutions for real estate investors. DSCR, Fix & Flip, and New Construction loans nationwide.
            </p>
            <div className="text-xs sm:text-sm text-muted-foreground space-y-1 mb-3 sm:mb-4">
              <p>{contactPhone}</p>
              <p>{contactEmail}</p>
              <p>{addressLine1}</p>
              {addressLine2 && <p>{addressLine2}</p>}
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9">
                <Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9">
                <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9">
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

        <div className="pt-4 sm:pt-8 border-t">
          {footerText && (
            <p className="text-muted-foreground text-xs sm:text-sm mb-4 text-center" data-testid="text-custom-footer">
              {footerText}
            </p>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4">
            <p className="text-muted-foreground text-[10px] sm:text-sm text-center sm:text-left" data-testid="text-footer-copyright">
              © {new Date().getFullYear()} {isDemoMode ? companyName : "Sequel Investments"}. All rights reserved.
              {isDemoMode && (
                <span className="ml-2 text-primary" data-testid="text-powered-by-footer">
                  Powered by Sequel Investments
                </span>
              )}
            </p>
            <p className="text-muted-foreground text-[10px] sm:text-sm">
              Licensed in 48 states + DC
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
