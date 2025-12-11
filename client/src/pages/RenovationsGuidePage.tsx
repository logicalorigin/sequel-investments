import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, Hammer, DollarSign, TrendingUp, Home, PaintBucket, ExternalLink, Check, AlertTriangle } from "lucide-react";
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
} from "recharts";

interface RenovationDataItem {
  project: string;
  roi: number;
  cost: number;
  color: string;
}

const renovationRoiData: RenovationDataItem[] = [
  { project: "Garage Door", roi: 194, cost: 4513, color: "hsl(var(--primary))" },
  { project: "Steel Entry Door", roi: 188, cost: 2355, color: "hsl(var(--primary))" },
  { project: "Stone Veneer", roi: 153, cost: 11000, color: "hsl(142 76% 36%)" },
  { project: "Grand Entrance", roi: 97, cost: 11000, color: "hsl(142 76% 36%)" },
  { project: "Minor Kitchen", roi: 80, cost: 25000, color: "hsl(217 91% 60%)" },
  { project: "Bathroom Remodel", roi: 73, cost: 24000, color: "hsl(217 91% 60%)" },
  { project: "Wood Deck", roi: 83, cost: 25000, color: "hsl(217 91% 60%)" },
  { project: "Vinyl Windows", roi: 67, cost: 20000, color: "hsl(var(--muted-foreground))" },
];

const flooringCostData = [
  { type: "LVP (DIY)", low: 3, high: 7 },
  { type: "Engineered Hardwood", low: 6, high: 12 },
  { type: "Hardwood Refinish", low: 3, high: 8 },
  { type: "Commercial Carpet", low: 2, high: 4 },
  { type: "Tile", low: 5, high: 15 },
];

