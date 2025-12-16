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
import { PortfolioConcentrationHeatmap } from "@/components/admin/PortfolioConcentrationHeatmap";
import { useState, useMemo } from "react";

interface PortfolioData {
  totalFunded: { value: number; count: number };
  byLoanType: Record<string, { value: number; count: number }>;
  byStatus: Record<string, { value: number; count: number }>;
  byState: { state: string; value: number; count: number }[];
  averages: { loanSize: number; interestRate: number; ltv: number };
  monthlyTrend: { month: string; value: number; count: number }[];
}

interface GeographicAnalyticsData {
  applicationActivity: {
    state: string;
    count: number;
    volume: number;
    statusBreakdown: Record<string, number>;
  }[];
  portfolioConcentration: {
    state: string;
    fundedCount: number;
    portfolioValue: number;
    performanceMetrics: {
      current: number;
      late: number;
      defaulted: number;
    };
  }[];
  summary: {
    totalApplications: number;
    totalApplicationVolume: number;
    totalPortfolioValue: number;
    activeStatesCount: number;
  };
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
      <Skeleton className="h-[400px]" />
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
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);

  const { data: portfolio, isLoading } = useQuery<PortfolioData>({
    queryKey: ["/api/admin/analytics/portfolio"],
  });

  const { data: geoAnalytics, isLoading: geoLoading } = useQuery<GeographicAnalyticsData>({
    queryKey: ["/api/admin/analytics/geographic"],
  });

  const handleViewChange = (state: string | null, cluster: any | null) => {
    setSelectedState(state);
    setSelectedCluster(cluster);
  };

  // Filter portfolio data based on selection
  const filteredPortfolioData = useMemo(() => {
    if (!portfolio) return null;

    // If cluster is selected, show cluster-specific data
    if (selectedCluster) {
      const clusterLoans = selectedCluster.loans;
      const clusterValue = selectedCluster.portfolioValue;
      const clusterCount = clusterLoans.length;
      const avgLoanSize = clusterCount > 0 ? clusterValue / clusterCount : 0;
      const avgInterestRate = selectedCluster.avgInterestRate;

      // Calculate LTV for cluster loans
      const avgLtv = clusterLoans.reduce((sum: number, loan: any) => {
        const ltv = loan.loanAmount && loan.propertyValue ? (loan.loanAmount / loan.propertyValue) * 100 : 0;
        return sum + ltv;
      }, 0) / clusterCount;

      // Calculate loan type distribution for cluster
      const byLoanType: Record<string, { value: number; count: number }> = {};
      clusterLoans.forEach((loan: any) => {
        const type = loan.loanType || 'Unknown';
        if (!byLoanType[type]) {
          byLoanType[type] = { value: 0, count: 0 };
        }
        byLoanType[type].value += loan.loanAmount || 0;
        byLoanType[type].count += 1;
      });

      // Calculate status distribution for cluster
      const byStatus: Record<string, { value: number; count: number }> = {};
      clusterLoans.forEach((loan: any) => {
        const status = loan.status || 'unknown';
        if (!byStatus[status]) {
          byStatus[status] = { value: 0, count: 0 };
        }
        byStatus[status].value += loan.currentBalance || 0;
        byStatus[status].count += 1;
      });

      return {
        totalFunded: { value: clusterValue, count: clusterCount },
        averages: {
          loanSize: avgLoanSize,
          interestRate: avgInterestRate,
          ltv: avgLtv,
        },
        byLoanType,
        byStatus,
      };
    }

    // If state is selected, filter by state
    if (selectedState && geoAnalytics?.portfolioConcentration) {
      const stateData = geoAnalytics.portfolioConcentration.find(s => s.state === selectedState);
      if (stateData) {
        return {
          totalFunded: { 
            value: stateData.portfolioValue, 
            count: stateData.fundedCount 
          },
          averages: {
            loanSize: stateData.fundedCount > 0 ? stateData.portfolioValue / stateData.fundedCount : 0,
            interestRate: portfolio.averages.interestRate, // Keep overall average
            ltv: portfolio.averages.ltv, // Keep overall average
          },
          byLoanType: portfolio.byLoanType, // Keep full breakdown
          byStatus: portfolio.byStatus,
        };
      }
    }

    // No selection - return full portfolio
    return portfolio;
  }, [portfolio, selectedState, selectedCluster, geoAnalytics]);

  // Filter portfolio data based on selection
  const filteredPortfolio = useMemo(() => {
    if (!portfolio) return null;

    // If a cluster is selected, filter by those specific loans
    if (selectedCluster && selectedCluster.loans) {
      const clusterLoanIds = new Set(selectedCluster.loans.map((l: any) => l.id));
      return {
        ...portfolio,
        totalFunded: {
          value: selectedCluster.portfolioValue,
          count: selectedCluster.loans.length,
        },
        averages: {
          loanSize: selectedCluster.portfolioValue / selectedCluster.loans.length,
          interestRate: selectedCluster.avgInterestRate,
          ltv: portfolio.averages.ltv, // Keep original LTV for now
        },
      };
    }

    // If a state is selected, filter by state
    if (selectedState && portfolio.byState) {
      const stateData = portfolio.byState.find(s => s.state === selectedState);
      if (stateData) {
        return {
          ...portfolio,
          totalFunded: {
            value: stateData.value,
            count: stateData.count,
          },
        };
      }
    }

    return portfolio;
  }, [portfolio, selectedState, selectedCluster]);

  // Process chart data from filtered portfolio
  const loanTypeData = useMemo(() => {
    if (!filteredPortfolioData?.byLoanType) return [];
    return Object.entries(filteredPortfolioData.byLoanType).map(([type, data]) => ({
      name: type,
      value: data.value,
      count: data.count,
    }));
  }, [filteredPortfolioData]);

  const statusData = useMemo(() => {
    if (!filteredPortfolioData?.byStatus) return [];
    return Object.entries(filteredPortfolioData.byStatus).map(([status, data]) => ({
      name: STATUS_LABELS[status] || status,
      value: data.value,
      count: data.count,
      fill: STATUS_COLORS[status] || "#94a3b8",
    }));
  }, [filteredPortfolioData]);

  // Filter monthly funding volume based on selection
  const filteredMonthlyTrend = useMemo(() => {
    if (!portfolio?.monthlyTrend) return [];

    // If cluster is selected, filter by cluster loans
    if (selectedCluster) {
      const clusterLoanIds = new Set(selectedCluster.loans.map((l: any) => l.id));
      // We'll need to approximate this since monthlyTrend doesn't have loan-level detail
      // For now, return empty array - would need backend support for accurate cluster-level monthly trends
      return [];
    }

    // If state is selected, filter by state
    if (selectedState) {
      // Similar approximation needed - would need backend support
      return [];
    }

    // No selection - return full monthly trend
    return portfolio.monthlyTrend;
  }, [portfolio, selectedState, selectedCluster]);

  // Geographic distribution - cluster-level for state selection
  const geographicData = useMemo(() => {
    if (!portfolio?.byState) return [];

    // If cluster is selected, show cluster name
    if (selectedCluster) {
      const city = selectedCluster.loans[0]?.propertyCity || 'Unknown';
      return [{
        state: city,
        value: selectedCluster.portfolioValue,
        count: selectedCluster.loans.length,
      }];
    }

    // If state is selected, aggregate by city/metro within that state
    if (selectedState && geoAnalytics?.portfolioConcentration) {
      // We need to fetch loan-level data to group by city
      // Since we don't have it in the current data structure, we'll use a placeholder
      // In production, this would need a backend endpoint that returns city-level aggregates
      const stateEntry = portfolio.byState.find(s => s.state === selectedState);
      return stateEntry ? [{
        state: `${selectedState} (state-level)`,
        value: stateEntry.value,
        count: stateEntry.count,
      }] : [];
    }

    // No selection - return top 10 states
    return portfolio.byState.slice(0, 10);
  }, [portfolio, selectedState, selectedCluster, geoAnalytics]);

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="portfolio-title">Portfolio Analytics</h1>
          <p className="text-muted-foreground text-sm">Monitor funded loan portfolio performance and geographic distribution</p>
        </div>
        
        {isLoading ? (
          <LoadingSkeleton />
        ) : !filteredPortfolioData ? (
          <div className="text-center py-12 text-muted-foreground">No portfolio data available</div>
        ) : (
          <>
            {(selectedState || selectedCluster) && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Viewing: {selectedCluster ? `Cluster in ${selectedState} (${selectedCluster.loans.length} loans)` : selectedState}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleViewChange(null, null)}
                  className="text-xs"
                >
                  View All Portfolio
                </Button>
              </div>
            )}
            
            <PortfolioConcentrationHeatmap 
              data={geoAnalytics?.portfolioConcentration || []} 
              isLoading={geoLoading}
              onViewChange={handleViewChange}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title={selectedState || selectedCluster ? `Portfolio (${selectedState || 'Cluster'})` : "Total Portfolio"}
                value={formatCurrency(filteredPortfolioData?.totalFunded?.value || 0)}
                subtitle={`${filteredPortfolioData?.totalFunded?.count || 0} active loans`}
                icon={Building2}
                onClick={() => navigate("/admin/servicing")}
              />
              <MetricCard
                title="Avg Loan Size"
                value={formatCurrency(filteredPortfolioData?.averages?.loanSize || 0)}
                icon={DollarSign}
              />
              <MetricCard
                title="Avg Interest Rate"
                value={formatPercent(filteredPortfolioData?.averages?.interestRate || 0)}
                icon={Percent}
              />
              <MetricCard
                title="Avg LTV"
                value={formatPercent(filteredPortfolioData?.averages?.ltv || 0)}
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
                <CardDescription>
                  {selectedCluster ? 'Cluster-level trends not available' : 
                   selectedState ? `${selectedState} trend data` : 
                   'Last 12 months trend'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredMonthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={filteredMonthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip formatter={(value: number) => formatFullCurrency(value)} />
                      <Area type="monotone" dataKey="value" name="Funded Volume" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {selectedCluster || selectedState ? 'Filtered monthly trend data not available - showing portfolio overview instead' : 'No monthly trend data available'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Geographic Distribution</CardTitle>
                  <CardDescription>
                    {selectedCluster ? 'Cluster location' : 
                     selectedState ? `Clusters in ${selectedState}` : 
                     'Top states by funded volume'}
                  </CardDescription>
                </div>
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {geographicData.length > 0 ? (
                  <div className="space-y-3">
                    {geographicData.map((item, index) => {
                      const maxValue = geographicData[0]?.value || 1;
                      const percentage = (item.value / maxValue) * 100;
                      return (
                        <div key={item.state} className="flex items-center gap-3">
                          <div className="w-8 text-sm font-medium text-muted-foreground">{index + 1}.</div>
                          <div className="w-12 font-medium">{item.state}</div>
                          <div className="flex-1">
                            <Progress value={percentage} className="h-3" />
                          </div>
                          <div className="w-24 text-right text-sm">{formatCurrency(item.value)}</div>
                          <div className="w-16 text-right text-sm text-muted-foreground">{item.count} loans</div>
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
      </div>
    </div>
  );
}