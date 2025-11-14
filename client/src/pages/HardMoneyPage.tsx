import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, Zap, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HardMoneyPage() {
  const { toast } = useToast();

  const handleFormSuccess = () => {
    toast({
      title: "Request received!",
      description: "A Hard Money loan specialist will contact you soon.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-hardmoney-title">
              Hard Money Loans
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Fast bridge financing for fix-and-flip investors and rehab projects. Get approved in 24-48 hours and fund in as little as 7 days
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" data-testid="button-hardmoney-apply">Apply Now</Button>
              <Button size="lg" variant="outline" data-testid="button-hardmoney-rates">View Current Rates</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">What is a Hard Money Loan?</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Hard money loans are short-term, asset-based loans secured by real estate. They're designed for real estate investors who need quick funding for fix-and-flip projects, property renovations, or bridge financing until they can secure permanent financing.
                </p>
                <p className="text-lg text-muted-foreground">
                  Unlike traditional mortgages, hard money loans focus on the property's value and potential rather than your credit score or income. This makes them ideal for time-sensitive deals and properties that need significant renovation.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-8">Loan Requirements</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card data-testid="card-requirement-1">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Approval Speed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Pre-approval in 24-48 hours. Full approval within 3-5 business days.</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-requirement-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Loan Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">$75,000 minimum. Up to 90% of purchase price plus 100% of rehab costs.</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-requirement-3">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">First-time flippers considered. Experience preferred but not required with strong deals.</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-requirement-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Property Condition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">All conditions accepted. We specialize in distressed properties needing renovation.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-8">Loan Terms & Structure</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Interest Rates</h4>
                          <p className="text-2xl font-bold text-primary mb-2">9.5% - 13.5%</p>
                          <p className="text-sm text-muted-foreground">Based on LTV, experience, and property type</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Loan Terms</h4>
                          <p className="text-2xl font-bold text-primary mb-2">6-24 Months</p>
                          <p className="text-sm text-muted-foreground">Flexible terms with extension options available</p>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h4 className="font-semibold mb-4">Typical Loan Structure</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Purchase Price Financing</span>
                            <span className="font-semibold">Up to 90% LTV</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Rehab Costs Coverage</span>
                            <span className="font-semibold">Up to 100%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Points</span>
                            <span className="font-semibold">2-4 points</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Rehab Draws</span>
                            <span className="font-semibold">Monthly or milestone-based</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-8">Ideal Scenarios</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card data-testid="card-scenario-1">
                    <CardHeader>
                      <Zap className="h-10 w-10 text-primary mb-3" />
                      <CardTitle>Fix & Flip</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Purchase distressed properties, renovate quickly, and sell for profit in 6-12 months.
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-scenario-2">
                    <CardHeader>
                      <DollarSign className="h-10 w-10 text-primary mb-3" />
                      <CardTitle>Bridge Financing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Short-term funding while securing permanent financing or selling another property.
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-scenario-3">
                    <CardHeader>
                      <Clock className="h-10 w-10 text-primary mb-3" />
                      <CardTitle>Time-Sensitive Deals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Close competitive deals quickly when traditional financing would cause you to lose the property.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" data-testid="faq-item-1">
                    <AccordionTrigger>How quickly can I get funding?</AccordionTrigger>
                    <AccordionContent>
                      With all documents ready, we can fund your hard money loan in as little as 7 days. Our average closing time is 10-14 days, significantly faster than traditional financing.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" data-testid="faq-item-2">
                    <AccordionTrigger>What credit score do I need?</AccordionTrigger>
                    <AccordionContent>
                      While we prefer a 600+ credit score, we focus primarily on the deal itself and the property's after-repair value (ARV). Strong deals with lower credit scores are often approved.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" data-testid="faq-item-3">
                    <AccordionTrigger>How are rehab funds disbursed?</AccordionTrigger>
                    <AccordionContent>
                      Rehab funds are held in escrow and released based on your draw schedule. We typically offer monthly draws or milestone-based draws after inspection confirms work completion. Some borrowers opt for upfront funding with experienced contractors.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" data-testid="faq-item-4">
                    <AccordionTrigger>Can I extend my loan term if needed?</AccordionTrigger>
                    <AccordionContent>
                      Yes! Most of our hard money loans include extension options. Extensions are typically 3-6 months and may include an extension fee. We work with you to ensure your project has the time it needs to succeed.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" data-testid="faq-item-5">
                    <AccordionTrigger>What happens if the project goes over budget?</AccordionTrigger>
                    <AccordionContent>
                      We build contingency buffers into our loan structures. If additional funding is needed, we can often increase the loan amount based on updated property valuations. It's important to communicate early if you anticipate budget overruns.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>Get Your Hard Money Quote</CardTitle>
                    <CardDescription>
                      Fast approval for your next project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LeadForm 
                      onSubmitSuccess={handleFormSuccess}
                      defaultLoanType="Hard Money"
                      compact
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
