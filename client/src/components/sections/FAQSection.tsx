import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQSectionConfig } from "@shared/schema";
import { useSectionVariant } from "@/hooks/useSectionVariant";

interface FAQSectionProps {
  config: FAQSectionConfig;
}

const DEFAULT_FAQS = [
  {
    question: "What is a DSCR loan?",
    answer: "A DSCR (Debt Service Coverage Ratio) loan is a type of mortgage that qualifies borrowers based on the property's rental income rather than personal income. This makes it ideal for real estate investors who may not have traditional W-2 income documentation."
  },
  {
    question: "How quickly can I close on a loan?",
    answer: "Our fastest closings have been completed in as little as 48 hours for bridge loans. DSCR loans typically close in 2-3 weeks. The timeline depends on property type, loan amount, and how quickly we receive required documentation."
  },
  {
    question: "What credit score do I need?",
    answer: "Minimum credit scores vary by loan type. DSCR loans require a minimum 620 FICO, while Fix & Flip loans may be available with scores as low as 660. Higher credit scores typically qualify for better rates."
  },
  {
    question: "Do you require tax returns?",
    answer: "No! Our DSCR and bridge loan programs do not require personal tax returns or W-2s. We qualify you based on the property's income potential and your real estate investment experience."
  },
  {
    question: "What states do you lend in?",
    answer: "We are licensed to lend in 48 states plus Washington D.C. Contact us to confirm availability in your specific area."
  },
  {
    question: "Can I finance renovation costs?",
    answer: "Yes! Our Fix & Flip and Construction loans include renovation financing. We fund up to 100% of renovation costs and release funds through a draw process as work is completed."
  },
];

export function FAQSection({ config }: FAQSectionProps) {
  const variantStyles = useSectionVariant("faq");
  const title = config.title || "Frequently Asked Questions";
  const description = config.description;
  const items = config.items?.length ? config.items : DEFAULT_FAQS;
  const layout = config.layout || "accordion";

  return (
    <section className={`${variantStyles.spacing} ${variantStyles.background}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 
            className={`${variantStyles.typography.headline} mb-4`}
            data-testid="text-faq-title"
          >
            {title}
          </h2>
          {description && (
            <p className={variantStyles.typography.body}>{description}</p>
          )}
        </div>

        {layout === "accordion" ? (
          <Accordion type="single" collapsible className="space-y-3">
            {items.map((item, i) => (
              <AccordionItem 
                key={i} 
                value={`faq-${i}`}
                className="border rounded-lg bg-card px-4"
              >
                <AccordionTrigger 
                  className="text-left hover:no-underline py-4"
                  data-testid={`accordion-faq-${i}`}
                >
                  <span className="font-medium">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((item, i) => (
              <div key={i} className="bg-card rounded-lg border p-6">
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className="text-muted-foreground text-sm">{item.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
