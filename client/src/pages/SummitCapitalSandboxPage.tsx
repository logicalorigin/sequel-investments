import { Link } from "wouter";
import { ArrowLeft, BarChart3, Wallet, TrendingUp, PieChart } from "lucide-react";
import SummitCapitalHero from "@/components/summit-capital/SummitCapitalHero";
import { Card } from "@/components/ui/card";

export default function SummitCapitalSandboxPage() {
  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" data-testid="link-back-home">
            <a className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
          </Link>
          <div className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Summit Capital Template Preview
          </div>
        </div>
      </div>

      <SummitCapitalHero />

      <section className="py-24 px-6 bg-[#030712]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="text-dashboard-heading"
            >
              Investor Dashboard
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Track your portfolio performance with real-time analytics and insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wallet, label: "Active Investments", value: "$4.2M", change: "+12.5%" },
              { icon: TrendingUp, label: "Total Returns", value: "$890K", change: "+8.3%" },
              { icon: BarChart3, label: "Average ROI", value: "18.4%", change: "+2.1%" },
              { icon: PieChart, label: "Portfolio Health", value: "Excellent", change: null },
            ].map((item, index) => (
              <Card 
                key={item.label}
                className="bg-[#1f2937] border-gray-800 p-6"
                data-testid={`dashboard-card-${index}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-[#7c3aed]/20">
                    <item.icon className="w-5 h-5 text-[#7c3aed]" />
                  </div>
                  {item.change && (
                    <span className="text-sm text-emerald-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {item.change}
                    </span>
                  )}
                </div>
                <div 
                  className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#D4AF37' }}
                >
                  {item.value}
                </div>
                <div className="text-sm text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {item.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-b from-[#030712] to-[#0a0f1a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="text-metrics-heading"
            >
              Performance Metrics
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Data-driven insights to optimize your investment strategy
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#1f2937] border-gray-800 p-8" data-testid="metrics-chart-placeholder">
              <h3 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Portfolio Growth
              </h3>
              <div className="h-64 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-[#7c3aed] mx-auto mb-3" />
                  <p className="text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Chart placeholder - Growth visualization
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1f2937] border-gray-800 p-8" data-testid="metrics-allocation-placeholder">
              <h3 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Asset Allocation
              </h3>
              <div className="h-64 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
                  <p className="text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Chart placeholder - Allocation breakdown
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-12 p-8 rounded-2xl border border-[#7c3aed]/30 bg-gradient-to-r from-[#7c3aed]/10 to-[#D4AF37]/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Ready to elevate your portfolio?
                </h3>
                <p className="text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Connect with our investment advisors for a personalized strategy session.
                </p>
              </div>
              <button 
                className="px-8 py-4 bg-[#7c3aed] hover:bg-[#D4AF37] text-white font-semibold rounded-lg transition-all duration-300"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                data-testid="button-schedule-consultation"
              >
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-[#030712] border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Summit Capital Template Preview • Premium Template
          </p>
        </div>
      </footer>
    </div>
  );
}
