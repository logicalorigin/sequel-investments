import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { 
  Home, 
  Hammer, 
  Building2, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  MapPin,
  DollarSign,
  User,
  Mail,
  Phone,
  Send,
  Sprout,
  TrendingUp,
  Award,
  Rocket,
  FileText,
  Calculator,
  ClipboardCheck,
  Building,
  RefreshCw,
  ShoppingCart,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import logoIcon from "@assets/logo_saf_only_removed_bg (1)_1764095523171.png";
import AddressAutocomplete from "@/components/AddressAutocomplete";

type LoanType = "dscr" | "fix-flip" | "construction" | "";
type TransactionType = "purchase" | "refinance" | "";

interface PropertyDetails {
  beds: string;
  baths: string;
  sqft: string;
  yearBuilt: string;
  estimatedValue: string;
}

interface FormData {
  loanType: LoanType;
  loanAmount: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  purchasePrice: string;
  rehabBudget: string;
  afterRepairValue: string;
  monthlyRent: string;
  experience: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // DSCR-specific fields
  transactionType: TransactionType;
  propertyDetails: PropertyDetails;
  downPaymentPercent: string;
  propertyValue: string;
  currentLoanBalance: string;
  desiredCashOut: string;
  annualTaxes: string;
  annualInsurance: string;
  annualHoa: string;
}

interface Question {
  id: string;
  type: "loan-type" | "sentence-input" | "address" | "experience" | "contact" | "transaction-type" | "dscr-purchase-financials" | "dscr-refinance-financials" | "property-details" | "fixflip-financials" | "construction-financials";
  prompt: string;
  field?: keyof FormData;
  showFor?: LoanType[];
  showForTransaction?: TransactionType[];
}

// Pipeline step definitions for visual progress
const pipelineSteps = [
  { id: "loan-type", label: "Loan Type", icon: FileText },
  { id: "property", label: "Property", icon: Building },
  { id: "financials", label: "Financials", icon: Calculator },
  { id: "experience", label: "Experience", icon: ClipboardCheck },
  { id: "contact", label: "Contact", icon: User },
];

const questions: Question[] = [
  {
    id: "loan-type",
    type: "loan-type",
    prompt: "What type of investment are you financing?",
  },
  {
    id: "property-address",
    type: "address",
    prompt: "Where is the property located?",
    field: "propertyAddress",
  },
  // DSCR & Fix & Flip: Show property details after address (existing properties)
  {
    id: "property-details",
    type: "property-details",
    prompt: "Property Details",
    showFor: ["dscr", "fix-flip"],
  },
  // DSCR: Transaction type selection
  {
    id: "transaction-type",
    type: "transaction-type",
    prompt: "Is this a purchase or refinance?",
    showFor: ["dscr"],
  },
  // DSCR Purchase flow
  {
    id: "dscr-purchase-financials",
    type: "dscr-purchase-financials",
    prompt: "Property Financials",
    showFor: ["dscr"],
    showForTransaction: ["purchase"],
  },
  // DSCR Refinance flow
  {
    id: "dscr-refinance-financials",
    type: "dscr-refinance-financials",
    prompt: "Property Financials",
    showFor: ["dscr"],
    showForTransaction: ["refinance"],
  },
  // Fix & Flip: Combined financials page
  {
    id: "fixflip-financials",
    type: "fixflip-financials",
    prompt: "Deal Financials",
    showFor: ["fix-flip"],
  },
  // New Construction: Combined financials page
  {
    id: "construction-financials",
    type: "construction-financials",
    prompt: "Project Financials",
    showFor: ["construction"],
  },
  {
    id: "experience",
    type: "experience",
    prompt: "How many deals have you completed?",
    field: "experience",
  },
  {
    id: "contact",
    type: "contact",
    prompt: "Let's get you a quote! How can we reach you?",
  },
];

const loanProducts = [
  {
    id: "dscr" as LoanType,
    icon: Home,
    title: "DSCR Rental",
    description: "Financing for Short & Long Term Rentals",
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500",
  },
  {
    id: "fix-flip" as LoanType,
    icon: Hammer,
    title: "Fix & Flip",
    description: "Short-term rehab loans",
    color: "from-amber-500/20 to-orange-600/20",
    borderColor: "border-amber-500",
  },
  {
    id: "construction" as LoanType,
    icon: Building2,
    title: "New Construction",
    description: "Ground-up building loans",
    color: "from-emerald-500/20 to-green-600/20",
    borderColor: "border-emerald-500",
  },
];

const experienceLevels = [
  { id: "0", label: "This is my first deal", icon: "seedling" },
  { id: "1-3", label: "1-3 deals", icon: "trending" },
  { id: "4-10", label: "4-10 deals", icon: "award" },
  { id: "10+", label: "10+ deals", icon: "rocket" },
];

function FluidProgressBar({ progress }: { progress: number }) {
  const progressValue = useMotionValue(0);
  const width = useTransform(progressValue, [0, 100], ["0%", "100%"]);
  
  useEffect(() => {
    animate(progressValue, progress, { duration: 0.6, ease: "easeOut" });
  }, [progress, progressValue]);

  return (
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-primary to-amber-400 rounded-full"
        style={{ width }}
      />
    </div>
  );
}

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    setDisplayText("");
    setIsComplete(false);
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, 25);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <span>
      {displayText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="inline-block w-0.5 h-8 bg-primary ml-1 align-middle"
        />
      )}
    </span>
  );
}

