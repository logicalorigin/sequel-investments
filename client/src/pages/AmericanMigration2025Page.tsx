import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, User, Linkedin, TrendingDown, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";

const outOfStateMortgageData = [
  { year: "2019", percentage: 18.2 },
  { year: "2020", percentage: 19.8 },
  { year: "2021", percentage: 21.5 },
  { year: "2022", percentage: 22.8 },
  { year: "2023", percentage: 21.2 },
  { year: "2024", percentage: 20.5 },
  { year: "2025", percentage: 20.3 },
];

const stateMigrationData = [
  { state: "South Carolina", inbound: 1.85, outbound: 1.0, net: 0.85 },
  { state: "Texas", inbound: 1.65, outbound: 1.0, net: 0.65 },
  { state: "Florida", inbound: 1.45, outbound: 1.0, net: 0.45 },
  { state: "North Carolina", inbound: 1.40, outbound: 1.0, net: 0.40 },
  { state: "Tennessee", inbound: 1.35, outbound: 1.0, net: 0.35 },
  { state: "Georgia", inbound: 1.25, outbound: 1.0, net: 0.25 },
  { state: "Nevada", inbound: 1.20, outbound: 1.0, net: 0.20 },
  { state: "Arizona", inbound: 1.15, outbound: 1.0, net: 0.15 },
];

