import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, FileText, DollarSign, CheckCircle, ClipboardList, Users, AlertTriangle, ExternalLink, Check } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const budgetBreakdownData = [
  { category: "Kitchen", amount: 12150, color: "hsl(var(--primary))" },
  { category: "Bathrooms", amount: 9800, color: "hsl(142 76% 36%)" },
  { category: "Exterior", amount: 8500, color: "hsl(217 91% 60%)" },
  { category: "Flooring", amount: 6500, color: "hsl(280 65% 60%)" },
  { category: "HVAC", amount: 4500, color: "hsl(350 80% 60%)" },
  { category: "Paint", amount: 4000, color: "hsl(40 90% 50%)" },
  { category: "Living Areas", amount: 4200, color: "hsl(180 60% 45%)" },
  { category: "Bedrooms", amount: 3600, color: "hsl(var(--muted-foreground))" },
];

const timelineData = [
  { week: "Week 1", phase: "Demo & Prep", progress: 100 },
  { week: "Week 2-3", phase: "Rough Work", progress: 100 },
  { week: "Week 4", phase: "Walls & Ceilings", progress: 100 },
  { week: "Week 5", phase: "Finishes", progress: 100 },
  { week: "Week 6", phase: "Kitchen & Bath", progress: 100 },
  { week: "Week 7", phase: "Final Finishes", progress: 100 },
  { week: "Week 8", phase: "Completion", progress: 100 },
];

const drawScheduleData = [
  { phase: "Deposit", percentage: 10, amount: 7124 },
  { phase: "Phase 1", percentage: 25, amount: 17810 },
  { phase: "Phase 2", percentage: 30, amount: 21373 },
  { phase: "Phase 3", percentage: 25, amount: 17810 },
  { phase: "Final", percentage: 10, amount: 7124 },
];

