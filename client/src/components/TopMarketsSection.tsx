import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  MapPin,
  TrendingUp,
  Home,
  DollarSign,
  ArrowRight,
  Building2,
} from "lucide-react";

interface Metro {
  name: string;
  lat: number;
  lng: number;
  rank: number;
}

interface MarketData {
  medianPrice: number;
  priceGrowth: number;
  avgRent: number;
  capRate: number;
}

interface TopMarketsSectionProps {
  stateSlug: string;
  stateName: string;
  loanVolume?: number;
}

const BASE_PRICES: Record<string, number> = {
  "california": 750000, "new-york": 680000, "florida": 420000, "texas": 340000,
  "arizona": 445000, "colorado": 560000, "washington": 620000, "nevada": 410000,
  "georgia": 380000, "north-carolina": 365000, "tennessee": 340000, "oregon": 520000,
  "massachusetts": 580000, "maryland": 420000, "virginia": 450000, "new-jersey": 480000,
  "connecticut": 390000, "utah": 490000, "illinois": 310000, "pennsylvania": 280000,
  "ohio": 240000, "michigan": 250000, "indiana": 230000, "wisconsin": 290000,
  "minnesota": 340000, "missouri": 250000, "south-carolina": 340000, "alabama": 230000,
  "kentucky": 220000, "louisiana": 250000, "oklahoma": 210000, "iowa": 220000,
  "kansas": 220000, "arkansas": 200000, "nebraska": 250000, "idaho": 450000,
  "hawaii": 850000, "new-mexico": 330000, "montana": 420000, "wyoming": 340000,
  "alaska": 380000, "maine": 360000, "new-hampshire": 450000, "vermont": 380000,
  "rhode-island": 420000, "delaware": 350000, "west-virginia": 160000, "mississippi": 180000,
  "north-dakota": 280000, "south-dakota": 290000, "district-of-columbia": 680000,
};

function generateMarketData(cityName: string, stateSlug: string, rank: number): MarketData {
  const basePrice = BASE_PRICES[stateSlug] || 350000;
  const rankMultiplier = 1 + (1 - rank) * 0.1;
  const cityHash = cityName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  const medianPrice = Math.round(basePrice * rankMultiplier * (0.9 + (cityHash % 30) / 100));
  const priceGrowth = 2.5 + (cityHash % 60) / 10;
  const avgRent = Math.round(medianPrice * 0.0055 * (0.85 + (cityHash % 30) / 100));
  const capRate = 4.5 + (cityHash % 35) / 10;
  
  return {
    medianPrice,
    priceGrowth,
    avgRent,
    capRate,
  };
}

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

export function TopMarketsSection({ stateSlug, stateName }: TopMarketsSectionProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [metros, setMetros] = useState<Metro[]>([]);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const marketsWithData = useMemo(() => {
    return metros.slice(0, 5).map(metro => ({
      ...metro,
      marketData: generateMarketData(metro.name, stateSlug, metro.rank),
    }));
  }, [metros, stateSlug]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [svgResponse, metrosResponse] = await Promise.all([
          fetch(`/state_maps/${stateSlug}.svg`),
          fetch('/state_maps/metros_data.json')
        ]);
        
        if (svgResponse.ok) {
          const svg = await svgResponse.text();
          setSvgContent(svg);
        }
        
        if (metrosResponse.ok) {
          const allMetros = await metrosResponse.json();
          setMetros(allMetros[stateSlug] || []);
        }
      } catch (error) {
        console.error("Failed to load state data:", error);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [stateSlug]);

  if (!isLoading && metros.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="text-center mb-8 md:mb-12">
        <Badge className="mb-4" variant="outline">
          <MapPin className="w-3 h-3 mr-1" />
          Investment Hotspots
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Top Investment Markets in {stateName}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We actively lend in these high-growth markets across {stateName}. 
          Each metro offers unique opportunities for real estate investors.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <Card className="overflow-hidden border-primary/10">
          <CardContent className="p-6 md:p-8">
            <div className="relative aspect-[4/3] flex items-center justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-muted-foreground">Loading map...</div>
                </div>
              ) : svgContent ? (
                <div 
                  className="w-full h-full text-primary [&_.state-boundary]:stroke-primary/60 [&_.metro-dot]:fill-primary [&_.metro-pulse]:fill-primary/30"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MapPin className="h-16 w-16 mb-4 opacity-30" />
                  <p>{stateName}</p>
                </div>
              )}
              
              {hoveredCity && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card border shadow-lg rounded-lg px-4 py-2 z-10">
                  <p className="font-medium text-sm flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-primary" />
                    {hoveredCity}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {marketsWithData.map((market) => (
                <Badge
                  key={market.name}
                  variant={hoveredCity === market.name ? "default" : "outline"}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredCity(market.name)}
                  onMouseLeave={() => setHoveredCity(null)}
                  data-testid={`badge-market-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${
                    market.rank === 1 ? 'bg-primary' : 
                    market.rank === 2 ? 'bg-primary/80' : 
                    'bg-primary/60'
                  }`} />
                  {market.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {marketsWithData.map((market, index) => (
            <Card 
              key={market.name}
              className={`overflow-hidden transition-all hover-elevate cursor-pointer ${
                hoveredCity === market.name ? 'ring-2 ring-primary/50' : ''
              }`}
              onMouseEnter={() => setHoveredCity(market.name)}
              onMouseLeave={() => setHoveredCity(null)}
              data-testid={`card-market-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-primary text-primary-foreground' : 
                    index === 1 ? 'bg-primary/20 text-primary' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{market.name}</h3>
                      <Badge variant="outline" className="text-xs shrink-0">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{market.marketData.priceGrowth.toFixed(1)}% YoY
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5">Median Price</p>
                        <p className="font-medium flex items-center gap-1">
                          <Home className="w-3 h-3 text-muted-foreground" />
                          {formatCurrency(market.marketData.medianPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5">Avg. Rent</p>
                        <p className="font-medium flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          {formatCurrency(market.marketData.avgRent)}/mo
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5">Cap Rate</p>
                        <p className="font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          {market.marketData.capRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="pt-4">
            <Link href="/get-quote">
              <Button className="w-full" size="lg" data-testid="button-get-quote-markets">
                Get a Quote for {stateName} Properties
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
