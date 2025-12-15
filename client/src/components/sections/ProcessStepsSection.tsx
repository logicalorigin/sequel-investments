import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Search, 
  FileCheck, 
  Banknote,
  Clock,
  ArrowRight
} from "lucide-react";
import type { ProcessStepsSectionConfig } from "@shared/schema";
import { useSectionVariant } from "@/hooks/useSectionVariant";

interface ProcessStepsSectionProps {
  config: ProcessStepsSectionConfig;
}

const ICON_MAP: Record<string, typeof Zap> = {
  Zap,
  CheckCircle,
  DollarSign,
  FileText,
  Search,
  FileCheck,
  Banknote,
  Clock,
};

const DEFAULT_STEPS = [
  { icon: "Zap", title: "Fast", description: "Apply in minutes with our streamlined online application" },
  { icon: "CheckCircle", title: "Simple", description: "No tax returns needed. We focus on property cash flow" },
  { icon: "DollarSign", title: "Funding", description: "Close in as few as 5 days with competitive rates" },
];

export function ProcessStepsSection({ config }: ProcessStepsSectionProps) {
  const variantStyles = useSectionVariant("process_steps");
  const title = config.title || "How It Works";
  const steps = config.steps?.length ? config.steps : DEFAULT_STEPS;
  const columns = config.columns || 3;
  const layout = config.layout || "row";
  const showConnectors = config.showConnectors ?? true;

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className={`${variantStyles.spacing} ${variantStyles.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {title && (
          <h2 
            className={`${variantStyles.typography.headline} text-center mb-8 sm:mb-12`}
            data-testid="text-process-steps-title"
          >
            {title}
          </h2>
        )}
        
        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
          {steps.map((step, i) => {
            const IconComponent = ICON_MAP[step.icon || "CheckCircle"] || CheckCircle;
            const isLast = i === steps.length - 1;
            
            return (
              <div key={i} className="relative">
                <Card className="hover-elevate h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                    <p className={`${variantStyles.typography.body} text-sm`}>{step.description}</p>
                  </CardContent>
                </Card>
                
                {showConnectors && !isLast && layout === "row" && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
