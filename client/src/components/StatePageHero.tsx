import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { statePaths } from "./USMap";
import type { StateData } from "@shared/schema";

interface StatePageHeroProps {
  state: StateData;
  formatLoanVolume: (volume: number) => string;
}

export function StatePageHero({ state, formatLoanVolume }: StatePageHeroProps) {
  return (
    <section className="relative pt-12 pb-20 overflow-hidden min-h-[500px]">
      {/* US Map Background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full opacity-20"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Render all states with subtle gray strokes */}
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent dark:from-black/90 dark:via-black/70 dark:to-black/30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-white/70 mb-4">
          <Link href="/where-we-lend" className="hover:text-primary transition-colors">
            Where We Lend
          </Link>
          <ArrowRight className="h-4 w-4" />
          <span className="text-white">{state.name}</span>
        </div>

        <div className="max-w-2xl">
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
    </section>
  );
}
