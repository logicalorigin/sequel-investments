import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import StylizedMapPreview from "@/components/StylizedMapPreview";
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
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import logoIcon from "@assets/generated_images/sequel_investments_s_logo_icon.png";
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
  propertyLatitude: number | null;
  propertyLongitude: number | null;
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
  const { user, isAuthenticated } = useAuth();
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
    propertyLatitude: null,
    propertyLongitude: null,
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

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || "",
        lastName: prev.lastName || user.lastName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [isAuthenticated, user]);

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
        if (formData.loanType !== "dscr" && !formData.investmentExperience) {
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

    const fullAddress = [
      formData.propertyAddress,
      formData.propertyCity,
      formData.propertyState,
      formData.propertyZip
    ].filter(Boolean).join(", ");

    createLeadMutation.mutate({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      loanType: loanTypeMap[formData.loanType],
      propertyLocation: fullAddress,
      propertyValue: formData.purchasePrice,
      investmentExperience: formData.investmentExperience,
      desiredClosingDate: formData.desiredCloseDate || undefined,
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
        "80% LTV Purchase",
        "75% LTV Cash-Out",
        "Long Term & Short Term Rental Loans",
        "No W2 or Tax Returns Required",
        "Term Sheet in 24 Hours",
      ],
    },
    {
      id: "fix-flip" as LoanType,
      icon: Hammer,
      title: "Fix & Flip",
      subtitle: "Bridge Loan",
      features: [
        "92.5% LTC",
        "100% Renovation Financing",
        "No Experience Necessary",
        "No Inspection Needed",
        "48 Hour Closings",
      ],
    },
    {
      id: "construction" as LoanType,
      icon: Building2,
      title: "New Construction",
      subtitle: "Ground Up Loan",
      features: [
        "90% LTC",
        "1-4 Units",
        "No Experience Necessary",
        "No Inspection Needed",
        "48 Hour Closings",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" data-testid="link-logo-home">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="font-bold text-xl sm:text-2xl text-amber-500">SEQUEL</span>
            </div>
          </Link>
          <Link href="/" data-testid="link-close">
            <Button variant="ghost" className="text-white/70 hover:text-white h-8 sm:h-9 text-sm">
              Close
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Mobile: Compact dots indicator */}
        <div className="sm:hidden mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    step > s.number
                      ? "bg-[#D4A01D]"
                      : step === s.number
                      ? "bg-[#D4A01D] ring-2 ring-[#D4A01D]/30"
                      : "bg-white/20"
                  }`}
                />
                {index < steps.length - 1 && (
                  <div className={`w-6 h-0.5 mx-1 ${step > s.number ? "bg-[#D4A01D]" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-white/70 text-xs">
            Step {step} of {steps.length}: <span className="text-white font-medium">{steps[step - 1]?.label}</span>
          </div>
        </div>

        {/* Desktop: Full step indicator */}
        <div className="hidden sm:flex justify-center mb-12 pb-4">
          <div className="flex items-center gap-0">
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
                          ? "bg-[#D4A01D] text-white"
                          : isActive
                          ? "bg-[#D4A01D] text-white ring-4 ring-[#D4A01D]/30"
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
                    <div className={`w-16 h-0.5 mx-2 mt-[-12px] ${step > s.number ? "bg-[#D4A01D]" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center mb-4 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Loan Product</h1>
                <p className="text-sm sm:text-base text-white/60">Choose your loan product</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                {loanProducts.map((product) => {
                  const Icon = product.icon;
                  const isSelected = formData.loanType === product.id;
                  
                  return (
                    <div
                      key={product.id}
                      className={`relative bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all border-2 flex flex-col min-h-[280px] sm:min-h-[380px] ${
                        isSelected
                          ? "border-[#D4A01D] bg-[#D4A01D]/10"
                          : "border-transparent hover:border-white/20 hover:bg-white/10"
                      }`}
                      onClick={() => handleLoanTypeSelect(product.id)}
                      data-testid={`option-loan-${product.id}`}
                    >
                      <div className="text-center mb-3 sm:mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto flex items-center justify-center mb-2 sm:mb-4 bg-[#D4A01D]/20">
                          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#D4A01D]" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white">{product.title}</h3>
                        <p className="text-white/60 text-xs sm:text-sm">{product.subtitle}</p>
                      </div>
                      
                      <ul className="space-y-1.5 sm:space-y-2 flex-1">
                        {product.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/80">
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0 text-[#D4A01D]" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full mt-3 sm:mt-6 h-9 sm:h-10 text-sm ${
                          isSelected
                            ? "bg-[#D4A01D] hover:bg-[#B88A17] text-white"
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

              <div className="flex justify-end pt-4 sm:pt-6">
                <Button
                  onClick={handleNextStep}
                  disabled={!formData.loanType}
                  className="bg-[#D4A01D] hover:bg-[#B88A17] text-white px-6 sm:px-8 h-9 sm:h-10 text-sm"
                  data-testid="button-next"
                >
                  Save & Next
                  <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center mb-4 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Deal Intro</h1>
                <p className="text-sm sm:text-base text-white/60">Tell us about your deal</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-white text-sm sm:text-base">What is the purpose of this loan? *</Label>
                  <RadioGroup
                    value={formData.loanPurpose}
                    onValueChange={(value) => setFormData({ ...formData, loanPurpose: value })}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3"
                  >
                    {formData.loanType === "dscr" 
                      ? ["Purchase", "Cash-Out", "Rate & Term"].map((option) => (
                          <div
                            key={option}
                            className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-all ${
                              formData.loanPurpose === option
                                ? "border-[#D4A01D] bg-[#D4A01D]/10"
                                : "border-white/10 hover:border-white/20"
                            }`}
                            onClick={() => setFormData({ ...formData, loanPurpose: option })}
                          >
                            <RadioGroupItem value={option} id={option} className="border-white/40" />
                            <Label htmlFor={option} className="text-white cursor-pointer text-sm sm:text-base">{option}</Label>
                          </div>
                        ))
                      : ["Purchase", "Refinance"].map((option) => (
                          <div
                            key={option}
                            className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-all ${
                              formData.loanPurpose === option
                                ? "border-[#D4A01D] bg-[#D4A01D]/10"
                                : "border-white/10 hover:border-white/20"
                            }`}
                            onClick={() => setFormData({ ...formData, loanPurpose: option })}
                          >
                            <RadioGroupItem value={option} id={option} className="border-white/40" />
                            <Label htmlFor={option} className="text-white cursor-pointer text-sm sm:text-base">{option}</Label>
                          </div>
                        ))
                    }
                  </RadioGroup>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-white text-sm sm:text-base">Have you identified a property? *</Label>
                  <RadioGroup
                    value={formData.propertyIdentified}
                    onValueChange={(value) => setFormData({ ...formData, propertyIdentified: value })}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3"
                  >
                    {["Yes, I have a property", "No, still looking"].map((option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.propertyIdentified === option
                            ? "border-[#D4A01D] bg-[#D4A01D]/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                        onClick={() => setFormData({ ...formData, propertyIdentified: option })}
                      >
                        <RadioGroupItem value={option} id={option} className="border-white/40" />
                        <Label htmlFor={option} className="text-white cursor-pointer text-sm sm:text-base">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-white text-sm sm:text-base">Desired Close Date</Label>
                  <Input
                    type="date"
                    value={formData.desiredCloseDate}
                    onChange={(e) => setFormData({ ...formData, desiredCloseDate: e.target.value })}
                    className="bg-white/5 border-white/10 text-white [color-scheme:dark] h-9 sm:h-10 text-sm sm:text-base"
                    data-testid="input-close-date"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 sm:pt-6 gap-3">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  className="border-white/20 text-white hover:bg-white/10 h-9 sm:h-10 text-sm"
                  data-testid="button-back"
                >
                  <ArrowLeft className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-[#D4A01D] hover:bg-[#B88A17] text-white px-6 sm:px-8 h-9 sm:h-10 text-sm"
                  data-testid="button-next"
                >
                  Save & Next
                  <ArrowRight className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                    <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="select-property-type">
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
                  <AddressAutocomplete
                    value={formData.propertyAddress}
                    onChange={(value) => setFormData({ ...formData, propertyAddress: value })}
                    onPlaceSelect={(place) => {
                      if (place.address_components) {
                        let city = "";
                        let state = "";
                        let zip = "";
                        let streetNumber = "";
                        let route = "";
                        
                        for (const component of place.address_components) {
                          const types = component.types;
                          if (types.includes("locality")) {
                            city = component.long_name;
                          } else if (types.includes("administrative_area_level_1")) {
                            state = component.short_name;
                          } else if (types.includes("postal_code")) {
                            zip = component.long_name;
                          } else if (types.includes("street_number")) {
                            streetNumber = component.long_name;
                          } else if (types.includes("route")) {
                            route = component.long_name;
                          }
                        }
                        
                        const streetAddress = `${streetNumber} ${route}`.trim();
                        
                        const lat = place.geometry?.location?.lat?.() ?? null;
                        const lng = place.geometry?.location?.lng?.() ?? null;
                        
                        setFormData({
                          ...formData,
                          propertyAddress: streetAddress || place.formatted_address || "",
                          propertyCity: city,
                          propertyState: state,
                          propertyZip: zip,
                          propertyLatitude: lat,
                          propertyLongitude: lng,
                        });
                      }
                    }}
                    placeholder="Start typing property address..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    data-testid="input-address"
                  />
                </div>

                {/* Stylized Map Preview */}
                {formData.propertyLatitude && formData.propertyLongitude && (
                  <div className="space-y-3">
                    <Label className="text-white">Property Location</Label>
                    <StylizedMapPreview
                      latitude={formData.propertyLatitude}
                      longitude={formData.propertyLongitude}
                      address={[
                        formData.propertyAddress,
                        formData.propertyCity,
                        formData.propertyState,
                        formData.propertyZip
                      ].filter(Boolean).join(", ")}
                      zoom={15}
                      style="dark"
                      className="w-full h-[200px] md:h-[250px]"
                      borderRadius="12px"
                      data-testid="map-property-preview"
                    />
                  </div>
                )}

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
                  className="bg-[#D4A01D] hover:bg-[#B88A17] text-white px-8"
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

                {(formData.loanType === "fix-flip" || formData.loanType === "construction") && (
                  <div className="space-y-3">
                    <Label className="text-white">Investment Experience *</Label>
                    <Select
                      value={formData.investmentExperience}
                      onValueChange={(value) => setFormData({ ...formData, investmentExperience: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="select-experience">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 Deals - First Timer</SelectItem>
                        <SelectItem value="1-2">1-2 Deals</SelectItem>
                        <SelectItem value="3-5">3-5 Deals</SelectItem>
                        <SelectItem value="6-10">6-10 Deals</SelectItem>
                        <SelectItem value="10+">10+ Deals</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-white/40">
                      How many {formData.loanType === "fix-flip" ? "fix & flip" : "construction"} projects have you completed?
                    </p>
                  </div>
                )}

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
                  className="bg-[#D4A01D] hover:bg-[#B88A17] text-white px-8"
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
                          {formData.loanType === "dscr" ? "SEQUEL DSCR" : formData.loanType === "fix-flip" ? "SEQUEL FIX & FLIP" : "SEQUEL CONSTRUCTION"}
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

                  {(formData.loanType === "fix-flip" || formData.loanType === "construction") && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Experience</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Investment Experience</span>
                          <span className="text-white font-medium">{formData.investmentExperience || "—"} Deals</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Exit Strategy</span>
                          <span className="text-white font-medium">{formData.exitStrategy || "—"}</span>
                        </div>
                      </div>
                    </div>
                  )}

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
                  By submitting this application, you agree to receive communications from Sequel Investments. 
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
                  className="bg-[#D4A01D] hover:bg-[#B88A17] text-white px-8"
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
              <div className="w-20 h-20 bg-[#D4A01D]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-[#D4A01D]" />
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
                <Link href="/login" data-testid="link-portal">
                  <Button className="bg-[#D4A01D] hover:bg-[#B88A17] text-white">
                    Go to Client Portal
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-4 text-sm text-white/40">
          <span>© 2025 Sequel Investments. All rights reserved.</span>
          <span>|</span>
          <Link href="/terms" className="hover:text-white">Terms of Use</Link>
          <span>|</span>
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