function AliveInput({ 
  value, 
  onChange, 
  placeholder,
  prefix,
  suffix,
  type = "text",
  autoFocus = false,
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [autoFocus]);

  const formatCurrency = (val: string) => {
    const num = val.replace(/[^\d]/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(num));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "currency") {
      onChange(formatCurrency(e.target.value));
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <motion.div 
      className={`relative inline-flex items-center gap-2 ${isFocused ? "scale-105" : ""}`}
      animate={{ scale: isFocused ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      {prefix && <span className="text-3xl sm:text-4xl font-light text-white/80">{prefix}</span>}
      <div className="relative">
        <motion.div
          className="absolute -inset-2 rounded-xl bg-primary/20 blur-xl"
          animate={{ 
            opacity: isFocused ? 0.6 : 0,
            scale: isFocused ? 1.1 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            relative z-10 bg-transparent border-b-2 
            text-3xl sm:text-4xl font-bold text-white
            placeholder:text-white/30 
            focus:outline-none 
            transition-all duration-300
            min-w-[120px] sm:min-w-[180px] max-w-[300px]
            text-center
            ${isFocused ? "border-primary" : "border-white/30"}
          `}
          data-testid={`input-${type}`}
        />
      </div>
      {suffix && <span className="text-3xl sm:text-4xl font-light text-white/80">{suffix}</span>}
    </motion.div>
  );
}

export default function ConversationalQuote() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    loanType: "",
    loanAmount: "",
    propertyAddress: "",
    propertyCity: "",
    propertyState: "",
    propertyZip: "",
    purchasePrice: "",
    rehabBudget: "",
    afterRepairValue: "",
    monthlyRent: "",
    experience: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // DSCR fields
    transactionType: "",
    propertyDetails: { beds: "", baths: "", sqft: "", yearBuilt: "", estimatedValue: "" },
    downPaymentPercent: "20",
    propertyValue: "",
    currentLoanBalance: "",
    desiredCashOut: "",
    annualTaxes: "",
    annualInsurance: "",
    annualHoa: "",
  });
  const [isLoadingPropertyDetails, setIsLoadingPropertyDetails] = useState(false);

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

  const filteredQuestions = questions.filter(q => {
    // Filter by loan type
    if (q.showFor && !q.showFor.includes(formData.loanType)) return false;
    // Filter by transaction type for DSCR
    if (q.showForTransaction && !q.showForTransaction.includes(formData.transactionType)) return false;
    return true;
  });
  
  // Map current question to pipeline step
  const getCurrentPipelineStep = () => {
    if (!currentQuestion) return 0;
    const questionId = currentQuestion.id;
    if (questionId === "loan-type") return 0;
    if (["property-address", "property-details"].includes(questionId)) return 1;
    if (["transaction-type", "dscr-purchase-financials", "dscr-refinance-financials", "fixflip-financials", "construction-financials"].includes(questionId)) return 2;
    if (questionId === "experience") return 3;
    if (questionId === "contact") return 4;
    return 0;
  };

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / filteredQuestions.length) * 100;

  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/leads", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error?.body?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => {
      // If loan type is changing, reset financial fields to prevent data contamination
      if (field === "loanType" && value !== prev.loanType) {
        // Also reset the question index since we're starting a new flow
        // Using setTimeout to avoid state update conflicts
        setTimeout(() => {
          setCurrentQuestionIndex(0);
          setDirection(1);
        }, 0);
        
        return {
          ...prev,
          [field]: value,
          // Reset all financial fields when changing loan type
          purchasePrice: "",
          rehabBudget: "",
          afterRepairValue: "",
          monthlyRent: "",
          transactionType: "" as TransactionType,
          propertyDetails: { beds: "", baths: "", sqft: "", yearBuilt: "", estimatedValue: "" },
          downPaymentPercent: "20",
          propertyValue: "",
          currentLoanBalance: "",
          desiredCashOut: "",
          annualTaxes: "",
          annualInsurance: "",
          annualHoa: "",
          // Reset property address since it's entered after loan type selection
          propertyAddress: "",
          propertyCity: "",
          propertyState: "",
          propertyZip: "",
        };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const canContinue = () => {
    if (!currentQuestion) return false;
    
    switch (currentQuestion.id) {
      case "loan-type":
        return !!formData.loanType;
      case "property-address":
        return !!formData.propertyAddress || !!formData.propertyCity;
      case "property-details":
        return true; // Property details are pre-filled or optional
      case "transaction-type":
        return !!formData.transactionType;
      case "dscr-purchase-financials":
        return !!formData.purchasePrice && !!formData.monthlyRent && !!formData.annualTaxes && !!formData.annualInsurance;
      case "dscr-refinance-financials":
        return !!formData.propertyValue && !!formData.currentLoanBalance && !!formData.monthlyRent && !!formData.annualTaxes && !!formData.annualInsurance;
      case "fixflip-financials":
        return !!formData.purchasePrice && !!formData.rehabBudget && !!formData.afterRepairValue;
      case "construction-financials":
        return !!formData.purchasePrice && !!formData.rehabBudget && !!formData.afterRepairValue;
      case "experience":
        return !!formData.experience;
      case "contact":
        return !!formData.firstName && !!formData.lastName && !!formData.email && !!formData.phone;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canContinue()) {
      toast({ title: "Please complete this step", variant: "destructive" });
      return;
    }

    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setDirection(1);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
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
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      loanType: loanTypeMap[formData.loanType],
      propertyLocation: fullAddress,
      propertyValue: formData.purchasePrice?.replace(/,/g, "") || formData.loanAmount?.replace(/,/g, ""),
      investmentExperience: formData.experience,
    });
  };

  const handleAddressSelect = (place: any) => {
    let city = "";
    let state = "";
    let zip = "";
    let streetAddress = place.formatted_address || "";

    if (place.address_components) {
      for (const component of place.address_components) {
        if (component.types.includes("locality")) {
          city = component.long_name;
        } else if (component.types.includes("administrative_area_level_1")) {
          state = component.short_name;
        } else if (component.types.includes("postal_code")) {
          zip = component.long_name;
        }
      }
    }

    setFormData(prev => {
      // For DSCR and Fix & Flip loans (existing properties), fetch property details
      if ((prev.loanType === "dscr" || prev.loanType === "fix-flip") && streetAddress) {
        // Use setTimeout to ensure state is updated before fetching
        setTimeout(() => fetchPropertyDetails(streetAddress), 100);
      }
      
      return {
        ...prev,
        propertyAddress: streetAddress,
        propertyCity: city,
        propertyState: state,
        propertyZip: zip,
      };
    });
  };

  const fetchPropertyDetails = async (address: string) => {
    setIsLoadingPropertyDetails(true);
    try {
      const response = await fetch(`/api/rentcast/property?address=${encodeURIComponent(address)}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          propertyDetails: {
            beds: data.bedrooms?.toString() || "",
            baths: data.bathrooms?.toString() || "",
            sqft: data.squareFootage?.toString() || "",
            yearBuilt: data.yearBuilt?.toString() || "",
            estimatedValue: data.price?.toString() || data.estimatedValue?.toString() || "",
          },
        }));
      }
    } catch (error) {
      console.log("Property details not available");
    } finally {
      setIsLoadingPropertyDetails(false);
    }
  };

  const updatePropertyDetail = (key: keyof PropertyDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      propertyDetails: { ...prev.propertyDetails, [key]: value },
    }));
  };

  const formatCurrency = (val: string) => {
    const num = val.replace(/[^\d]/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("en-US").format(parseInt(num));
  };

  // Calculate max cash out for refinance (75% LTV)
  const maxCashOut = formData.propertyValue 
    ? Math.floor(parseFloat(formData.propertyValue.replace(/,/g, "")) * 0.75 - parseFloat(formData.currentLoanBalance?.replace(/,/g, "") || "0"))
    : 0;

  // Calculate min down payment for purchase (20% = 80% LTV max)
  const minDownPayment = formData.purchasePrice 
    ? Math.ceil(parseFloat(formData.purchasePrice.replace(/,/g, "")) * 0.20)
    : 0;

  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction < 0 ? 60 : -60,
      opacity: 0,
    }),
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "loan-type":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center leading-tight">
              <TypewriterText text={currentQuestion.prompt} />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {loanProducts.map((product) => {
                const Icon = product.icon;
                const isSelected = formData.loanType === product.id;
                
                return (
                  <motion.button
                    key={product.id}
                    onClick={() => updateField("loanType", product.id)}
                    className={`
                      relative p-6 rounded-2xl border-2 transition-all
                      bg-gradient-to-br ${product.color}
                      ${isSelected ? `${product.borderColor} shadow-lg shadow-primary/20` : "border-white/10 hover:border-white/30"}
                    `}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`option-loan-${product.id}`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    <Icon className={`w-10 h-10 mx-auto mb-3 ${isSelected ? "text-primary" : "text-white/70"}`} />
                    <h3 className="text-lg font-bold text-white">{product.title}</h3>
                    <p className="text-sm text-white/60 mt-1">{product.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case "sentence-input":
        const fieldValue = currentQuestion.field ? formData[currentQuestion.field] : "";
        const stringValue = typeof fieldValue === "string" ? fieldValue : "";
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight flex flex-wrap items-center justify-center gap-3">
              <TypewriterText text={currentQuestion.prompt} />
              <AliveInput
                value={stringValue}
                onChange={(val) => updateField(currentQuestion.field as keyof FormData, val)}
                placeholder="$0"
                prefix="$"
                type="currency"
                autoFocus
              />
            </h2>
          </div>
        );

      case "address":
        return (
          <div className="space-y-8 text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              <TypewriterText text={currentQuestion.prompt} />
            </h2>
            <div className="relative">
              <motion.div
                className="absolute -inset-2 rounded-xl bg-primary/20 blur-xl opacity-50"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <div className="relative z-10">
                <AddressAutocomplete
                  value={formData.propertyAddress}
                  onChange={(val) => updateField("propertyAddress", val)}
                  onPlaceSelect={handleAddressSelect}
                  placeholder="Enter property address..."
                  className="w-full text-lg p-4 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>
            <p className="text-white/50 text-sm">
              <MapPin className="w-4 h-4 inline mr-1" />
              {formData.propertyCity && formData.propertyState 
                ? `${formData.propertyCity}, ${formData.propertyState}`
                : "Start typing to search..."}
            </p>
          </div>
        );

      case "property-details":
        return (
          <div className="space-y-6 text-center max-w-xl mx-auto">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                Property Details
              </h2>
              <p className="text-white/60 text-sm">
                {formData.propertyAddress && (
                  <span className="flex items-center justify-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {formData.propertyAddress}
                  </span>
                )}
              </p>
            </div>
            {isLoadingPropertyDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="ml-3 text-white/60">Fetching property details...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Bedrooms</label>
                  <input
                    type="text"
                    value={formData.propertyDetails.beds}
                    onChange={(e) => updatePropertyDetail("beds", e.target.value)}
                    placeholder="--"
                    className="w-full bg-transparent text-2xl font-bold text-white text-center focus:outline-none"
                    data-testid="input-beds"
                  />
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Bathrooms</label>
                  <input
                    type="text"
                    value={formData.propertyDetails.baths}
                    onChange={(e) => updatePropertyDetail("baths", e.target.value)}
                    placeholder="--"
                    className="w-full bg-transparent text-2xl font-bold text-white text-center focus:outline-none"
                    data-testid="input-baths"
                  />
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Sq. Ft.</label>
                  <input
                    type="text"
                    value={formData.propertyDetails.sqft}
                    onChange={(e) => updatePropertyDetail("sqft", e.target.value)}
                    placeholder="--"
                    className="w-full bg-transparent text-2xl font-bold text-white text-center focus:outline-none"
                    data-testid="input-sqft"
                  />
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Year Built</label>
                  <input
                    type="text"
                    value={formData.propertyDetails.yearBuilt}
                    onChange={(e) => updatePropertyDetail("yearBuilt", e.target.value)}
                    placeholder="--"
                    className="w-full bg-transparent text-2xl font-bold text-white text-center focus:outline-none"
                    data-testid="input-yearBuilt"
                  />
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 col-span-2">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Estimated Value</label>
                  <div className="flex items-center justify-center">
                    <span className="text-white/60 text-2xl mr-1">$</span>
                    <input
                      type="text"
                      value={formData.propertyDetails.estimatedValue}
                      onChange={(e) => updatePropertyDetail("estimatedValue", formatCurrency(e.target.value))}
                      placeholder="--"
                      className="w-full bg-transparent text-2xl font-bold text-white text-center focus:outline-none"
                      data-testid="input-estimatedValue"
                    />
                  </div>
                </div>
              </div>
            )}
            <p className="text-white/40 text-xs">
              Values are auto-filled when available. You can edit if needed.
            </p>
          </div>
        );

      case "transaction-type":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center leading-tight">
              <TypewriterText text={currentQuestion.prompt} />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              <motion.button
                onClick={() => updateField("transactionType", "purchase")}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all
                  bg-gradient-to-br from-blue-500/20 to-blue-600/20
                  ${formData.transactionType === "purchase" ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-white/10 hover:border-white/30"}
                `}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                data-testid="option-transaction-purchase"
              >
                {formData.transactionType === "purchase" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                )}
                <ShoppingCart className={`w-10 h-10 mx-auto mb-3 ${formData.transactionType === "purchase" ? "text-blue-500" : "text-white/70"}`} />
                <h3 className="text-lg font-bold text-white">Purchase</h3>
                <p className="text-sm text-white/60 mt-1">Buying a new property</p>
                <p className="text-xs text-white/40 mt-2">Up to 80% LTV</p>
              </motion.button>
              <motion.button
                onClick={() => updateField("transactionType", "refinance")}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all
                  bg-gradient-to-br from-emerald-500/20 to-green-600/20
                  ${formData.transactionType === "refinance" ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-white/10 hover:border-white/30"}
                `}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                data-testid="option-transaction-refinance"
              >
                {formData.transactionType === "refinance" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                )}
                <RefreshCw className={`w-10 h-10 mx-auto mb-3 ${formData.transactionType === "refinance" ? "text-emerald-500" : "text-white/70"}`} />
                <h3 className="text-lg font-bold text-white">Refinance</h3>
                <p className="text-sm text-white/60 mt-1">Refinance existing property</p>
                <p className="text-xs text-white/40 mt-2">Up to 75% LTV (cash out)</p>
              </motion.button>
            </div>
          </div>
        );

      case "dscr-purchase-financials":
        return (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                Purchase Details
              </h2>
              <p className="text-white/60 text-sm">80% LTV maximum</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Purchase Price</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.purchasePrice}
                    onChange={(e) => updateField("purchasePrice", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-dscr-purchase-price"
                  />
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Down Payment %</label>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={formData.downPaymentPercent}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d]/g, "");
                      const num = Math.min(100, Math.max(20, parseInt(val) || 20));
                      updateField("downPaymentPercent", num.toString());
                    }}
                    placeholder="20"
                    className="w-20 bg-transparent text-xl font-bold text-white focus:outline-none text-center"
                    data-testid="input-down-payment"
                  />
                  <span className="text-white/40">% (min 20%)</span>
                </div>
                {formData.purchasePrice && (
                  <p className="text-white/40 text-xs mt-2">
                    = ${formatCurrency((parseFloat(formData.purchasePrice.replace(/,/g, "")) * parseFloat(formData.downPaymentPercent) / 100).toString())} down
                  </p>
                )}
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Expected Monthly Rent</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.monthlyRent}
                    onChange={(e) => updateField("monthlyRent", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-dscr-monthly-rent"
                  />
                  <span className="text-white/40 ml-2">/mo</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Annual Taxes</label>
                  <div className="flex items-center">
                    <span className="text-white/40 mr-1">$</span>
                    <input
                      type="text"
                      value={formData.annualTaxes}
                      onChange={(e) => updateField("annualTaxes", formatCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full bg-transparent text-lg font-bold text-white focus:outline-none"
                      data-testid="input-annual-taxes"
                    />
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Annual Insurance</label>
                  <div className="flex items-center">
                    <span className="text-white/40 mr-1">$</span>
                    <input
                      type="text"
                      value={formData.annualInsurance}
                      onChange={(e) => updateField("annualInsurance", formatCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full bg-transparent text-lg font-bold text-white focus:outline-none"
                      data-testid="input-annual-insurance"
                    />
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Annual HOA</label>
                  <div className="flex items-center">
                    <span className="text-white/40 mr-1">$</span>
                    <input
                      type="text"
                      value={formData.annualHoa}
                      onChange={(e) => updateField("annualHoa", formatCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full bg-transparent text-lg font-bold text-white focus:outline-none"
                      data-testid="input-annual-hoa"
                    />
                  </div>
                  <span className="text-white/30 text-xs">Optional</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "dscr-refinance-financials":
        return (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                Refinance Details
              </h2>
              <p className="text-white/60 text-sm">75% LTV maximum for cash out</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Property Value</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.propertyValue}
                    onChange={(e) => updateField("propertyValue", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-property-value"
                  />
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Current Loan Balance</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.currentLoanBalance}
                    onChange={(e) => updateField("currentLoanBalance", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-current-loan-balance"
                  />
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Desired Cash Out</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.desiredCashOut}
                    onChange={(e) => updateField("desiredCashOut", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-desired-cash-out"
                  />
                </div>
                {maxCashOut > 0 && (
                  <p className="text-white/40 text-xs mt-2">
                    Max available: ${formatCurrency(maxCashOut.toString())} (75% LTV)
                  </p>
                )}
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Current Monthly Rent</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.monthlyRent}
                    onChange={(e) => updateField("monthlyRent", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-refi-monthly-rent"
                  />
                  <span className="text-white/40 ml-2">/mo</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Annual Taxes</label>
                  <div className="flex items-center">
                    <span className="text-white/40 mr-1">$</span>
                    <input
                      type="text"
                      value={formData.annualTaxes}
                      onChange={(e) => updateField("annualTaxes", formatCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full bg-transparent text-lg font-bold text-white focus:outline-none"
                      data-testid="input-refi-annual-taxes"
                    />
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Annual Insurance</label>
                  <div className="flex items-center">
                    <span className="text-white/40 mr-1">$</span>
                    <input
                      type="text"
                      value={formData.annualInsurance}
                      onChange={(e) => updateField("annualInsurance", formatCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full bg-transparent text-lg font-bold text-white focus:outline-none"
                      data-testid="input-refi-annual-insurance"
                    />
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Annual HOA</label>
                  <div className="flex items-center">
                    <span className="text-white/40 mr-1">$</span>
                    <input
                      type="text"
                      value={formData.annualHoa}
                      onChange={(e) => updateField("annualHoa", formatCurrency(e.target.value))}
                      placeholder="0"
                      className="w-full bg-transparent text-lg font-bold text-white focus:outline-none"
                      data-testid="input-refi-annual-hoa"
                    />
                  </div>
                  <span className="text-white/30 text-xs">Optional</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "fixflip-financials":
        return (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                Deal Financials
              </h2>
              <p className="text-white/60 text-sm">Tell us about your fix & flip project</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Purchase Price</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.purchasePrice}
                    onChange={(e) => updateField("purchasePrice", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-fixflip-purchase-price"
                  />
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Renovation Budget</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.rehabBudget}
                    onChange={(e) => updateField("rehabBudget", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-fixflip-rehab-budget"
                  />
                </div>
                <p className="text-white/40 text-xs mt-2">Estimated cost for renovations</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">After Repair Value (ARV)</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.afterRepairValue}
                    onChange={(e) => updateField("afterRepairValue", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-fixflip-arv"
                  />
                </div>
                <p className="text-white/40 text-xs mt-2">Expected property value after renovations</p>
              </div>
              {formData.purchasePrice && formData.rehabBudget && formData.afterRepairValue && (
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total Investment</span>
                    <span className="text-white font-medium">
                      ${formatCurrency((parseFloat(formData.purchasePrice.replace(/,/g, "")) + parseFloat(formData.rehabBudget.replace(/,/g, ""))).toString())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-white/60">Potential Profit</span>
                    <span className="text-primary font-bold">
                      ${formatCurrency((parseFloat(formData.afterRepairValue.replace(/,/g, "")) - parseFloat(formData.purchasePrice.replace(/,/g, "")) - parseFloat(formData.rehabBudget.replace(/,/g, ""))).toString())}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "construction-financials":
        return (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                Project Financials
              </h2>
              <p className="text-white/60 text-sm">Tell us about your new construction project</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Land/Lot Cost</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.purchasePrice}
                    onChange={(e) => updateField("purchasePrice", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-construction-land-cost"
                  />
                </div>
                <p className="text-white/40 text-xs mt-2">Purchase price of the land</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Construction Budget</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.rehabBudget}
                    onChange={(e) => updateField("rehabBudget", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-construction-budget"
                  />
                </div>
                <p className="text-white/40 text-xs mt-2">Total construction costs</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/50 text-xs uppercase tracking-wide block mb-2">Estimated Completed Value</label>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-white/40 mr-2" />
                  <input
                    type="text"
                    value={formData.afterRepairValue}
                    onChange={(e) => updateField("afterRepairValue", formatCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                    data-testid="input-construction-completed-value"
                  />
                </div>
                <p className="text-white/40 text-xs mt-2">Expected value when complete</p>
              </div>
              {formData.purchasePrice && formData.rehabBudget && formData.afterRepairValue && (
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total Project Cost</span>
                    <span className="text-white font-medium">
                      ${formatCurrency((parseFloat(formData.purchasePrice.replace(/,/g, "")) + parseFloat(formData.rehabBudget.replace(/,/g, ""))).toString())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-white/60">Potential Profit</span>
                    <span className="text-primary font-bold">
                      ${formatCurrency((parseFloat(formData.afterRepairValue.replace(/,/g, "")) - parseFloat(formData.purchasePrice.replace(/,/g, "")) - parseFloat(formData.rehabBudget.replace(/,/g, ""))).toString())}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              <TypewriterText text={currentQuestion.prompt} />
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {experienceLevels.map((level) => {
                const isSelected = formData.experience === level.id;
                const IconComponent = level.icon === "seedling" ? Sprout 
                  : level.icon === "trending" ? TrendingUp 
                  : level.icon === "award" ? Award 
                  : Rocket;
                return (
                  <motion.button
                    key={level.id}
                    onClick={() => updateField("experience", level.id)}
                    className={`
                      p-4 rounded-xl border-2 transition-all
                      ${isSelected 
                        ? "border-primary bg-primary/20" 
                        : "border-white/10 bg-white/5 hover:border-white/30"}
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    data-testid={`option-experience-${level.id}`}
                  >
                    <IconComponent className={`w-8 h-8 mx-auto mb-2 ${isSelected ? "text-primary" : "text-white/60"}`} />
                    <span className="text-sm text-white font-medium">{level.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-8 text-center max-w-md mx-auto">
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                <TypewriterText text={currentQuestion.prompt} />
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    placeholder="First name"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-all text-lg"
                    data-testid="input-firstName"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    placeholder="Last name"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-all text-lg"
                    data-testid="input-lastName"
                  />
                </div>
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-all text-lg"
                  data-testid="input-email"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Phone number"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-all text-lg"
                  data-testid="input-phone"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">Application Received!</h1>
          <p className="text-white/70 text-lg mb-8">
            We'll review your information and reach out within 24 hours with your custom quote.
          </p>
          <Link href="/">
            <Button size="lg" className="text-lg px-8" data-testid="button-back-home">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" data-testid="link-logo-home">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={logoIcon} alt="Sequel Investments" className="h-8 w-8 sm:h-10 sm:w-10 object-contain brightness-0 invert" />
              <span className="font-bold text-base sm:text-xl text-white hidden sm:inline">Sequel Investments</span>
            </div>
          </Link>
          <Link href="/" data-testid="link-close">
            <Button variant="ghost" className="text-white/70 hover:text-white h-8 sm:h-9 text-sm">
              Close
            </Button>
          </Link>
        </div>
        
        {/* Pipeline Iconography */}
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {pipelineSteps.map((step, index) => {
              const Icon = step.icon;
              const currentStep = getCurrentPipelineStep();
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all
                        ${isCompleted ? "bg-primary text-white" : isActive ? "bg-primary/20 border-2 border-primary text-primary" : "bg-white/10 text-white/40"}
                      `}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </motion.div>
                    <span className={`text-xs mt-1 hidden sm:block ${isActive ? "text-primary font-medium" : isCompleted ? "text-white/70" : "text-white/40"}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < pipelineSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-primary" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="max-w-md mx-auto px-6 pb-4">
          <FluidProgressBar progress={progress} />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion?.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full"
            >
              {renderQuestion()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className="text-white/70 hover:text-white disabled:opacity-30"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <AnimatePresence mode="wait">
            {canContinue() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={createLeadMutation.isPending}
                    className="text-lg px-8 shadow-lg shadow-primary/30"
                    data-testid="button-continue"
                  >
                    {currentQuestionIndex === filteredQuestions.length - 1 ? (
                      <>
                        {createLeadMutation.isPending ? "Submitting..." : "Get My Quote"}
                        <Send className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </footer>
    </div>
  );
}
