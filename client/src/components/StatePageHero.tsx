import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { statePaths } from "./USMap";
import type { StateData } from "@shared/schema";

interface StatePageHeroProps {
  state: StateData;
  formatLoanVolume: (volume: number) => string;
}

// Get the bounding box for a state path to calculate its center
function getPathBounds(pathD: string): { minX: number; minY: number; maxX: number; maxY: number; centerX: number; centerY: number } {
  const coords: number[][] = [];
  const regex = /[ML]\s*([\d.]+)[,\s]+([\d.]+)/gi;
  let match;
  while ((match = regex.exec(pathD)) !== null) {
    coords.push([parseFloat(match[1]), parseFloat(match[2])]);
  }
  if (coords.length === 0) return { minX: 0, minY: 0, maxX: 100, maxY: 100, centerX: 50, centerY: 50 };
  
  const xs = coords.map(c => c[0]);
  const ys = coords.map(c => c[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
}

export function StatePageHero({ state, formatLoanVolume }: StatePageHeroProps) {
  const statePathD = statePaths[state.abbreviation];
  const bounds = statePathD ? getPathBounds(statePathD) : null;
  
  // Calculate viewBox to center the focus state in the right portion of the hero
  // We shift the viewBox so the state appears in the right-center area
  const mapWidth = 1000;
  const mapHeight = 600;
  
  // Target: position the state's center around x=700 (right-center of the hero)
  // This means we need to shift the viewBox left
  const targetX = 700;
  const shiftX = bounds ? bounds.centerX - targetX : 0;
  
  // Create a viewBox that's shifted to put the state in the right area
  const viewBoxX = shiftX;
  const viewBoxY = 0;

  return (
    <section className="relative pt-12 pb-20 overflow-hidden min-h-[500px]">
      {/* US Map Background - positioned to center the focus state on the right */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          viewBox={`${viewBoxX} ${viewBoxY} ${mapWidth} ${mapHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          style={{ transform: 'scale(1.2)', transformOrigin: 'center' }}
        >
          {/* All other states - very subtle */}
          {Object.entries(statePaths).map(([abbr, pathD]) => {
            if (abbr === state.abbreviation) return null;
            return (
              <path
                key={abbr}
                d={pathD}
                fill="hsl(var(--muted-foreground) / 0.08)"
                stroke="hsl(var(--muted-foreground) / 0.15)"
                strokeWidth={0.5}
              />
            );
          })}
          
          {/* Focus state - prominent and highlighted */}
          {statePathD && (
            <path
              d={statePathD}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
              }}
            />
          )}
        </svg>
      </div>

      {/* Dark gradient overlay - stronger on left for text, lighter on right to show state */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30 dark:from-black/95 dark:via-black/75 dark:to-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="min-h-[400px] flex flex-col justify-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 mb-4">
            <Link href="/where-we-lend" className="hover:text-primary transition-colors">
              Where We Lend
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-white">{state.name}</span>
          </div>

          <div className="max-w-xl">
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
        </div>
      </div>
    </section>
  );
}
