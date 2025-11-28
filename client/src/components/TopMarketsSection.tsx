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
  ChevronRight,
  X,
  Sparkles,
  Users,
  GraduationCap,
} from "lucide-react";
import { StateMarketMap } from "@/components/StateMarketMap";
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

export function TopMarketsSection({ stateSlug, stateName }: TopMarketsSectionProps) {
  const [metros, setMetros] = useState<Metro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredMarket, setHoveredMarket] = useState<MarketDetail | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketDetail | null>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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

      <div className="relative">
        <div className={`grid gap-8 items-start transition-all duration-300 ${
          selectedMarket ? 'lg:grid-cols-2' : 'lg:grid-cols-2'
        }`}>
          <Card className="overflow-hidden border-primary/10">
            <CardContent className="p-4 md:p-6">
              <StateMarketMap
                stateSlug={stateSlug}
                stateName={stateName}
                markets={marketsWithDetails}
                selectedMarket={selectedMarket}
                hoveredMarket={hoveredMarket}
                onMarkerClick={handleMarkerClick}
                onMarkerHover={handleMarkerHover}
              />
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {marketsWithDetails.map((market) => (
                  <Badge
                    key={market.id}
                    variant={selectedMarket?.id === market.id ? "default" : hoveredMarket?.id === market.id ? "secondary" : "outline"}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredMarket(market)}
                    onMouseLeave={() => setHoveredMarket(null)}
                    onClick={() => handleCardClick(market)}
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
            ) : (
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

        {selectedMarket && !isDesktop && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
              onClick={handleCloseDrawer}
            />
            <div 
              className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col"
              data-testid="mobile-market-drawer"
            >
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="flex-1 overflow-hidden">
                <MarketDetailDrawer
                  market={selectedMarket}
                  stateName={stateName}
                  onClose={handleCloseDrawer}
                  isOpen={!!selectedMarket}
                  isMobile={true}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
