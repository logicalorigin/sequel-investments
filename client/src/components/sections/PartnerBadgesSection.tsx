import { 
  Shield, 
  Star, 
  BadgeCheck, 
  Home,
  Award,
  CheckCircle 
} from "lucide-react";
import type { PartnerBadgesSectionConfig } from "@shared/schema";

interface PartnerBadgesSectionProps {
  config: PartnerBadgesSectionConfig;
}

const ICON_MAP: Record<string, typeof Shield> = {
  Shield,
  Star,
  BadgeCheck,
  Home,
  Award,
  CheckCircle,
};

const DEFAULT_BADGES = [
  { name: "BBB Accredited", rating: "A+", icon: "Shield" },
  { name: "TrustPilot", rating: "4.8/5", icon: "Star" },
  { name: "Google Reviews", rating: "4.9/5", icon: "Star" },
];

export function PartnerBadgesSection({ config }: PartnerBadgesSectionProps) {
  const title = config.title;
  const badges = config.badges?.length ? config.badges : DEFAULT_BADGES;
  const layout = config.layout || "row";
  const showLinks = config.showLinks ?? false;

  const layoutClasses = layout === "row" 
    ? "flex flex-wrap justify-center gap-6 md:gap-12" 
    : "grid grid-cols-2 md:grid-cols-4 gap-6";

  return (
    <section className="py-8 sm:py-12 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {title && (
          <h3 
            className="text-lg font-semibold text-center mb-6 text-muted-foreground"
            data-testid="text-partner-badges-title"
          >
            {title}
          </h3>
        )}
        
        <div className={layoutClasses}>
          {badges.map((badge, i) => {
            const IconComponent = ICON_MAP[badge.icon || "Shield"] || Shield;
            
            const BadgeContent = (
              <div 
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`badge-partner-${i}`}
              >
                <IconComponent className="h-6 w-6 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{badge.name}</span>
                  {badge.rating && (
                    <span className="text-xs text-primary font-semibold">{badge.rating}</span>
                  )}
                </div>
              </div>
            );
            
            if (showLinks && badge.link) {
              return (
                <a 
                  key={i} 
                  href={badge.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-elevate p-2 rounded-lg"
                >
                  {BadgeContent}
                </a>
              );
            }
            
            return (
              <div key={i} className="p-2">
                {BadgeContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
