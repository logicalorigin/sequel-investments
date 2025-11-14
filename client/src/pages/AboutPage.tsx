import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Users, Target, Shield, TrendingUp, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-about-title">
              About PrimeLend
            </h1>
            <p className="text-xl text-muted-foreground">
              Your trusted partner in non-QM mortgage solutions since 2015
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Founded in 2015, PrimeLend was born from a simple observation: traditional mortgage lending wasn't serving the needs of real estate investors. Experienced investors with strong portfolios were being turned away because they couldn't provide W2s or traditional income documentation.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                We set out to change that by specializing in non-QM mortgage products that focus on what matters most for investment properties: cash flow and property value. Today, we've helped thousands of investors fund over $2 billion in real estate acquisitions and renovations across all 50 states.
              </p>
              <p className="text-lg text-muted-foreground">
                Our team of experienced loan officers understands the investment business because many of us are investors ourselves. We speak your language and structure loans that align with your investment strategy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card data-testid="card-mission">
                <CardHeader>
                  <Target className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To empower real estate investors with fast, flexible financing solutions that help them build wealth and grow their portfolios without the constraints of traditional banking.
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-values">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Our Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Transparency in rates and fees</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Speed without sacrificing quality</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Expertise and education-first approach</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Investors Choose Us</h2>
            <p className="text-xl text-muted-foreground">
              The PrimeLend advantage in numbers
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center" data-testid="card-stat-funded">
              <CardContent className="pt-8">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2">$2B+</div>
                <p className="text-muted-foreground">Total Funded</p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-stat-investors">
              <CardContent className="pt-8">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2">5,000+</div>
                <p className="text-muted-foreground">Happy Investors</p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-stat-states">
              <CardContent className="pt-8">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2">50</div>
                <p className="text-muted-foreground">States Licensed</p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-stat-experience">
              <CardContent className="pt-8">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2">9+</div>
                <p className="text-muted-foreground">Years Experience</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Licensing & Compliance</h2>
            <Card>
              <CardContent className="p-8 space-y-4">
                <p className="text-muted-foreground">
                  PrimeLend is a licensed mortgage lender operating under NMLS #123456. We are licensed to originate loans in all 50 states and comply with all federal and state lending regulations.
                </p>
                <p className="text-muted-foreground">
                  Our loan officers are individually licensed and undergo continuing education to stay current with lending laws and best practices. We maintain all required insurance and bonding to protect our clients.
                </p>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    NMLS Consumer Access: <span className="text-foreground font-medium">www.nmlsconsumeraccess.org</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Equal Housing Lender | Licensed by the Department of Financial Protection and Innovation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Work Together?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of successful investors who trust PrimeLend for their financing needs
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="text-lg px-8" data-testid="button-about-contact">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