export default function RenovationsGuidePage() {
  useEffect(() => {
    document.title = "Top Renovations to Maximize Profits for Real Estate Investors | Sequel Investments";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = "Discover which home renovations offer the best ROI for real estate investors. Learn budget-smart upgrade strategies for kitchens, bathrooms, curb appeal, and more.";
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
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1920&q=80')] bg-cover bg-center opacity-20" />
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
              Fix & Flip Guide
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight" data-testid="text-article-title">
              Top Renovations to Maximize Profits for Real Estate Investors
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated December 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>8 min read</span>
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
                      <h3 className="font-semibold text-white mb-1">194% ROI Leader</h3>
                      <p className="text-sm text-white/70">Garage door replacement delivers the highest return of any renovation project.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Home className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Exterior Wins</h3>
                      <p className="text-sm text-white/70">Curb appeal projects consistently outperform major interior renovations.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <DollarSign className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Minor Over Major</h3>
                      <p className="text-sm text-white/70">A minor kitchen refresh (80% ROI) vastly outperforms a luxury gut job (30-40%).</p>
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
                "Exterior improvements consistently outperform major interior renovations. A garage door replacement can nearly double your investment while a luxury kitchen overhaul might only return 30-40 cents on the dollar."
              </blockquote>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold">2024 Cost vs. Value Report</span>
                <span>|</span>
                <span>Zonda/Remodeling Magazine</span>
                <a href="https://www.remodeling.hw.net/cost-vs-value" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">Renovation ROI by Project Type</h2>

          <p className="mb-6">
            Every dollar spent on renovations should increase property value and buyer appeal. With rising labor and material costs, focusing on upgrades that deliver measurable returns separates profitable projects from expensive lessons.
          </p>

          {/* ROI Chart */}
          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Return on Investment by Renovation Type</h3>
              <p className="text-sm text-muted-foreground mb-6">Based on 2024 Cost vs. Value Report data</p>
              <div className="h-[400px]" data-testid="chart-renovation-roi">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={renovationRoiData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      domain={[0, 200]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="project"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      width={95}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload as RenovationDataItem;
                          return (
                            <div className="bg-card border border-border rounded-lg p-3">
                              <p className="font-semibold">{data.project}</p>
                              <p className="text-sm text-muted-foreground">
                                {data.roi}% ROI (${data.cost.toLocaleString()} avg cost)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                      {renovationRoiData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.roi >= 150 ? 'hsl(var(--primary))' : entry.roi >= 75 ? 'hsl(142 76% 36%)' : 'hsl(217 91% 60%)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">The Renovation Priority Hierarchy</h2>

          <p className="mb-6">
            Successful renovation projects follow a clear prioritization framework. Address essential repairs first, then high-impact cosmetics, and consider optional improvements last.
          </p>

          <div className="grid gap-4 mb-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="default">Tier 1</Badge>
                  Essential Improvements (First Priority)
                </h4>
                <p className="text-sm text-muted-foreground mb-3">Non-negotiable repairs affecting habitability. Buyers and inspectors will flag these issues—unaddressed, they kill deals or justify significant price reductions.</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Roof</Badge>
                  <Badge variant="secondary">HVAC</Badge>
                  <Badge variant="secondary">Plumbing</Badge>
                  <Badge variant="secondary">Electrical</Badge>
                  <Badge variant="secondary">Foundation</Badge>
                  <Badge variant="secondary">Water Damage</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge className="bg-green-500">Tier 2</Badge>
                  High-Impact Cosmetic Updates
                </h4>
                <p className="text-sm text-muted-foreground mb-3">These create the visual appeal that drives buyer interest and premium pricing without breaking the budget.</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Fresh Paint</Badge>
                  <Badge variant="secondary">Flooring</Badge>
                  <Badge variant="secondary">Kitchen Refresh</Badge>
                  <Badge variant="secondary">Bathroom Updates</Badge>
                  <Badge variant="secondary">Curb Appeal</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge className="bg-blue-500">Tier 3</Badge>
                  Nice-to-Haves (After Budget Allows)
                </h4>
                <p className="text-sm text-muted-foreground mb-3">Consider only after Tier 1 and 2 are complete. These may or may not provide positive ROI depending on the market.</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Smart Home</Badge>
                  <Badge variant="secondary">Landscaping</Badge>
                  <Badge variant="secondary">Finished Basement</Badge>
                  <Badge variant="secondary">Deck Addition</Badge>
                  <Badge variant="secondary">Pool</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Kitchen Renovations</h2>

          <p className="mb-6">
            Kitchens consistently rank as the most important room for buyers and renters. A mid-range kitchen remodel typically delivers 72-80% ROI. The key: minor updates beat major overhauls.
          </p>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Cabinet Refresh
                </h4>
                <p className="text-sm text-muted-foreground">Refacing with new doors and hardware costs 50% less than replacement while achieving similar visual impact. Save $7,000-$15,000.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Countertop Upgrades
                </h4>
                <p className="text-sm text-muted-foreground">Quartz and granite at $50-$100/sq ft installed. Butcher block offers a trendy, affordable alternative at lower cost.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Appliance Strategy
                </h4>
                <p className="text-sm text-muted-foreground">Stainless steel remains standard. Focus on the "big three" (fridge, range, dishwasher). Mid-range for rentals, premium for luxury flips.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Backsplash Impact
                </h4>
                <p className="text-sm text-muted-foreground">$800-$2,000 investment with major visual impact. Subway tile offers classic appeal at budget-friendly prices.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Bathroom Updates</h2>

          <p className="mb-6">
            Bathrooms deliver approximately 60-74% ROI on mid-range remodels. Focus on high-impact updates while controlling costs.
          </p>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Vanity Replacement</h4>
                <p className="text-sm text-muted-foreground">Pre-fabricated sets (cabinet, sink, countertop) cost $300-$1,000 and instantly update the space.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Fixture Upgrades</h4>
                <p className="text-sm text-muted-foreground">New faucets, showerheads, and hardware under $500 signal quality throughout the entire bathroom.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Tub/Shower Refresh</h4>
                <p className="text-sm text-muted-foreground">Before replacing, consider refinishing ($300-$600), reglazing, or new glass shower doors.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Flooring Solutions</h4>
                <p className="text-sm text-muted-foreground">Clean and regrout existing tile, or install waterproof vinyl plank for a durable, affordable update.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Flooring Options</h2>

          <p className="mb-6">
            Flooring sets the tone for the entire property. Luxury Vinyl Plank (LVP) has become the investor's flooring of choice: waterproof, scratch-resistant, easy DIY installation, and realistic wood looks at lower cost.
          </p>

          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Flooring Cost Comparison</h3>
              <p className="text-sm text-muted-foreground mb-6">Cost per square foot (installed)</p>
              <div className="space-y-4">
                {flooringCostData.map((item) => (
                  <div key={item.type} className="flex items-center gap-4">
                    <span className="w-40 text-sm font-medium">{item.type}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(item.high / 15) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-24">${item.low}-${item.high}/sf</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">Curb Appeal: The 7% Premium</h2>

          <p className="mb-6">
            First impressions matter. Studies show buyers pay up to 7% more for homes with strong curb appeal. These updates often cost relatively little but make a significant impact.
          </p>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  Front Door Focus
                </h4>
                <p className="text-sm text-muted-foreground">Fresh paint in a bold, complementary color. New hardware (handle, knocker, house numbers). New door if dated ($500-$2,000).</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <PaintBucket className="h-4 w-4 text-primary" />
                  Landscaping Basics
                </h4>
                <p className="text-sm text-muted-foreground">Fresh mulch ($200-$500), trimmed bushes, seasonal flowers, clean and edged walkways.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Hammer className="h-4 w-4 text-primary" />
                  Exterior Paint
                </h4>
                <p className="text-sm text-muted-foreground">Touch up trim and shutters, front porch, and garage doors. Full exterior paint if peeling or dated.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Lighting Updates
                </h4>
                <p className="text-sm text-muted-foreground">New porch light ($50-$200), pathway lighting ($100-$300), illuminated address numbers.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Budget Management</h2>

          <Card className="my-8 bg-blue-500/10 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2">The 70% Rule</h4>
              <p className="text-muted-foreground mb-4">For fix and flip projects:</p>
              <div className="bg-background/50 p-4 rounded-lg font-mono text-center">
                Maximum Purchase Price = (ARV × 0.70) - Renovation Costs
              </div>
              <p className="text-sm text-muted-foreground mt-4">This ensures room for profit after acquisition, renovation, holding costs, and selling expenses.</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Contingency Planning</h4>
                <p className="text-sm text-muted-foreground">Budget 10-20% above renovation estimate for hidden issues, material cost increases, timeline extensions, and permit requirements.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Cost-Saving Tactics</h4>
                <p className="text-sm text-muted-foreground">Multiple contractor bids, materials during sales, prefabricated elements, cosmetic over structural focus, DIY for simple tasks.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Mistakes to Avoid</h2>

          <div className="space-y-4 mb-8">
            <Card className="border-amber-500/30">
              <CardContent className="p-4 flex gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Over-Improvement</h4>
                  <p className="text-sm text-muted-foreground">Creating the most expensive house in a modest neighborhood. Research comparable sales and match renovation levels to area expectations.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30">
              <CardContent className="p-4 flex gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Trendy Over Timeless</h4>
                  <p className="text-sm text-muted-foreground">Avoid bold accent walls, ultra-modern fixtures, and niche color palettes. Stick to neutral finishes that appeal to the broadest audience.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30">
              <CardContent className="p-4 flex gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Skipping Permits</h4>
                  <p className="text-sm text-muted-foreground">Unpermitted work can kill deals during inspection, create liability issues, reduce property value, and lead to costly corrections.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Creating Your Renovation Plan</h2>

          <div className="space-y-4 mb-8">
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold">Property Assessment</h4>
                  <p className="text-sm text-muted-foreground">Walk through with a contractor. Note required repairs (Tier 1), cosmetic update opportunities (Tier 2), and optional improvements (Tier 3).</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold">Budget Development</h4>
                  <p className="text-sm text-muted-foreground">Get detailed bids for each category. Include labor, materials, permits, and 15-20% contingency.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold">Timeline Creation</h4>
                  <p className="text-sm text-muted-foreground">Sequence work: demolition, rough-in (electrical/plumbing/HVAC), drywall, painting, flooring, fixtures, final touches.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold">Contractor Selection</h4>
                  <p className="text-sm text-muted-foreground">Evaluate experience with similar projects, references, license and insurance, detailed bid breakdown, and communication style.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-3">Ready to Finance Your Renovation Project?</h3>
              <p className="text-muted-foreground mb-6">
                Sequel Investments offers Fix & Flip loans up to 90% of purchase + 100% of rehab, bridge loans for value-add projects, and DSCR loans for post-renovation refinancing.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/get-quote">
                  <Button size="lg" data-testid="button-get-quote">
                    Get Your Renovation Financing
                  </Button>
                </Link>
                <Link href="/resources/scope-of-work-guide">
                  <Button variant="outline" size="lg" data-testid="button-scope-of-work">
                    View Scope of Work Guide
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
