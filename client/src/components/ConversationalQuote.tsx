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
  Loader2,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import logoIcon from "@assets/generated_images/sequel_investments_s_logo_icon.png";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { CurrencySliderInput, PercentageSlider } from "@/components/AnimatedSlider";
import { Map, Marker } from "@vis.gl/react-google-maps";

// US Metro fallback locations for when geolocation fails
const US_METROS = [
  { lat: 40.7128, lng: -74.0060, name: "New York" },
  { lat: 34.0522, lng: -118.2437, name: "Los Angeles" },
  { lat: 41.8781, lng: -87.6298, name: "Chicago" },
  { lat: 29.7604, lng: -95.3698, name: "Houston" },
  { lat: 33.4484, lng: -112.0740, name: "Phoenix" },
  { lat: 29.4241, lng: -98.4936, name: "San Antonio" },
  { lat: 32.7767, lng: -96.7970, name: "Dallas" },
  { lat: 37.7749, lng: -122.4194, name: "San Francisco" },
  { lat: 47.6062, lng: -122.3321, name: "Seattle" },
  { lat: 39.7392, lng: -104.9903, name: "Denver" },
  { lat: 25.7617, lng: -80.1918, name: "Miami" },
  { lat: 33.7490, lng: -84.3880, name: "Atlanta" },
];

// Get a random US metro location
const getRandomMetro = () => US_METROS[Math.floor(Math.random() * US_METROS.length)];

// Dark theme map styles
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#64779e" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#023e58" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
  { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3C7680" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#b0d5ce" }] },
  { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#023e58" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "transit", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "transit.line", elementType: "geometry.fill", stylers: [{ color: "#283d6a" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#3a4762" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] },
];

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
  propertyLat: number | null;
  propertyLng: number | null;
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
  // Borrower profile fields
  entityType: string;
  creditRange: string;
  liquidReserves: string;
  yearsInvesting: string;
  citizenship: string;
}