export default function AmericanMigration2025Page() {
  useEffect(() => {
    document.title = "The Great American Reshuffle | Sequel Investments";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = "High mortgage rates and the lock-in effect have slowed interstate migration. Discover how generational shifts and rising insurance costs are reshaping American migration patterns in 2025.";
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
      {/* Navigation */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <Link href="/resources">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="link-back-resources">
              <ArrowLeft className="h-4 w-4" />
              Back to Resources
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl">
            <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary border-primary/30">
              Property Market Economics
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-article-title">
              The Great American Reshuffle
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>December 5, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>By Archana Pradhan</span>
                <a href="https://www.linkedin.com/in/archana-pradhan-59816354/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Key Points */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Migration Stalls</h3>
                      <p className="text-sm text-white/70">High mortgage rates and the "lock-in effect" have slowed interstate moves, creating a stagnant market despite rising inventory.</p>
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
                      <h3 className="font-semibold text-white mb-1">Generational Shifts</h3>
                      <p className="text-sm text-white/70">Young buyers are now flocking to Texas and South Carolina for jobs. Rising insurance costs are forcing residents across generations out of Florida.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Hidden Costs</h3>
                      <p className="text-sm text-white/70">Americans are chasing affordability in disaster-prone areas, trading lower sale prices for spiking insurance premiums and long-term risk.</p>
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
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            Although trends in the American housing market are cyclical there is one constant: a search for affordability. At the beginning of the millennium, affordability came in the form of suburban sprawl. During the pandemic, remote work transformed affordability to look like Sunbelt markets far from traditional job centers. Now, it's increasingly looking like staying in place.
          </p>

          <p className="mb-6">
            A combination of economic uncertainty, tighter lending criteria, and a persistent gap between buyer and seller expectations is stagnating the market. Since the height of interstate migration in 2022, loan applications for out-of-state moves dropped 2.5 percentage points.
          </p>

          {/* Chart 1: Out-of-State Mortgage Applications */}
          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Share of Out-of-State Mortgage Applications by Year</h3>
              <p className="text-sm text-muted-foreground mb-6">Data source: Cotality, 2025</p>
              <div className="h-[350px]" data-testid="chart-mortgage-applications">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={outOfStateMortgageData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="year" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      domain={[16, 24]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Out-of-State Applications']}
                    />
                    <ReferenceLine y={22.8} stroke="hsl(var(--primary))" strokeDasharray="5 5" label={{ value: '2022 Peak', fill: 'hsl(var(--primary))', fontSize: 12 }} />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">The Price of Certainty</h2>

          <p className="mb-6">
            People will always move out of state, but they are doing so about 15% less frequently than they did five years ago. That trend is at odds with the increasing number of homes coming up for sale.
          </p>

          <p className="mb-6">
            A glance at the market reveals that there is more choice than there's been in years, yet buyers aren't biting. The problem is price.
          </p>

          <p className="mb-6">
            In September, the national median list price held at just above $400,000, while mortgage rates hovered near 7%. Those figures have swollen the number of cost-burdened households to a third of those with mortgages. Add in the overall increase in the cost of living, and taking on a new, high-rate mortgage is something many families choose to forego. Data shows closed sales were down 15% year-over-year, despite a 10% rise in pending deals.
          </p>

          <p className="mb-6">
            Home prices aren't the only reason that migration between states is slowing. Experts point to the continued lock-in effect as a major deterrent for interstate moves. Established homeowners with paid off homes or low mortgage interest rates are now hesitant to take on current rates and prices. Plus, an aging population and less opportunity for remote work is also leading to people staying put.
          </p>

          <p className="mb-6">
            Data shows that more seniors are aging in place, which is eroding traditional retirement migration patterns of downsizing and moving to warmer climes. However, the north to south pipeline hasn't completely dried up.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">Changes in Latitude, Changes in Attitude</h2>

          <p className="mb-6">
            The South remains a desirable place to relocate, with Florida, Texas, and the Carolinas welcoming the largest number of newcomers. But American tastes are changing, and it largely depends on age.
          </p>

          <p className="mb-6">
            Data shows that while Florida and Texas dominated in-migration between 2019 and 2023, South Carolina has taken the top spot since 2024. Still, Texas does remain a top destination for younger homebuyers, many of whom come from California and Florida.
          </p>

          <p className="mb-6">
            In 2025, the Lone Star State welcomed the largest number of buyers between the ages of 20 and 35. Many of these buyers were motivated by the state's lower taxes, more affordable housing, and employment opportunities. Similarly, younger homebuyers seeking fewer taxes and more affordable lifestyles are drifting to Nevada from California, and New Yorkers from this age group are applying for mortgages in the neighboring states of New Jersey and Connecticut.
          </p>

          {/* Chart 2: State Migration Ratios */}
          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Ratios of People Moving In and Out of States with High Migration</h3>
              <p className="text-sm text-muted-foreground mb-6">Data source: Cotality, 2025</p>
              <div className="h-[400px]" data-testid="chart-state-migration">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stateMigrationData} 
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      domain={[0, 2]}
                      tickFormatter={(value) => `${value}x`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="state"
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
                      formatter={(value: number, name: string) => {
                        if (name === 'inbound') return [`${value}x`, 'Inbound Ratio'];
                        return [`${value}x`, 'Baseline (Outbound)'];
                      }}
                    />
                    <Legend />
                    <ReferenceLine x={1} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <Bar 
                      dataKey="inbound" 
                      name="Inbound Migration Ratio"
                      radius={[0, 4, 4, 0]}
                    >
                      {stateMigrationData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.net > 0.5 ? 'hsl(var(--primary))' : entry.net > 0.3 ? 'hsl(142 76% 36%)' : 'hsl(217 91% 60%)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Ratio shows inbound migration relative to outbound (1.0 = baseline). Higher values indicate net positive migration.
              </p>
            </CardContent>
          </Card>

          <p className="mb-6">
            High prices, large tax burdens, and quality of life concerns are usually attributed to people moving out of state, but there is increasingly a generational divide as to where these lifestyle considerations are pushing people.
          </p>

          <p className="mb-6">
            Pricey states like California, New York, and Massachusetts are all losing more homebuyers than they're gaining, but different age groups are picking different arrival destinations. Younger generations tend to stay close to their original locations, with Northeasterners staying in the general region and West Coast inhabitants remaining in the Southwest. Those over 55 are more likely to make Florida their new home.
          </p>

          <p className="mb-6">
            While Florida continues to be the third most popular destination for newcomers, data found that migration patterns are shifting along generational lines. Escalating property insurance costs and home prices have pushed younger Floridians to nearby states like South Carolina and Georgia while the older buyers continue to arrive from colder, pricier states.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">A Recipe for Disaster</h2>

          <p className="mb-6">
            Regardless of which generation a homebuyer comes from, they all have one thing in common: they are searching for affordability in areas that are prone to natural disasters.
          </p>

          <Card className="my-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <blockquote className="text-lg italic text-foreground">
                "Affordability tends to be associated with sales price. But lower monthly payments don't always translate to long-term stability, especially in the areas where we see people moving. Insurance costs are likely to make homeowners' futures costly despite the cheap homes that are available today."
              </blockquote>
              <p className="text-sm text-muted-foreground mt-4">— Archana Pradhan, Principal Economist</p>
            </CardContent>
          </Card>

          <p className="mb-6">
            States all along the Gulf Coast and Mid-Atlantic region have seen the cost of homeowners insurance climb over the last several years. Nationwide, costs have increased 74% in the past fifteen years. In some storm-prone states, insurers are withdrawing altogether. In those cases where insurance is unavailable, the costs fall to the homeowner.
          </p>

          <p className="mb-6">
            While home prices may look like a bargain in the states attracting the most Americans, the cost of keeping a home may become too much to bear. Risk is becoming another barrier to homeownership.
          </p>

          <p className="mb-8">
            Florida has already revealed what happens when risk outpaces resilience. Insurers exit. Premiums spike. Properties lose value. Markets freeze. These same patterns may evolve in other states where natural disaster risk is growing unless resilience becomes a cornerstone of homeownership. Left unchecked, the strain created by market unaffordability and escalating natural disaster risk could further stymie Americans ability to move and prevent people from entering homeownership altogether.
          </p>

          {/* Call to Action */}
          <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-3">Planning Your Investment Strategy?</h3>
              <p className="text-muted-foreground mb-6">
                Understanding migration trends is crucial for real estate investors. Let our team help you identify opportunities in growing markets with sustainable long-term value.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/get-quote">
                  <Button size="lg" data-testid="button-get-quote">
                    Get a Quote
                  </Button>
                </Link>
                <Link href="/resources">
                  <Button variant="outline" size="lg" data-testid="button-more-resources">
                    More Resources
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Data and analysis adapted from Cotality research. For educational purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
