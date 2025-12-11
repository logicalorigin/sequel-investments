import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, User, Calculator, Shield, TrendingUp, Clock, Building, ExternalLink, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import { ArticleDSCRCalculator } from "@/components/ArticleDSCRCalculator";
import { PortalSignUpCTA } from "@/components/PortalSignUpCTA";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const dscrComparisonData = [
  { dscr: "0.75", rate: 8.5, label: "Below 1.0" },
  { dscr: "1.0", rate: 7.75, label: "Break-even" },
  { dscr: "1.25", rate: 7.0, label: "Standard" },
  { dscr: "1.5+", rate: 6.25, label: "Strong" },
];

const loanComparisonData = [
  { name: "Income Docs", dscr: 0, conventional: 100 },
  { name: "Closing Speed", dscr: 85, conventional: 45 },
  { name: "Property Limit", dscr: 100, conventional: 25 },
  { name: "LLC Eligible", dscr: 100, conventional: 0 },
];

export default function DSCRLoansGuidePage() {
  const [rentAmount, setRentAmount] = useState(2500);
  const [pitiAmount, setPitiAmount] = useState(2000);
  
  const calculatedDSCR = pitiAmount > 0 ? (rentAmount / pitiAmount).toFixed(2) : "0.00";
  const dscrValue = parseFloat(calculatedDSCR);
  
  const getDSCRStatus = () => {
    if (dscrValue >= 1.25) return { label: "Strong Cash Flow", color: "text-green-500", bg: "bg-green-500/10" };
    if (dscrValue >= 1.0) return { label: "Positive Cash Flow", color: "text-blue-500", bg: "bg-blue-500/10" };
    if (dscrValue >= 0.75) return { label: "Negative Cash Flow", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { label: "High Risk", color: "text-red-500", bg: "bg-red-500/10" };
  };

  useEffect(() => {
    document.title = "The Complete Guide to DSCR Rental Property Loans | Sequel Investments";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = "Learn everything about DSCR loans for rental property investors. Discover how debt service coverage ratio works, qualification requirements, and how to scale your portfolio.";
    if (metaDescription) {
      metaDescription.setAttribute("content", descriptionContent);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = descriptionContent;
      document.head.appendChild(meta);
    }
    
    window.scrollTo(0, 0);
  }, []);

  const status = getDSCRStatus();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl">
            <Link href="/resources">
              <Button variant="ghost" size="sm" className="gap-2 mb-6 text-white/70 hover:text-white hover:bg-white/10" data-testid="link-back-resources">
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Button>
            </Link>
            
            <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary border-primary/30">
              Guide
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight" data-testid="text-article-title">
              The Complete Guide to DSCR Rental Property Loans
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated December 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>12 min read</span>
              </div>
            </div>

            {/* Key Points */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Income-Based Qualification</h3>
                      <p className="text-sm text-white/70">Qualify using rental income instead of personal W-2s or tax returns.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Shield className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">LLC Protection</h3>
                      <p className="text-sm text-white/70">Borrow through your entity to protect personal assets.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Unlimited Properties</h3>
                      <p className="text-sm text-white/70">Scale your portfolio without hitting lending caps.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          
          {/* Expert Quote - Featured */}
          <Card className="my-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-l-primary">
            <CardContent className="p-6">
              <blockquote className="text-lg font-medium text-foreground mb-3">
                "DSCR loans revolutionize investment property financing by qualifying you based on rental income—not your personal income, tax returns, or W-2s."
              </blockquote>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold">Griffin Funding</span>
                <span>|</span>
                <span>#1 Direct-to-Consumer DSCR Lender</span>
                <a href="https://griffinfunding.com/non-qm-mortgages/debt-service-coverage-ratio-investor-loans/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">What is a DSCR Loan?</h2>

          <p className="mb-6">
            A Debt Service Coverage Ratio (DSCR) loan qualifies borrowers based on a property's rental income rather than personal income. This financing structure works well for investors with complex tax situations, multiple properties, or self-employment income that proves difficult to document through traditional means.
          </p>

          <p className="mb-6">
            DSCR loans focus on one metric: can the property pay for itself? The calculation divides monthly rental income by monthly debt obligations (Principal, Interest, Taxes, Insurance, and Association dues—PITIA).
          </p>

          {/* Interactive DSCR Calculator */}
          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Interactive DSCR Calculator</h3>
              <p className="text-sm text-muted-foreground mb-6">Adjust the sliders to see how rent and expenses affect your DSCR</p>
              
              <div className="grid md:grid-cols-2 gap-8" data-testid="calculator-dscr">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Monthly Rent</label>
                      <span className="text-sm font-bold text-primary">${rentAmount.toLocaleString()}</span>
                    </div>
                    <Slider
                      value={[rentAmount]}
                      onValueChange={(value) => setRentAmount(value[0])}
                      min={1000}
                      max={10000}
                      step={100}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Monthly PITIA</label>
                      <span className="text-sm font-bold">${pitiAmount.toLocaleString()}</span>
                    </div>
                    <Slider
                      value={[pitiAmount]}
                      onValueChange={(value) => setPitiAmount(value[0])}
                      min={500}
                      max={8000}
                      step={50}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${status.bg}`}>
                  <div className="text-5xl font-bold mb-2">{calculatedDSCR}</div>
                  <div className="text-sm text-muted-foreground mb-2">DSCR Ratio</div>
                  <Badge className={status.color}>{status.label}</Badge>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    {dscrValue >= 1.0 
                      ? `Property generates $${(rentAmount - pitiAmount).toLocaleString()} monthly cash flow`
                      : `Property requires $${(pitiAmount - rentAmount).toLocaleString()} monthly to cover expenses`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">How DSCR Affects Your Rate</h2>

          <p className="mb-6">
            Higher DSCR ratios generally result in better rates. Properties generating strong cash flow present less risk to lenders.
          </p>

          {/* DSCR Rate Chart */}
          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Interest Rate by DSCR Range</h3>
              <p className="text-sm text-muted-foreground mb-6">Approximate rates based on market conditions (December 2025)</p>
              <div className="h-[300px]" data-testid="chart-dscr-rates">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dscrComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="label" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      domain={[5, 9]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Interest Rate']}
                    />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                      {dscrComparisonData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.rate <= 7 ? 'hsl(var(--primary))' : entry.rate <= 7.5 ? 'hsl(142 76% 36%)' : 'hsl(var(--muted-foreground))'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">DSCR Loans vs. Conventional Mortgages</h2>

          <p className="mb-6">
            DSCR loans differ from conventional mortgages in several key areas:
          </p>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  DSCR Loan Advantages
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    No personal income verification required
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Borrow through LLC for asset protection
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    No cap on number of financed properties
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Close in 14-21 days (10 days expedited)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Short-term rental friendly
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-500" />
                  Conventional Loan Comparison
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Requires W-2s, tax returns, pay stubs</li>
                  <li>Personal borrowing only (no LLC)</li>
                  <li>Limited to 4-10 mortgages typically</li>
                  <li>30-45 day closing timeline</li>
                  <li>Lower interest rates (0.5-1.5% less)</li>
                  <li>Lower down payment options available</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Inline CTA */}
          <div className="my-8">
            <PortalSignUpCTA 
              variant="inline"
              title="Want to compare financing options?"
              description="Create a free account to run side-by-side loan comparisons"
            />
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Qualification Requirements</h2>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Credit Score</h4>
                <p className="text-sm text-muted-foreground">Minimum 660 FICO. Scores of 740+ receive the most competitive rates.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Down Payment</h4>
                <p className="text-sm text-muted-foreground">20-25% for most programs. Higher down payments offset lower credit scores or DSCR.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Property Types</h4>
                <p className="text-sm text-muted-foreground">Single-family, 2-4 units, townhomes, condos, short-term rentals, small multifamily (5-10 units).</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Documentation</h4>
                <p className="text-sm text-muted-foreground">Lease agreement or market rent analysis, property insurance, bank statements for reserves.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">DSCR Loan Terms at Sequel Investments</h2>

          <Card className="my-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Interest Rates</span>
                  <span className="font-semibold">Starting at 5.75%</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Loan Amounts</span>
                  <span className="font-semibold">$100K - $3M</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">LTV (Purchase/Refi)</span>
                  <span className="font-semibold">Up to 80%</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">LTV (Cash-Out)</span>
                  <span className="font-semibold">Up to 75%</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Term Options</span>
                  <span className="font-semibold">30-Year Fixed or 5/6 ARM</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">DSCR Requirement</span>
                  <span className="font-semibold text-primary">No Minimum</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">The Application Process</h2>

          <div className="space-y-4 mb-8">
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold">Identify Your Property</h4>
                  <p className="text-sm text-muted-foreground">Research market rents using Rentometer, Zillow estimates, or local property managers.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold">Calculate Your DSCR</h4>
                  <p className="text-sm text-muted-foreground">Divide monthly rental income by projected PITIA. Use our calculator above or the full <Link href="/calculator" className="text-primary hover:underline">DSCR Calculator</Link>.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold">Gather Documentation</h4>
                  <p className="text-sm text-muted-foreground">Prepare lease agreement (or market rent analysis), bank statements for reserves, and insurance quotes.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold">Submit Application</h4>
                  <p className="text-sm text-muted-foreground">Apply online and receive a preliminary term sheet within 24 hours.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
                <div>
                  <h4 className="font-semibold">Close Your Loan</h4>
                  <p className="text-sm text-muted-foreground">Most DSCR loans close in 14-21 days. Expedited closings available in 10 days with complete documentation.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Can I use a DSCR loan for my first rental property?</h4>
                <p className="text-sm text-muted-foreground">Yes. DSCR loans work for both new and experienced investors. First-time investors may see slightly higher rates or down payment requirements.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">What if my property has no rental history?</h4>
                <p className="text-sm text-muted-foreground">We use a market rent analysis from an appraiser to estimate rental income for properties without existing leases.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Can I refinance an existing rental into a DSCR loan?</h4>
                <p className="text-sm text-muted-foreground">Yes. Rate-and-term refinances and cash-out refinances both available. A popular strategy for accessing equity from appreciated properties.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Do DSCR loans have prepayment penalties?</h4>
                <p className="text-sm text-muted-foreground">Options available both with and without prepayment penalties. Choose based on your investment strategy.</p>
              </CardContent>
            </Card>
          </div>

          {/* Embedded Calculator */}
          <div className="my-12">
            <h2 className="text-2xl font-bold mb-2">Estimate Your DSCR Loan</h2>
            <p className="text-muted-foreground mb-6">Run your numbers below to see estimated rates and cash flow. Create a free account to save scenarios and access detailed analysis.</p>
            <div className="grid md:grid-cols-2 gap-8">
              <ArticleDSCRCalculator />
              <PortalSignUpCTA 
                loanType="dscr" 
                title="Unlock Full Deal Analysis"
                description="Save unlimited scenarios, compare properties, and track your portfolio in one place."
              />
            </div>
          </div>

          {/* Final CTA Banner */}
          <div className="mt-12">
            <PortalSignUpCTA 
              variant="banner"
              title="Ready to Scale Your Rental Portfolio?"
              description="Join thousands of investors using our platform to analyze DSCR deals, track applications, and close faster with rates starting at 5.75%."
            />
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
