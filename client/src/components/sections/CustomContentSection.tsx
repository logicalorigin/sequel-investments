import DOMPurify from "dompurify";
import type { CustomContentSectionConfig } from "@shared/schema";

interface CustomContentSectionProps {
  config: CustomContentSectionConfig;
}

export function CustomContentSection({ config }: CustomContentSectionProps) {
  const paddingTop = config.paddingTop || "3rem";
  const paddingBottom = config.paddingBottom || "3rem";

  if (!config.htmlContent) {
    return (
      <section 
        className={config.cssClass || ""}
        style={{ paddingTop, paddingBottom }}
        data-testid="section-custom-content-empty"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center py-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">
              Custom content section - configure HTML content in the page builder.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const sanitizedHtml = DOMPurify.sanitize(config.htmlContent, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'u', 'span', 'div', 'blockquote', 'pre', 'code', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class', 'id', 'style'],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <section 
      className={config.cssClass || ""}
      style={{ paddingTop, paddingBottom }}
      data-testid="section-custom-content"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div 
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    </section>
  );
}
