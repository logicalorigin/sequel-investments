import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { PortalHeader } from "@/components/PortalHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileText,
} from "lucide-react";

type StaffMember = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  profileImageUrl: string | null;
  staffRole: string | null;
  role: string;
};

type TimeSlot = {
  time: string;
  available: boolean;
};

export default function BookConsultationPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: staffMembers = [], isLoading: staffLoading } = useQuery<StaffMember[]>({
    queryKey: ["/api/staff/available"],
    enabled: isAuthenticated,
  });

  const { data: timeSlots = [], isLoading: slotsLoading, refetch: refetchSlots } = useQuery<TimeSlot[]>({
    queryKey: ["/api/staff", selectedStaff?.id, "slots", selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedStaff?.id || !selectedDate) return [];
      const response = await fetch(`/api/staff/${selectedStaff.id}/slots?date=${selectedDate.toISOString()}`);
      if (!response.ok) throw new Error("Failed to fetch slots");
      return response.json();
    },
    enabled: !!selectedStaff?.id && !!selectedDate,
  });

  const { data: applications = [] } = useQuery<any[]>({
    queryKey: ["/api/applications"],
    enabled: isAuthenticated,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Consultation Scheduled",
        description: "Your consultation has been booked successfully. You will receive a confirmation email.",
      });
      setLocation("/portal/appointments");
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book consultation. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    setLocation("/login");
    return null;
  }

  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setSelectedDate(undefined);
    setSelectedTime("");
    setStep(2);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
    if (date) {
      refetchSlots();
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedStaff || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    const [hours, minutes] = selectedTime.split(":");
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    createAppointmentMutation.mutate({
      staffUserId: selectedStaff.id,
      scheduledAt: scheduledAt.toISOString(),
      title: "Loan Consultation",
      description: notes || undefined,
      durationMinutes: 30,
      relatedApplicationId: selectedApplicationId || undefined,
      notes: notes || undefined,
    });
  };

  const getStaffDisplayName = (staff: StaffMember) => {
    if (staff.firstName && staff.lastName) {
      return `${staff.firstName} ${staff.lastName}`;
    }
    return staff.firstName || staff.email.split("@")[0];
  };

  const getStaffInitials = (staff: StaffMember) => {
    if (staff.firstName && staff.lastName) {
      return `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase();
    }
    return staff.email[0].toUpperCase();
  };

  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0 || date.getDay() === 6;
  };

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Book a Consultation
          </h1>
          <p className="text-muted-foreground">
            Schedule a meeting with one of our loan specialists
          </p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                data-testid={`step-indicator-${s}`}
              >
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 mx-2 rounded ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Select a Loan Officer
              </CardTitle>
              <CardDescription>
                Choose who you'd like to speak with
              </CardDescription>
            </CardHeader>
            <CardContent>
              {staffLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : staffMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No staff members available at this time
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {staffMembers.map((staff) => (
                    <Card
                      key={staff.id}
                      className="cursor-pointer transition-all hover-elevate"
                      onClick={() => handleStaffSelect(staff)}
                      data-testid={`staff-card-${staff.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={staff.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getStaffInitials(staff)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {getStaffDisplayName(staff)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {staff.staffRole || "Loan Officer"}
                            </p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {staff.role === "admin" ? "Senior Officer" : "Account Executive"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && selectedStaff && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Select Date & Time
                  </CardTitle>
                  <CardDescription>
                    Meeting with {getStaffDisplayName(selectedStaff)}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  data-testid="button-back-step1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium mb-4 block">Choose a Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={disablePastDates}
                    className="rounded-md border"
                    data-testid="calendar-date-picker"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-4 block">
                    Available Times {selectedDate && `for ${selectedDate.toLocaleDateString()}`}
                  </Label>
                  {!selectedDate ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Select a date to see available times
                    </div>
                  ) : slotsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No available times for this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          data-testid={`time-slot-${slot.time}`}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && selectedStaff && selectedDate && selectedTime && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Confirm Details
                  </CardTitle>
                  <CardDescription>
                    Review and confirm your consultation
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(2)}
                  data-testid="button-back-step2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedStaff.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getStaffInitials(selectedStaff)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {getStaffDisplayName(selectedStaff)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStaff.staffRole || "Loan Officer"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground" data-testid="text-selected-date">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground" data-testid="text-selected-time">
                      {selectedTime}
                    </p>
                  </div>
                </div>
              </div>

              {applications.length > 0 && (
                <div className="space-y-2">
                  <Label id="application-label">Link to Application (Optional)</Label>
                  <Select
                    value={selectedApplicationId}
                    onValueChange={setSelectedApplicationId}
                  >
                    <SelectTrigger 
                      data-testid="select-application"
                      aria-labelledby="application-label"
                    >
                      <SelectValue placeholder="Select an application to discuss" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific application</SelectItem>
                      {applications.map((app: any) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.propertyAddress || `Application #${app.id.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label id="consultation-notes-label">Notes or Questions (Optional)</Label>
                <Textarea
                  placeholder="Add any notes or specific questions you'd like to discuss..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  data-testid="input-notes"
                  aria-labelledby="consultation-notes-label"
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-testid="button-confirm-booking"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm Consultation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
