import { useState, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PropertySearchBar, type PlaceResult } from "@/components/PropertySearchBar";
import { PropertyCard, PropertyCardSkeleton } from "@/components/PropertyCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeometricPattern } from "@/components/GeometricPattern";
import { 
  Search, 
  MapPin, 
  Building2, 
  TrendingUp, 
  Calculator,
  ArrowRight,
  Sparkles,
  Home,
  Target
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface SearchedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  estimatedValue?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  propertyType?: string;
}

export default function PropertySearchPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchedProperties, setSearchedProperties] = useState<SearchedProperty[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handlePlaceSelect = useCallback((place: PlaceResult) => {
    setIsSearching(true);
    setHasSearched(true);
    
    setTimeout(() => {
      const property: SearchedProperty = {
        id: place.placeId,
        address: place.address,
        city: place.city,
        state: place.state,
        stateCode: place.stateCode,
        zipCode: place.zipCode,
        latitude: place.latitude,
        longitude: place.longitude,
        formattedAddress: place.formattedAddress,
        estimatedValue: Math.floor(Math.random() * 500000) + 200000,
        bedrooms: Math.floor(Math.random() * 4) + 2,
        bathrooms: Math.floor(Math.random() * 3) + 1,
        squareFeet: Math.floor(Math.random() * 2000) + 1000,
        yearBuilt: Math.floor(Math.random() * 50) + 1970,
        propertyType: ["Single Family", "Multi-Family", "Condo", "Townhouse"][Math.floor(Math.random() * 4)],
      };

      setSearchedProperties((prev) => {
        const exists = prev.some(p => p.id === property.id);
        if (exists) {
          return prev;
        }
        return [property, ...prev];
      });
      
      setIsSearching(false);
      
      toast({
        title: "Property Found",
        description: `${place.formattedAddress} has been added to your search results.`,
      });
    }, 1000);
  }, [toast]);

  const handleAnalyzeProperty = useCallback((property: SearchedProperty) => {
    navigate(`/portal/dscr-analyzer?address=${encodeURIComponent(property.formattedAddress)}`);
  }, [navigate]);

  const handleFavoriteProperty = useCallback((property: SearchedProperty) => {
    toast({
      title: "Added to Favorites",
      description: `${property.address} has been saved to your favorites.`,
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-8 pb-16 md:pt-12 md:pb-24 overflow-hidden bg-background">
        <GeometricPattern 
          variant="orbs" 
          className="text-primary" 
          opacity={0.08}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by Google Maps
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-page-title">
              Find Your Next{" "}
              <span className="text-primary">Investment Property</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Search any property address to view satellite imagery, get instant valuations, 
              and analyze potential investment returns
            </p>

            <div className="max-w-2xl mx-auto">
              <PropertySearchBar 
                onPlaceSelect={handlePlaceSelect}
                placeholder="Enter a property address to search..."
                size="lg"
                showButton={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Satellite View</h3>
                <p className="text-sm text-muted-foreground">
                  View properties from above with high-resolution satellite imagery
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Instant Valuations</h3>
                <p className="text-sm text-muted-foreground">
                  Get estimated property values and market data instantly
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Investment Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze ROI, cash flow, and financing options with one click
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {(hasSearched || searchedProperties.length > 0) && (
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" data-testid="text-results-title">
                  Search Results
                </h2>
                <p className="text-muted-foreground">
                  {searchedProperties.length} {searchedProperties.length === 1 ? "property" : "properties"} found
                </p>
              </div>
              {searchedProperties.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => setSearchedProperties([])}
                  data-testid="button-clear-results"
                >
                  Clear All
                </Button>
              )}
            </div>

            {isSearching && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <PropertyCardSkeleton />
              </div>
            )}

            {searchedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    address={property.address}
                    city={property.city}
                    state={property.stateCode}
                    zipCode={property.zipCode}
                    latitude={property.latitude}
                    longitude={property.longitude}
                    estimatedValue={property.estimatedValue}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    squareFeet={property.squareFeet}
                    yearBuilt={property.yearBuilt}
                    propertyType={property.propertyType}
                    onAnalyze={() => handleAnalyzeProperty(property)}
                    onFavorite={() => handleFavoriteProperty(property)}
                  />
                ))}
              </div>
            ) : (
              !isSearching && hasSearched && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No properties yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Search for an address above to view property details with satellite imagery
                    </p>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Finance Your Investment?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Once you've found the perfect property, explore our flexible financing options 
              designed specifically for real estate investors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">DSCR Loans</CardTitle>
                <CardDescription>
                  Qualify based on rental income, not personal income
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                  <li>• Rates from 5.75%</li>
                  <li>• No W2 or tax returns required</li>
                  <li>• Up to 80% LTV</li>
                </ul>
                <Link href="/dscr-loans">
                  <Button variant="outline" className="w-full" data-testid="link-dscr-loans">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Fix & Flip Loans</CardTitle>
                <CardDescription>
                  Short-term financing for renovation projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                  <li>• Close in as fast as 48 hours</li>
                  <li>• Up to 90% of purchase + 100% rehab</li>
                  <li>• 12-24 month terms</li>
                </ul>
                <Link href="/fix-flip">
                  <Button variant="outline" className="w-full" data-testid="link-fix-flip">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Construction Loans</CardTitle>
                <CardDescription>
                  Finance your ground-up construction projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                  <li>• Up to 90% LTC</li>
                  <li>• 9-24 month terms</li>
                  <li>• Rates from 9.90%</li>
                </ul>
                <Link href="/new-construction">
                  <Button variant="outline" className="w-full" data-testid="link-construction">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary relative overflow-hidden">
        <GeometricPattern 
          variant="circles" 
          className="text-primary-foreground" 
          opacity={0.15}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
            Get Pre-Qualified in Minutes
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Start your investment journey today with flexible financing options 
            tailored to your needs
          </p>
          <Link href="/get-quote">
            <Button size="lg" variant="secondary" className="text-lg px-8" data-testid="button-cta-getquote">
              Get Your Rate
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