interface Question {
  id: string;
  type: "loan-type" | "sentence-input" | "address" | "experience" | "contact" | "transaction-type" | "dscr-purchase-financials" | "dscr-refinance-financials" | "property-details" | "fixflip-financials" | "construction-financials" | "dscr-property-transaction";
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
  // DSCR: Combined property details + transaction type + financials (all in one step)
  {
    id: "dscr-property-transaction",
    type: "dscr-property-transaction",
    prompt: "Property Details",
    showFor: ["dscr"],
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
    propertyLat: null,
    propertyLng: null,
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
    // Borrower profile fields
    entityType: "",
    creditRange: "",
    liquidReserves: "",
    yearsInvesting: "",
    citizenship: "",
  });
  const [isLoadingPropertyDetails, setIsLoadingPropertyDetails] = useState(false);
  
  // Map state for geolocation
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(() => getRandomMetro());
  const [mapZoom, setMapZoom] = useState(10); // Default zoom for city view
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(true);

  // Initialize user location on mount
  useEffect(() => {
    const initializeLocation = async () => {
      setIsGeolocationLoading(true);
      
      // Try browser geolocation first
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 300000 // Cache for 5 minutes
            });
          });
          
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setMapZoom(11);
          setIsGeolocationLoading(false);
          return;
        } catch (error) {
          console.log("Browser geolocation failed, trying IP-based fallback");
        }
      }
      
      // Try IP-based geolocation as fallback
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.latitude && data.longitude) {
            setMapCenter({
              lat: data.latitude,
              lng: data.longitude
            });
            setMapZoom(11);
            setIsGeolocationLoading(false);
            return;
          }
        }
      } catch (error) {
        console.log("IP geolocation failed, using random metro fallback");
      }
      
      // Final fallback: random US metro
      const metro = getRandomMetro();
      setMapCenter({ lat: metro.lat, lng: metro.lng });
      setMapZoom(10);
      setIsGeolocationLoading(false);
    };
    
    initializeLocation();
  }, []);

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

  useEffect(() => {
    if (formData.transactionType === "refinance") {
      const propValue = parseFloat(formData.propertyValue.replace(/,/g, "")) || 0;
      const loanBalance = parseFloat(formData.currentLoanBalance.replace(/,/g, "")) || 0;
      
      // Clamp loan balance if it exceeds property value
      if (propValue > 0 && loanBalance > propValue) {
        setFormData(prev => ({ ...prev, currentLoanBalance: propValue.toLocaleString("en-US") }));
        return; // Exit early - this will re-trigger the effect with updated balance
      }
      
      const rawMaxCashOut = (propValue * 0.75) - loanBalance;
      const step = rawMaxCashOut >= 50000 ? 10000 : 5000;
      const effectiveMax = Math.max(0, Math.floor(rawMaxCashOut / step) * step);
      const currentCashOut = parseFloat(formData.desiredCashOut.replace(/,/g, "")) || 0;
      
      if (effectiveMax < 10000) {
        if (currentCashOut > 0) {
          setFormData(prev => ({ ...prev, desiredCashOut: "0" }));
        }
      } else {
        const snappedValue = Math.floor(currentCashOut / step) * step;
        const clampedValue = Math.min(snappedValue, effectiveMax);
        
        if (clampedValue !== currentCashOut && currentCashOut > 0) {
          setFormData(prev => ({ ...prev, desiredCashOut: formatCurrency(clampedValue.toString()) }));
        }
      }
    }
  }, [formData.propertyValue, formData.currentLoanBalance, formData.transactionType, formData.desiredCashOut]);

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
    if (["property-address", "property-details", "dscr-property-transaction"].includes(questionId)) return 1;
    if (["dscr-purchase-financials", "dscr-refinance-financials", "fixflip-financials", "construction-financials"].includes(questionId)) return 2;
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
          loanType: value as LoanType,
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
          propertyLat: null,
          propertyLng: null,
          // Keep borrower profile fields (don't reset them)
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
      case "dscr-property-transaction":
        // Must select transaction type AND fill in core financials
        if (!formData.transactionType) return false;
        if (formData.transactionType === "purchase") {
          return !!formData.purchasePrice && !!formData.monthlyRent;
        } else {
          return !!formData.propertyValue && !!formData.currentLoanBalance && !!formData.monthlyRent;
        }
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
      creditScore: formData.creditRange || "700",
      entityType: formData.entityType,
    });
  };

  const handleAddressSelect = (place: any) => {
    let city = "";
    let state = "";
    let zip = "";
    let streetAddress = place.formatted_address || "";
    let lat: number | null = null;
    let lng: number | null = null;

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

    // Extract coordinates from place geometry
    if (place.geometry?.location) {
      lat = typeof place.geometry.location.lat === 'function' 
        ? place.geometry.location.lat() 
        : place.geometry.location.lat;
      lng = typeof place.geometry.location.lng === 'function' 
        ? place.geometry.location.lng() 
        : place.geometry.location.lng;
    }

    // Update map center to fly to property location
    if (lat !== null && lng !== null) {
      setMapCenter({ lat, lng });
      setMapZoom(17); // Close zoom for verified property
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
        propertyLat: lat,
        propertyLng: lng,
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
          <div className="space-y-4 sm:space-y-8">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white text-center leading-tight">
              <TypewriterText text={currentQuestion.prompt} />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {loanProducts.map((product) => {
                const Icon = product.icon;
                const isSelected = formData.loanType === product.id;
                
                return (
                  <motion.button
                    key={product.id}
                    onClick={() => {
                      const isNewSelection = formData.loanType !== product.id;
                      
                      if (isNewSelection) {
                        // Only reset fields when actually changing loan type
                        setFormData(prev => ({
                          ...prev,
                          loanType: product.id as LoanType,
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
                          propertyAddress: "",
                          propertyCity: "",
                          propertyState: "",
                          propertyZip: "",
                          propertyLat: null,
                          propertyLng: null,
                        }));
                      }
                      
                      // Always advance to next step after selection
                      setTimeout(() => {
                        setDirection(1);
                        setCurrentQuestionIndex(1);
                      }, 300);
                    }}
                    className={`
                      relative p-4 sm:p-8 rounded-xl sm:rounded-2xl border-2 transition-all
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
                        className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </motion.div>
                    )}
                    <Icon className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 ${isSelected ? "text-primary" : "text-white/70"}`} />
                    <h3 className="text-base sm:text-xl font-bold text-white">{product.title}</h3>
                    <p className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-2">{product.description}</p>
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
        const hasVerifiedAddress = !!(formData.propertyAddress && formData.propertyCity && formData.propertyState);
        const hasMapCoordinates = formData.propertyLat !== null && formData.propertyLng !== null;
        return (
          <div className="relative w-full h-[calc(100vh-220px)] sm:h-[calc(100vh-280px)] -mt-3 sm:-mt-12 -mx-3 sm:-mx-12 rounded-xl overflow-hidden" style={{ width: 'calc(100% + 1.5rem)', marginLeft: '-0.75rem' }}>
            {/* Map Background - view only, no interaction, hide attributions */}
            <div className="absolute inset-0 pointer-events-none [&_.gm-style-cc]:!hidden [&_.gmnoprint]:!hidden [&_a[href*='google']]:!hidden [&_.gm-style>div:last-child]:!hidden">
              <Map
                id="address-verification-map"
                center={mapCenter}
                zoom={mapZoom}
                gestureHandling="none"
                disableDefaultUI={true}
                draggable={false}
                zoomControl={false}
                scrollwheel={false}
                disableDoubleClickZoom={true}
                styles={darkMapStyles}
                className="w-full h-full"
              />
              
              {/* Theme-colored marker with pop animation - Navigation icon */}
              {hasVerifiedAddress && hasMapCoordinates && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, y: -50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ 
                      type: "spring", 
                      damping: 10, 
                      stiffness: 200,
                      mass: 0.8
                    }}
                    className="relative"
                    style={{ marginTop: "-24px" }}
                  >
                    {/* Pulsing ring animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-500"
                      />
                    </div>
                    {/* Second pulse ring (delayed) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.6 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          ease: "easeOut",
                          delay: 0.5
                        }}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-400"
                      />
                    </div>
                    {/* Main marker with bounce - Navigation icon */}
                    <motion.div
                      animate={{ 
                        y: [0, -8, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 0.6,
                        delay: 0.3,
                        ease: "easeOut"
                      }}
                      className="relative"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/50 border-[3px] border-white">
                        <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
                      </div>
                      {/* Pin tail/pointer */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-amber-500" />
                      </div>
                    </motion.div>
                    {/* Ground shadow */}
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.3 }}
                      transition={{ delay: 0.4 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2"
                    >
                      <div className="w-6 h-2 bg-black/40 rounded-full blur-sm" />
                    </motion.div>
                  </motion.div>
                </div>
              )}
              
              {/* Loading indicator for geolocation */}
              {isGeolocationLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                  <div className="flex items-center gap-2 text-white/80">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Finding your location...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Floating Address Input Card */}
            <div className="absolute top-3 left-3 right-3 z-10">
              <div className="max-w-md mx-auto bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-xl">
                <div className="space-y-3">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">
                      Property Address
                    </label>
                    <AddressAutocomplete
                      value={formData.propertyAddress}
                      onChange={(val) => updateField("propertyAddress", val)}
                      onPlaceSelect={handleAddressSelect}
                      placeholder="Enter property address..."
                      className="w-full text-sm sm:text-base p-3.5 rounded-xl border border-white/20 bg-slate-800/80 text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none transition-all"
                      data-testid="input-property-address"
                    />
                  </div>
                  
                  {/* Verification Status - green for verified */}
                  <AnimatePresence mode="wait">
                    {hasVerifiedAddress && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-emerald-400 text-xs font-medium">Address Verified</p>
                              <p className="text-white/50 text-[10px] truncate">
                                {formData.propertyCity}, {formData.propertyState} {formData.propertyZip}
                              </p>
                            </div>
                          </div>
                          {isLoadingPropertyDetails && (
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          )}
                          {!isLoadingPropertyDetails && formData.propertyDetails?.estimatedValue && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-white/40 text-[10px]">Est. Value</p>
                              <p className="text-amber-400 font-bold text-sm">
                                ${parseInt(formData.propertyDetails.estimatedValue).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        );

      case "dscr-property-transaction":
        // Calculate values for purchase
        const dscrPurchasePrice = parseFloat(formData.purchasePrice.replace(/,/g, "")) || 0;
        const dscrDownPaymentPct = parseFloat(formData.downPaymentPercent) || 20;
        const dscrDownPaymentAmt = dscrPurchasePrice * dscrDownPaymentPct / 100;
        const dscrLoanAmt = dscrPurchasePrice - dscrDownPaymentAmt;
        
        // Calculate values for refinance
        const dscrRefiPropValue = parseFloat(formData.propertyValue.replace(/,/g, "")) || 0;
        const dscrRefiLoanBal = parseFloat(formData.currentLoanBalance.replace(/,/g, "")) || 0;
        const dscrRefiMaxLoan = dscrRefiPropValue * 0.75;
        const dscrRefiRawMaxCashOut = dscrRefiMaxLoan - dscrRefiLoanBal;
        const dscrRefiEquity = dscrRefiPropValue - dscrRefiLoanBal;
        const dscrCashOutStep = dscrRefiRawMaxCashOut >= 50000 ? 10000 : 5000;
        const dscrCashOutSliderMax = Math.max(0, Math.floor(dscrRefiRawMaxCashOut / dscrCashOutStep) * dscrCashOutStep);
        const dscrCashOutAvailable = dscrCashOutSliderMax >= 10000;
        
        return (
          <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto px-2 sm:px-0">
            <div className="text-center">
              <h2 className="text-lg sm:text-3xl font-bold text-white leading-tight mb-1">
                Property Details
              </h2>
              <p className="text-white/60 text-xs sm:text-sm">
                {formData.propertyAddress && (
                  <span className="flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{formData.propertyAddress}</span>
                  </span>
                )}
              </p>
            </div>
            
            {/* Purchase / Refinance Selection */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <motion.button
                onClick={() => updateField("transactionType", "purchase")}
                className={`
                  relative p-2 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all
                  bg-gradient-to-br from-blue-500/20 to-blue-600/20
                  ${formData.transactionType === "purchase" ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-white/10 hover:border-white/30"}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid="option-transaction-purchase"
              >
                {formData.transactionType === "purchase" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </motion.div>
                )}
                <Home className={`w-5 h-5 sm:w-7 sm:h-7 mx-auto mb-1 sm:mb-2 ${formData.transactionType === "purchase" ? "text-blue-500" : "text-white/70"}`} />
                <h3 className="text-xs sm:text-sm font-bold text-white">Purchase</h3>
              </motion.button>
              <motion.button
                onClick={() => updateField("transactionType", "refinance")}
                className={`
                  relative p-2 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all
                  bg-gradient-to-br from-emerald-500/20 to-green-600/20
                  ${formData.transactionType === "refinance" ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-white/10 hover:border-white/30"}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid="option-transaction-refinance"
              >
                {formData.transactionType === "refinance" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </motion.div>
                )}
                <RefreshCw className={`w-5 h-5 sm:w-7 sm:h-7 mx-auto mb-1 sm:mb-2 ${formData.transactionType === "refinance" ? "text-emerald-500" : "text-white/70"}`} />
                <h3 className="text-xs sm:text-sm font-bold text-white">Refinance</h3>
              </motion.button>
            </div>

            {/* Content area - shown after transaction type selected */}
            <AnimatePresence mode="wait">
              {formData.transactionType && (
                <motion.div
                  key={formData.transactionType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {isLoadingPropertyDetails ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-spin" />
                      <span className="ml-2 text-white/60 text-sm">Fetching details...</span>
                    </div>
                  ) : formData.transactionType === "purchase" ? (
                    <>
                      {/* PURCHASE FLOW - Integrated Financials */}
                      <CurrencySliderInput
                        value={formData.purchasePrice}
                        onChange={(val) => updateField("purchasePrice", val)}
                        min={50000}
                        max={3000000}
                        step={10000}
                        label="Purchase Price"
                        data-testid="input-dscr-purchase-price"
                      />
                      
                      <PercentageSlider
                        value={formData.downPaymentPercent}
                        onChange={(val) => updateField("downPaymentPercent", val)}
                        min={20}
                        max={50}
                        step={5}
                        label="Down Payment"
                        calculatedAmount={dscrDownPaymentAmt}
                        helperText="Minimum 20% required"
                        data-testid="input-down-payment"
                      />
                      
                      {dscrPurchasePrice > 0 && (
                        <motion.div 
                          className="bg-primary/10 rounded-lg p-2 sm:p-3 border border-primary/30"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-xs sm:text-sm">Est. Loan Amount</span>
                            <span className="text-sm sm:text-lg font-bold text-primary">
                              ${dscrLoanAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </motion.div>
                      )}
                      
                      <CurrencySliderInput
                        value={formData.monthlyRent}
                        onChange={(val) => updateField("monthlyRent", val)}
                        min={500}
                        max={15000}
                        step={100}
                        label="Expected Monthly Rent"
                        data-testid="input-dscr-monthly-rent"
                      />
                      
                      {/* Property Specs + Annual Costs in compact grid */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Beds</label>
                          <input type="text" value={formData.propertyDetails.beds} onChange={(e) => updatePropertyDetail("beds", e.target.value)} placeholder="--" className="w-full bg-transparent text-sm font-bold text-amber-400 text-center focus:outline-none" data-testid="input-beds" />
                        </div>
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Baths</label>
                          <input type="text" value={formData.propertyDetails.baths} onChange={(e) => updatePropertyDetail("baths", e.target.value)} placeholder="--" className="w-full bg-transparent text-sm font-bold text-amber-400 text-center focus:outline-none" data-testid="input-baths" />
                        </div>
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Sq Ft</label>
                          <input type="text" value={formData.propertyDetails.sqft} onChange={(e) => updatePropertyDetail("sqft", e.target.value)} placeholder="--" className="w-full bg-transparent text-sm font-bold text-amber-400 text-center focus:outline-none" data-testid="input-sqft" />
                        </div>
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Year</label>
                          <input type="text" value={formData.propertyDetails.yearBuilt} onChange={(e) => updatePropertyDetail("yearBuilt", e.target.value)} placeholder="--" className="w-full bg-transparent text-sm font-bold text-amber-400 text-center focus:outline-none" data-testid="input-yearBuilt" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Taxes/yr</label>
                          <div className="flex items-center"><span className="text-amber-400/60 mr-0.5 text-xs">$</span><input type="text" value={formData.annualTaxes} onChange={(e) => updateField("annualTaxes", formatCurrency(e.target.value))} placeholder="0" className="w-full bg-transparent text-sm font-bold text-amber-400 focus:outline-none" data-testid="input-annual-taxes" /></div>
                        </div>
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Ins/yr</label>
                          <div className="flex items-center"><span className="text-amber-400/60 mr-0.5 text-xs">$</span><input type="text" value={formData.annualInsurance} onChange={(e) => updateField("annualInsurance", formatCurrency(e.target.value))} placeholder="0" className="w-full bg-transparent text-sm font-bold text-amber-400 focus:outline-none" data-testid="input-annual-insurance" /></div>
                        </div>
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">HOA/yr</label>
                          <div className="flex items-center"><span className="text-amber-400/60 mr-0.5 text-xs">$</span><input type="text" value={formData.annualHoa} onChange={(e) => updateField("annualHoa", formatCurrency(e.target.value))} placeholder="0" className="w-full bg-transparent text-sm font-bold text-amber-400 focus:outline-none" data-testid="input-annual-hoa" /></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* REFINANCE FLOW - Integrated Financials */}
                      <CurrencySliderInput
                        value={formData.propertyValue}
                        onChange={(val) => updateField("propertyValue", val)}
                        min={100000}
                        max={5000000}
                        step={25000}
                        label="Property Value"
                        data-testid="input-property-value"
                      />
                      
                      <CurrencySliderInput
                        value={formData.currentLoanBalance}
                        onChange={(val) => {
                          const newBalance = parseFloat(val.replace(/,/g, "")) || 0;
                          const propVal = dscrRefiPropValue || 3000000;
                          if (newBalance <= propVal) {
                            updateField("currentLoanBalance", val);
                          } else {
                            updateField("currentLoanBalance", propVal.toLocaleString("en-US"));
                          }
                        }}
                        min={0}
                        max={Math.max(dscrRefiPropValue || 3000000, 100000)}
                        step={10000}
                        label="Current Loan Balance"
                        data-testid="input-current-loan-balance"
                      />
                      
                      {dscrRefiPropValue > 0 && dscrRefiLoanBal > 0 && (
                        <motion.div 
                          className={`rounded-lg p-2 sm:p-3 border ${dscrCashOutAvailable ? "bg-primary/10 border-primary/30" : "bg-red-500/10 border-red-500/30"}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-white/60">Current Equity</span>
                            <span className={`font-medium ${dscrRefiEquity >= 0 ? "text-white" : "text-red-400"}`}>
                              ${dscrRefiEquity.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm mt-1">
                            <span className="text-white/60">Max Cash Out</span>
                            <span className={`font-bold ${dscrCashOutAvailable ? "text-primary" : "text-red-400"}`}>
                              ${dscrCashOutSliderMax.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </motion.div>
                      )}
                      
                      {dscrCashOutAvailable ? (
                        <CurrencySliderInput
                          value={formData.desiredCashOut}
                          onChange={(val) => updateField("desiredCashOut", val)}
                          min={0}
                          max={dscrCashOutSliderMax}
                          step={dscrCashOutStep}
                          label="Desired Cash Out"
                          data-testid="input-desired-cash-out"
                        />
                      ) : (
                        <div className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10 opacity-50">
                          <label className="text-white/50 text-[9px] uppercase tracking-wide block mb-1">Desired Cash Out</label>
                          <div className="text-sm font-bold text-white/40">$0</div>
                          <p className="text-white/40 text-[9px]">Min $10k equity required</p>
                        </div>
                      )}
                      
                      <CurrencySliderInput
                        value={formData.monthlyRent}
                        onChange={(val) => updateField("monthlyRent", val)}
                        min={500}
                        max={15000}
                        step={100}
                        label="Current Monthly Rent"
                        data-testid="input-refi-monthly-rent"
                      />
                      
                      {/* Property Specs + Annual Costs in compact grid */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Beds</label>
                          <input type="text" value={formData.propertyDetails.beds} onChange={(e) => updatePropertyDetail("beds", e.target.value)} placeholder="--" className="w-full bg-transparent text-sm font-bold text-amber-400 text-center focus:outline-none" data-testid="input-refi-beds" />
                        </div>
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Baths</label>
                          <input type="text" value={formData.propertyDetails.baths} onChange={(e) => updatePropertyDetail("baths", e.target.value)} placeholder="--" className="w-full bg-transparent text-sm font-bold text-amber-400 text-center focus:outline-none" data-testid="input-refi-baths" />
                        </div>
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Sq Ft</label>
                          <input type="text" value={formData.propertyDetails.sqft} onChange={(e) => updatePropertyDetail("sqft", e.target.value)} placeholder="--" className="w-full bg-transparent text-sm font-bold text-amber-400 text-center focus:outline-none" data-testid="input-refi-sqft" />
                        </div>
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Year</label>
                          <input type="text" value={formData.propertyDetails.yearBuilt} onChange={(e) => updatePropertyDetail("yearBuilt", e.target.value)} placeholder="--" className="w-full bg-transparent text-sm font-bold text-amber-400 text-center focus:outline-none" data-testid="input-refi-yearBuilt" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Taxes/yr</label>
                          <div className="flex items-center"><span className="text-amber-400/60 mr-0.5 text-xs">$</span><input type="text" value={formData.annualTaxes} onChange={(e) => updateField("annualTaxes", formatCurrency(e.target.value))} placeholder="0" className="w-full bg-transparent text-sm font-bold text-amber-400 focus:outline-none" data-testid="input-refi-annual-taxes" /></div>
                        </div>
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">Ins/yr</label>
                          <div className="flex items-center"><span className="text-amber-400/60 mr-0.5 text-xs">$</span><input type="text" value={formData.annualInsurance} onChange={(e) => updateField("annualInsurance", formatCurrency(e.target.value))} placeholder="0" className="w-full bg-transparent text-sm font-bold text-amber-400 focus:outline-none" data-testid="input-refi-annual-insurance" /></div>
                        </div>
                        <div className="bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                          <label className="text-amber-500 text-[9px] uppercase tracking-wide block mb-1">HOA/yr</label>
                          <div className="flex items-center"><span className="text-amber-400/60 mr-0.5 text-xs">$</span><input type="text" value={formData.annualHoa} onChange={(e) => updateField("annualHoa", formatCurrency(e.target.value))} placeholder="0" className="w-full bg-transparent text-sm font-bold text-amber-400 focus:outline-none" data-testid="input-refi-annual-hoa" /></div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "fixflip-financials":
        const ffPurchase = parseFloat(formData.purchasePrice.replace(/,/g, "")) || 0;
        const ffRehab = parseFloat(formData.rehabBudget.replace(/,/g, "")) || 0;
        const ffArv = parseFloat(formData.afterRepairValue.replace(/,/g, "")) || 0;
        const ffTotalInvestment = ffPurchase + ffRehab;
        const ffPotentialProfit = ffArv - ffTotalInvestment;
        
        return (
          <div className="space-y-3 sm:space-y-5 max-w-2xl mx-auto px-2 sm:px-0">
            <div className="text-center">
              <h2 className="text-lg sm:text-3xl font-bold text-white leading-tight mb-1">
                Property & Deal Details
              </h2>
              <p className="text-white/60 text-xs sm:text-sm">
                {formData.propertyAddress && (
                  <span className="flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{formData.propertyAddress}</span>
                  </span>
                )}
              </p>
            </div>
            
            {isLoadingPropertyDetails ? (
              <div className="flex items-center justify-center py-4 sm:py-8">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin" />
                <span className="ml-2 sm:ml-3 text-white/60 text-sm">Fetching details...</span>
              </div>
            ) : (
              <>
                {/* Financial Sliders FIRST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <CurrencySliderInput
                    value={formData.purchasePrice}
                    onChange={(val) => updateField("purchasePrice", val)}
                    min={25000}
                    max={2000000}
                    step={5000}
                    label="Purchase Price"
                    data-testid="input-fixflip-purchase-price"
                  />
                  
                  <CurrencySliderInput
                    value={formData.rehabBudget}
                    onChange={(val) => updateField("rehabBudget", val)}
                    min={5000}
                    max={500000}
                    step={2500}
                    label="Rehab Budget"
                    data-testid="input-fixflip-rehab-budget"
                  />
                </div>
                
                <CurrencySliderInput
                  value={formData.afterRepairValue}
                  onChange={(val) => updateField("afterRepairValue", val)}
                  min={50000}
                  max={3000000}
                  step={10000}
                  label="After Repair Value (ARV)"
                  data-testid="input-fixflip-arv"
                />
                
                {/* 4-column Grid for Property Details */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-gray-900/90 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700">
                    <label className="text-amber-500 text-[9px] sm:text-[10px] uppercase tracking-wide block mb-1">Beds</label>
                    <input
                      type="text"
                      value={formData.propertyDetails.beds}
                      onChange={(e) => updatePropertyDetail("beds", e.target.value)}
                      placeholder="--"
                      className="w-full bg-transparent text-lg sm:text-2xl font-bold text-amber-400 text-center focus:outline-none"
                      data-testid="input-ff-beds"
                    />
                  </div>
                  <div className="bg-gray-900/90 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700">
                    <label className="text-amber-500 text-[9px] sm:text-[10px] uppercase tracking-wide block mb-1">Baths</label>
                    <input
                      type="text"
                      value={formData.propertyDetails.baths}
                      onChange={(e) => updatePropertyDetail("baths", e.target.value)}
                      placeholder="--"
                      className="w-full bg-transparent text-lg sm:text-2xl font-bold text-amber-400 text-center focus:outline-none"
                      data-testid="input-ff-baths"
                    />
                  </div>
                  <div className="bg-gray-900/90 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700">
                    <label className="text-amber-500 text-[9px] sm:text-[10px] uppercase tracking-wide block mb-1">Sq Ft</label>
                    <input
                      type="text"
                      value={formData.propertyDetails.sqft}
                      onChange={(e) => updatePropertyDetail("sqft", e.target.value)}
                      placeholder="--"
                      className="w-full bg-transparent text-lg sm:text-2xl font-bold text-amber-400 text-center focus:outline-none"
                      data-testid="input-ff-sqft"
                    />
                  </div>
                  <div className="bg-gray-900/90 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700">
                    <label className="text-amber-500 text-[9px] sm:text-[10px] uppercase tracking-wide block mb-1">Year</label>
                    <input
                      type="text"
                      value={formData.propertyDetails.yearBuilt}
                      onChange={(e) => updatePropertyDetail("yearBuilt", e.target.value)}
                      placeholder="--"
                      className="w-full bg-transparent text-lg sm:text-2xl font-bold text-amber-400 text-center focus:outline-none"
                      data-testid="input-ff-yearBuilt"
                    />
                  </div>
                </div>
                
                <p className="text-amber-400/60 text-[10px] sm:text-xs text-center">Auto-filled when available</p>
                
                {(ffPurchase > 0 || ffRehab > 0 || ffArv > 0) && (
                  <motion.div 
                    className="bg-primary/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-white/50 text-[10px] sm:text-xs block">Total Cost</span>
                        <motion.span 
                          className="text-white font-bold text-sm sm:text-lg"
                          key={ffTotalInvestment}
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                        >
                          ${(ffTotalInvestment / 1000).toFixed(0)}k
                        </motion.span>
                      </div>
                      <div>
                        <span className="text-white/50 text-[10px] sm:text-xs block">Profit</span>
                        <motion.span 
                          className={`font-bold text-sm sm:text-lg ${ffPotentialProfit >= 0 ? "text-primary" : "text-red-400"}`}
                          key={ffPotentialProfit}
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                        >
                          {ffPotentialProfit >= 0 ? "+" : ""}${(ffPotentialProfit / 1000).toFixed(0)}k
                        </motion.span>
                      </div>
                      <div>
                        <span className="text-white/50 text-[10px] sm:text-xs block">ROI</span>
                        <motion.span 
                          className={`font-bold text-sm sm:text-lg ${ffPotentialProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                          key={ffTotalInvestment > 0 ? ffPotentialProfit / ffTotalInvestment : 0}
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                        >
                          {ffTotalInvestment > 0 ? ((ffPotentialProfit / ffTotalInvestment) * 100).toFixed(0) : 0}%
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        );

      case "construction-financials":
        const cLand = parseFloat(formData.purchasePrice.replace(/,/g, "")) || 0;
        const cBuild = parseFloat(formData.rehabBudget.replace(/,/g, "")) || 0;
        const cCompleted = parseFloat(formData.afterRepairValue.replace(/,/g, "")) || 0;
        const cTotalCost = cLand + cBuild;
        const cPotentialProfit = cCompleted - cTotalCost;
        
        return (
          <div className="space-y-3 sm:space-y-5 max-w-2xl mx-auto px-2 sm:px-0">
            <div className="text-center">
              <h2 className="text-lg sm:text-3xl font-bold text-white leading-tight mb-1">
                Project Details
              </h2>
              <p className="text-white/60 text-xs sm:text-sm">
                {formData.propertyAddress && (
                  <span className="flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{formData.propertyAddress}</span>
                  </span>
                )}
              </p>
            </div>
            
            {/* Financial Sliders FIRST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <CurrencySliderInput
                value={formData.purchasePrice}
                onChange={(val) => updateField("purchasePrice", val)}
                min={10000}
                max={1000000}
                step={5000}
                label="Land/Lot Cost"
                data-testid="input-construction-land-cost"
              />
              
              <CurrencySliderInput
                value={formData.rehabBudget}
                onChange={(val) => updateField("rehabBudget", val)}
                min={50000}
                max={2000000}
                step={10000}
                label="Construction Budget"
                data-testid="input-construction-budget"
              />
            </div>
            
            <CurrencySliderInput
              value={formData.afterRepairValue}
              onChange={(val) => updateField("afterRepairValue", val)}
              min={100000}
              max={5000000}
              step={25000}
              label="Completed Value"
              data-testid="input-construction-completed-value"
            />
            
            {/* 4-column Grid for Project Specs */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-gray-900/90 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700">
                <label className="text-amber-500 text-[9px] sm:text-[10px] uppercase tracking-wide block mb-1">Lot Size</label>
                <div className="flex items-center justify-center">
                  <input
                    type="text"
                    value={formData.propertyDetails.sqft}
                    onChange={(e) => updatePropertyDetail("sqft", e.target.value)}
                    placeholder="--"
                    className="w-full bg-transparent text-lg sm:text-2xl font-bold text-amber-400 text-center focus:outline-none"
                    data-testid="input-nc-lot-size"
                  />
                </div>
              </div>
              <div className="bg-gray-900/90 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700">
                <label className="text-amber-500 text-[9px] sm:text-[10px] uppercase tracking-wide block mb-1">Beds</label>
                <input
                  type="text"
                  value={formData.propertyDetails.beds}
                  onChange={(e) => updatePropertyDetail("beds", e.target.value)}
                  placeholder="--"
                  className="w-full bg-transparent text-lg sm:text-2xl font-bold text-amber-400 text-center focus:outline-none"
                  data-testid="input-nc-beds"
                />
              </div>
              <div className="bg-gray-900/90 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700">
                <label className="text-amber-500 text-[9px] sm:text-[10px] uppercase tracking-wide block mb-1">Baths</label>
                <input
                  type="text"
                  value={formData.propertyDetails.baths}
                  onChange={(e) => updatePropertyDetail("baths", e.target.value)}
                  placeholder="--"
                  className="w-full bg-transparent text-lg sm:text-2xl font-bold text-amber-400 text-center focus:outline-none"
                  data-testid="input-nc-baths"
                />
              </div>
              <div className="bg-gray-900/90 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-700">
                <label className="text-amber-500 text-[9px] sm:text-[10px] uppercase tracking-wide block mb-1">Build SF</label>
                <input
                  type="text"
                  value={formData.propertyDetails.estimatedValue}
                  onChange={(e) => updatePropertyDetail("estimatedValue", e.target.value)}
                  placeholder="--"
                  className="w-full bg-transparent text-lg sm:text-2xl font-bold text-amber-400 text-center focus:outline-none"
                  data-testid="input-nc-build-sqft"
                />
              </div>
            </div>
            
            {(cLand > 0 || cBuild > 0 || cCompleted > 0) && (
              <motion.div 
                className="bg-primary/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-white/50 text-[10px] sm:text-xs block">Total Cost</span>
                    <motion.span 
                      className="text-white font-bold text-sm sm:text-lg"
                      key={cTotalCost}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      ${(cTotalCost / 1000).toFixed(0)}k
                    </motion.span>
                  </div>
                  <div>
                    <span className="text-white/50 text-[10px] sm:text-xs block">Profit</span>
                    <motion.span 
                      className={`font-bold text-sm sm:text-lg ${cPotentialProfit >= 0 ? "text-primary" : "text-red-400"}`}
                      key={cPotentialProfit}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      {cPotentialProfit >= 0 ? "+" : ""}${(cPotentialProfit / 1000).toFixed(0)}k
                    </motion.span>
                  </div>
                  <div>
                    <span className="text-white/50 text-[10px] sm:text-xs block">ROI</span>
                    <motion.span 
                      className={`font-bold text-sm sm:text-lg ${cPotentialProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                      key={cTotalCost > 0 ? cPotentialProfit / cTotalCost : 0}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      {cTotalCost > 0 ? ((cPotentialProfit / cTotalCost) * 100).toFixed(0) : 0}%
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case "experience":
        const entityTypes = [
          { id: "individual", label: "Individual" },
          { id: "llc", label: "LLC" },
          { id: "corp", label: "Corporation" },
          { id: "trust", label: "Trust" },
        ];
        
        // Credit score slider value (stored as string like "720")
        const creditScoreValue = parseInt(formData.creditRange?.replace(/[^0-9]/g, "") || "700");
        const getCreditLabel = (score: number) => {
          if (score >= 760) return "Excellent";
          if (score >= 720) return "Very Good";
          if (score >= 680) return "Good";
          if (score >= 640) return "Fair";
          return "Building";
        };
        const getCreditColor = (score: number) => {
          if (score >= 760) return "text-green-400";
          if (score >= 720) return "text-primary";
          if (score >= 680) return "text-yellow-400";
          if (score >= 640) return "text-orange-400";
          return "text-red-400";
        };
        
        return (
          <div className="space-y-4 sm:space-y-5 max-w-md mx-auto px-2 sm:px-0">
            <div className="text-center">
              <h2 className="text-lg sm:text-3xl font-bold text-white leading-tight mb-1">
                Tell Us About Yourself
              </h2>
              <p className="text-white/60 text-xs sm:text-sm">
                This helps us match you with the best loan options
              </p>
            </div>
            
            {/* Credit Score Slider - First and most prominent */}
            <div className="space-y-2 bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <label className="text-amber-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide block text-center">
                Credit Score
              </label>
              <div className="text-center">
                <motion.span 
                  className={`text-3xl sm:text-4xl font-bold ${getCreditColor(creditScoreValue)}`}
                  key={creditScoreValue}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  {creditScoreValue}
                </motion.span>
                <span className={`block text-xs sm:text-sm ${getCreditColor(creditScoreValue)} mt-0.5`}>
                  {getCreditLabel(creditScoreValue)}
                </span>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="580"
                  max="800"
                  step="10"
                  value={creditScoreValue}
                  onChange={(e) => updateField("creditRange", e.target.value)}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  data-testid="slider-credit-score"
                />
                <div className="flex justify-between text-[10px] sm:text-xs text-white/40 mt-1">
                  <span>580</span>
                  <span>800</span>
                </div>
              </div>
            </div>
            
            {/* Investment Experience - 2x2 grid */}
            <div className="space-y-2">
              <label className="text-amber-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide block">
                Investment Experience
              </label>
              <div className="grid grid-cols-2 gap-2">
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
                        p-2 sm:p-3 rounded-lg border transition-all flex items-center gap-2
                        ${isSelected 
                          ? "border-primary bg-primary/20" 
                          : "border-white/10 bg-white/5 hover:border-white/30"}
                      `}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`option-experience-${level.id}`}
                    >
                      <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${isSelected ? "text-primary" : "text-white/60"}`} />
                      <span className="text-xs sm:text-sm text-white font-medium text-left">{level.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            
            {/* Entity Type - 2x2 grid */}
            <div className="space-y-2">
              <label className="text-amber-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide block">
                Entity Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {entityTypes.map((entity) => {
                  const isSelected = formData.entityType === entity.id;
                  return (
                    <motion.button
                      key={entity.id}
                      onClick={() => updateField("entityType", entity.id)}
                      className={`
                        py-2.5 px-3 rounded-lg border transition-all text-xs sm:text-sm font-medium
                        ${isSelected 
                          ? "border-primary bg-primary/20 text-white" 
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"}
                      `}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`option-entity-${entity.id}`}
                    >
                      {entity.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-4 sm:space-y-8 text-center max-w-md mx-auto">
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </motion.div>
              <h2 className="text-lg sm:text-3xl font-bold text-white leading-tight">
                <TypewriterText text={currentQuestion.prompt} />
              </h2>
            </div>
            <div className="space-y-2 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    placeholder="First name"
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-all text-sm sm:text-lg"
                    data-testid="input-firstName"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    placeholder="Last name"
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-all text-sm sm:text-lg"
                    data-testid="input-lastName"
                  />
                </div>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-all text-sm sm:text-lg"
                  data-testid="input-email"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="Phone number"
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-primary focus:outline-none transition-all text-sm sm:text-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Application Received!</h1>
          <p className="text-white/70 text-sm sm:text-lg mb-4 sm:mb-6">
            Your borrower portal is ready. Track your application, upload documents, and communicate with our team.
          </p>
          
          {/* Portal CTA Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 rounded-xl border border-white/10 p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm sm:text-base">{formData.firstName} {formData.lastName}</p>
                <p className="text-white/50 text-xs sm:text-sm">{formData.email}</p>
              </div>
            </div>
            <Link href="/portal">
              <Button size="lg" className="w-full text-base sm:text-lg shadow-lg shadow-primary/30" data-testid="button-go-to-portal">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Go to My Portal
              </Button>
            </Link>
          </motion.div>
          
          <p className="text-white/50 text-xs sm:text-sm mb-3">
            We'll review your application and reach out within 24 hours.
          </p>
          
          <Link href="/">
            <Button variant="ghost" className="text-white/60 hover:text-white text-sm" data-testid="button-back-home">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
          <Link href="/" data-testid="link-logo-home">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="font-bold text-lg sm:text-2xl text-amber-500">SEQUEL</span>
            </div>
          </Link>
          <Link href="/" data-testid="link-close">
            <Button variant="ghost" className="text-white/70 hover:text-white h-7 sm:h-9 text-xs sm:text-sm px-2 sm:px-3">
              Close
            </Button>
          </Link>
        </div>
        
        {/* Pipeline Iconography - centered with clickable completed steps */}
        <div className="max-w-md mx-auto px-3 sm:px-4 py-1.5 sm:py-3">
          <div className="flex items-center justify-center">
            {pipelineSteps.map((step, index) => {
              const Icon = step.icon;
              const currentStep = getCurrentPipelineStep();
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isClickable = isCompleted;
              
              const handleStepClick = () => {
                if (isClickable) {
                  // Navigate to the first question of that pipeline step
                  const targetQuestionIndex = filteredQuestions.findIndex(q => {
                    if (index === 0) return q.id === "loan-type";
                    if (index === 1) return q.id === "property-address";
                    if (index === 2) return ["dscr-purchase-financials", "dscr-refinance-financials", "fixflip-financials", "construction-financials", "dscr-property-transaction"].includes(q.id);
                    if (index === 3) return q.id === "experience";
                    if (index === 4) return q.id === "contact";
                    return false;
                  });
                  if (targetQuestionIndex >= 0) {
                    setDirection(-1);
                    setCurrentQuestionIndex(targetQuestionIndex);
                  }
                }
              };
              
              return (
                <div key={step.id} className="flex items-center">
                  <motion.button
                    onClick={handleStepClick}
                    disabled={!isClickable}
                    className={`flex flex-col items-center ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                    whileHover={isClickable ? { scale: 1.1 } : undefined}
                    whileTap={isClickable ? { scale: 0.95 } : undefined}
                    data-testid={`pipeline-step-${step.id}`}
                  >
                    <motion.div
                      className={`
                        w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all
                        ${isCompleted ? "bg-primary text-white" : isActive ? "bg-primary/20 border-2 border-primary text-primary" : "bg-white/10 text-white/40"}
                      `}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3 h-3 sm:w-5 sm:h-5" />
                      ) : (
                        <Icon className="w-3 h-3 sm:w-5 sm:h-5" />
                      )}
                    </motion.div>
                    <span className={`text-xs mt-1 hidden sm:block ${isActive ? "text-primary font-medium" : isCompleted ? "text-white/70" : "text-white/40"}`}>
                      {step.label}
                    </span>
                  </motion.button>
                  {index < pipelineSteps.length - 1 && (
                    <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 ${isCompleted ? "bg-primary" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="max-w-md mx-auto px-4 sm:px-6 pb-2 sm:pb-4">
          <FluidProgressBar progress={progress} />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-3 sm:p-12 overflow-y-auto">
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

      <footer className="flex-shrink-0 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 sm:py-4 flex items-center justify-between">
          {/* Hide back button on first page, just show empty space */}
          {currentQuestionIndex > 0 ? (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white/70 hover:text-white"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

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
