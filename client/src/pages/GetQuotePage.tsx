import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { 
  Home, 
  TrendingUp, 
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoIcon from "@assets/ChatGPT Image Jun 25, 2025, 12_32_43 PM_1764028581255.png";

type LoanType = "dscr" | "fix-flip" | "construction" | "";
type Step = 1 | 2 | 3 | 4;

interface FormData {
  loanType: LoanType;
  propertyValue: string;
  propertyLocation: string;
  investmentExperience: string;
  name: string;
  email: string;
  phone: string;
}

export default function GetQuotePage() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    loanType: "",
    propertyValue: "",
    propertyLocation: "",
    investmentExperience: "",
    name: "",
    email: "",
    phone: "",
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/leads", data);
    },
    onSuccess: () => {
      setStep(4);
    },
    onError: (error: any) => {
      let errorMessage = "Failed to submit. Please try again.";
      if (error?.body?.message) {
        errorMessage = error.body.message;
      }
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleLoanTypeSelect = (type: LoanType) => {
    setFormData({ ...formData, loanType: type });
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.loanType) {
      toast({
        title: "Please select a loan type",
        description: "Choose the type of financing you're looking for.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && (!formData.propertyValue || !formData.propertyLocation)) {
      toast({
        title: "Please complete all fields",
        description: "Property value and location are required.",
        variant: "destructive",
      });
      return;
    }
    if (step < 3) {
      setStep((step + 1) as Step);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Please complete all fields",
        description: "Name, email, and phone are required.",
        variant: "destructive",
      });
      return;
    }

    const loanTypeMap: Record<LoanType, string> = {
      dscr: "DSCR",
      "fix-flip": "Fix & Flip",
      construction: "New Construction",
      "": "Other",
    };

    createLeadMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      loanType: loanTypeMap[formData.loanType],
      propertyLocation: formData.propertyLocation,
      propertyValue: formData.propertyValue,
      investmentExperience: formData.investmentExperience,
    });
  };

  const loanTypes = [
    {
      id: "dscr" as LoanType,
      icon: Home,
      title: "DSCR Rental Loan",
      description: "Financing for rental properties",
      features: ["5.75%+ rates", "Up to 80% LTV", "30-year terms"],
    },
    {
      id: "fix-flip" as LoanType,
      icon: TrendingUp,
      title: "Fix & Flip Loan",
      description: "Short-term financing for flip projects",
      features: ["8.90%+ rates", "Up to 90% LTC", "48-hr closing"],
    },
    {
      id: "construction" as LoanType,
      icon: Building2,
      title: "New Construction",
      description: "Ground-up construction financing",
      features: ["9.90%+ rates", "Up to 82.5% LTC", "48-hr draws"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <img 
              src={logoIcon} 
              alt="SAF" 
              className="h-12 w-12 object-contain mx-auto mb-4"
            />
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Get Your Personalized Rate</h1>
            <p className="text-muted-foreground">
              Answer a few questions to see your financing options
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-12 h-1 mx-1 ${
                        step > s ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>What type of financing are you looking for?</CardTitle>
                <CardDescription>
                  Select the loan product that best fits your investment strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loanTypes.map((loan) => (
                  <div
                    key={loan.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover-elevate ${
                      formData.loanType === loan.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => handleLoanTypeSelect(loan.id)}
                    data-testid={`option-loan-${loan.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        formData.loanType === loan.id ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <loan.icon className={`h-6 w-6 ${
                          formData.loanType === loan.id ? "text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{loan.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{loan.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {loan.features.map((feature) => (
                            <span
                              key={feature}
                              className="text-xs bg-muted px-2 py-1 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.loanType === loan.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}>
                        {formData.loanType === loan.id && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handleNextStep}
                  disabled={!formData.loanType}
                  data-testid="button-next-step1"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Tell us about your property</CardTitle>
                <CardDescription>
                  Help us understand your investment so we can provide accurate pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyValue">Estimated Property Value / Purchase Price</Label>
                  <Select
                    value={formData.propertyValue}
                    onValueChange={(value) => setFormData({ ...formData, propertyValue: value })}
                  >
                    <SelectTrigger data-testid="select-property-value">
                      <SelectValue placeholder="Select a range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-100k">Under $100,000</SelectItem>
                      <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                      <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                      <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                      <SelectItem value="1m-2m">$1,000,000 - $2,000,000</SelectItem>
                      <SelectItem value="over-2m">Over $2,000,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyLocation">Property Location (City, State)</Label>
                  <Input
                    id="propertyLocation"
                    placeholder="e.g., Austin, TX"
                    value={formData.propertyLocation}
                    onChange={(e) => setFormData({ ...formData, propertyLocation: e.target.value })}
                    data-testid="input-property-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Real Estate Investment Experience</Label>
                  <RadioGroup
                    value={formData.investmentExperience}
                    onValueChange={(value) => setFormData({ ...formData, investmentExperience: value })}
                    className="grid grid-cols-2 gap-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="first-time" id="first-time" data-testid="radio-first-time" />
                      <Label htmlFor="first-time" className="cursor-pointer">First-time investor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-3" id="1-3" data-testid="radio-1-3" />
                      <Label htmlFor="1-3" className="cursor-pointer">1-3 properties</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4-10" id="4-10" data-testid="radio-4-10" />
                      <Label htmlFor="4-10" className="cursor-pointer">4-10 properties</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="10+" id="10+" data-testid="radio-10plus" />
                      <Label htmlFor="10+" className="cursor-pointer">10+ properties</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    data-testid="button-back-step2"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleNextStep}
                    data-testid="button-next-step2"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Last step - your contact information</CardTitle>
                <CardDescription>
                  We'll send your personalized rate quote to this email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Smith"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  By submitting, you agree to receive communications from Secured Asset Funding. 
                  We respect your privacy and will never share your information.
                </p>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(2)}
                    data-testid="button-back-step3"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={createLeadMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createLeadMutation.isPending ? "Submitting..." : "Get My Rate"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="text-center">
              <CardContent className="pt-12 pb-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Your rate request has been received. A loan specialist will contact you within 24 hours with your personalized financing options.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => window.location.href = "/"} data-testid="button-back-home">
                    Back to Home
                  </Button>
                  <Button onClick={() => window.location.href = "/calculator"} data-testid="button-try-calculator">
                    Try Our Calculator
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