export default function ScopeOfWorkGuidePage() {
  useEffect(() => {
    document.title = "The Ins and Outs of Your Scope of Work | Sequel Investments";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = "Learn how to create a professional Scope of Work (SOW) for your fix and flip project. A detailed SOW ensures accurate budgeting, contractor accountability, and lender confidence.";
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

  const totalBudget = budgetBreakdownData.reduce((sum, item) => sum + item.amount, 0);
  const contingency = Math.round(totalBudget * 0.15);
  const grandTotal = totalBudget + contingency;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80')] bg-cover bg-center opacity-20" />
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
              Project Management Guide
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight" data-testid="text-article-title">
              The Ins and Outs of Your Scope of Work
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated December 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>9 min read</span>
              </div>
            </div>

            {/* Key Points */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Project Blueprint</h3>
                      <p className="text-sm text-white/70">Documents every task, material, cost, and timeline from start to finish.</p>
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
                      <h3 className="font-semibold text-white mb-1">Budget Control</h3>
                      <p className="text-sm text-white/70">Prevents scope creep and cost overruns with formal change order processes.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <CheckCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Lender Confidence</h3>
                      <p className="text-sm text-white/70">Demonstrates project planning competence and supports draw requests.</p>
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
                "A detailed SOW helps prevent the dreaded 'while we're at it' syndrome, where small additions snowball into major budget overruns. If it isn't in the SOW, it requires a formal change order."
              </blockquote>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold">BiggerPockets</span>
                <span>|</span>
                <span>Real Estate Investor Community</span>
                <a href="https://www.biggerpockets.com/blog/scope-of-work-construction" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">What Is a Scope of Work?</h2>

          <p className="mb-6">
            A Scope of Work (SOW) is a detailed outline of all planned construction and renovations for your investment project. It documents every task, material, cost, and timeline—the blueprint for your entire rehab.
          </p>

          <p className="mb-6">
            For fix and flip investors, a comprehensive SOW guides contractors, keeps projects on budget, satisfies lender requirements, and protects against scope creep and cost overruns.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">Why Your SOW Matters</h2>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Accurate ARV Estimation
                </h4>
                <p className="text-sm text-muted-foreground">Your After Repair Value projection depends on renovation planning. A detailed SOW ensures realistic profit projections.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Contractor Accountability
                </h4>
                <p className="text-sm text-muted-foreground">Detailed, organized documentation sets clear expectations and reduces misunderstandings throughout the project.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Lender Confidence
                </h4>
                <p className="text-sm text-muted-foreground">Private lenders rely on your SOW to underwrite loans. It demonstrates thorough project planning and cost understanding.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Draw Management
                </h4>
                <p className="text-sm text-muted-foreground">Your SOW forms the basis for construction draws, defining what work must be completed before each payment is released.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Sample Budget Breakdown</h2>

          <p className="mb-6">
            A professional SOW organizes costs by category for clear tracking and draw management. Here's a typical breakdown for a cosmetic renovation:
          </p>

          {/* Budget Chart */}
          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Renovation Budget by Category</h3>
              <p className="text-sm text-muted-foreground mb-6">Sample fix and flip budget allocation</p>
              <div className="h-[400px]" data-testid="chart-budget-breakdown">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetBreakdownData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="category"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      width={75}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Budget']}
                    />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                      {budgetBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Subtotal</div>
                    <div className="font-bold">${totalBudget.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Contingency (15%)</div>
                    <div className="font-bold">${contingency.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Budget</div>
                    <div className="font-bold text-primary">${grandTotal.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">Project Timeline</h2>

          <p className="mb-6">
            A realistic schedule keeps contractors accountable and helps lenders understand draw timing. Build in buffer time for permit delays, weather, and material backorders.
          </p>

          <Card className="my-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">8-Week Renovation Timeline</h3>
              <div className="space-y-4">
                {timelineData.map((item, index) => (
                  <div key={item.week} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-20 text-sm font-medium">{item.week}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{item.phase}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">Draw Schedule</h2>

          <p className="mb-6">
            Most rehab loans fund construction costs through draws—installments released as work completes. Tie payments to milestones for accountability.
          </p>

          <Card className="my-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sample Draw Schedule (${grandTotal.toLocaleString()} Budget)</h3>
              <div className="space-y-3">
                {drawScheduleData.map((draw) => (
                  <div key={draw.phase} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{draw.percentage}%</Badge>
                      <span className="font-medium">{draw.phase}</span>
                    </div>
                    <span className="font-bold">${Math.round(grandTotal * (draw.percentage / 100)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">Core SOW Components</h2>

          <div className="space-y-4 mb-8">
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold">Project Overview</h4>
                  <p className="text-sm text-muted-foreground">Property address, current condition, investment strategy (flip, BRRRR, rental), target ARV, and overall renovation goals.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold">Exterior Scope</h4>
                  <p className="text-sm text-muted-foreground">Roof (repair vs. replace), siding/paint, landscaping, windows, doors, driveway, fencing, and gutters.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold">Interior Scope (Room by Room)</h4>
                  <p className="text-sm text-muted-foreground">Detailed breakdown for kitchen, each bathroom, living areas, bedrooms, and garage with specific materials, specifications, and costs.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold">Systems and Infrastructure</h4>
                  <p className="text-sm text-muted-foreground">Electrical (panel, circuits, fixtures), plumbing (water heater, supply/drain lines), and HVAC (system age, repairs, ductwork).</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
                <div>
                  <h4 className="font-semibold">Budget Summary</h4>
                  <p className="text-sm text-muted-foreground">Costs compiled by category with 15-20% contingency. Include permits, dumpster/cleanup, and holding costs.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">6</div>
                <div>
                  <h4 className="font-semibold">Timeline & Contractor Info</h4>
                  <p className="text-sm text-muted-foreground">Realistic schedule with phases, contractor names/licenses, and permit requirements documented.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">SOW Best Practices</h2>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card className="border-green-500/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Be Specific
                </h4>
                <p className="text-sm text-muted-foreground">Instead of "new kitchen faucet," write "Delta Fuse single-handle pull-down faucet, brushed nickel, model #9159-AR-DST."</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Include Material Specs
                </h4>
                <p className="text-sm text-muted-foreground">Document brand names, model numbers, colors/finishes, and quality level for every selection.</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Build in Contingency
                </h4>
                <p className="text-sm text-muted-foreground">Always include 15-20% for unexpected issues. Older properties especially reveal surprises during demolition.</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Document with Photos
                </h4>
                <p className="text-sm text-muted-foreground">Take photos of current condition for each area. Creates a baseline for comparison and helps resolve disputes.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Common SOW Mistakes</h2>

          <div className="space-y-4 mb-8">
            <Card className="border-amber-500/30">
              <CardContent className="p-4 flex gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Underestimating Costs</h4>
                  <p className="text-sm text-muted-foreground">New investors often miss permit fees, dumpster rentals, utility costs during rehab, final cleaning/staging, and holding costs.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30">
              <CardContent className="p-4 flex gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Overlooking Hidden Issues</h4>
                  <p className="text-sm text-muted-foreground">Budget for likely discoveries: water damage behind walls, outdated electrical, plumbing issues, pest damage, foundation concerns.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30">
              <CardContent className="p-4 flex gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Scope Creep</h4>
                  <p className="text-sm text-muted-foreground">Each addition should go through a formal change order process with cost and timeline impact documented before work begins.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30">
              <CardContent className="p-4 flex gap-4">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Timeline Optimism</h4>
                  <p className="text-sm text-muted-foreground">Add buffer time for permit delays, weather issues, contractor availability, and material backorders.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">What Lenders Want to See</h2>

          <p className="mb-6">
            Private and hard money lenders evaluate your SOW for feasibility, completeness, cost accuracy, ARV support, and evidence of investor competence.
          </p>

          <Card className="my-8 bg-muted/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">SOW Submission Checklist</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Complete room-by-room breakdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Specific material selections</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Verified cost estimates (contractor bids)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Realistic timeline with contingency</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Contractor information and licenses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Permit requirements documented</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Before photos of current condition</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">15-20% contingency included</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-3">Ready to Get Your Fix & Flip Funded?</h3>
              <p className="text-muted-foreground mb-6">
                Our fix and flip loans offer up to 90% of purchase price, up to 100% of rehab costs, 48-hour draw turnaround, and rates from 8.90%. Our team can help you refine your SOW and structure financing that matches your project.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/get-quote">
                  <Button size="lg" data-testid="button-get-quote">
                    Submit Your Deal
                  </Button>
                </Link>
                <Link href="/resources/top-renovations-to-maximize-profits">
                  <Button variant="outline" size="lg" data-testid="button-renovations-guide">
                    View Renovations Guide
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
