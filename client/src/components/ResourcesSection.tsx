import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, ExternalLink } from "lucide-react";

export interface ResourceItem {
  type: "Guide" | "Webinar" | "Article" | "Video" | "Calculator";
  title: string;
  link: string;
  imageUrl?: string;
  isExternal?: boolean;
}

interface ResourcesSectionProps {
  sectionLabel?: string;
  title: string;
  description: string;
  resources: ResourceItem[];
  viewMoreLink?: string;
  viewMoreText?: string;
}

const placeholderImages: Record<ResourceItem["type"], string> = {
  Guide: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop&auto=format",
  Webinar: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=400&h=250&fit=crop&auto=format",
  Article: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=400&h=250&fit=crop&auto=format",
  Video: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop&auto=format",
  Calculator: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=250&fit=crop&auto=format",
};

const badgeColors: Record<ResourceItem["type"], string> = {
  Guide: "bg-primary/90 hover:bg-primary text-primary-foreground",
  Webinar: "bg-blue-600/90 hover:bg-blue-600 text-white",
  Article: "bg-emerald-600/90 hover:bg-emerald-600 text-white",
  Video: "bg-purple-600/90 hover:bg-purple-600 text-white",
  Calculator: "bg-amber-600/90 hover:bg-amber-600 text-white",
};

export function ResourcesSection({
  sectionLabel = "Resources",
  title,
  description,
  resources,
  viewMoreLink = "/resources",
  viewMoreText = "View More",
}: ResourcesSectionProps) {
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-primary font-semibold text-sm mb-3" data-testid="text-resources-label">
          {sectionLabel}
        </p>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8 sm:mb-10">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3" data-testid="text-resources-title">
              {title}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              {description}
            </p>
          </div>
          
          <Link href={viewMoreLink}>
            <Button size="lg" className="text-base px-6" data-testid="button-resources-viewmore">
              {viewMoreText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => {
            const imageUrl = resource.imageUrl || placeholderImages[resource.type];
            
            const CardContent = (
              <div 
                className="group bg-card rounded-lg overflow-hidden border hover-elevate cursor-pointer"
                data-testid={`card-resource-${index}`}
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                  <img
                    src={imageUrl}
                    alt={resource.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <Badge className={`mb-3 ${badgeColors[resource.type]}`}>
                    {resource.type}
                  </Badge>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-primary font-medium">
                    Learn more
                    {resource.isExternal ? (
                      <ExternalLink className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                </div>
              </div>
            );
            
            if (resource.isExternal) {
              return (
                <a 
                  key={index} 
                  href={resource.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {CardContent}
                </a>
              );
            }
            
            return (
              <Link key={index} href={resource.link}>
                {CardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
