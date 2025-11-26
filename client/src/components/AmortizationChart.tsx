import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { calculateAmortization, calculateInterestOnlyAmortization, formatCurrency } from "@/lib/amortization";
import { TrendingDown, DollarSign, Percent } from "lucide-react";

interface AmortizationChartProps {
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  interestType?: "fixed" | "interest_only" | string;
  interestOnlyMonths?: number;
}

export function AmortizationChart({
  loanAmount,
  interestRate,
  termMonths,
  interestType = "fixed",
  interestOnlyMonths = 0,
}: AmortizationChartProps) {
  const [view, setView] = useState<"balance" | "breakdown">("balance");

  const amortization = useMemo(() => {
    if (interestType === "interest_only" && interestOnlyMonths > 0) {
      return calculateInterestOnlyAmortization(loanAmount, interestRate, termMonths, interestOnlyMonths);
    }
    return calculateAmortization(loanAmount, interestRate, termMonths);
  }, [loanAmount, interestRate, termMonths, interestType, interestOnlyMonths]);

  const chartData = useMemo(() => {
    return amortization.schedule.map((row) => ({
      month: row.month,
      monthLabel: `Mo ${row.month}`,
      balance: Math.round(row.balance),
      principal: Math.round(row.principal),
      interest: Math.round(row.interest),
      cumulativePrincipal: Math.round(row.cumulativePrincipal),
      cumulativeInterest: Math.round(row.cumulativeInterest),
    }));
  }, [amortization]);

  const yearMarkers = useMemo(() => {
    const years = Math.ceil(termMonths / 12);
    return Array.from({ length: years }, (_, i) => (i + 1) * 12).filter(m => m <= termMonths);
  }, [termMonths]);

  if (!loanAmount || !interestRate || !termMonths) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            Loan details required to display amortization schedule
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingDown className="h-5 w-5 text-primary" />
          Amortization Schedule
        </CardTitle>
        <Tabs value={view} onValueChange={(v) => setView(v as "balance" | "breakdown")}>
          <TabsList className="h-8">
            <TabsTrigger value="balance" className="text-xs px-3 h-6" data-testid="tab-balance">
              Balance
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="text-xs px-3 h-6" data-testid="tab-breakdown">
              Breakdown
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
              <DollarSign className="h-3 w-3" />
              Monthly Payment
            </div>
            <p className="text-lg font-bold" data-testid="text-monthly-payment">
              {formatCurrency(amortization.monthlyPayment)}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
              <Percent className="h-3 w-3" />
              Total Interest
            </div>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400" data-testid="text-total-interest">
              {formatCurrency(amortization.totalInterest)}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
              <DollarSign className="h-3 w-3" />
              Total Paid
            </div>
            <p className="text-lg font-bold" data-testid="text-total-paid">
              {formatCurrency(amortization.totalPayment)}
            </p>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            {view === "balance" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value % 12 === 0) return `Yr ${value / 12}`;
                    if (value === 1) return "1";
                    return "";
                  }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  className="text-muted-foreground"
                  width={60}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Month ${label}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#balanceGradient)"
                  name="Remaining Balance"
                />
              </AreaChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value % 12 === 0) return `Yr ${value / 12}`;
                    if (value === 1) return "1";
                    return "";
                  }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  className="text-muted-foreground"
                  width={60}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Month ${label}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cumulativePrincipal"
                  stackId="1"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  fill="url(#principalGradient)"
                  name="Principal Paid"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeInterest"
                  stackId="2"
                  stroke="hsl(38, 92%, 50%)"
                  strokeWidth={2}
                  fill="url(#interestGradient)"
                  name="Interest Paid"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
