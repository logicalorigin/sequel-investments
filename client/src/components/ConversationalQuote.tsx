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
  Rocket
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
}

interface Question {
  id: string;
  type: "loan-type" | "sentence-input" | "address" | "experience" | "contact";
  prompt: string;
  field?: keyof FormData;
  showFor?: LoanType[];
}

const questions: Question[] = [
  {
    id: "loan-type",
    type: "loan-type",
    prompt: "What type of investment are you financing?",
  },
  {
    id: "loan-amount",
    type: "sentence-input",
    prompt: "I'm looking to borrow around",
    field: "loanAmount",
  },
  {
    id: "property-address",
    type: "address",
    prompt: "Where is the property located?",
    field: "propertyAddress",
  },
  {
    id: "purchase-price",
    type: "sentence-input",
    prompt: "The purchase price is",
    field: "purchasePrice",
  },
  {
    id: "rehab-budget",
    type: "sentence-input",
    prompt: "My renovation budget is",
    field: "rehabBudget",
    showFor: ["fix-flip", "construction"],
  },
  {
    id: "arv",
    type: "sentence-input",
    prompt: "After repairs, I expect it to be worth",
    field: "afterRepairValue",
    showFor: ["fix-flip", "construction"],
  },
  {
    id: "monthly-rent",
    type: "sentence-input",
    prompt: "The expected monthly rent is",
    field: "monthlyRent",
    showFor: ["dscr"],
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
    description: "Long-term rental financing",
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

  const filteredQuestions = questions.filter(q => {
    if (!q.showFor) return true;
    return q.showFor.includes(formData.loanType);
  });

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
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const canContinue = () => {
    if (!currentQuestion) return false;
    
    switch (currentQuestion.id) {
      case "loan-type":
        return !!formData.loanType;
      case "loan-amount":
        return !!formData.loanAmount;
      case "property-address":
        return !!formData.propertyAddress || !!formData.propertyCity;
      case "purchase-price":
        return !!formData.purchasePrice;
      case "rehab-budget":
        return !!formData.rehabBudget;
      case "arv":
        return !!formData.afterRepairValue;
      case "monthly-rent":
        return !!formData.monthlyRent;
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

    setFormData(prev => ({
      ...prev,
      propertyAddress: streetAddress,
      propertyCity: city,
      propertyState: state,
      propertyZip: zip,
    }));
  };

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
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight flex flex-wrap items-center justify-center gap-3">
              <TypewriterText text={currentQuestion.prompt} />
              <AliveInput
                value={formData[currentQuestion.field as keyof FormData] || ""}
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
