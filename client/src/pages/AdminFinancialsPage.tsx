import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  MapPin,
  BarChart3,
  Wallet,
  Percent,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import type { User as UserType } from "@shared/schema";

type PipelineData = {
  byStatus: Record<string, { count: number; value: number }>;
  byStage: Record<string, { count: number; value: number }>;
  byLoanType: Record<string, { count: number; value: number }>;
  leadConversionRate: number;
  totalLeads: number;
  totalSubmitted: number;
  avgDaysInStage: Record<string, number>;
  totalPipelineValue: number;
  totalPipelineCount: number;
};

type PortfolioData = {
  totalFunded: { count: number; value: number };
  byLoanType: Record<string, { count: number; value: number }>;
  byStatus: Record<string, { count: number; value: number }>;
  byState: Array<{ state: string; count: number; value: number }>;
  averages: { loanSize: number; interestRate: number; ltv: number };
  monthlyTrend: Array<{ month: string; count: number; value: number }>;
};

type RevenueData = {
  totalOriginationFees: number;
  totalInterestIncome: number;
  totalRevenue: number;
  byLoanType: Record<string, { originationFees: number; interestIncome: number }>;
  monthlyTrend: Array<{ month: string; originationFees: number; interestIncome: number; total: number }>;
};

type ServicingData = {
  byStatus: Record<string, { count: number; balance: number }>;
  outstandingBalance: number;
  originalPrincipal: number;
  paydownRate: number;
  drawUtilization: { totalDrawn: number; totalCommitment: number; utilizationRate: number };
  delinquencyRate: number;
  delinquentCount: number;
  totalActiveLoans: number;
  atRiskLoans: Array<{
    id: string;
    borrowerName: string;
    propertyAddress: string;
    loanAmount: number;
    loanStatus: string;
    loanType: string;
  }>;
  paymentCounts: Record<string, number>;
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "#8884d8", "#82ca9d", "#ffc658"];

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  submitted: "#3b82f6",
  in_review: "#eab308",
  approved: "#22c55e",
  funded: "#10b981",
  denied: "#ef4444",
  withdrawn: "#6b7280",
  current: "#22c55e",
  grace_period: "#eab308",
  late: "#f97316",
  default: "#ef4444",
  paid_off: "#06b6d4",
  foreclosure: "#dc2626",
  matured: "#8b5cf6",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  funded: "Funded",
  denied: "Denied",
  withdrawn: "Withdrawn",
  current: "Current",
  grace_period: "Grace Period",
  late: "Late",
  default: "Default",
  paid_off: "Paid Off",
  foreclosure: "Foreclosure",
  matured: "Matured",
  account_review: "Account Review",
  underwriting: "Underwriting",
  term_sheet: "Term Sheet",
  processing: "Processing",
  docs_out: "Docs Out",
  closed: "Closed",
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

function formatFullCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendLabel,
  onClick,
}: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  icon: any;
  trend?: number;
  trendLabel?: string;
  onClick?: () => void;
}) {
  return (
    <Card className={onClick ? "cursor-pointer hover-elevate" : ""} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{trend >= 0 ? "+" : ""}{formatPercent(trend)}</span>
                {trendLabel && <span className="text-muted-foreground ml-1">{trendLabel}</span>}
              </div>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Icon className="h-5 w-5 text-primary" />
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
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PipelineTab() {
  const [, navigate] = useLocation();
  
  const { data: pipeline, isLoading } = useQuery<PipelineData>({
    queryKey: ["/api/admin/analytics/pipeline"],
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!pipeline) return <div className="text-center py-12 text-muted-foreground">No pipeline data available</div>;

  const statusData = Object.entries(pipeline.byStatus || {}).map(([status, data]) => ({
    name: STATUS_LABELS[status] || status,
    value: data.value,
    count: data.count,
    fill: STATUS_COLORS[status] || "#94a3b8",
  }));

  const stageData = Object.entries(pipeline.byStage || {}).map(([stage, data]) => ({
    name: STATUS_LABELS[stage] || stage,
    value: data.value,
    count: data.count,
  }));

  const loanTypeData = Object.entries(pipeline.byLoanType || {}).map(([type, data]) => ({
    name: type,
    value: data.value,
    count: data.count,
  }));

  const funnelData = [
    { name: "Leads", value: pipeline.totalLeads || 0, fill: "#94a3b8" },
    { name: "Submitted", value: pipeline.byStatus?.submitted?.count || 0, fill: "#3b82f6" },
    { name: "In Review", value: pipeline.byStatus?.in_review?.count || 0, fill: "#eab308" },
    { name: "Approved", value: pipeline.byStatus?.approved?.count || 0, fill: "#22c55e" },
    { name: "Funded", value: pipeline.byStatus?.funded?.count || 0, fill: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Pipeline Value"
          value={formatCurrency(pipeline.totalPipelineValue)}
          subtitle={`${pipeline.totalPipelineCount} active applications`}
          icon={DollarSign}
        />
        <MetricCard
          title="Lead Conversion"
          value={formatPercent(pipeline.leadConversionRate)}
          subtitle={`${pipeline.totalSubmitted} of ${pipeline.totalLeads} leads`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg Days to Close"
          value={`${Math.round(pipeline.avgDaysInStage?.closed || 0)}`}
          subtitle="From submission to close"
          icon={Clock}
        />
        <MetricCard
          title="In Review"
          value={String(pipeline.byStatus?.in_review?.count || 0)}
          subtitle={formatCurrency(pipeline.byStatus?.in_review?.value || 0)}
          icon={FileText}
          onClick={() => navigate("/admin")}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
            <CardDescription>Lead to funding pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => v.toString()} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value: number) => [value, "Count"]} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pipeline by Loan Type</CardTitle>
            <CardDescription>Value distribution</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pipeline by Processing Stage</CardTitle>
          <CardDescription>Application count and value by stage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" tickFormatter={(v) => formatCurrency(v)} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: number, name: string) => [
                name === "value" ? formatFullCurrency(value) : value,
                name === "value" ? "Value" : "Count"
              ]} />
              <Legend />
              <Bar yAxisId="left" dataKey="value" name="Value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="count" name="Count" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Average Days in Stage</CardTitle>
          <CardDescription>Time spent in each processing stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(pipeline.avgDaysInStage || {}).map(([stage, days]) => (
              <div key={stage} className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{Math.round(days)}</p>
                <p className="text-xs text-muted-foreground">{STATUS_LABELS[stage] || stage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PortfolioTab() {
  const [, navigate] = useLocation();
  
  const { data: portfolio, isLoading } = useQuery<PortfolioData>({
    queryKey: ["/api/admin/analytics/portfolio"],
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!portfolio) return <div className="text-center py-12 text-muted-foreground">No portfolio data available</div>;

  const loanTypeData = Object.entries(portfolio.byLoanType || {}).map(([type, data]) => ({
    name: type,
    value: data.value,
    count: data.count,
  }));

  const statusData = Object.entries(portfolio.byStatus || {}).map(([status, data]) => ({
    name: STATUS_LABELS[status] || status,
    value: data.value,
    count: data.count,
    fill: STATUS_COLORS[status] || "#94a3b8",
  }));

  return (
    <div className="space-y-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Portfolio Health</CardTitle>
            <CardDescription>Loan status distribution</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Funding Volume</CardTitle>
          <CardDescription>Last 12 months trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolio.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(value: number) => formatFullCurrency(value)} />
              <Area type="monotone" dataKey="value" name="Funded Volume" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Geographic Distribution</CardTitle>
          <CardDescription>Top states by funded volume</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}

function RevenueTab() {
  const { data: revenue, isLoading } = useQuery<RevenueData>({
    queryKey: ["/api/admin/analytics/revenue"],
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!revenue) return <div className="text-center py-12 text-muted-foreground">No revenue data available</div>;

  const loanTypeData = Object.entries(revenue.byLoanType || {}).map(([type, data]) => ({
    name: type,
    originationFees: data.originationFees,
    interestIncome: data.interestIncome,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(revenue.totalRevenue || 0)}
          subtitle="All-time"
          icon={Wallet}
        />
        <MetricCard
          title="Origination Fees"
          value={formatCurrency(revenue.totalOriginationFees || 0)}
          subtitle="~1.5% of funded loans"
          icon={DollarSign}
        />
        <MetricCard
          title="Interest Income"
          value={formatCurrency(revenue.totalInterestIncome || 0)}
          subtitle="From loan payments"
          icon={Percent}
        />
        <MetricCard
          title="Fee Ratio"
          value={formatPercent((revenue.totalOriginationFees || 0) > 0 && (revenue.totalRevenue || 0) > 0 ? ((revenue.totalOriginationFees || 0) / (revenue.totalRevenue || 1)) * 100 : 0)}
          subtitle="Origination vs Interest"
          icon={PieChart}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Revenue Trend</CardTitle>
          <CardDescription>Last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenue.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(value: number) => formatFullCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="originationFees" name="Origination Fees" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
              <Area type="monotone" dataKey="interestIncome" name="Interest Income" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Revenue by Loan Type</CardTitle>
          <CardDescription>Fees and interest breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={loanTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(value: number) => formatFullCurrency(value)} />
              <Legend />
              <Bar dataKey="originationFees" name="Origination Fees" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="interestIncome" name="Interest Income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function ServicingTab() {
  const [, navigate] = useLocation();
  
  const { data: servicing, isLoading } = useQuery<ServicingData>({
    queryKey: ["/api/admin/analytics/servicing"],
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!servicing) return <div className="text-center py-12 text-muted-foreground">No servicing data available</div>;

  const statusData = Object.entries(servicing.byStatus || {}).map(([status, data]) => ({
    name: STATUS_LABELS[status] || status,
    count: data.count,
    balance: data.balance,
    fill: STATUS_COLORS[status] || "#94a3b8",
  }));

  const healthyCount = (servicing.byStatus?.current?.count || 0) + (servicing.byStatus?.paid_off?.count || 0);
  const healthyPercent = servicing.totalActiveLoans > 0 ? (healthyCount / servicing.totalActiveLoans) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Outstanding Balance"
          value={formatCurrency(servicing.outstandingBalance || 0)}
          subtitle={`${formatPercent(servicing.paydownRate || 0)} paid down`}
          icon={DollarSign}
        />
        <MetricCard
          title="Portfolio Health"
          value={formatPercent(healthyPercent)}
          subtitle={`${healthyCount} of ${servicing.totalActiveLoans || 0} loans current`}
          icon={healthyPercent >= 90 ? CheckCircle2 : AlertTriangle}
        />
        <MetricCard
          title="Delinquency Rate"
          value={formatPercent(servicing.delinquencyRate || 0)}
          subtitle={`${servicing.delinquentCount || 0} loans at risk`}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Draw Utilization"
          value={formatPercent(servicing.drawUtilization?.utilizationRate || 0)}
          subtitle={formatCurrency(servicing.drawUtilization?.totalDrawn || 0) + " drawn"}
          icon={Activity}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Loan Status Distribution</CardTitle>
            <CardDescription>By outstanding balance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPie>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="balance"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatFullCurrency(value)} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Performance</CardTitle>
            <CardDescription>Payment count by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(servicing.paymentCounts || {}).map(([status, count]) => {
                const total = Object.values(servicing.paymentCounts || {}).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const statusColor = status === "completed" ? "bg-green-500" : 
                                   status === "late" ? "bg-orange-500" : 
                                   status === "partial" ? "bg-yellow-500" : "bg-blue-500";
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{status.replace("_", " ")}</span>
                      <span className="text-muted-foreground">{count} ({formatPercent(percentage)})</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${statusColor}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">At-Risk Loans</CardTitle>
            <CardDescription>Loans requiring attention</CardDescription>
          </div>
          {servicing.atRiskLoans.length > 0 && (
            <Badge variant="destructive">{servicing.atRiskLoans.length} loans</Badge>
          )}
        </CardHeader>
        <CardContent>
          {servicing.atRiskLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p>No at-risk loans in portfolio</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {servicing.atRiskLoans.map((loan) => (
                  <div 
                    key={loan.id} 
                    className="flex items-center justify-between p-3 rounded-lg hover-elevate cursor-pointer border"
                    onClick={() => navigate(`/admin/servicing/${loan.id}`)}
                    data-testid={`row-at-risk-loan-${loan.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{loan.borrowerName}</p>
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {loan.propertyAddress}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(loan.loanAmount)}</p>
                        <p className="text-xs text-muted-foreground">{loan.loanType}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          backgroundColor: `${STATUS_COLORS[loan.loanStatus]}20`,
                          borderColor: STATUS_COLORS[loan.loanStatus],
                          color: STATUS_COLORS[loan.loanStatus],
                        }}
                      >
                        {STATUS_LABELS[loan.loanStatus] || loan.loanStatus}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminFinancialsPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("pipeline");
  const [dateRange, setDateRange] = useState("all");

  const { data: currentUser, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== "staff" && currentUser.role !== "admin")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p className="text-muted-foreground">Access denied. Staff or admin role required.</p>
          <Button className="mt-4" onClick={() => navigate("/admin/login")}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Financials & Portfolio</h1>
                <p className="text-sm text-muted-foreground">Analytics dashboard</p>
              </div>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40" data-testid="select-date-range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6" data-testid="tabs-financials">
            <TabsTrigger value="pipeline" className="gap-2" data-testid="tab-pipeline">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2" data-testid="tab-portfolio">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2" data-testid="tab-revenue">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="servicing" className="gap-2" data-testid="tab-servicing">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Servicing</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <PipelineTab />
          </TabsContent>
          <TabsContent value="portfolio">
            <PortfolioTab />
          </TabsContent>
          <TabsContent value="revenue">
            <RevenueTab />
          </TabsContent>
          <TabsContent value="servicing">
            <ServicingTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
