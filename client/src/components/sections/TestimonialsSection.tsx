import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { TestimonialsSectionConfig } from "@shared/schema";
import { useSectionVariant } from "@/hooks/useSectionVariant";

import testimonial1 from "@assets/generated_images/Investor_testimonial_headshot_1_2a222601.png";
import testimonial2 from "@assets/generated_images/Investor_testimonial_headshot_2_bb13b1a2.png";
import testimonial3 from "@assets/generated_images/Investor_testimonial_headshot_3_a4e6c79b.png";

interface TestimonialsSectionProps {
  config: TestimonialsSectionConfig;
}

const DEFAULT_TESTIMONIALS = [
  {
    name: "Michael Chen",
    role: "Fix & Flip Investor",
    quote: "Closed my hard money loan in 6 days. The team was incredibly responsive and made the process seamless. Already on my third property with them!",
    image: testimonial1,
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    role: "Rental Property Owner",
    quote: "No tax returns, no W2s needed. Got approved for a DSCR loan based purely on my property's rental income. Game changer for my portfolio!",
    image: testimonial2,
    rating: 5,
  },
  {
    name: "David Rodriguez",
    role: "Multi-Family Investor",
    quote: "Financed 3 apartment buildings in 6 months. Their rates are competitive and the loan officers really understand the investment business.",
    image: testimonial3,
    rating: 5,
  },
];

export function TestimonialsSection({ config }: TestimonialsSectionProps) {
  const variantStyles = useSectionVariant("testimonials");
  const testimonials = config.testimonials?.length ? config.testimonials : DEFAULT_TESTIMONIALS;
  const showRatings = config.showRatings !== false;
  const layout = config.layout || "carousel";

  if (testimonials.length === 0) return null;

  const renderStars = (rating: number = 5) => {
    if (!showRatings) return null;
    return (
      <div className="flex gap-1 mb-4" aria-label={`${rating} out of 5 stars`} role="img">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} 
            aria-hidden="true" 
          />
        ))}
      </div>
    );
  };

  const getTestimonialImage = (testimonial: typeof testimonials[0], index: number) => {
    if (testimonial.image) return testimonial.image;
    const defaultImages = [testimonial1, testimonial2, testimonial3];
    return defaultImages[index % defaultImages.length];
  };

  return (
    <section 
      className={`${variantStyles.spacing} ${variantStyles.background}`}
      role="region"
      aria-label="Investor testimonials"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className={`${variantStyles.typography.headline} mb-3 sm:mb-4`}>What Our Investors Say</h2>
          <p className={variantStyles.typography.body}>
            Real success stories from real estate investors
          </p>
        </div>

        <div className="sm:hidden">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-2">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 basis-[85%]">
                  <Card data-testid={`card-testimonial-${index + 1}-mobile`} tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    <CardContent className="pt-6">
                      {renderStars(testimonial.rating)}
                      <blockquote className="text-sm text-muted-foreground mb-4">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <img 
                          src={getTestimonialImage(testimonial, index)} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover"
                          aria-hidden="true"
                        />
                        <div>
                          <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                          <p className="text-xs text-muted-foreground">{testimonial.role || (testimonial as any).company}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <p className="text-center text-xs text-muted-foreground mt-3">Swipe for more</p>
        </div>

        <div className={`hidden sm:grid ${layout === "list" ? "sm:grid-cols-1 max-w-2xl mx-auto" : "sm:grid-cols-2 md:grid-cols-3"} gap-4 sm:gap-6 md:gap-8`}>
          {testimonials.map((testimonial, index) => (
            <Card key={index} data-testid={`card-testimonial-${index + 1}`} tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <CardContent className="pt-6">
                {renderStars(testimonial.rating)}
                <blockquote className="text-muted-foreground mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <img 
                    src={getTestimonialImage(testimonial, index)} 
                    alt="" 
                    className="w-12 h-12 rounded-full object-cover"
                    aria-hidden="true"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role || (testimonial as any).company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
