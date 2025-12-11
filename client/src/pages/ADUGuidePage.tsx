import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, Home, DollarSign, TrendingUp, Building, Users, ExternalLink, Check, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} from "recharts";

const aduMarketGrowthData = [
  { year: "2020", value: 12.5 },
  { year: "2021", value: 14.2 },
  { year: "2022", value: 15.8 },
  { year: "2023", value: 17.1 },
  { year: "2024", value: 18.0 },
  { year: "2025", value: 19.7 },
  { year: "2030", value: 32.0 },
];

const aduCostData = [
  { type: "Garage Conversion", min: 30000, max: 80000, avg: 55000 },
  { type: "Attached ADU", min: 50000, max: 150000, avg: 100000 },
  { type: "Detached New Build", min: 100000, max: 300000, avg: 200000 },
];

const aduRoiData = [
  { category: "Property Value Increase", percentage: 35, color: "hsl(var(--primary))" },
  { category: "Monthly Rental (Urban)", percentage: 2250, color: "hsl(142 76% 36%)" },
  { category: "Monthly Rental (Suburban)", percentage: 1500, color: "hsl(217 91% 60%)" },
];

const topAduStates = [
  { state: "California", permits: 22000, growth: 1200 },
  { state: "Texas", permits: 8500, growth: 45 },
  { state: "Washington", permits: 6200, growth: 85 },
  { state: "Oregon", permits: 4800, growth: 120 },
  { state: "Florida", permits: 4100, growth: 65 },
];

