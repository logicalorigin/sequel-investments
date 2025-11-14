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
import { CheckCircle2, Home, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DSCRLoansPage() {
  const { toast } = useToast();

  const handleFormSuccess = () => {
    toast({
      title: "Request received!",
      description: "A DSCR loan specialist will contact you soon.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-dscr-title">
              DSCR Loans
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Debt Service Coverage Ratio loans designed for rental property investors who want to qualify based on property cash flow, not personal income
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" data-testid="button-dscr-apply">Apply Now</Button>
              <Button size="lg" variant="outline" data-testid="button-dscr-rates">View Current Rates</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">What is a DSCR Loan?</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  A DSCR (Debt Service Coverage Ratio) loan is a type of non-QM mortgage that qualifies borrowers based on the cash flow of their rental property rather than their personal income. This makes it ideal for real estate investors who want to expand their portfolio without the hassle of traditional income documentation.
                </p>
                <p className="text-lg text-muted-foreground">
                  The DSCR is calculated by dividing the property's monthly rental income by its monthly debt obligations (mortgage payment plus expenses). A DSCR of 1.0 or higher typically qualifies for approval.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-8">Loan Requirements</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card data-testid="card-requirement-1">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Credit Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Minimum 620 credit score required. Higher scores qualify for better rates.</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-requirement-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Down Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Minimum 20% down payment (80% LTV). Lower LTV available for stronger deals.</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-requirement-3">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Property Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">1-4 unit residential properties, condos, and townhomes. Primary, secondary, or investment.</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-requirement-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        DSCR Ratio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Minimum 1.0 DSCR preferred. Some programs available for 0.75+ DSCR at higher rates.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-8">Competitive Rates & Terms</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">LTV Range</th>
                            <th className="text-left py-3 px-4">DSCR Range</th>
                            <th className="text-left py-3 px-4">Rate Range</th>
                            <th className="text-left py-3 px-4">Term</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 px-4">Up to 80%</td>
                            <td className="py-3 px-4">1.25+</td>
                            <td className="py-3 px-4 font-semibold">6.5% - 7.5%</td>
                            <td className="py-3 px-4">30 years</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4">Up to 75%</td>
                            <td className="py-3 px-4">1.0 - 1.24</td>
                            <td className="py-3 px-4 font-semibold">7.0% - 8.0%</td>
                            <td className="py-3 px-4">30 years</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4">Up to 70%</td>
                            <td className="py-3 px-4">0.75 - 0.99</td>
                            <td className="py-3 px-4 font-semibold">7.5% - 8.5%</td>
                            <td className="py-3 px-4">30 years</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      *Rates are subject to change and depend on credit score, property type, and market conditions. Contact us for current rates.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-8">Common Use Cases</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card data-testid="card-usecase-1">
                    <CardHeader>
                      <Home className="h-10 w-10 text-primary mb-3" />
                      <CardTitle>Portfolio Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Buy additional rental properties without maxing out your personal debt-to-income ratio.
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-usecase-2">
                    <CardHeader>
                      <TrendingUp className="h-10 w-10 text-primary mb-3" />
                      <CardTitle>Self-Employed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Qualify without complicated tax returns or showing two years of self-employment income.
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-usecase-3">
                    <CardHeader>
                      <Users className="h-10 w-10 text-primary mb-3" />
                      <CardTitle>Cash Flow Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Let the property's rental income be the primary qualification factor, not your W2.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" data-testid="faq-item-1">
                    <AccordionTrigger>What documents do I need for a DSCR loan?</AccordionTrigger>
                    <AccordionContent>
                      You'll need a signed lease agreement (or market rent analysis), property insurance, bank statements for down payment/reserves, and credit authorization. No tax returns or W2s required!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" data-testid="faq-item-2">
                    <AccordionTrigger>How long does it take to close?</AccordionTrigger>
                    <AccordionContent>
                      Most DSCR loans close in 14-21 days once you're under contract. We can expedite to as fast as 10 days in urgent situations with all documents ready.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" data-testid="faq-item-3">
                    <AccordionTrigger>Can I get a DSCR loan on a property I'm buying?</AccordionTrigger>
                    <AccordionContent>
                      Yes! DSCR loans work for both purchases and refinances. For purchases, we'll use a market rent analysis to determine the property's rental income potential.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" data-testid="faq-item-4">
                    <AccordionTrigger>Are there prepayment penalties?</AccordionTrigger>
                    <AccordionContent>
                      Most of our DSCR loan programs have no prepayment penalties, though some may have a 6-12 month soft prepay period. We'll discuss the specific terms during your consultation.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" data-testid="faq-item-5">
                    <AccordionTrigger>Can I finance multiple properties at once?</AccordionTrigger>
                    <AccordionContent>
                      Absolutely! DSCR loans are perfect for portfolio investors. Each property is evaluated on its own cash flow, making it easy to finance multiple properties simultaneously.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>Get Your DSCR Loan Quote</CardTitle>
                    <CardDescription>
                      Connect with a specialist for personalized rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LeadForm 
                      onSubmitSuccess={handleFormSuccess}
                      defaultLoanType="DSCR"
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
