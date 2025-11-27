import { useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { articles, type Article } from "@/data/articles";
import { Search, ArrowRight, Calendar, Clock, BookOpen } from "lucide-react";
import { GeometricPattern } from "@/components/GeometricPattern";

const categories: Article["category"][] = ["Guide", "Article", "Webinar", "Calculator"];

const badgeColors: Record<Article["category"], string> = {
  Guide: "bg-primary/90 hover:bg-primary text-primary-foreground",
  Webinar: "bg-blue-600/90 hover:bg-blue-600 text-white",
  Article: "bg-emerald-600/90 hover:bg-emerald-600 text-white",
  Calculator: "bg-amber-600/90 hover:bg-amber-600 text-white",
};

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Article["category"] | "All">("All");

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-primary overflow-hidden">
        <GeometricPattern 
          variant="circles" 
          className="text-primary-foreground" 
          opacity={0.12}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
              <span className="text-primary-foreground/80 text-sm font-medium">RESOURCES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4" data-testid="text-resources-hero-title">
              Scale your real estate investment portfolio
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8">
              Unlock flexible financing, a fast online platform and expert support—trusted by thousands of real estate investors nationwide.
            </p>
            <Link href="/get-quote">
              <Button size="lg" variant="secondary" className="text-base px-6" data-testid="button-resources-hero-cta">
                See Your Personalized Rate
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-resources"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("All")}
                data-testid="button-filter-all"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`button-filter-${category.toLowerCase()}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No resources found matching your criteria.</p>
              <Button 
                variant="ghost" 
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                data-testid="button-clear-filters"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredArticles.map((article, index) => (
                <Link key={article.slug} href={`/resources/${article.slug}`} data-testid={`link-article-${index}`}>
                  <article 
                    className="group bg-card rounded-lg overflow-hidden border hover-elevate cursor-pointer h-full flex flex-col"
                    data-testid={`card-article-${article.slug}`}
                  >
                    <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                      <img
                        src={article.heroImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={badgeColors[article.category]}>
                          {article.category}
                        </Badge>
                      </div>
                      <h2 className="font-semibold text-lg sm:text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-muted-foreground text-sm sm:text-base mb-4 line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Scale Your Portfolio?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Get pre-qualified in minutes with flexible financing designed for real estate investors.
          </p>
          <Link href="/get-quote">
            <Button size="lg" className="text-base px-8" data-testid="button-cta-getquote">
              Get Your Rate
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
