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
  Home,
  FileText,
  Shield,
  X,
  MapPin,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StateSelectionMap, ALL_STATES } from "@/components/StateSelectionMap";

const US_STATES = ALL_STATES;

const brokerApplicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().optional(),
  nmlsNumber: z.string().optional(),
  state: z.string().optional(),
  lendingStates: z.array(z.string()).min(1, "Select at least one state"),
  monthlyLoanVolume: z.string().optional(),
  referralSource: z.string().optional(),
});

type BrokerApplicationFormData = z.infer<typeof brokerApplicationSchema>;

const comparisonFeatures = [
  { feature: "All Loan Programs", broker: true, wholesale: true },
  { feature: "48-State Coverage", broker: true, wholesale: true },
  { feature: "No License Required*", broker: true, wholesale: true },
  { feature: "Close in 48 Hours", broker: true, wholesale: true },
  { feature: "White-Labeled Docs", broker: true, wholesale: true },
  { feature: "Rate Lock Available", broker: true, wholesale: true },
  { feature: "Standard Pricing", broker: true, wholesale: false },
  { feature: "Enhanced Pricing", broker: false, wholesale: true },
  { feature: "Close in SAF Name", broker: true, wholesale: false },
  { feature: "Close in Your Name", broker: false, wholesale: true },
];

const benefits = [
  {
    icon: DollarSign,
    title: "Profitability",
    description: "Boost your profitability with competitive commissions and attractive returns for connecting borrowers with the right lending solutions. We reward your hard work and expertise.",
  },
  {
    icon: Palette,
    title: "Branding",
    description: "Maintain your professional brand image with white-labeled documents showcasing your logo and design. Establish yourself as a trusted, credible broker with your clients.",
  },
  {
    icon: Shield,
    title: "Borrower Protection",
    description: "Our strict broker agreement offers lifetime exclusivity and protection for your borrowers. You'll be notified if your clients ever reach out to SAF requesting information.",
  },
];

const loanProducts = [
  { name: "DSCR Loans", rate: "5.75%", description: "Long-term rental property financing" },
  { name: "Fix & Flip", rate: "8.90%", description: "Short-term bridge loans" },
  { name: "Construction", rate: "9.90%", description: "Ground-up new builds" },
];

export default function BrokerRegister() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

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
      lendingStates: [],
      monthlyLoanVolume: "",
      referralSource: "",
    },
  });

  const toggleState = (stateValue: string) => {
    const newStates = selectedStates.includes(stateValue)
      ? selectedStates.filter(s => s !== stateValue)
      : [...selectedStates, stateValue];
    setSelectedStates(newStates);
    form.setValue("lendingStates", newStates);
  };

  const selectAllStates = () => {
    const allStates = US_STATES.map(s => s.value);
    setSelectedStates(allStates);
    form.setValue("lendingStates", allStates);
  };

  const clearAllStates = () => {
    setSelectedStates([]);
    form.setValue("lendingStates", []);
  };

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
    submitMutation.mutate(data);
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
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/broker">
              <Button variant="ghost" size="sm" data-testid="button-back-broker">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Broker Login
              </Button>
            </Link>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">Mortgage Broker Program</h1>
            <p className="text-muted-foreground mb-4">
              <strong>Secured Asset Funding</strong> offers a broker program designed exclusively for real estate professionals seeking to expand their business. We understand the importance of fostering strong relationships with mortgage brokers who play a vital role in connecting borrowers with the right lending solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Badge variant="secondary" className="px-3 py-1">
                <Check className="h-3 w-3 mr-1" /> No License Required*
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Check className="h-3 w-3 mr-1" /> No Cost, No Commitment
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Check className="h-3 w-3 mr-1" /> Strict Borrower Protection
              </Badge>
            </div>
          </div>
        </div>
      </section>
      {/* Compare/Contrast Table */}
      <section className="py-10 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-6">SAF Broker Programs</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 bg-muted/50 font-medium border-b"></th>
                  <th className="text-center p-3 bg-muted/50 font-semibold border-b min-w-[120px]">Broker</th>
                  <th className="text-center p-3 bg-primary/10 font-semibold border-b min-w-[140px]">Wholesale Partner</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="p-3 text-sm border-b">{row.feature}</td>
                    <td className="p-3 text-center border-b">
                      {row.broker ? (
                        <Check className="h-4 w-4 text-primary mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                    <td className="p-3 text-center border-b bg-primary/5">
                      {row.wholesale ? (
                        <Check className="h-4 w-4 text-primary mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            *No license required excluding CA, AZ, UT, NV, OR. All tiers eligible for each SAF loan program.
          </p>
        </div>
      </section>
      {/* Loan Products Row */}
      <section className="py-8 border-b">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4">
            {loanProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.description}</p>
                  <p className="text-xs text-primary font-medium">From {product.rate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Benefits Section */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Registration Form Section */}
      <section className="py-10 bg-muted/30" id="apply">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Broker Registration</CardTitle>
              <CardDescription>
                Complete the form below. We'll review your application within 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {/* Personal Info Row */}
                  <div className="grid sm:grid-cols-2 gap-3">
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

                  {/* Contact Row */}
                  <div className="grid sm:grid-cols-2 gap-3">
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

                  {/* Company Row */}
                  <div className="grid sm:grid-cols-2 gap-3">
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
                          <FormLabel>NMLS Number (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="123456" data-testid="input-nmls" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Website & Primary State */}
                  <div className="grid sm:grid-cols-2 gap-3">
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

                  {/* States Serviced - Interactive Map Section */}
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      States Serviced *
                    </FormLabel>
                    <StateSelectionMap
                      selectedStates={selectedStates}
                      onToggleState={toggleState}
                      onSelectAll={selectAllStates}
                      onClearAll={clearAllStates}
                    />
                    {form.formState.errors.lendingStates && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.lendingStates.message}
                      </p>
                    )}
                  </div>

                  {/* Volume & Referral */}
                  <div className="grid sm:grid-cols-2 gap-3">
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

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting, you agree to our broker terms. No cost, no commitment.
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Footer CTA */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-2">Already a Partner?</h2>
          <p className="mb-4 opacity-90 text-sm">Sign in to access your broker dashboard</p>
          <Link href="/broker">
            <Button variant="secondary" data-testid="button-signin">
              Sign In to Broker Portal
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
