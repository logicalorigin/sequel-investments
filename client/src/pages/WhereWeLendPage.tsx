import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import USMap from "@/components/USMap";
import USMap3D from "@/components/USMap3D";
import { statesData, getEligibleStates, type StateData } from "@shared/schema";
import { MapPin, Check, X, Box, MapIcon } from "lucide-react";

export default function WhereWeLendPage() {
  const eligibleStates = getEligibleStates();
  const ineligibleStates = statesData.filter(s => !s.isEligible);
  const [, setLocation] = useLocation();
  const [mapView, setMapView] = useState<"3d" | "2d">("3d");

  useEffect(() => {
    document.title = "Where We Lend - Secured Asset Funding | 48 States + DC";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Secured Asset Funding offers DSCR, Fix & Flip, and Hard Money loans across 48 states and Washington D.C. Find investment property financing in your state.");
    }
  }, []);

  const handleStateClick = (state: StateData) => {
    setLocation(`/states/${state.slug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative pt-12 pb-20 overflow-hidden bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-page-title">
              Where We Lend
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Secured Asset Funding is a nationwide private mortgage lender serving real estate investors across 48 states and Washington D.C. 
              Our innovative financing solutions help investors of all experience levels achieve their investment goals.
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            <Button
              variant={mapView === "3d" ? "default" : "outline"}
              size="sm"
              onClick={() => setMapView("3d")}
              data-testid="button-map-3d"
            >
              <Box className="h-4 w-4 mr-2" />
              3D Interactive
            </Button>
            <Button
              variant={mapView === "2d" ? "default" : "outline"}
              size="sm"
              onClick={() => setMapView("2d")}
              data-testid="button-map-2d"
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Classic Map
            </Button>
          </div>

          <div className="max-w-5xl mx-auto">
            {mapView === "3d" ? (
              <USMap3D onStateClick={handleStateClick} />
            ) : (
              <USMap onStateClick={handleStateClick} />
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Eligible States: All Lending Programs
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-12">
            {eligibleStates
              .filter(s => s.eligiblePrograms.dscr && s.eligiblePrograms.fixFlip && s.eligiblePrograms.hardMoney)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((state) => (
                <Link key={state.slug} href={`/states/${state.slug}`}>
                  <div className="text-center p-3 rounded-lg border bg-card hover-elevate transition-all cursor-pointer" data-testid={`state-card-${state.slug}`}>
                    <p className="font-bold text-primary text-lg">{state.abbreviation}</p>
                    <p className="text-xs text-muted-foreground truncate">{state.name}</p>
                  </div>
                </Link>
              ))}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Eligible States: DSCR Only
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-12">
            {eligibleStates
              .filter(s => s.eligiblePrograms.dscr && !s.eligiblePrograms.fixFlip)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((state) => (
                <Link key={state.slug} href={`/states/${state.slug}`}>
                  <div className="text-center p-3 rounded-lg border bg-card hover-elevate transition-all cursor-pointer" data-testid={`state-card-${state.slug}`}>
                    <p className="font-bold text-primary text-lg">{state.abbreviation}</p>
                    <p className="text-xs text-muted-foreground truncate">{state.name}</p>
                  </div>
                </Link>
              ))}
          </div>

          {ineligibleStates.length > 0 && (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-muted-foreground">
                Ineligible States: All Programs
              </h2>
              
              <div className="flex justify-center gap-3">
                {ineligibleStates.map((state) => (
                  <div key={state.slug} className="text-center p-3 rounded-lg border bg-muted/50" data-testid={`state-card-${state.slug}`}>
                    <p className="font-bold text-muted-foreground text-lg">{state.abbreviation}</p>
                    <p className="text-xs text-muted-foreground truncate">{state.name}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Our Loan Programs
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card data-testid="card-program-dscr">
              <CardHeader>
                <CardTitle className="text-xl">DSCR Loans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Rates from 5.75%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Up to 80% LTV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>No minimum DSCR</span>
                  </li>
                </ul>
                <Link href="/dscr-loans">
                  <Button variant="outline" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="card-program-fixflip">
              <CardHeader>
                <CardTitle className="text-xl">Fix & Flip Loans</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Rates from 8.90%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Up to 90% LTC / 70% ARV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>48-hour closes available</span>
                  </li>
                </ul>
                <Link href="/fix-flip">
                  <Button variant="outline" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="card-program-construction">
              <CardHeader>
                <CardTitle className="text-xl">New Construction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Rates from 9.90%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Up to 82.5% LTC</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>48-hour draw turnaround</span>
                  </li>
                </ul>
                <Link href="/new-construction">
                  <Button variant="outline" className="w-full">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
