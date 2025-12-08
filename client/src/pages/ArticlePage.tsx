import { useRoute, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getArticleBySlug, getRelatedArticles } from "@/data/articles";
import { Calendar, Clock, ArrowLeft, ArrowRight, User, Tag } from "lucide-react";
import { GeometricPattern } from "@/components/GeometricPattern";
import { useEffect } from "react";

const badgeColors: Record<string, string> = {
  Guide: "bg-primary/90 hover:bg-primary text-primary-foreground",
  Webinar: "bg-blue-600/90 hover:bg-blue-600 text-white",
  Article: "bg-emerald-600/90 hover:bg-emerald-600 text-white",
  Calculator: "bg-amber-600/90 hover:bg-amber-600 text-white",
};

export default function ArticlePage() {
  const [, params] = useRoute("/resources/:slug");
  const slug = params?.slug;
  const article = slug ? getArticleBySlug(slug) : null;
  const relatedArticles = article ? getRelatedArticles(article.relatedArticles) : [];

  useEffect(() => {
    if (article) {
      document.title = `${article.title} | Sequel Investments`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", article.metaDescription);
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = article.metaDescription;
        document.head.appendChild(meta);
      }
    }
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Link href="/resources">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="aspect-[21/9] sm:aspect-[3/1] relative overflow-hidden bg-muted">
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
            <Link href="/resources" data-testid="link-back-resources">
              <Button variant="ghost" className="text-white/80 hover:text-white mb-4 -ml-3 hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
              </Button>
            </Link>
            
            <Badge className={`mb-4 ${badgeColors[article.category]}`}>
              {article.category}
            </Badge>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" data-testid="text-article-title">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/80 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(article.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article 
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-3 prose-td:border prose-td:border-border prose-td:p-3"
                data-testid="article-content"
                dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
              />
              
              {/* Tags */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {article.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* CTA Card */}
                <Card className="bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle className="text-xl">Ready to Get Started?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-primary-foreground/80 mb-4">
                      Get pre-qualified in minutes with flexible financing designed for investors.
                    </p>
                    <Link href="/get-quote">
                      <Button variant="secondary" className="w-full" data-testid="button-sidebar-cta">
                        See Your Rate
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Related Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {relatedArticles.map((related, index) => (
                        <Link key={related.slug} href={`/resources/${related.slug}`} data-testid={`link-related-${index}`}>
                          <div className="group flex gap-3 p-2 -m-2 rounded-lg hover-elevate cursor-pointer">
                            <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0 bg-muted">
                              <img
                                src={related.heroImage}
                                alt={related.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                {related.title}
                              </h4>
                              <span className="text-xs text-muted-foreground">{related.readTime}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/dscr-loans">
                      <div className="text-sm text-muted-foreground hover:text-primary cursor-pointer py-1">
                        DSCR Loans
                      </div>
                    </Link>
                    <Link href="/fix-flip">
                      <div className="text-sm text-muted-foreground hover:text-primary cursor-pointer py-1">
                        Fix & Flip Loans
                      </div>
                    </Link>
                    <Link href="/new-construction">
                      <div className="text-sm text-muted-foreground hover:text-primary cursor-pointer py-1">
                        Construction Loans
                      </div>
                    </Link>
                    <Link href="/calculator">
                      <div className="text-sm text-muted-foreground hover:text-primary cursor-pointer py-1">
                        Loan Calculator
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <GeometricPattern 
          variant="bubbles" 
          className="text-primary-foreground" 
          opacity={0.15}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
            Scale Your Investment Portfolio
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Flexible financing with fast closings. Get pre-qualified in minutes.
          </p>
          <Link href="/get-quote">
            <Button size="lg" variant="secondary" className="text-base px-8" data-testid="button-footer-cta">
              Get Your Rate Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function formatContent(content: string): string {
  const lines = content.trim().split('\n');
  let html = '';
  let inList = false;
  let inTable = false;
  let tableRows: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
      continue;
    } else if (inTable) {
      html += buildTable(tableRows);
      tableRows = [];
      inTable = false;
    }

    if (line.startsWith('## ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h2>${line.substring(3)}</h2>`;
    } else if (line.startsWith('### ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h3>${line.substring(4)}</h3>`;
    } else if (line.startsWith('#### ')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h4>${line.substring(5)}</h4>`;
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${formatInlineMarkdown(line.substring(2))}</li>`;
    } else if (line.startsWith('**') && line.endsWith('**')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p><strong>${line.slice(2, -2)}</strong></p>`;
    } else if (line.trim() === '') {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p>${formatInlineMarkdown(line)}</p>`;
    }
  }

  if (inTable && tableRows.length > 0) {
    html += buildTable(tableRows);
  }

  if (inList) {
    html += '</ul>';
  }

  return html;
}

function buildTable(rows: string[]): string {
  if (rows.length < 2) return '';

  const headerRow = rows[0];
  const separatorRow = rows[1];
  const dataRows = rows.slice(2);

  const headers = headerRow.split('|').filter(cell => cell.trim());

  let tableHtml = '<table><thead><tr>';
  headers.forEach(header => {
    tableHtml += `<th>${header.trim()}</th>`;
  });
  tableHtml += '</tr></thead><tbody>';

  dataRows.forEach(row => {
    const cells = row.split('|').filter(cell => cell.trim());
    tableHtml += '<tr>';
    cells.forEach(cell => {
      tableHtml += `<td>${formatInlineMarkdown(cell.trim())}</td>`;
    });
    tableHtml += '</tr>';
  });

  tableHtml += '</tbody></table>';
  return tableHtml;
}

function formatInlineMarkdown(text: string): string {
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  return text;
}
