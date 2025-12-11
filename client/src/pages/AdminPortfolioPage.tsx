import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Percent,
  BarChart3,
  TrendingUp,
  MapPin,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { LucideIcon } from "lucide-react";

interface PortfolioData {
  totalFunded: { value: number; count: number };
  byLoanType: Record<string, { value: number; count: number }>;
  byStatus: Record<string, { value: number; count: number }>;
  byState: { state: string; value: number; count: number }[];
  averages: { loanSize: number; interestRate: number; ltv: number };
  monthlyTrend: { month: string; value: number; count: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  current: "Current",
  late_30: "30 Days Late",
  late_60: "60 Days Late",
  late_90: "90+ Days Late",
  default: "Default",
  paid_off: "Paid Off",
  foreclosure: "Foreclosure",
};

const STATUS_COLORS: Record<string, string> = {
  current: "#22c55e",
  late_30: "#f59e0b",
  late_60: "#f97316",
  late_90: "#ef4444",
  default: "#dc2626",
  paid_off: "#3b82f6",
  foreclosure: "#7c3aed",
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  onClick 
}: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  icon: LucideIcon; 
  onClick?: () => void;
}) {
  return (
    <Card 
      className={onClick ? "cursor-pointer hover-elevate" : ""} 
      onClick={onClick}
      data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardContent className="p-4"><Skeleton className="h-[280px] w-full" /></CardContent></Card>
        <Card><CardContent className="p-4"><Skeleton className="h-[280px] w-full" /></CardContent></Card>
      </div>
      <Card><CardContent className="p-4"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
    </div>
  );
}

export default function AdminPortfolioPage() {
  const [, navigate] = useLocation();
  
  const { data: portfolio, isLoading } = useQuery<PortfolioData>({
    queryKey: ["/api/admin/analytics/portfolio"],
  });

  const loanTypeData = portfolio ? Object.entries(portfolio.byLoanType || {}).map(([type, data]) => ({
    name: type,
    value: data.value,
    count: data.count,
  })) : [];

  const statusData = portfolio ? Object.entries(portfolio.byStatus || {}).map(([status, data]) => ({
    name: STATUS_LABELS[status] || status,
    value: data.value,
    count: data.count,
    fill: STATUS_COLORS[status] || "#94a3b8",
  })) : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 sm:h-9 sm:w-9" 
              onClick={() => navigate("/admin")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold" data-testid="text-page-title">Loan Portfolio</h1>
              <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">
                Portfolio composition and performance metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/admin/servicing")}
              data-testid="button-view-servicing"
            >
              <TrendingUp className="h-4 w-4 mr-1.5" />
              View Servicing
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : !portfolio ? (
          <div className="text-center py-12 text-muted-foreground">No portfolio data available</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Portfolio"
                value={formatCurrency(portfolio.totalFunded?.value || 0)}
                subtitle={`${portfolio.totalFunded?.count || 0} active loans`}
                icon={Building2}
                onClick={() => navigate("/admin/servicing")}
              />
              <MetricCard
                title="Avg Loan Size"
                value={formatCurrency(portfolio.averages?.loanSize || 0)}
                icon={DollarSign}
              />
              <MetricCard
                title="Avg Interest Rate"
                value={formatPercent(portfolio.averages?.interestRate || 0)}
                icon={Percent}
              />
              <MetricCard
                title="Avg LTV"
                value={formatPercent(portfolio.averages?.ltv || 0)}
                icon={BarChart3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Portfolio by Loan Type</CardTitle>
                  <CardDescription>Distribution of funded loans</CardDescription>
                </CardHeader>
                <CardContent>
                  {loanTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <RechartsPie>
                        <Pie
                          data={loanTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {loanTypeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatFullCurrency(value)} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                      No loan type data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Portfolio Health</CardTitle>
                  <CardDescription>Loan status distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip formatter={(value: number) => formatFullCurrency(value)} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                      No status data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Monthly Funding Volume</CardTitle>
                <CardDescription>Last 12 months trend</CardDescription>
              </CardHeader>
              <CardContent>
                {(portfolio.monthlyTrend || []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={portfolio.monthlyTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip formatter={(value: number) => formatFullCurrency(value)} />
                      <Area type="monotone" dataKey="value" name="Funded Volume" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No monthly trend data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Geographic Distribution</CardTitle>
                  <CardDescription>Top states by funded volume</CardDescription>
                </div>
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {(portfolio.byState || []).length > 0 ? (
                  <div className="space-y-3">
                    {(portfolio.byState || []).slice(0, 10).map((state, index) => {
                      const maxValue = (portfolio.byState || [])[0]?.value || 1;
                      const percentage = (state.value / maxValue) * 100;
                      return (
                        <div key={state.state} className="flex items-center gap-3">
                          <div className="w-8 text-sm font-medium text-muted-foreground">{index + 1}.</div>
                          <div className="w-12 font-medium">{state.state}</div>
                          <div className="flex-1">
                            <Progress value={percentage} className="h-3" />
                          </div>
                          <div className="w-24 text-right text-sm">{formatCurrency(state.value)}</div>
                          <div className="w-16 text-right text-sm text-muted-foreground">{state.count} loans</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No geographic data available
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
