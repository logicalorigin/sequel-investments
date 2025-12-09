import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { statePaths } from "./USMap";
import type { StateData } from "@shared/schema";

interface StatePageHeroProps {
  state: StateData;
  formatLoanVolume: (volume: number) => string;
}

// Get the bounding box for a state path to properly center it
function getPathBounds(pathD: string): { minX: number; minY: number; maxX: number; maxY: number } {
  const coords: number[][] = [];
  const regex = /[ML]\s*([\d.]+)[,\s]+([\d.]+)/gi;
  let match;
  while ((match = regex.exec(pathD)) !== null) {
    coords.push([parseFloat(match[1]), parseFloat(match[2])]);
  }
  if (coords.length === 0) return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
  
  const xs = coords.map(c => c[0]);
  const ys = coords.map(c => c[1]);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  };
}

export function StatePageHero({ state, formatLoanVolume }: StatePageHeroProps) {
  const statePathD = statePaths[state.abbreviation];
  const bounds = statePathD ? getPathBounds(statePathD) : null;
  
  // Add padding around the state
  const padding = 20;
  const viewBox = bounds 
    ? `${bounds.minX - padding} ${bounds.minY - padding} ${bounds.maxX - bounds.minX + padding * 2} ${bounds.maxY - bounds.minY + padding * 2}`
    : "0 0 100 100";

  return (
    <section className="relative pt-12 pb-20 overflow-hidden min-h-[500px]">
      {/* US Map Background with highlighted focus state */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full opacity-20"
          preserveAspectRatio="xMidYMid slice"
        >
          {Object.entries(statePaths).map(([abbr, pathD]) => (
            <path
              key={abbr}
              d={pathD}
              fill={abbr === state.abbreviation ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.15)"}
              stroke={abbr === state.abbreviation ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)"}
              strokeWidth={abbr === state.abbreviation ? 2 : 0.5}
              className={abbr === state.abbreviation ? "opacity-100" : "opacity-60"}
            />
          ))}
        </svg>
      </div>

      {/* Dark gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40 dark:from-black/90 dark:via-black/75 dark:to-black/50 pointer-events-none" />

      {/* Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[400px]">
          {/* Left: Text Content */}
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/70 mb-4">
              <Link href="/where-we-lend" className="hover:text-primary transition-colors">
                Where We Lend
              </Link>
              <ArrowRight className="h-4 w-4" />
              <span className="text-white">{state.name}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white" data-testid="text-state-title">
              {state.name} Investment Property Loans
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Sequel Investments is proud to be a leading private lender in {state.name}! 
              We offer industry-leading Hard Money and DSCR Loans for every type of {state.name} real estate investor.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="bg-card/90 backdrop-blur-sm rounded-lg px-6 py-4 border">
                <p className="text-3xl font-bold text-primary">{state.loansClosed.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Loans Closed in {state.abbreviation}</p>
              </div>
              <div className="bg-card/90 backdrop-blur-sm rounded-lg px-6 py-4 border">
                <p className="text-3xl font-bold text-primary">{formatLoanVolume(state.loanVolume)}</p>
                <p className="text-sm text-muted-foreground">Total Volume Funded</p>
              </div>
            </div>

            {/* CTA */}
            <Link href="/get-quote">
              <Button size="lg" data-testid="button-get-quote">
                Get Your Rate
              </Button>
            </Link>
          </div>

          {/* Right: Large Prominent State */}
          <div className="hidden lg:flex items-center justify-center">
            {statePathD && (
              <svg
                viewBox={viewBox}
                className="w-full max-w-md h-auto drop-shadow-2xl"
                style={{ maxHeight: '350px' }}
              >
                <path
                  d={statePathD}
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  className="opacity-90"
                  style={{
                    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))'
                  }}
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
