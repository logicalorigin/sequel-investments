import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ContactPage() {
  const { toast } = useToast();

  const handleFormSuccess = () => {
    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-12 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-contact-title">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground">
              Have questions? We're here to help you find the perfect financing solution for your investment
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and a loan specialist will contact you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadForm onSubmitSuccess={handleFormSuccess} />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card data-testid="card-contact-phone">
                <CardHeader>
                  <Phone className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>Call Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href="tel:+18005551234" 
                    className="text-lg font-semibold text-primary hover:underline"
                    data-testid="link-phone"
                  >
                    (800) 555-1234
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    Monday - Friday: 8am - 8pm EST<br />
                    Saturday: 9am - 5pm EST
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-contact-email">
                <CardHeader>
                  <Mail className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>Email Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href="mailto:info@securedassetfunding.com" 
                    className="text-lg font-semibold text-primary hover:underline"
                    data-testid="link-email"
                  >
                    info@securedassetfunding.com
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    We respond to all emails within 4 business hours
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-contact-office">
                <CardHeader>
                  <MapPin className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>Main Office</CardTitle>
                </CardHeader>
                <CardContent>
                  <address className="not-italic text-muted-foreground">
                    1201 E Cesar Chavez Street<br />
                    Suite 1<br />
                    Austin, TX 78702
                  </address>
                  <p className="text-sm text-muted-foreground mt-3">
                    Office visits by appointment only
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-contact-hours">
                <CardHeader>
                  <Clock className="h-10 w-10 text-primary mb-3" />
                  <CardTitle>Business Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-medium">8am - 8pm EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">9am - 5pm EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mb-8">
            Before you reach out, check if your question is answered in our{" "}
            <Link href="/dscr-loans">
              <span className="text-primary hover:underline cursor-pointer">DSCR FAQ</span>
            </Link>{" "}
            or{" "}
            <Link href="/fix-flip">
              <span className="text-primary hover:underline cursor-pointer">Fix & Flip FAQ</span>
            </Link>{" "}
            sections.
          </p>
          <p className="text-sm text-muted-foreground">
            For general inquiries, licensing information, or partnership opportunities,<br />
            please use the contact form above or call our main line.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
