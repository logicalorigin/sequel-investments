import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Check, 
  DollarSign, 
  Palette, 
  HeadphonesIcon,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Star,
  Zap,
  Crown,
  Home,
  FileText,
  Clock,
  Shield,
  Users,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const US_STATES = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" }, { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" }, { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" }, { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" }, { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" }, { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" }, { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" }, { value: "DC", label: "Washington DC" },
];

const brokerApplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().optional(),
  nmlsNumber: z.string().optional(),
  state: z.string().optional(),
  yearsExperience: z.number().optional(),
  monthlyLoanVolume: z.string().optional(),
  loanTypesInterested: z.array(z.string()).optional(),
  programTier: z.enum(["partner", "premier", "elite"]).default("partner"),
  referralSource: z.string().optional(),
});

type BrokerApplicationFormData = z.infer<typeof brokerApplicationSchema>;

const programTiers = [
  {
    id: "partner",
    name: "Partner",
    icon: Star,
    description: "Standard pricing with full loan program access",
    features: [
      "All Loan Programs",
      "48-State Coverage",
      "Standard Pricing",
      "White-Labeled Documents",
      "Rate Lock Available",
    ],
    highlight: false,
  },
  {
    id: "premier",
    name: "Premier",
    icon: Zap,
    description: "Enhanced pricing for experienced brokers",
    features: [
      "All Loan Programs",
      "48-State Coverage",
      "Enhanced Pricing",
      "White-Labeled Portal",
      "Priority Processing",
      "Dedicated Support",
    ],
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite",
    icon: Crown,
    description: "Top-tier pricing with full white-label capabilities",
    features: [
      "All Loan Programs",
      "48-State Coverage",
      "Best-in-Class Pricing",
      "Full White-Label Experience",
      "Table Funding Available",
      "Executive Account Manager",
      "Custom Co-Branding",
    ],
    highlight: false,
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    description: "Earn attractive commissions on every funded loan. Our broker program is designed to maximize your profitability with transparent fee structures and fast payment processing.",
  },
  {
    icon: Palette,
    title: "White-Label Branding",
    description: "Present your brand professionally with white-labeled documents, term sheets, and borrower portals. Your clients see your company, building long-term relationships.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description: "Access our broker support team for deal structuring, scenario analysis, and pipeline management. We're your behind-the-scenes lending partner.",
  },
];

const loanProducts = [
  {
    name: "DSCR Loans",
    description: "Long-term financing for rental properties based on property cash flow",
    features: ["Rates from 5.75%", "No income verification", "30-year fixed terms"],
  },
  {
    name: "Fix & Flip",
    description: "Short-term bridge loans for property renovations and resale",
    features: ["Rates from 8.90%", "Up to 90% LTC", "Close in 48 hours"],
  },
  {
    name: "New Construction",
    description: "Ground-up construction financing for spec builds and new development",
    features: ["Rates from 9.90%", "Up to 90% LTC", "9-24 month terms"],
  },
];

export default function BrokerRegister() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string>("partner");
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<BrokerApplicationFormData>({
    resolver: zodResolver(brokerApplicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      companyWebsite: "",
      nmlsNumber: "",
      state: "",
      monthlyLoanVolume: "",
      loanTypesInterested: [],
      programTier: "partner",
      referralSource: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: BrokerApplicationFormData) => {
      const response = await apiRequest("POST", "/api/broker/apply", data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Thank you! We'll review your application and be in touch within 24-48 hours.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BrokerApplicationFormData) => {
    submitMutation.mutate({ ...data, programTier: selectedTier as "partner" | "premier" | "elite" });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your interest in becoming a SAF Broker Partner. Our team will review your application and contact you within 24-48 business hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button variant="outline" data-testid="button-back-home">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Homepage
                </Button>
              </Link>
              <Link href="/broker">
                <Button data-testid="button-go-login">
                  Already Approved? Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/broker">
              <Button variant="ghost" size="sm" data-testid="button-back-broker">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Broker Login
              </Button>
            </Link>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">Broker Partner Program</Badge>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              Grow Your Business with SAF
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Join our network of mortgage professionals and offer your clients industry-leading investment property financing. Competitive compensation, white-label capabilities, and dedicated support.
            </p>
          </div>
        </div>
      </section>

      {/* Program Tiers Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Choose Your Program Tier</h2>
            <p className="text-muted-foreground">Select the partnership level that fits your business</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {programTiers.map((tier) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === tier.id;
              return (
                <Card 
                  key={tier.id} 
                  className={`relative cursor-pointer transition-all hover-elevate ${
                    isSelected ? "ring-2 ring-primary" : ""
                  } ${tier.highlight ? "border-primary" : ""}`}
                  onClick={() => setSelectedTier(tier.id)}
                  data-testid={`card-tier-${tier.id}`}
                >
                  {tier.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10"
                    }`}>
                      <Icon className={`h-6 w-6 ${isSelected ? "" : "text-primary"}`} />
                    </div>
                    <CardTitle>{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-center text-primary font-medium">Selected</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Why Partner with SAF?</h2>
            <p className="text-muted-foreground">Industry-leading tools and support for broker success</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Loan Products Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Full Product Suite Access</h2>
            <p className="text-muted-foreground">All brokers have access to our complete loan product lineup</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {loanProducts.map((product, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-16" id="apply">
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Apply to Join</CardTitle>
              <CardDescription>
                Complete the form below and our team will review your application within 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-medium mb-4">Personal Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" data-testid="input-first-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" data-testid="input-last-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@company.com" data-testid="input-email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" data-testid="input-phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Company Information */}
                  <div>
                    <h3 className="font-medium mb-4">Company Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC Mortgage" data-testid="input-company-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nmlsNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NMLS Number</FormLabel>
                            <FormControl>
                              <Input placeholder="123456" data-testid="input-nmls" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="companyWebsite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourcompany.com" data-testid="input-website" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary State</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-state">
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {US_STATES.map((state) => (
                                  <SelectItem key={state.value} value={state.value}>
                                    {state.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Experience */}
                  <div>
                    <h3 className="font-medium mb-4">Experience & Volume</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="monthlyLoanVolume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Loan Volume</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-volume">
                                  <SelectValue placeholder="Select volume" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1-5">1-5 loans/month</SelectItem>
                                <SelectItem value="6-10">6-10 loans/month</SelectItem>
                                <SelectItem value="11-20">11-20 loans/month</SelectItem>
                                <SelectItem value="20+">20+ loans/month</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="referralSource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How did you hear about us?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-referral">
                                  <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="search">Search Engine</SelectItem>
                                <SelectItem value="referral">Referral</SelectItem>
                                <SelectItem value="social">Social Media</SelectItem>
                                <SelectItem value="conference">Conference/Event</SelectItem>
                                <SelectItem value="advertisement">Advertisement</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Selected Tier Display */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Selected Program</p>
                        <p className="font-medium">
                          {programTiers.find(t => t.id === selectedTier)?.name} Tier
                        </p>
                      </div>
                      <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <Button variant="ghost" size="sm" type="button">Change</Button>
                      </a>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-application"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Already a Partner?</h2>
          <p className="mb-6 opacity-90">Sign in to access your broker dashboard</p>
          <Link href="/broker">
            <Button variant="secondary" size="lg" data-testid="button-signin">
              Sign In to Broker Portal
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
