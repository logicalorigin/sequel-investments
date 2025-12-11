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
// Properly handles both absolute (M,L) and relative (m,l) SVG commands
function getPathBounds(pathD: string): { minX: number; minY: number; maxX: number; maxY: number; centerX: number; centerY: number } {
  const points: { x: number; y: number }[] = [];
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  
  const commands = pathD.match(/[MmLlHhVvZzCcSsQqTtAa][^MmLlHhVvZzCcSsQqTtAa]*/g) || [];
  
  for (const cmd of commands) {
    const type = cmd[0];
    const args = cmd.slice(1).trim().split(/[\s,]+/).filter(s => s).map(Number);
    
    switch (type) {
      case 'M':
        for (let i = 0; i < args.length; i += 2) {
          currentX = args[i]; currentY = args[i + 1];
          if (i === 0) { startX = currentX; startY = currentY; }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'm':
        for (let i = 0; i < args.length; i += 2) {
          currentX += args[i]; currentY += args[i + 1];
          if (i === 0) { startX = currentX; startY = currentY; }
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'L':
        for (let i = 0; i < args.length; i += 2) {
          currentX = args[i]; currentY = args[i + 1];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'l':
        for (let i = 0; i < args.length; i += 2) {
          currentX += args[i]; currentY += args[i + 1];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case 'H': currentX = args[0]; points.push({ x: currentX, y: currentY }); break;
      case 'h': currentX += args[0]; points.push({ x: currentX, y: currentY }); break;
      case 'V': currentY = args[0]; points.push({ x: currentX, y: currentY }); break;
      case 'v': currentY += args[0]; points.push({ x: currentX, y: currentY }); break;
      case 'Z': case 'z': currentX = startX; currentY = startY; break;
      default:
        if (args.length >= 2) {
          const isRel = type === type.toLowerCase();
          if (isRel) { currentX += args[args.length - 2]; currentY += args[args.length - 1]; }
          else { currentX = args[args.length - 2]; currentY = args[args.length - 1]; }
          points.push({ x: currentX, y: currentY });
        }
    }
  }
  
  if (points.length === 0) return { minX: 0, minY: 0, maxX: 100, maxY: 100, centerX: 50, centerY: 50 };
  
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return { minX, minY, maxX, maxY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
}

export function StatePageHero({ state, formatLoanVolume }: StatePageHeroProps) {
  const statePathD = statePaths[state.abbreviation];
  const bounds = statePathD ? getPathBounds(statePathD) : null;
  
  // Calculate viewBox to zoom into the focus state and position it on the right side of the hero
  // The text content is on the left, so the state should appear prominently on the right
  const padding = 80; // Generous padding around the state
  
  // Calculate the state's dimensions with padding
  const stateWidth = bounds ? (bounds.maxX - bounds.minX) + padding * 2 : 200;
  const stateHeight = bounds ? (bounds.maxY - bounds.minY) + padding * 2 : 200;
  
  // Create a viewBox that's wider to allow the state to be positioned on the right
  // The viewBox width should be about 2x the state width to leave room for text area
  const viewBoxWidth = Math.max(stateWidth * 2, 400);
  const viewBoxHeight = Math.max(stateHeight * 1.2, 300);
  
  // Position the viewBox so the state appears on the right half
  // Start the viewBox left of the state so there's empty space (for text) on the left
  const viewBoxX = bounds ? bounds.minX - padding - stateWidth * 0.8 : 0;
  const viewBoxY = bounds ? bounds.minY - padding - (viewBoxHeight - stateHeight) / 2 : 0;

  return (
    <section className="relative pt-12 pb-20 overflow-hidden min-h-[500px]">
      {/* US Map Background - zoomed to focus state, positioned on right side */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
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
