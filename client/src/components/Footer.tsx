import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import { Phone, MailOpen } from "react-coolicons";
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
    <footer className="bg-card border-t relative overflow-hidden" data-testid="footer-main">
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
                <span className="text-base font-bold text-foreground" data-testid="text-footer-company-first">{firstName}</span>
                {restOfName && <span className="text-base font-light text-muted-foreground ml-1" data-testid="text-footer-company-rest">{restOfName}</span>}
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
                <li><Link href="/dscr-loans" data-testid="link-footer-mobile-dscr"><span className="text-xs text-muted-foreground">DSCR Loans</span></Link></li>
                <li><Link href="/fix-flip" data-testid="link-footer-mobile-fixflip"><span className="text-xs text-muted-foreground">Fix & Flip</span></Link></li>
                <li><Link href="/new-construction" data-testid="link-footer-mobile-construction"><span className="text-xs text-muted-foreground">Construction</span></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs mb-2">Company</h3>
              <ul className="space-y-1">
                <li><Link href="/about" data-testid="link-footer-mobile-about"><span className="text-xs text-muted-foreground">About</span></Link></li>
                <li><Link href="/contact" data-testid="link-footer-mobile-contact"><span className="text-xs text-muted-foreground">Contact</span></Link></li>
                <li><Link href="/admin/login" data-testid="link-footer-mobile-staff-login"><span className="text-xs text-muted-foreground">Staff Login</span></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1" data-testid="footer-contact-info">
            <p className="flex items-center gap-1.5" data-testid="text-footer-phone">
              <Phone className="h-3 w-3 text-muted-foreground" />
              {contactPhone}
            </p>
            <p className="flex items-center gap-1.5" data-testid="text-footer-email">
              <MailOpen className="h-3 w-3 text-muted-foreground" />
              {contactEmail}
            </p>
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
                  <span className="text-lg font-bold text-foreground">{firstName}</span>
                  {restOfName && <span className="text-lg font-light text-muted-foreground ml-1">{restOfName}</span>}
                </>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
              Private financing solutions for real estate investors. DSCR, Fix & Flip, and New Construction loans nationwide.
            </p>
            <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5 mb-3 sm:mb-4" data-testid="footer-contact-info-desktop">
              <p className="flex items-center gap-2" data-testid="text-footer-phone-desktop">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                {contactPhone}
              </p>
              <p className="flex items-center gap-2" data-testid="text-footer-email-desktop">
                <MailOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                {contactEmail}
              </p>
              <p data-testid="text-footer-address">{addressLine1}</p>
              {addressLine2 && <p>{addressLine2}</p>}
            </div>
            <div className="flex gap-2 sm:gap-3" data-testid="footer-social-links">
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9" data-testid="button-social-facebook-desktop">
                <Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9" data-testid="button-social-twitter-desktop">
                <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 sm:h-9 sm:w-9" data-testid="button-social-linkedin-desktop">
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
                <span className="text-xs sm:text-sm md:text-base text-muted-foreground cursor-pointer hover:text-foreground transition-colors" data-testid="link-footer-privacy">
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
                <span className="ml-2 text-muted-foreground" data-testid="text-powered-by-footer">
                  Powered by Sequel Investments
                </span>
              )}
            </p>
            <p className="text-muted-foreground text-[10px] sm:text-sm" data-testid="text-footer-licensed">
              Licensed in 48 states + DC
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
