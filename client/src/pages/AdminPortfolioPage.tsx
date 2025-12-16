import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  DollarSign,
  Percent,
  TrendingUp,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
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
  grace_period: "Grace Period",
  late: "Late",
};

const STATUS_COLORS: Record<string, string> = {
  current: "#22c55e",
  late_30: "#f59e0b",
  late_60: "#f97316",
  late_90: "#ef4444",
  default: "#dc2626",
  paid_off: "#3b82f6",
  foreclosure: "#7c3aed",
  grace_period: "#eab308",
  late: "#f97316",
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

function CompactMetricCard({ 
  title, 
  value, 
  subtitle,
  change,
  icon: Icon, 
  onClick 
}: { 
  title: string; 
  value: string; 
  subtitle?: string;
  change?: { value: string; positive: boolean };
  icon: LucideIcon; 
  onClick?: () => void;
}) {
  return (
    <Card 
      className={onClick ? "cursor-pointer hover-elevate" : ""} 
      onClick={onClick}
      data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            <p className="text-lg font-bold truncate">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        {change && (
          <div className={`text-xs mt-1 ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
            {change.positive ? '↑' : '↓'} {change.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Skeleton className="h-[400px]" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-[190px]" />
          <Skeleton className="h-[190px]" />
        </div>
      </div>
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

  // Fetch recent serviced loans for the default view
  const { data: allServicedLoans = [] } = useQuery<any>({
    queryKey: ["/api/admin/serviced-loans"],
    select: (data) => {
      // API returns { items: [], pagination: {} } or direct array
      const loans = Array.isArray(data) ? data : (data?.items || data || []);
      // Sort by closing date (most recent first) and take top 5
      return [...loans]
        .sort((a, b) => {
          const dateA = new Date(a.closingDate || a.createdAt || 0).getTime();
          const dateB = new Date(b.closingDate || b.createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
    },
  });

  const handleViewChange = (state: string | null, cluster: any | null) => {
    setSelectedState(state);
    setSelectedCluster(cluster);
  };

  // Get loans to display in sidebar - use cluster loans when available, otherwise show recent loans
  const displayLoans = useMemo(() => {
    if (selectedCluster?.loans) {
      return selectedCluster.loans.slice(0, 5).map((loan: any) => ({
        id: loan.id,
        loanNumber: loan.loanNumber || `Loan-${loan.id.slice(0, 6)}`,
        propertyCity: loan.propertyCity || 'Unknown',
        propertyState: loan.propertyState || '',
        loanAmount: loan.loanAmount || loan.currentBalance || 0,
        interestRate: loan.interestRate || '0',
        loanType: loan.loanType || 'dscr',
        status: loan.status || loan.loanStatus || 'current',
      }));
    }
    // Fallback to recent serviced loans when no cluster selected
    if (allServicedLoans.length > 0) {
      return allServicedLoans.map((loan: any) => ({
        id: loan.id,
        loanNumber: loan.loanNumber || `Loan-${loan.id.slice(0, 6)}`,
        propertyCity: loan.propertyCity || 'Unknown',
        propertyState: loan.propertyState || '',
        loanAmount: loan.originalLoanAmount || loan.currentBalance || 0,
        interestRate: loan.interestRate || '0',
        loanType: loan.loanType || 'dscr',
        status: loan.loanStatus || 'current',
      }));
    }
    return [];
  }, [selectedCluster, allServicedLoans]);

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

      const avgLtv = clusterLoans.reduce((sum: number, loan: any) => {
        const ltv = loan.loanAmount && loan.propertyValue ? (loan.loanAmount / loan.propertyValue) * 100 : 0;
        return sum + ltv;
      }, 0) / clusterCount;

      const byLoanType: Record<string, { value: number; count: number }> = {};
      clusterLoans.forEach((loan: any) => {
        const type = loan.loanType || 'Unknown';
        if (!byLoanType[type]) {
          byLoanType[type] = { value: 0, count: 0 };
        }
        byLoanType[type].value += loan.loanAmount || 0;
        byLoanType[type].count += 1;
      });

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
        byState: [],
        monthlyTrend: [],
      };
    }

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

  // Process chart data
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

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!statusData.length) return { current: 0, late: 0, defaulted: 0, total: 0 };
    
    const current = statusData.find(s => s.name === 'Current')?.count || 0;
    const late = statusData.filter(s => s.name.includes('Late') || s.name === 'Grace Period').reduce((sum, s) => sum + s.count, 0);
    const defaulted = statusData.filter(s => s.name === 'Default' || s.name === 'Foreclosure').reduce((sum, s) => sum + s.count, 0);
    const total = current + late + defaulted;
    
    return { current, late, defaulted, total };
  }, [statusData]);

  const geographicData = useMemo(() => {
    if (!portfolio?.byState) return [];
    if (selectedCluster) {
      const city = selectedCluster.loans[0]?.propertyCity || 'Unknown';
      return [{
        state: city,
        value: selectedCluster.portfolioValue,
        count: selectedCluster.loans.length,
      }];
    }
    if (selectedState && geoAnalytics?.portfolioConcentration) {
      const stateEntry = portfolio.byState.find(s => s.state === selectedState);
      return stateEntry ? [{
        state: `${selectedState} (state-level)`,
        value: stateEntry.value,
        count: stateEntry.count,
      }] : [];
    }
    return portfolio.byState.slice(0, 5);
  }, [portfolio, selectedState, selectedCluster, geoAnalytics]);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-3 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" data-testid="portfolio-title">Portfolio Analytics</h1>
            <p className="text-muted-foreground text-xs">Monitor funded loan portfolio performance and geographic distribution</p>
          </div>
          {(selectedState || selectedCluster) && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                <MapPin className="h-3 w-3 mr-1" />
                {selectedCluster ? `Cluster (${selectedCluster.loans.length})` : selectedState}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleViewChange(null, null)}
                className="text-xs h-7"
              >
                View All
              </Button>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <LoadingSkeleton />
        ) : !filteredPortfolioData ? (
          <div className="text-center py-12 text-muted-foreground">No portfolio data available</div>
        ) : (
          <>
            {/* Summary Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <CompactMetricCard
                title="Total Portfolio"
                value={formatCurrency(filteredPortfolioData?.totalFunded?.value || 0)}
                subtitle={`${filteredPortfolioData?.totalFunded?.count || 0} loans`}
                icon={Building2}
                onClick={() => navigate("/admin/servicing")}
              />
              <CompactMetricCard
                title="Avg Loan Size"
                value={formatCurrency(filteredPortfolioData?.averages?.loanSize || 0)}
                icon={DollarSign}
              />
              <CompactMetricCard
                title="Avg Rate"
                value={formatPercent(filteredPortfolioData?.averages?.interestRate || 0)}
                icon={Percent}
              />
              <CompactMetricCard
                title="Active States"
                value={String(geoAnalytics?.summary?.activeStatesCount || portfolio?.byState?.length || 0)}
                subtitle="Geographic spread"
                icon={MapPin}
              />
            </div>

            {/* Main Content: Map + Sidebar */}
            <div className="grid lg:grid-cols-5 gap-4">
              {/* Map Section - 60% */}
              <div className="lg:col-span-3">
                <Card className="h-full">
                  <CardHeader className="py-2 px-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Portfolio Concentration</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {filteredPortfolioData?.totalFunded?.count || 0} loans
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[380px]">
                      <PortfolioConcentrationHeatmap 
                        data={geoAnalytics?.portfolioConcentration || []} 
                        isLoading={geoLoading}
                        onViewChange={handleViewChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Panels - 40% */}
              <div className="lg:col-span-2 space-y-4">
                {/* Performance Summary */}
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm">Portfolio Health</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Current</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{performanceMetrics.current}</span>
                          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                            {performanceMetrics.total > 0 ? Math.round((performanceMetrics.current / performanceMetrics.total) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Late/Grace</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{performanceMetrics.late}</span>
                          <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-600">
                            {performanceMetrics.total > 0 ? Math.round((performanceMetrics.late / performanceMetrics.total) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Default</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{performanceMetrics.defaulted}</span>
                          <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-600">
                            {performanceMetrics.total > 0 ? Math.round((performanceMetrics.defaulted / performanceMetrics.total) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mini pie chart */}
                    {loanTypeData.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">By Loan Type</p>
                        <div className="flex items-center gap-3">
                          <div className="h-[80px] w-[80px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPie>
                                <Pie
                                  data={loanTypeData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={20}
                                  outerRadius={35}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {loanTypeData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatFullCurrency(value)} />
                              </RechartsPie>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex-1 space-y-1">
                            {loanTypeData.slice(0, 3).map((item, index) => (
                              <div key={item.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  />
                                  <span className="truncate max-w-[80px]">{item.name}</span>
                                </div>
                                <span className="font-medium">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top States */}
                <Card>
                  <CardHeader className="py-2 px-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Top States</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                      {geographicData.map((item, index) => {
                        const maxValue = geographicData[0]?.value || 1;
                        const percentage = (item.value / maxValue) * 100;
                        return (
                          <div key={item.state} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-medium w-4 text-muted-foreground">{index + 1}.</span>
                                <span className="font-medium">{item.state}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{item.count} loans</span>
                                <span className="font-semibold">{formatCurrency(item.value)}</span>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Loans List */}
                <Card>
                  <CardHeader className="py-2 px-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {selectedCluster ? 'Cluster Loans' : selectedState ? 'State Loans' : 'Recent Loans'}
                      </CardTitle>
                      <Link href="/admin/servicing">
                        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                          View All <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[140px]">
                      <div className="p-3 pt-0 space-y-2">
                        {displayLoans.length > 0 ? (
                          displayLoans.map((loan: any) => (
                            <Link key={loan.id} href={`/admin/servicing/${loan.id}`}>
                              <div className="flex items-center justify-between p-2 rounded-md hover-elevate cursor-pointer bg-muted/30">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium truncate">{loan.loanNumber}</span>
                                    <Badge variant="outline" className="text-[10px] h-4 capitalize">
                                      {loan.loanType}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {loan.propertyCity}{loan.propertyState ? `, ${loan.propertyState}` : ''}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs font-semibold">{formatCurrency(loan.loanAmount)}</p>
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-[10px] h-4 ${
                                      loan.status === 'current' ? 'bg-green-500/10 text-green-600' :
                                      loan.status === 'late' ? 'bg-yellow-500/10 text-yellow-600' :
                                      'bg-red-500/10 text-red-600'
                                    }`}
                                  >
                                    {loan.status}
                                  </Badge>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="py-4 text-center text-xs text-muted-foreground">
                            Loading loans...
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
