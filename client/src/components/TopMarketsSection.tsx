import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import {
  MapPin,
  TrendingUp,
  Home,
  DollarSign,
  ArrowRight,
  Building2,
  ChevronRight,
  Sparkles,
  Users,
  GraduationCap,
  Percent,
  Star,
  CheckCircle,
} from "lucide-react";
import { StateMapDark } from "@/components/StateMapDark";
import { MarketDetailDrawer } from "@/components/MarketDetailDrawer";
import { 
  getMarketDetails, 
  generateMarketDetailFromBasicData,
  type MarketDetail 
} from "@/data/marketDetails";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

interface Metro {
  name: string;
  lat: number;
  lng: number;
  rank: number;
}

interface TopMarketsSectionProps {
  stateSlug: string;
  stateName: string;
  loanVolume?: number;
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

function MarketCard({ 
  market, 
  index,
  isHovered,
  isSelected,
  onHover,
  onClick,
}: { 
  market: MarketDetail;
  index: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) {
  return (
    <Card 
      className={`overflow-hidden transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : 
        isHovered ? 'ring-2 ring-primary/50 shadow-md' : 'hover-elevate'
      }`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
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
              <div className="flex items-center gap-1.5">
                {market.strFriendliness.tier === "Excellent" && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30 shrink-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    STR Friendly
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs shrink-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{market.realEstate.priceGrowth.toFixed(1)}%
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Median Price</p>
                <p className="font-medium flex items-center gap-1">
                  <Home className="w-3 h-3 text-muted-foreground" />
                  {formatCurrency(market.realEstate.medianPrice)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Avg. Rent</p>
                <p className="font-medium flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                  {formatCurrency(market.realEstate.avgRent)}/mo
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Cap Rate</p>
                <p className="font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                  {market.realEstate.capRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {(isHovered || isSelected) && (
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground border-t pt-2">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Pop: {(market.demographics.population / 1000).toFixed(0)}K
                </span>
                {market.universities.length > 0 && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {market.universities.length} Universities
                  </span>
                )}
                <span className="ml-auto text-primary flex items-center gap-1">
                  View Details <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MobileMarketAccordionContent({ market }: { market: MarketDetail }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Home className="h-4 w-4" />
            <span className="text-xs font-medium">Median Price</span>
          </div>
          <span className="text-lg font-bold">{formatCurrency(market.realEstate.medianPrice)}</span>
          <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(market.realEstate.medianPricePerSqft)}/sqft</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">Price Growth</span>
          </div>
          <span className="text-lg font-bold">+{market.realEstate.priceGrowth.toFixed(1)}%</span>
          <p className="text-xs text-muted-foreground mt-0.5">Year over Year</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">Avg. Rent</span>
          </div>
          <span className="text-lg font-bold">{formatCurrency(market.realEstate.avgRent)}/mo</span>
          <p className="text-xs text-muted-foreground mt-0.5">+{market.realEstate.rentGrowth.toFixed(1)}% YoY</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Percent className="h-4 w-4" />
            <span className="text-xs font-medium">Cap Rate</span>
          </div>
          <span className="text-lg font-bold">{market.realEstate.capRate.toFixed(1)}%</span>
          <p className="text-xs text-muted-foreground mt-0.5">Average</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Pop: {(market.demographics.population / 1000).toFixed(0)}K</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{market.realEstate.daysOnMarket} days on market</span>
        </div>
        {market.universities.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>{market.universities.length} Universities</span>
          </div>
        )}
      </div>

      {market.highlights.length > 0 && (
        <div className="bg-muted/20 rounded-lg p-3 border border-muted">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Market Highlights
          </h4>
          <ul className="space-y-1.5">
            {market.highlights.slice(0, 3).map((highlight, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function TopMarketsSection({ stateSlug, stateName }: TopMarketsSectionProps) {
  const [metros, setMetros] = useState<Metro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredMarket, setHoveredMarket] = useState<MarketDetail | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketDetail | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const containerRef = useRef<HTMLDivElement>(null);

  const marketsWithDetails = useMemo(() => {
    const enrichedMarkets = getMarketDetails(stateSlug);
    
    if (enrichedMarkets.length > 0) {
      return enrichedMarkets.slice(0, 5);
    }

    return metros.slice(0, 5).map(metro => 
      generateMarketDetailFromBasicData(
        metro.name, 
        stateSlug, 
        metro.lat, 
        metro.lng, 
        metro.rank
      )
    );
  }, [metros, stateSlug]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const metrosResponse = await fetch('/state_maps/metros_data.json');
        
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

  const handleMarkerClick = (market: MarketDetail) => {
    setSelectedMarket(selectedMarket?.id === market.id ? null : market);
    setHoveredMarket(null);
  };

  const handleMarkerHover = (market: MarketDetail | null) => {
    if (!selectedMarket && isDesktop) {
      setHoveredMarket(market);
    }
  };

  const handleCardClick = (market: MarketDetail) => {
    setSelectedMarket(selectedMarket?.id === market.id ? null : market);
    setHoveredMarket(null);
  };

  const handleCloseDrawer = () => {
    setSelectedMarket(null);
    setHoveredMarket(null);
  };

  if (!isLoading && marketsWithDetails.length === 0) {
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
          Click on a market to explore detailed stats, demographics, universities, and STR regulations.
        </p>
      </div>

      <div className="relative" ref={containerRef}>
        <div className={`grid gap-8 items-start transition-all duration-300 ${
          selectedMarket ? 'lg:grid-cols-2' : 'lg:grid-cols-2'
        }`}>
          <Card className="overflow-hidden border-primary/10 bg-transparent">
            <CardContent className="p-0">
              <StateMapDark
                stateSlug={stateSlug}
                stateName={stateName}
                markets={marketsWithDetails}
                selectedMarket={selectedMarket}
                hoveredMarket={hoveredMarket}
                onMarkerClick={handleMarkerClick}
                onMarkerHover={handleMarkerHover}
              />
              
              <div className="p-4 bg-slate-900/80 backdrop-blur-sm border-t border-amber-500/20">
                <div className="flex flex-wrap gap-2 justify-center">
                  {marketsWithDetails.map((market) => (
                    <Badge
                      key={market.id}
                      variant={selectedMarket?.id === market.id ? "default" : hoveredMarket?.id === market.id ? "secondary" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedMarket?.id === market.id 
                          ? 'bg-amber-500 text-slate-900 border-amber-400' 
                          : hoveredMarket?.id === market.id 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                            : 'bg-slate-800/80 text-slate-300 border-slate-600 hover:border-amber-500/50 hover:text-amber-300'
                      }`}
                      onMouseEnter={() => setHoveredMarket(market)}
                      onMouseLeave={() => setHoveredMarket(null)}
                      onClick={() => handleCardClick(market)}
                      data-testid={`badge-market-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${
                        market.rank === 1 ? 'bg-amber-500' : 
                        market.rank === 2 ? 'bg-amber-600' : 
                        'bg-amber-700'
                      }`} />
                      {market.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className={`transition-all duration-300 ${selectedMarket && isDesktop ? 'lg:col-span-1' : ''}`}>
            {selectedMarket && isDesktop ? (
              <div className="h-[500px] lg:h-[600px] rounded-lg overflow-hidden border">
                <MarketDetailDrawer
                  market={selectedMarket}
                  stateName={stateName}
                  onClose={handleCloseDrawer}
                  isOpen={!!selectedMarket}
                />
              </div>
            ) : isDesktop ? (
              <div className="space-y-3">
                {marketsWithDetails.map((market, index) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    index={index}
                    isHovered={hoveredMarket?.id === market.id}
                    isSelected={selectedMarket?.id === market.id}
                    onHover={(hovered) => setHoveredMarket(hovered ? market : null)}
                    onClick={() => handleCardClick(market)}
                  />
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
            ) : (
              <Accordion 
                type="single" 
                collapsible 
                value={selectedMarket?.id || ""} 
                onValueChange={(value) => {
                  const market = marketsWithDetails.find(m => m.id === value);
                  setSelectedMarket(market || null);
                }}
                className="space-y-3"
              >
                {marketsWithDetails.map((market, index) => (
                  <AccordionItem 
                    key={market.id} 
                    value={market.id}
                    className="border rounded-lg overflow-hidden bg-card"
                    data-testid={`accordion-market-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:border-b">
                      <div className="flex items-center gap-3 w-full">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-primary text-primary-foreground' : 
                          index === 1 ? 'bg-primary/20 text-primary' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h3 className="font-semibold">{market.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatCurrency(market.realEstate.medianPrice)}</span>
                            <span>•</span>
                            <span className="text-green-600">+{market.realEstate.priceGrowth.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mr-2">
                          {market.strFriendliness.tier === "Excellent" && (
                            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/30 shrink-0">
                              <Sparkles className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <MobileMarketAccordionContent market={market} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
                
                <div className="pt-4">
                  <Link href="/get-quote">
                    <Button className="w-full" size="lg" data-testid="button-get-quote-markets">
                      Get a Quote for {stateName} Properties
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Accordion>
            )}
          </div>
        </div>

        {selectedMarket && isDesktop && (
          <div className="hidden lg:block mt-6">
            <div className="space-y-3">
              {marketsWithDetails.filter(m => m.id !== selectedMarket.id).map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  index={marketsWithDetails.findIndex(m => m.id === market.id)}
                  isHovered={hoveredMarket?.id === market.id}
                  isSelected={false}
                  onHover={(hovered) => setHoveredMarket(hovered ? market : null)}
                  onClick={() => handleCardClick(market)}
                />
              ))}
              
              <div className="pt-4">
                <Link href="/get-quote">
                  <Button className="w-full" size="lg" data-testid="button-get-quote-markets-bottom">
                    Get a Quote for {stateName} Properties
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
