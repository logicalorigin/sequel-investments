import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, User, TrendingUp, MapPin, DollarSign, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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
  Cell,
  ReferenceLine,
} from "recharts";

const relocationTrendData = [
  { year: "2019", percentage: 18.2 },
  { year: "2020", percentage: 19.8 },
  { year: "2021", percentage: 21.5 },
  { year: "2022", percentage: 22.8 },
  { year: "2023", percentage: 21.2 },
  { year: "2024", percentage: 20.5 },
  { year: "2025", percentage: 20.3 },
];

const investorHotspotData = [
  { state: "South Carolina", growth: 1.85, color: "hsl(var(--primary))" },
  { state: "Texas", growth: 1.65, color: "hsl(var(--primary))" },
  { state: "Florida", growth: 1.45, color: "hsl(142 76% 36%)" },
  { state: "North Carolina", growth: 1.40, color: "hsl(142 76% 36%)" },
  { state: "Tennessee", growth: 1.35, color: "hsl(217 91% 60%)" },
  { state: "Georgia", growth: 1.25, color: "hsl(217 91% 60%)" },
  { state: "Nevada", growth: 1.20, color: "hsl(217 91% 60%)" },
  { state: "Arizona", growth: 1.15, color: "hsl(217 91% 60%)" },
];

export default function AmericanMigration2025Page() {
  useEffect(() => {
    document.title = "Where Americans Are Moving in 2025: Investment Hotspots | Sequel Investments";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = "Discover where Americans are relocating in 2025 and what it means for real estate investors. Analysis of top growth markets, population trends, and investment opportunities.";
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
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80')] bg-cover bg-center opacity-20" />
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
              Market Analysis
            </Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight" data-testid="text-article-title">
              Where Americans Are Moving in 2025: Investment Hotspots for Smart Investors
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>December 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Sequel Investments Research</span>
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
                      <h3 className="font-semibold text-white mb-1">Sun Belt Surge</h3>
                      <p className="text-sm text-white/70">Southern states continue attracting relocators with lower taxes and affordable housing prices.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <MapPin className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">New Leader Emerges</h3>
                      <p className="text-sm text-white/70">South Carolina has overtaken Florida and Texas as the top destination for new residents.</p>
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
                      <h3 className="font-semibold text-white mb-1">Investor Opportunity</h3>
                      <p className="text-sm text-white/70">Population growth creates strong rental demand and appreciation potential in key markets.</p>
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
            For real estate investors, understanding where Americans are moving isn't just interesting—it's essential for building a profitable portfolio. Population growth drives rental demand, supports property values, and creates opportunities for savvy investors who position themselves ahead of the trend.
          </p>

          <p className="mb-6">
            After years of pandemic-driven migration, the dust has settled enough to reveal clear patterns. While overall interstate moves have moderated from their 2022 peak, certain markets continue to attract a steady stream of new residents—and that's exactly where investors should be looking.
          </p>

          {/* Chart 1: Relocation Trends */}
          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Interstate Relocation Trends (2019-2025)</h3>
              <p className="text-sm text-muted-foreground mb-6">Percentage of home purchases involving interstate moves</p>
              <div className="h-[350px]" data-testid="chart-relocation-trends">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={relocationTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                      formatter={(value: number) => [`${value}%`, 'Interstate Moves']}
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

          <h2 className="text-2xl font-bold mt-12 mb-6">The Top Markets Drawing New Residents</h2>

          <p className="mb-6">
            While Florida and Texas dominated headlines during the pandemic migration boom, the landscape has shifted. South Carolina has emerged as the new front-runner, attracting nearly twice as many inbound movers as outbound residents.
          </p>

          <p className="mb-6">
            For investors, this matters because population growth is one of the strongest predictors of real estate performance. More residents mean more renters, more buyers, and more competition for limited housing stock—all factors that support both rental rates and property values.
          </p>

          {/* Chart 2: Investment Hotspots */}
          <Card className="my-10 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Top States for Population Growth</h3>
              <p className="text-sm text-muted-foreground mb-6">Inbound-to-outbound migration ratio (higher = more net growth)</p>
              <div className="h-[400px]" data-testid="chart-growth-markets">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={investorHotspotData} 
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
                      formatter={(value: number) => [`${value}x baseline`, 'Growth Ratio']}
                    />
                    <ReferenceLine x={1} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <Bar 
                      dataKey="growth" 
                      name="Growth Ratio"
                      radius={[0, 4, 4, 0]}
                    >
                      {investorHotspotData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.growth > 1.5 ? 'hsl(var(--primary))' : entry.growth > 1.3 ? 'hsl(142 76% 36%)' : 'hsl(217 91% 60%)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                A ratio of 1.85x means 85% more people moving in than leaving
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">What's Driving the Migration?</h2>

          <p className="mb-6">
            Several factors are pushing Americans toward these high-growth markets:
          </p>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Lower Cost of Living
                </h4>
                <p className="text-sm text-muted-foreground">Residents from high-cost states like California and New York can sell their homes and buy comparable properties with cash left over.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  Tax Advantages
                </h4>
                <p className="text-sm text-muted-foreground">States like Texas, Florida, and Tennessee have no state income tax, letting residents keep more of their earnings.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Job Growth
                </h4>
                <p className="text-sm text-muted-foreground">Major employers are relocating headquarters and operations to business-friendly Sun Belt states.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Remote Work Flexibility
                </h4>
                <p className="text-sm text-muted-foreground">Workers who can work from anywhere are choosing locations based on lifestyle preferences rather than office proximity.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-6">Investment Implications</h2>

          <p className="mb-6">
            For real estate investors, these migration patterns create clear opportunities:
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">Rental Properties in Growth Markets</h3>
          <p className="mb-6">
            New residents need places to live, and many prefer to rent while they get established in a new area. DSCR loans are ideal for acquiring rental properties in these markets because they qualify based on the property's income potential rather than your personal income.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">Fix and Flip Opportunities</h3>
          <p className="mb-6">
            Population growth puts pressure on existing housing stock, supporting prices and creating opportunities for value-add investors. Properties that might sit on the market in stagnant areas sell quickly in high-growth markets.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4">New Construction</h3>
          <p className="mb-6">
            In markets where population growth outpaces housing supply, new construction loans can help you meet demand with modern inventory that commands premium prices.
          </p>

          <Card className="my-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <blockquote className="text-lg italic text-foreground">
                "Smart investors follow population growth. When you invest in markets where people want to live, you're not just buying property—you're buying into demand that supports your investment for years to come."
              </blockquote>
              <p className="text-sm text-muted-foreground mt-4">— Sequel Investments</p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mt-12 mb-6">Due Diligence Considerations</h2>

          <p className="mb-6">
            While population growth is a positive indicator, investors should also consider:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Insurance costs:</strong> Some high-growth states, particularly in hurricane-prone areas, have seen significant increases in property insurance premiums.</li>
            <li><strong>Property taxes:</strong> States without income tax often have higher property taxes to fund government services.</li>
            <li><strong>Market-specific dynamics:</strong> Even within high-growth states, some neighborhoods and property types perform better than others.</li>
            <li><strong>Competition:</strong> Popular markets attract more investors, which can compress cap rates and make deals harder to find.</li>
          </ul>

          <p className="mb-8">
            Working with a lender who understands these markets—and can help you analyze deals quickly—gives you an edge when competing for properties.
          </p>

          {/* Call to Action */}
          <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-3">Ready to Invest in High-Growth Markets?</h3>
              <p className="text-muted-foreground mb-6">
                Our team specializes in financing investment properties across the country. Whether you're targeting South Carolina, Texas, or any of the other high-growth markets, we can help you move quickly on opportunities.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/get-quote">
                  <Button size="lg" data-testid="button-get-quote">
                    Get Pre-Qualified
                  </Button>
                </Link>
                <Link href="/where-we-lend">
                  <Button variant="outline" size="lg" data-testid="button-where-we-lend">
                    See Where We Lend
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
