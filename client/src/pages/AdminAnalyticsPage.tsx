import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  BarChart3,
  PieChart,
  MapPin,
  Users,
  FileText,
  Briefcase,
  LogOut,
  LayoutGrid,
  Settings,
  Webhook,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Funnel,
  FunnelChart,
  LabelList,
} from "recharts";
import { apiRequest } from "@/lib/queryClient";

interface AnalyticsData {
  statusCounts: Record<string, number>;
  loanTypeCounts: Record<string, number>;
  weeklyVolume: { week: string; count: number; volume: number }[];
  topStates: { state: string; count: number; volume: number }[];
  funnel: { stage: string; count: number }[];
  stats: {
    totalPipelineValue: number;
    avgLoanSize: number;
    avgDaysToClose: number;
    thisMonthCount: number;
    lastMonthCount: number;
    thisMonthVolume: number;
    lastMonthVolume: number;
  };
}

const GOLD_COLOR = "#D4A01D";
const GOLD_COLORS = ["#D4A01D", "#B8860B", "#DAA520", "#FFD700", "#F4C430", "#CFB53B", "#E6BE8A"];

const statusColors: Record<string, string> = {
  draft: "#6B7280",
  submitted: "#3B82F6",
  in_review: "#F59E0B",
  approved: "#10B981",
  funded: "#059669",
  denied: "#EF4444",
  withdrawn: "#9CA3AF",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  funded: "Funded",
  denied: "Denied",
  withdrawn: "Withdrawn",
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  testId,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color: GOLD_COLOR }}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-1">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
            <span className={`text-xs ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminSidebar() {
  const [location] = useLocation();
  
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutGrid },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/servicing", label: "Loan Servicing", icon: Briefcase },
  ];
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/staff/logout");
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <div className="w-64 bg-card border-r flex flex-col h-screen">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold" style={{ color: GOLD_COLOR }}>Sequel Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                location === item.href
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [, navigate] = useLocation();
  
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
  });
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Unable to load analytics. Please log in as staff.
            </p>
            <Button className="w-full mt-4" onClick={() => navigate("/admin/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const statusData = analytics
    ? Object.entries(analytics.statusCounts).map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
        fill: statusColors[status] || "#6B7280",
      }))
    : [];
  
  const loanTypeData = analytics
    ? Object.entries(analytics.loanTypeCounts).map(([type, count], index) => ({
        name: type,
        value: count,
        fill: GOLD_COLORS[index % GOLD_COLORS.length],
      }))
    : [];
  
  const funnelData = analytics?.funnel.map((item, index) => ({
    ...item,
    fill: GOLD_COLORS[index % GOLD_COLORS.length],
  })) || [];
  
  const monthChange = analytics
    ? ((analytics.stats.thisMonthCount - analytics.stats.lastMonthCount) / Math.max(analytics.stats.lastMonthCount, 1)) * 100
    : 0;
  
  const volumeChange = analytics
    ? ((analytics.stats.thisMonthVolume - analytics.stats.lastMonthVolume) / Math.max(analytics.stats.lastMonthVolume, 1)) * 100
    : 0;
  
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center px-6 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Analytics Dashboard</h1>
        </header>
        
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-80" />
                  ))}
                </div>
              </div>
            ) : analytics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-grid">
                  <StatCard
                    title="Total Pipeline Value"
                    value={formatCurrency(analytics.stats.totalPipelineValue)}
                    subtitle="Active applications"
                    icon={DollarSign}
                    testId="stat-pipeline-value"
                  />
                  <StatCard
                    title="Average Loan Size"
                    value={formatCurrency(analytics.stats.avgLoanSize)}
                    subtitle="Across all applications"
                    icon={BarChart3}
                    testId="stat-avg-loan-size"
                  />
                  <StatCard
                    title="Avg Days to Close"
                    value={analytics.stats.avgDaysToClose > 0 ? `${analytics.stats.avgDaysToClose} days` : "N/A"}
                    subtitle="From application to funding"
                    icon={Clock}
                    testId="stat-avg-days-close"
                  />
                  <StatCard
                    title="This Month"
                    value={`${analytics.stats.thisMonthCount} apps`}
                    subtitle={formatCurrency(analytics.stats.thisMonthVolume)}
                    icon={TrendingUp}
                    trend={monthChange >= 0 ? "up" : "down"}
                    trendValue={`${monthChange >= 0 ? "+" : ""}${monthChange.toFixed(0)}% vs last month`}
                    testId="stat-this-month"
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card data-testid="chart-status-bar">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" style={{ color: GOLD_COLOR }} />
                        Applications by Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis type="number" stroke="#9CA3AF" />
                          <YAxis dataKey="name" type="category" width={80} stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card data-testid="chart-volume-line">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" style={{ color: GOLD_COLOR }} />
                        Weekly Application Volume
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.weeklyVolume}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="week" stroke="#9CA3AF" />
                          <YAxis yAxisId="left" stroke="#9CA3AF" />
                          <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" tickFormatter={formatCurrency} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number, name: string) => [
                              name === "volume" ? formatFullCurrency(value) : value,
                              name === "volume" ? "Volume" : "Applications"
                            ]}
                          />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="count"
                            name="Applications"
                            stroke={GOLD_COLOR}
                            strokeWidth={2}
                            dot={{ fill: GOLD_COLOR }}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="volume"
                            name="Volume"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ fill: "#10B981" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card data-testid="chart-loan-type-pie">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" style={{ color: GOLD_COLOR }} />
                        Distribution by Loan Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={loanTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {loanTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card data-testid="chart-funnel">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" style={{ color: GOLD_COLOR }} />
                        Conversion Funnel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {funnelData.map((item, index) => {
                          const maxCount = funnelData[0]?.count || 1;
                          const width = Math.max((item.count / maxCount) * 100, 20);
                          const prevCount = index > 0 ? funnelData[index - 1].count : item.count;
                          const conversionRate = prevCount > 0 ? ((item.count / prevCount) * 100).toFixed(1) : "100";
                          
                          return (
                            <div key={item.stage} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{item.stage}</span>
                                <span className="text-muted-foreground">
                                  {item.count} {index > 0 && `(${conversionRate}%)`}
                                </span>
                              </div>
                              <div className="h-8 bg-muted rounded-md overflow-hidden">
                                <div
                                  className="h-full rounded-md flex items-center justify-center text-xs font-medium text-white"
                                  style={{
                                    width: `${width}%`,
                                    backgroundColor: item.fill,
                                  }}
                                >
                                  {item.count}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card data-testid="chart-top-states">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" style={{ color: GOLD_COLOR }} />
                      Top 10 States by Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.topStates.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No state data available</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.topStates}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="state" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1F2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                              }}
                              formatter={(value: number) => [formatFullCurrency(value), "Volume"]}
                            />
                            <Bar dataKey="volume" fill={GOLD_COLOR} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground border-b pb-2">
                            <span>State</span>
                            <span className="text-right">Count</span>
                            <span className="text-right">Volume</span>
                          </div>
                          {analytics.topStates.map((state, index) => (
                            <div
                              key={state.state}
                              className="grid grid-cols-3 text-sm py-1"
                              data-testid={`state-row-${state.state}`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: GOLD_COLORS[index % GOLD_COLORS.length] }}
                                />
                                {state.state}
                              </span>
                              <span className="text-right">{state.count}</span>
                              <span className="text-right font-medium" style={{ color: GOLD_COLOR }}>
                                {formatCurrency(state.volume)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