export default function ADUGuidePage() {
  useEffect(() => {
    document.title = "What Every Real Estate Investor Should Know About ADUs | Sequel Investments";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = "Discover how Accessory Dwelling Units (ADUs) can boost your real estate investment returns. Learn about ADU types, financing options, zoning considerations, and ROI potential.";
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')] bg-cover bg-center opacity-20" />
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
              Investment Guide
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight" data-testid="text-article-title">
              What Every Real Estate Investor Should Know About ADUs
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated December 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>10 min read</span>
              </div>
            </div>

            {/* Key Points */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">35% Value Premium</h3>
                      <p className="text-sm text-white/70">Homes with ADUs sell for significantly more than comparable properties without them.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <DollarSign className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">$19B+ Market</h3>
                      <p className="text-sm text-white/70">ADU market projected to reach $43B by 2034 with 9% annual growth.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">70% Interest Rate</h3>
                      <p className="text-sm text-white/70">Most homeowners would build an ADU if local regulations permitted.</p>
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
                "ADUs are a scalable solution to the housing crisis. We anticipate more homeowners taking advantage of relaxed regulations to build units on their properties, particularly in urban and suburban areas."
              </blockquote>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold">Lisa Sanderson</span>
                <span>|</span>
                <span>Senior Urban Planner</span>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">What Is an Accessory Dwelling Unit?</h2>

          <p className="mb-6">
            An Accessory Dwelling Unit (ADU) is an additional housing unit built on a property with an existing primary residence. Also known as granny flats, in-law suites, or backyard cottages, ADUs typically range from 400 to 1,000 square feet and include all amenities needed for independent living.
          </p>

          <p className="mb-6">
            To qualify as a true ADU, a unit must have a separate entrance from the main home, its own kitchen, a bathroom, and private living and sleeping spaces.
          </p>

          {/* ADU Market Growth Chart */}
          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">ADU Market Growth Trajectory</h3>
              <p className="text-sm text-muted-foreground mb-6">U.S. ADU market value (billions USD)</p>
              <div className="h-[300px]" data-testid="chart-adu-growth">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aduMarketGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="year" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `$${value}B`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value}B`, 'Market Size']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">Types of ADUs</h2>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Detached ADUs
                </h4>
                <p className="text-sm text-muted-foreground mb-2">Standalone structures completely separate from the main house. Converted garages or purpose-built backyard cottages.</p>
                <Badge variant="secondary">Highest Rents</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  Attached ADUs
                </h4>
                <p className="text-sm text-muted-foreground mb-2">Units connected to the primary residence but with their own entrance. Additions built onto the back or side.</p>
                <Badge variant="secondary">Lower Build Cost</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Internal ADUs
                </h4>
                <p className="text-sm text-muted-foreground mb-2">Conversions of existing space: basement apartments, attic conversions, or converted attached garages.</p>
                <Badge variant="secondary">Fastest to Complete</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Construction Cost Chart */}
          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">ADU Construction Costs by Type</h3>
              <p className="text-sm text-muted-foreground mb-6">Typical cost ranges (USD)</p>
              <div className="h-[300px]" data-testid="chart-adu-costs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aduCostData} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="type"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      width={115}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Average Cost']}
                    />
                    <Bar dataKey="avg" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Costs vary by location, materials, and local permit requirements
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">Growth Drivers</h2>

          <p className="mb-6">
            The national share of homes with ADUs has grown from 1.6% in 2000 to nearly 7% today. California alone saw a 1,200% increase in ADU permits between 2016 and 2023.
          </p>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Housing Shortage
                </h4>
                <p className="text-sm text-muted-foreground">ADUs add density without dramatically changing neighborhood character, addressing supply constraints in high-demand markets.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Multigenerational Living
                </h4>
                <p className="text-sm text-muted-foreground">49% of homeowners exploring ADUs for aging family members or adult children. Cultural shifts and economic pressures bring families closer.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Rental Income
                </h4>
                <p className="text-sm text-muted-foreground">Homeowners generate an average 30% of mortgage costs from ADU rentals. Urban ADUs command $1,500-$3,000+ monthly.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Regulatory Changes
                </h4>
                <p className="text-sm text-muted-foreground">61% of municipalities now permit ADUs. 58% of demand comes from cities with recent zoning reform.</p>
              </CardContent>
            </Card>
          </div>

          {/* Expert Quote - Financing */}
          <Card className="my-8 bg-blue-500/10 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <blockquote className="text-lg font-medium text-foreground mb-3">
                "Lenders and financial institutions are beginning to see the value ADUs bring to homeowners and the broader housing market. We're expecting innovative financing products, like ADU-specific mortgages and state-funded subsidies, to gain traction."
              </blockquote>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold">Mark Davis</span>
                <span>|</span>
                <span>Housing Finance Specialist</span>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">Financial Benefits</h2>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Property Value Increase</h4>
                <div className="text-3xl font-bold text-primary mb-2">+35%</div>
                <p className="text-sm text-muted-foreground">Homes with ADUs priced higher than comparable properties without them (Porch.com 2021 study).</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Rental Income Potential</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Urban markets</span>
                    <span className="font-semibold">$1,500-$3,000+/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Suburban markets</span>
                    <span className="font-semibold">$1,000-$2,000/mo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Challenges to Consider</h2>

          <div className="space-y-4 mb-8">
            <Card className="border-amber-500/30">
              <CardContent className="p-4 flex gap-4">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Zoning and Permitting</h4>
                  <p className="text-sm text-muted-foreground">Regulations vary significantly: lot size requirements, setback rules, height restrictions, parking mandates, and owner-occupancy rules. Contact your local planning department before purchasing.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30">
              <CardContent className="p-4 flex gap-4">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Property Tax Increases</h4>
                  <p className="text-sm text-muted-foreground">Adding an ADU increases your property's assessed value. Calculate this into ROI projections before committing to construction.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30">
              <CardContent className="p-4 flex gap-4">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Management Complexity</h4>
                  <p className="text-sm text-muted-foreground">Renting an ADU means becoming a landlord. Consider tenant screening, maintenance, and compliance with landlord-tenant laws.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Investment Strategies</h2>

          <div className="space-y-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Fix and Flip with ADU Addition</h4>
                <p className="text-sm text-muted-foreground">Purchase a property with ADU potential, build the unit, and sell at a premium. The 35% average price increase can translate to significant profits.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Buy and Hold Income Play</h4>
                <p className="text-sm text-muted-foreground">Add an ADU to boost cash flow. The additional income improves your DSCR ratio and helps qualify for better refinancing terms.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">House Hacking</h4>
                <p className="text-sm text-muted-foreground">Live in the main house while renting the ADU, or vice versa. Dramatically reduce housing costs while building equity.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Value-Add Development</h4>
                <p className="text-sm text-muted-foreground">Target properties with existing but outdated ADUs. Renovating can be more cost-effective than new construction while capturing income premium.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Financing Options</h2>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Construction Loans</h4>
                <p className="text-sm text-muted-foreground">For new ADU builds. Funds released as work progresses. Converts to permanent financing upon completion.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">DSCR Refinance</h4>
                <p className="text-sm text-muted-foreground">Pull cash out of an existing property to fund ADU construction. Projected ADU income helps qualify for higher loan amounts.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Home Equity Products</h4>
                <p className="text-sm text-muted-foreground">For owner-occupied properties. HELOCs provide funds at relatively low rates based on existing equity.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Fix and Flip Loans</h4>
                <p className="text-sm text-muted-foreground">Finance both property purchase and ADU construction for projects intended for resale.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Steps to Success</h2>

          <div className="space-y-4 mb-8">
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold">Research Local Regulations</h4>
                  <p className="text-sm text-muted-foreground">Confirm ADU zoning, permitted types, size limits, owner-occupancy requirements, and permit processes before purchasing.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold">Analyze the Numbers</h4>
                  <p className="text-sm text-muted-foreground">Create detailed projections: construction costs, permit fees, utility connections, rental income, timeline, and property tax increases.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold">Secure Financing Early</h4>
                  <p className="text-sm text-muted-foreground">Understand available options, whether projected ADU income counts for qualification, and documentation requirements.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold">Work with Experienced Professionals</h4>
                  <p className="text-sm text-muted-foreground">Engage architects familiar with local ADU codes, experienced contractors, real estate attorneys, and property managers.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
                <div>
                  <h4 className="font-semibold">Plan for Management</h4>
                  <p className="text-sm text-muted-foreground">Develop strategies for marketing, tenant screening, lease terms, maintenance, and compliance before the ADU is complete.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-3">Ready to Finance Your ADU Project?</h3>
              <p className="text-muted-foreground mb-6">
                Sequel Investments offers DSCR loans for properties with existing ADUs, fix and flip loans for ADU addition projects, and construction loans for ground-up development.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/get-quote">
                  <Button size="lg" data-testid="button-get-quote">
                    Speak with a Loan Specialist
                  </Button>
                </Link>
                <Link href="/loan-programs">
                  <Button variant="outline" size="lg" data-testid="button-loan-programs">
                    View Loan Programs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>

      <Footer />
    </div>
  );
}
