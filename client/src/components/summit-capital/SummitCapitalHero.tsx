import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

interface AnimatedCounterProps {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ end, prefix = "", suffix = "", duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function SummitCapitalHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: 1200, prefix: "$", suffix: "M+", label: "Funded" },
    { value: 2500, prefix: "", suffix: "+", label: "Deals Closed" },
    { value: 47, prefix: "", suffix: "", label: "States" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030712]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/20 via-transparent to-[#7c3aed]/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c3aed]/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px]" />
      
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124, 58, 237, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 mb-8">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm font-medium text-[#D4AF37]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Private lending for sophisticated investors
            </span>
          </div>

          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
            data-testid="text-hero-headline"
          >
            Elevate Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#f4d03f]">
              Investments
            </span>
          </h1>

          <p 
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Access premium lending solutions designed for high-net-worth investors. 
            Fast closings, competitive rates, and white-glove service.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Button 
              size="lg"
              className="bg-[#7c3aed] hover:bg-[#D4AF37] text-white px-8 py-6 text-lg font-semibold transition-all duration-300 group"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-gray-600 text-gray-300 hover:bg-white/5 hover:text-white px-8 py-6 text-lg font-semibold"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              data-testid="button-view-products"
            >
              View Products
            </Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="relative group"
              data-testid={`stat-card-${index}`}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed]/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8 rounded-2xl border border-gray-800 bg-[#1f2937]/50 backdrop-blur-sm">
                <div 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2"
                  style={{ 
                    fontFamily: "'Playfair Display', serif",
                    color: '#D4AF37'
                  }}
                  data-testid={`stat-value-${index}`}
                >
                  <AnimatedCounter 
                    end={stat.value} 
                    prefix={stat.prefix} 
                    suffix={stat.suffix}
                    duration={2000 + index * 200}
                  />
                </div>
                <div 
                  className="text-gray-400 text-lg uppercase tracking-wider"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-20 flex flex-wrap items-center justify-center gap-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 text-gray-500">
            <TrendingUp className="w-5 h-5 text-[#7c3aed]" />
            <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Institutional-Grade Underwriting</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Zap className="w-5 h-5 text-[#D4AF37]" />
            <span style={{ fontFamily: "'DM Sans', sans-serif" }}>24-Hour Term Sheets</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Shield className="w-5 h-5 text-[#7c3aed]" />
            <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Dedicated Account Manager</span>
          </div>
        </div>
      </div>
    </section>
  );
}
