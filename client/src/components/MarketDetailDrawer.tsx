import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Home,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  Percent,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Info,
  Star,
  BarChart3,
  Clock,
  Shield,
  Wallet,
  FileText,
  Lightbulb,
  Loader2,
  Navigation,
} from "lucide-react";
import type { MarketDetail, STRFriendliness } from "@/data/marketDetails";
import { AirDNAModalTrigger } from "@/components/AirDNAModal";

interface NearbyUniversity {
  name: string;
  type: "public" | "private" | "community";
  enrollment: number;
  placeId?: string;
  rating?: number;
  userRatingsTotal?: number;
  vicinity?: string;
  distanceMiles: number;
}

interface MarketDetailDrawerProps {
  market: MarketDetail | null;
  stateName: string;
  onClose: () => void;
  isOpen: boolean;
  isMobile?: boolean;
}

type TabId = "overview" | "demographics" | "universities" | "str";

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function STRTierBadge({ tier }: { tier: STRFriendliness["tier"] }) {
  const colors: Record<STRFriendliness["tier"], string> = {
    "Excellent": "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
    "Good": "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
    "Moderate": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    "Restricted": "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
    "Prohibited": "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
  };

  const icons: Record<STRFriendliness["tier"], typeof CheckCircle> = {
    "Excellent": CheckCircle,
    "Good": CheckCircle,
    "Moderate": AlertCircle,
    "Restricted": AlertCircle,
    "Prohibited": X,
  };

  const Icon = icons[tier];

  return (
    <Badge variant="outline" className={`${colors[tier]} gap-1`}>
      <Icon className="h-3 w-3" />
      {tier}
    </Badge>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  trend,
  className = "" 
}: { 
  icon: typeof Home; 
  label: string; 
  value: string; 
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <div className={`bg-muted/30 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold">{value}</span>
        {trend && (
          trend === "up" ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : trend === "down" ? (
            <TrendingDown className="h-3 w-3 text-red-500" />
          ) : null
        )}
      </div>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
      )}
    </div>
  );
}

function TabButton({ 
  id, 
  label, 
  icon: Icon, 
  isActive, 
  onClick 
}: { 
  id: TabId; 
  label: string; 
  icon: typeof Home; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
      data-testid={`tab-${id}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function OverviewTab({ market }: { market: MarketDetail }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <StatCard 
          icon={Home} 
          label="Median Price" 
          value={formatCurrency(market.realEstate.medianPrice)}
          subValue={`${formatCurrency(market.realEstate.medianPricePerSqft)}/sqft`}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Price Growth" 
          value={`+${market.realEstate.priceGrowth.toFixed(1)}%`}
          subValue="Year over Year"
          trend="up"
        />
        <StatCard 
          icon={DollarSign} 
          label="Avg. Rent" 
          value={`${formatCurrency(market.realEstate.avgRent)}/mo`}
          subValue={`+${market.realEstate.rentGrowth.toFixed(1)}% YoY`}
          trend="up"
        />
        <StatCard 
          icon={Percent} 
          label="Cap Rate" 
          value={`${market.realEstate.capRate.toFixed(1)}%`}
          subValue="Average"
        />
        <StatCard 
          icon={Calendar} 
          label="Days on Market" 
          value={market.realEstate.daysOnMarket.toString()}
          subValue="Average listing"
        />
        <StatCard 
          icon={BarChart3} 
          label="Inventory" 
          value={`${market.realEstate.inventoryMonths.toFixed(1)} mo`}
          subValue="Supply"
        />
      </div>

      <div className="bg-muted/20 rounded-lg p-3 border border-muted">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          Market Highlights
        </h4>
        <ul className="space-y-1.5">
          {market.highlights.map((highlight, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Investor Tips
        </h4>
        <ul className="space-y-1.5">
          {market.investorTips.map((tip, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DemographicsTab({ market }: { market: MarketDetail }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <StatCard 
          icon={Users} 
          label="Population" 
          value={formatNumber(market.demographics.population)}
          subValue={`+${market.demographics.populationGrowth.toFixed(1)}% growth`}
          trend={market.demographics.populationGrowth > 0 ? "up" : "down"}
        />
        <StatCard 
          icon={Wallet} 
          label="Median Income" 
          value={formatCurrency(market.demographics.medianIncome)}
        />
        <StatCard 
          icon={Clock} 
          label="Median Age" 
          value={market.demographics.medianAge.toFixed(1)}
          subValue="years"
        />
        <StatCard 
          icon={Building2} 
          label="Walk Score" 
          value={market.demographics.walkScore.toString()}
          subValue={market.demographics.walkScore >= 70 ? "Very Walkable" : market.demographics.walkScore >= 50 ? "Somewhat Walkable" : "Car-Dependent"}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium">Crime Index</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  market.demographics.crimeIndex < 40 ? "bg-green-500" :
                  market.demographics.crimeIndex < 60 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${market.demographics.crimeIndex}%` }}
              />
            </div>
            <span className="text-sm font-medium">{market.demographics.crimeIndex}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {market.demographics.crimeIndex < 40 ? "Below average" : 
             market.demographics.crimeIndex < 60 ? "Average" : "Above average"}
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">Unemployment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  market.demographics.unemploymentRate < 4 ? "bg-green-500" :
                  market.demographics.unemploymentRate < 6 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(market.demographics.unemploymentRate * 10, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium">{market.demographics.unemploymentRate.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {market.demographics.unemploymentRate < 4 ? "Strong job market" : 
             market.demographics.unemploymentRate < 6 ? "Average" : "High unemployment"}
          </p>
        </div>
      </div>

      <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          Demographic Insights
        </h4>
        <p className="text-sm text-muted-foreground">
          {market.name} has a population of {formatNumber(market.demographics.population)} with 
          {market.demographics.populationGrowth > 1 ? " strong" : market.demographics.populationGrowth > 0 ? " modest" : " declining"} growth. 
          The median household income of {formatCurrency(market.demographics.medianIncome)} 
          {market.demographics.medianIncome > 65000 ? " is above the national average, supporting higher rents" : " suggests focusing on workforce housing"}.
        </p>
      </div>
    </div>
  );
}

function UniversitiesTab({ market }: { market: MarketDetail }) {
  const { data, isLoading, error } = useQuery<{ universities: NearbyUniversity[]; totalResults: number; searchRadius: string }>({
    queryKey: ['/api/universities/nearby', market.lat, market.lng],
    queryFn: async () => {
      const response = await fetch(`/api/universities/nearby?lat=${market.lat}&lng=${market.lng}`);
      if (!response.ok) throw new Error('Failed to fetch universities');
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Finding universities within 25 miles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500/50 mb-3" />
        <p className="text-muted-foreground">Unable to load university data</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please try again later
        </p>
      </div>
    );
  }

  const universities = data?.universities || [];

  if (universities.length === 0) {
    return (
      <div className="text-center py-8">
        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No universities found within 25 miles</p>
        <p className="text-sm text-muted-foreground mt-1">
          This market may have limited student housing opportunities
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-purple-500/5 rounded-lg p-3 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Universities Within 25 Miles</p>
            <p className="text-2xl font-bold">{universities.length}</p>
          </div>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30">
            <Navigation className="h-3 w-3 mr-1" />
            25 mi radius
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {universities.map((university, i) => (
          <div 
            key={university.placeId || i} 
            className="bg-muted/30 rounded-lg p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm">{university.name}</h4>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {university.type}
                  </Badge>
                </div>
                {university.vicinity && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {university.vicinity}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {university.distanceMiles} mi away
                  </span>
                  {university.rating && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      {university.rating.toFixed(1)}
                      {university.userRatingsTotal && (
                        <span className="text-muted-foreground/70">({university.userRatingsTotal})</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/20 rounded-lg p-3 border border-muted">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Student Housing Opportunity
        </h4>
        <p className="text-sm text-muted-foreground">
          With {universities.length} {universities.length === 1 ? 'university' : 'universities'} nearby, {market.name} offers potential for 
          student housing investments. Consider properties within walking distance of campus or 
          along public transit routes. Multi-bedroom configurations typically yield higher returns 
          in college markets.
        </p>
      </div>
    </div>
  );
}

function STRTab({ market }: { market: MarketDetail }) {
  const { strFriendliness } = market;

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(strFriendliness.score / 100) * 176} 176`}
                className={
                  strFriendliness.score >= 70 ? "text-green-500" :
                  strFriendliness.score >= 50 ? "text-amber-500" : "text-red-500"
                }
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
              {strFriendliness.score}
            </span>
          </div>
          <div className="text-left">
            <STRTierBadge tier={strFriendliness.tier} />
            <p className="text-sm text-muted-foreground mt-1">STR Friendliness Score</p>
          </div>
        </div>
      </div>

      <div className="bg-muted/20 rounded-lg p-3 border border-muted">
        <p className="text-sm">{strFriendliness.summary}</p>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Key Regulations
        </h4>
        <ul className="space-y-2">
          {strFriendliness.regulations.map((reg, i) => (
            <li key={i} className="text-sm flex items-start gap-2 bg-muted/20 rounded-lg px-3 py-2">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              {reg}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Permit Required</p>
          <p className="font-semibold flex items-center gap-2">
            {strFriendliness.permitRequired ? (
              <>
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Yes
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                No
              </>
            )}
          </p>
        </div>
        {strFriendliness.licenseFee && (
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">License/Tax</p>
            <p className="font-semibold text-sm">{strFriendliness.licenseFee}</p>
          </div>
        )}
      </div>

      {strFriendliness.tier === "Excellent" || strFriendliness.tier === "Good" ? (
        <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
          <h4 className="font-semibold text-sm mb-1 flex items-center gap-2 text-green-700 dark:text-green-400">
            <Sparkles className="h-4 w-4" />
            Good for STR Investment
          </h4>
          <p className="text-sm text-muted-foreground">
            {market.name}'s regulatory environment is favorable for short-term rental investors. 
            The permitting process is straightforward and there are no strict day limits on rentals.
          </p>
        </div>
      ) : (
        <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/20">
          <h4 className="font-semibold text-sm mb-1 flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            Consider Long-Term Rentals
          </h4>
          <p className="text-sm text-muted-foreground">
            Due to STR restrictions in {market.name}, consider focusing on long-term or mid-term rentals 
            (30+ days) which typically face fewer regulations while still providing solid returns.
          </p>
        </div>
      )}

      <AirDNAModalTrigger 
        variant="default" 
        className="w-full mt-4"
        data-testid="button-estimate-income-market"
      >
        Estimate Income for This Market
      </AirDNAModalTrigger>
    </div>
  );
}

export function MarketDetailDrawer({ market, stateName, onClose, isOpen, isMobile = false }: MarketDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  if (!market || !isOpen) return null;

  return (
    <div 
      className={`bg-card flex flex-col h-full ${isMobile ? 'rounded-t-xl' : 'border-l shadow-xl animate-in slide-in-from-right duration-300'}`}
      data-testid="market-detail-drawer"
    >
      <div className={`flex items-center justify-between border-b bg-muted/30 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <Badge variant="outline" className="h-8 w-8 p-0 justify-center text-sm font-bold shrink-0">
            {market.rank}
          </Badge>
          <div className="min-w-0">
            <h2 className="font-bold text-lg truncate">{market.name}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {stateName}
            </p>
          </div>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={onClose}
          className="shrink-0"
          data-testid="button-close-drawer"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-1 p-2 border-b bg-muted/10 overflow-x-auto">
        <TabButton 
          id="overview" 
          label="Real Estate" 
          icon={Home} 
          isActive={activeTab === "overview"} 
          onClick={() => setActiveTab("overview")} 
        />
        <TabButton 
          id="demographics" 
          label="Demographics" 
          icon={Users} 
          isActive={activeTab === "demographics"} 
          onClick={() => setActiveTab("demographics")} 
        />
        <TabButton 
          id="universities" 
          label="Universities" 
          icon={GraduationCap} 
          isActive={activeTab === "universities"} 
          onClick={() => setActiveTab("universities")} 
        />
        <TabButton 
          id="str" 
          label="STR Rules" 
          icon={Building2} 
          isActive={activeTab === "str"} 
          onClick={() => setActiveTab("str")} 
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeTab === "overview" && <OverviewTab market={market} />}
          {activeTab === "demographics" && <DemographicsTab market={market} />}
          {activeTab === "universities" && <UniversitiesTab market={market} />}
          {activeTab === "str" && <STRTab market={market} />}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/10 space-y-2">
        <Link href="/get-quote">
          <Button className="w-full" data-testid="button-get-quote-market">
            Get a Quote for {market.name}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
        <Link href="/portal/dscr-analyzer">
          <Button variant="outline" className="w-full" data-testid="button-analyze-deal">
            Analyze a Deal
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default MarketDetailDrawer;
