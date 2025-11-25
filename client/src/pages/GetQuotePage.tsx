import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Home, 
  Hammer, 
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  MapPin,
  Target,
  User,
  Send,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoIcon from "@assets/ChatGPT Image Jun 25, 2025, 12_32_43 PM_1764028581255.png";
import { Link } from "wouter";

type LoanType = "dscr" | "fix-flip" | "construction" | "";
type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface FormData {
  loanType: LoanType;
  loanPurpose: string;
  propertyIdentified: string;
  closingTimeframe: string;
  desiredCloseDate: string;
  propertyType: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  purchasePrice: string;
  rehabBudget: string;
  afterRepairValue: string;
  annualRents: string;
  annualTaxes: string;
  annualInsurance: string;
  annualHOA: string;
  investmentExperience: string;
  exitStrategy: string;
  entityType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  additionalNotes: string;
}

const steps = [
  { number: 1, label: "Loan Product", icon: FileText },
  { number: 2, label: "Deal Intro", icon: Target },
  { number: 3, label: "Property Info", icon: MapPin },
  { number: 4, label: "Borrower Info", icon: User },
  { number: 5, label: "Submit App", icon: Send },
];

export default function GetQuotePage() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    loanType: "",
    loanPurpose: "",
    propertyIdentified: "",
    closingTimeframe: "",
    desiredCloseDate: "",
    propertyType: "",
    propertyAddress: "",
    propertyCity: "",
    propertyState: "",
    propertyZip: "",
    purchasePrice: "",
    rehabBudget: "",
    afterRepairValue: "",
    annualRents: "",
    annualTaxes: "",
    annualInsurance: "",
    annualHOA: "",
    investmentExperience: "",
    exitStrategy: "",
    entityType: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    additionalNotes: "",
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/leads", data);
    },
    onSuccess: () => {
      setStep(6);
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

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.loanType) {
          toast({ title: "Please select a loan product", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!formData.loanPurpose || !formData.propertyIdentified) {
          toast({ title: "Please complete all required fields", variant: "destructive" });
          return false;
        }
        return true;
      case 3:
        if (!formData.propertyType || !formData.propertyCity || !formData.propertyState || !formData.purchasePrice) {
          toast({ title: "Please complete all required fields", variant: "destructive" });
          return false;
        }
        return true;
      case 4:
        if (!formData.investmentExperience) {
          toast({ title: "Please select your experience level", variant: "destructive" });
          return false;
        }
        return true;
      case 5:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          toast({ title: "Please complete all required fields", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep() && step < 6) {
      setStep((step + 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    if (!validateStep()) return;

    const loanTypeMap: Record<LoanType, string> = {
      dscr: "DSCR",
      "fix-flip": "Fix & Flip",
      construction: "New Construction",
      "": "Other",
    };

    const location = [formData.propertyCity, formData.propertyState].filter(Boolean).join(", ");

    createLeadMutation.mutate({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      loanType: loanTypeMap[formData.loanType],
      propertyLocation: location,
      propertyValue: formData.purchasePrice,
      investmentExperience: formData.investmentExperience,
      message: formData.additionalNotes || undefined,
    });
  };

  const loanProducts = [
    {
      id: "dscr" as LoanType,
      icon: Home,
      title: "DSCR",
      subtitle: "Rental Loan",
      features: [
        "No Minimum DSCR",
        "STR: Qualify on 100% AirDNA",
        "Multifamily up to 10 Units",
        "Mixed Use up to 8 Units",
        "Term Sheet in 24 Hours",
        "85% LTV / 75% LTV (Cash-Out)",
      ],
    },
    {
      id: "fix-flip" as LoanType,
      icon: Hammer,
      title: "Fix & Flip",
      subtitle: "Bridge Loan",
      features: [
        "Minimum Cash to Close",
        "No Appraisal Required",
        "No Junk Fees",
        "No Prepayment Penalty",
        "$ for Renovation",
        "48 Hour Draw Funding",
        "48 Hour Closings",
      ],
    },
    {
      id: "construction" as LoanType,
      icon: Building2,
      title: "New Construction",
      subtitle: "Ground Up Loan",
      features: [
        "Ground Up Construction or Additions",
        "Minimum Cash to Close",
        "No Junk Fees",
        "No Prepayment Penalty",
        "48 Hour Draw Funding",
        "48 Hour Closings",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" data-testid="link-logo-home">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={logoIcon} alt="SAF" className="h-10 w-10 object-contain" />
              <span className="font-bold text-xl text-white hidden sm:inline">Secured Asset Funding</span>
            </div>
          </Link>
          <Link href="/" data-testid="link-close">
            <Button variant="ghost" className="text-white/70 hover:text-white">
              Close
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-center mb-12 overflow-x-auto pb-4">
          <div className="flex items-center gap-0 min-w-max">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.number;
              const isCompleted = step > s.number;
              
              return (
                <div key={s.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-white/50 mb-2">Step {s.number}</div>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-[#e55c2b] text-white"
                          : isActive
                          ? "bg-[#e55c2b] text-white ring-4 ring-[#e55c2b]/30"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className={`text-xs mt-2 font-medium ${isActive || isCompleted ? "text-white" : "text-white/40"}`}>
                      {s.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 mt-[-12px] ${step > s.number ? "bg-[#e55c2b]" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Loan Product</h1>
                <p className="text-white/60">Choose your loan product</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {loanProducts.map((product) => {
                  const Icon = product.icon;
                  const isSelected = formData.loanType === product.id;
                  
                  return (
                    <div
                      key={product.id}
                      className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 cursor-pointer transition-all border-2 ${
                        isSelected
                          ? "border-[#e55c2b] bg-[#e55c2b]/10"
                          : "border-transparent hover:border-white/20 hover:bg-white/10"
                      }`}
                      onClick={() => handleLoanTypeSelect(product.id)}
                      data-testid={`option-loan-${product.id}`}
                    >
                      <div className="text-center mb-6">
                        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
                          isSelected ? "bg-[#e55c2b]" : "bg-white/10"
                        }`}>
                          <Icon className={`h-8 w-8 ${isSelected ? "text-white" : "text-white/60"}`} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{product.title}</h3>
                        <p className="text-white/60 text-sm">{product.subtitle}</p>
                      </div>
                      
                      <ul className="space-y-2">
                        {product.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                            <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isSelected ? "text-[#e55c2b]" : "text-white/40"}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full mt-6 ${
                          isSelected
                            ? "bg-[#e55c2b] hover:bg-[#d44d1f] text-white"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoanTypeSelect(product.id);
                        }}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  onClick={handleNextStep}
                  disabled={!formData.loanType}
                  className="bg-[#e55c2b] hover:bg-[#d44d1f] text-white px-8"
                  data-testid="button-next"
                >
                  Save & Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Deal Intro</h1>
                <p className="text-white/60">Tell us about your deal</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 space-y-6">
                <div className="space-y-3">
                  <Label className="text-white">What is the purpose of this loan? *</Label>
                  <RadioGroup
                    value={formData.loanPurpose}
                    onValueChange={(value) => setFormData({ ...formData, loanPurpose: value })}
                    className="grid grid-cols-3 gap-3"
                  >
                    {formData.loanType === "dscr" 
                      ? ["Purchase", "Cash-Out", "Rate & Term"].map((option) => (
                          <div
                            key={option}
                            className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                              formData.loanPurpose === option
                                ? "border-[#e55c2b] bg-[#e55c2b]/10"
                                : "border-white/10 hover:border-white/20"
                            }`}
                            onClick={() => setFormData({ ...formData, loanPurpose: option })}
                          >
                            <RadioGroupItem value={option} id={option} className="border-white/40" />
                            <Label htmlFor={option} className="text-white cursor-pointer">{option}</Label>
                          </div>
                        ))
                      : ["Purchase", "Refinance"].map((option) => (
                          <div
                            key={option}
                            className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                              formData.loanPurpose === option
                                ? "border-[#e55c2b] bg-[#e55c2b]/10"
                                : "border-white/10 hover:border-white/20"
                            }`}
                            onClick={() => setFormData({ ...formData, loanPurpose: option })}
                          >
                            <RadioGroupItem value={option} id={option} className="border-white/40" />
                            <Label htmlFor={option} className="text-white cursor-pointer">{option}</Label>
                          </div>
                        ))
                    }
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Have you identified a property? *</Label>
                  <RadioGroup
                    value={formData.propertyIdentified}
                    onValueChange={(value) => setFormData({ ...formData, propertyIdentified: value })}
                    className="grid grid-cols-2 gap-3"
                  >
                    {["Yes, I have a property", "No, still looking"].map((option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.propertyIdentified === option
                            ? "border-[#e55c2b] bg-[#e55c2b]/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                        onClick={() => setFormData({ ...formData, propertyIdentified: option })}
                      >
                        <RadioGroupItem value={option} id={option} className="border-white/40" />
                        <Label htmlFor={option} className="text-white cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Desired Close Date</Label>
                  <Input
                    type="date"
                    value={formData.desiredCloseDate}
                    onChange={(e) => setFormData({ ...formData, desiredCloseDate: e.target.value })}
                    className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                    data-testid="input-close-date"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  className="border-white/20 text-white hover:bg-white/10"
                  data-testid="button-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-[#e55c2b] hover:bg-[#d44d1f] text-white px-8"
                  data-testid="button-next"
                >
                  Save & Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Property Info</h1>
                <p className="text-white/60">Tell us about the property</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 space-y-6">
                <div className="space-y-3">
                  <Label className="text-white">Property Type *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sfr">Single Family Residence</SelectItem>
                      <SelectItem value="condo">Condo/Townhouse</SelectItem>
                      <SelectItem value="2-4-unit">2-4 Unit</SelectItem>
                      <SelectItem value="5-plus">5+ Units</SelectItem>
                      <SelectItem value="mixed-use">Mixed Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Property Address</Label>
                  <Input
                    placeholder="123 Main Street"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    data-testid="input-address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label className="text-white">City *</Label>
                    <Input
                      placeholder="City"
                      value={formData.propertyCity}
                      onChange={(e) => setFormData({ ...formData, propertyCity: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      data-testid="input-city"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white">State *</Label>
                    <Input
                      placeholder="TX"
                      value={formData.propertyState}
                      onChange={(e) => setFormData({ ...formData, propertyState: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      data-testid="input-state"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white">ZIP</Label>
                    <Input
                      placeholder="78701"
                      value={formData.propertyZip}
                      onChange={(e) => setFormData({ ...formData, propertyZip: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      data-testid="input-zip"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label className="text-white">Purchase Price / Value *</Label>
                    <Input
                      placeholder="$500,000"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      data-testid="input-purchase-price"
                    />
                  </div>
                  {formData.loanType === "dscr" && (
                    <>
                      <div className="space-y-3">
                        <Label className="text-white">Annual Rents *</Label>
                        <Input
                          placeholder="$36,000"
                          value={formData.annualRents}
                          onChange={(e) => setFormData({ ...formData, annualRents: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          data-testid="input-annual-rents"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white">Annual Taxes</Label>
                        <Input
                          placeholder="$6,000"
                          value={formData.annualTaxes}
                          onChange={(e) => setFormData({ ...formData, annualTaxes: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          data-testid="input-annual-taxes"
                        />
                      </div>
                    </>
                  )}
                  {(formData.loanType === "fix-flip" || formData.loanType === "construction") && (
                    <>
                      <div className="space-y-3">
                        <Label className="text-white">Rehab/Construction Budget</Label>
                        <Input
                          placeholder="$100,000"
                          value={formData.rehabBudget}
                          onChange={(e) => setFormData({ ...formData, rehabBudget: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          data-testid="input-rehab-budget"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-white">After Repair Value (ARV)</Label>
                        <Input
                          placeholder="$750,000"
                          value={formData.afterRepairValue}
                          onChange={(e) => setFormData({ ...formData, afterRepairValue: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          data-testid="input-arv"
                        />
                      </div>
                    </>
                  )}
                </div>

                {formData.loanType === "dscr" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-white">Annual Insurance</Label>
                      <Input
                        placeholder="$2,400"
                        value={formData.annualInsurance}
                        onChange={(e) => setFormData({ ...formData, annualInsurance: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        data-testid="input-annual-insurance"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-white">Annual HOA (if applicable)</Label>
                      <Input
                        placeholder="$1,200"
                        value={formData.annualHOA}
                        onChange={(e) => setFormData({ ...formData, annualHOA: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        data-testid="input-annual-hoa"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  className="border-white/20 text-white hover:bg-white/10"
                  data-testid="button-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-[#e55c2b] hover:bg-[#d44d1f] text-white px-8"
                  data-testid="button-next"
                >
                  Save & Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Borrower Info</h1>
                <p className="text-white/60">Your contact information</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-white">First Name *</Label>
                    <Input
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-white">Last Name *</Label>
                    <Input
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Phone Number *</Label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Additional Notes</Label>
                  <Textarea
                    placeholder="Tell us anything else about your deal..."
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                    data-testid="input-notes"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  className="border-white/20 text-white hover:bg-white/10"
                  data-testid="button-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-[#e55c2b] hover:bg-[#d44d1f] text-white px-8"
                  data-testid="button-next"
                >
                  Save & Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Submit Application</h1>
                <p className="text-white/60">Review and submit your application</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Loan Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Loan Product</span>
                        <span className="text-white font-medium">
                          {formData.loanType === "dscr" ? "SAFRENT" : formData.loanType === "fix-flip" ? "SAFFIX" : "SAFBUILD"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Purpose</span>
                        <span className="text-white font-medium">{formData.loanPurpose || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Timeframe</span>
                        <span className="text-white font-medium">{formData.closingTimeframe || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Property Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Location</span>
                        <span className="text-white font-medium">{formData.propertyCity}, {formData.propertyState}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Property Type</span>
                        <span className="text-white font-medium">{formData.propertyType || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Purchase Price</span>
                        <span className="text-white font-medium">{formData.purchasePrice || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Strategy</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Experience</span>
                        <span className="text-white font-medium">{formData.investmentExperience || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Exit Strategy</span>
                        <span className="text-white font-medium">{formData.exitStrategy || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Contact Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Name</span>
                        <span className="text-white font-medium">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Email</span>
                        <span className="text-white font-medium">{formData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Phone</span>
                        <span className="text-white font-medium">{formData.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/40 pt-4 border-t border-white/10">
                  By submitting this application, you agree to receive communications from Secured Asset Funding. 
                  We respect your privacy and will never share your information with third parties.
                </p>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  className="border-white/20 text-white hover:bg-white/10"
                  data-testid="button-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createLeadMutation.isPending}
                  className="bg-[#e55c2b] hover:bg-[#d44d1f] text-white px-8"
                  data-testid="button-submit"
                >
                  {createLeadMutation.isPending ? "Submitting..." : "Submit Application"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#e55c2b]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-[#e55c2b]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Application Submitted!</h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                Thank you for your application. A loan specialist will contact you within 24 hours to discuss your financing options.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/" data-testid="link-home">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Back to Home
                  </Button>
                </Link>
                <Link href="/calculator" data-testid="link-calculator">
                  <Button className="bg-[#e55c2b] hover:bg-[#d44d1f] text-white">
                    Try Our Calculator
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-4 text-sm text-white/40">
          <span>© 2025 Secured Asset Funding. All rights reserved.</span>
          <span>|</span>
          <Link href="/terms" className="hover:text-white">Terms of Use</Link>
          <span>|</span>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
