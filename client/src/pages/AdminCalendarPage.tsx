import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Phone,
  Mail,
  X,
  GripVertical,
} from "lucide-react";
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import type { ConsultationType } from "@shared/schema";

type Appointment = {
  id: string;
  borrowerUserId: string;
  staffUserId: string;
  title: string;
  description: string | null;
  consultationType: ConsultationType | null;
  scheduledAt: string;
  durationMinutes: number;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  meetingUrl: string | null;
  relatedApplicationId: string | null;
  notes: string | null;
  createdAt: string;
  borrower?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
    phone: string | null;
  };
  staff?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    profileImageUrl: string | null;
    staffRole: string | null;
  };
};

const CONSULTATION_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  initial_call: { label: "Initial Call", color: "text-blue-700 dark:text-blue-300", bgColor: "bg-blue-500/20", borderColor: "border-l-blue-500" },
  follow_up: { label: "Follow-up", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-500/20", borderColor: "border-l-green-500" },
  loan_review: { label: "Loan Review", color: "text-purple-700 dark:text-purple-300", bgColor: "bg-purple-500/20", borderColor: "border-l-purple-500" },
  document_review: { label: "Document Review", color: "text-orange-700 dark:text-orange-300", bgColor: "bg-orange-500/20", borderColor: "border-l-orange-500" },
  closing: { label: "Closing", color: "text-teal-700 dark:text-teal-300", bgColor: "bg-teal-500/20", borderColor: "border-l-teal-500" },
  other: { label: "Other", color: "text-gray-700 dark:text-gray-300", bgColor: "bg-gray-500/20", borderColor: "border-l-gray-500" },
};

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

function getTimeFromHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour} ${period}`;
}

function DroppableTimeSlot({ dayIndex, hour, children }: { dayIndex: number; hour: number; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${dayIndex}-${hour}`,
    data: { dayIndex, hour },
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative h-12 border-t border-border/50 ${isOver ? "bg-primary/10" : ""}`}
      data-testid={`time-slot-${dayIndex}-${hour}`}
    >
      {children}
    </div>
  );
}

function DraggableEvent({ 
  appointment, 
  topOffset, 
  height, 
  onClick,
  getPersonDisplayName,
}: { 
  appointment: Appointment; 
  topOffset: number; 
  height: number;
  onClick: () => void;
  getPersonDisplayName: (p: any) => string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: appointment.id,
    data: { appointment },
  });

  const config = CONSULTATION_TYPE_CONFIG[appointment.consultationType || "other"];
  const scheduledTime = new Date(appointment.scheduledAt);
  const timeStr = scheduledTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={`absolute left-0 right-0 mx-0.5 rounded-md border-l-4 cursor-pointer transition-all ${config.bgColor} ${config.borderColor} ${isDragging ? "opacity-50 z-50" : "z-10"}`}
      style={{
        top: `${topOffset}px`,
        height: `${Math.max(height, 20)}px`,
      }}
      onClick={onClick}
      data-testid={`calendar-event-${appointment.id}`}
    >
      <div className="flex items-center gap-1 px-1.5 py-0.5 h-full overflow-hidden">
        <div {...listeners} className="cursor-grab shrink-0">
          <GripVertical className="h-3 w-3 text-muted-foreground/50" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-medium truncate ${config.color}`}>
            {timeStr} - {getPersonDisplayName(appointment.borrower)}
          </p>
          {height > 35 && (
            <p className="text-xs text-muted-foreground truncate">
              {config.label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCalendarPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const timeGridRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [selectedWeek, setSelectedWeek] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
  });
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [detailNotes, setDetailNotes] = useState("");
  const [detailStatus, setDetailStatus] = useState<string>("");
  const [detailConsultationType, setDetailConsultationType] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "staff"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment Updated",
        description: "The appointment has been updated successfully.",
      });
      setSelectedAppointment(null);
      setIsSaving(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update the appointment.",
        variant: "destructive",
      });
      setIsSaving(false);
    },
  });

  const filteredAppointments = useMemo(() => {
    if (filterType === "all") return appointments;
    return appointments.filter(a => a.consultationType === filterType);
  }, [appointments, filterType]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "staff")) {
    setLocation("/admin/login");
    return null;
  }

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedWeek);
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const getAppointmentsForDay = (date: Date) => {
    return filteredAppointments.filter((a) => {
      const appointmentDate = new Date(a.scheduledAt);
      return (
        appointmentDate.getFullYear() === date.getFullYear() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getDate() === date.getDate() &&
        a.status === "scheduled"
      );
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(selectedWeek.getDate() + (direction === "next" ? 7 : -7));
    setSelectedWeek(newWeek);
  };

  const goToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    setSelectedWeek(new Date(now.setDate(diff)));
  };

  const getPersonDisplayName = (person: { firstName: string | null; lastName: string | null; email: string } | undefined) => {
    if (!person) return "Unknown";
    if (person.firstName && person.lastName) {
      return `${person.firstName} ${person.lastName}`;
    }
    return person.firstName || person.email.split("@")[0];
  };

  const getInitials = (person: { firstName: string | null; lastName: string | null; email: string } | undefined) => {
    if (!person) return "??";
    if (person.firstName && person.lastName) {
      return `${person.firstName[0]}${person.lastName[0]}`.toUpperCase();
    }
    return person.email[0].toUpperCase();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const handleOpenDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailNotes(appointment.notes || "");
    setDetailStatus(appointment.status);
    setDetailConsultationType(appointment.consultationType || "other");
  };

  const handleSaveDetail = () => {
    if (!selectedAppointment) return;
    setIsSaving(true);
    updateMutation.mutate({
      id: selectedAppointment.id,
      updates: {
        notes: detailNotes,
        status: detailStatus,
        consultationType: detailConsultationType,
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedAppointment = appointments.find(a => a.id === active.id);
    if (!draggedAppointment) return;

    const slotData = over.data.current as { dayIndex: number; hour: number } | undefined;
    if (!slotData) return;

    const newDate = new Date(weekDays[slotData.dayIndex]);
    newDate.setHours(slotData.hour, 0, 0, 0);

    updateMutation.mutate({
      id: draggedAppointment.id,
      updates: {
        scheduledAt: newDate.toISOString(),
      },
    });
  };

  const getCurrentTimePosition = () => {
    const now = currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (hours < 6 || hours >= 22) return null;
    const offset = (hours - 6) * 48 + (minutes / 60) * 48;
    return offset;
  };

  const currentTimePosition = getCurrentTimePosition();
  const isTodayInWeek = weekDays.some(d => isToday(d));
  const todayIndex = weekDays.findIndex(d => isToday(d));

  const monthYear = weekDays[3].toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek("prev")}
              data-testid="button-prev-week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              data-testid="button-today"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateWeek("next")}
              data-testid="button-next-week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground" data-testid="text-month-year">
              {monthYear}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(CONSULTATION_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${config.bgColor.replace('/20', '')}`} />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(CONSULTATION_TYPE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <div className={`w-3 h-3 rounded ${config.bgColor} border-l-2 ${config.borderColor}`} />
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Card className="flex-1 mx-4 mb-4 overflow-hidden">
        <CardContent className="p-0 h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DndContext onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id as string)}>
              <div className="flex h-full">
                <div className="w-16 shrink-0 border-r">
                  <div className="h-14 border-b" />
                  <div ref={timeGridRef}>
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="h-12 border-t border-border/50 pr-2 flex items-start justify-end"
                      >
                        <span className="text-xs text-muted-foreground -mt-2">
                          {getTimeFromHour(hour)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                  <div className="grid grid-cols-7 min-w-[700px]">
                    {weekDays.map((day, dayIndex) => (
                      <div key={dayIndex} className="border-r last:border-r-0">
                        <div
                          className={`h-14 border-b flex flex-col items-center justify-center ${
                            isToday(day) ? "bg-primary/5" : ""
                          }`}
                        >
                          <span className="text-xs text-muted-foreground uppercase">
                            {day.toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                          <span
                            className={`text-lg font-semibold w-8 h-8 flex items-center justify-center rounded-full ${
                              isToday(day)
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {day.getDate()}
                          </span>
                        </div>

                        <div className="relative">
                          {HOURS.map((hour) => {
                            const dayAppointments = getAppointmentsForDay(day).filter(a => {
                              const appointmentHour = new Date(a.scheduledAt).getHours();
                              return appointmentHour === hour;
                            });

                            return (
                              <DroppableTimeSlot key={hour} dayIndex={dayIndex} hour={hour}>
                                {dayAppointments.map((appointment) => {
                                  const scheduledTime = new Date(appointment.scheduledAt);
                                  const minuteOffset = scheduledTime.getMinutes();
                                  const topOffset = (minuteOffset / 60) * 48;
                                  const height = (appointment.durationMinutes / 60) * 48;

                                  return (
                                    <Popover key={appointment.id}>
                                      <PopoverTrigger asChild>
                                        <div>
                                          <DraggableEvent
                                            appointment={appointment}
                                            topOffset={topOffset}
                                            height={height}
                                            onClick={() => handleOpenDetail(appointment)}
                                            getPersonDisplayName={getPersonDisplayName}
                                          />
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-80 p-0" align="start">
                                        <EventPopover
                                          appointment={appointment}
                                          getPersonDisplayName={getPersonDisplayName}
                                          getInitials={getInitials}
                                          onClose={() => setSelectedAppointment(null)}
                                          onEdit={() => handleOpenDetail(appointment)}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  );
                                })}
                              </DroppableTimeSlot>
                            );
                          })}

                          {isTodayInWeek && dayIndex === todayIndex && currentTimePosition !== null && (
                            <div
                              className="absolute left-0 right-0 z-20 pointer-events-none"
                              style={{ top: `${currentTimePosition}px` }}
                            >
                              <div className="relative">
                                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
                                <div className="h-0.5 bg-red-500" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DragOverlay>
                {activeId ? (
                  <div className="bg-primary/20 border border-primary rounded-md p-2 shadow-lg">
                    <span className="text-sm font-medium">
                      {appointments.find(a => a.id === activeId)?.title || "Moving..."}
                    </span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAppointment(null)}>
          <div className="bg-background rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-foreground">Edit Appointment</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedAppointment(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={selectedAppointment.borrower?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedAppointment.borrower)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {getPersonDisplayName(selectedAppointment.borrower)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.borrower?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(selectedAppointment.scheduledAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">
                    {new Date(selectedAppointment.scheduledAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium text-foreground">
                    {selectedAppointment.durationMinutes} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium text-foreground">
                    {getPersonDisplayName(selectedAppointment.staff)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Consultation Type</Label>
                  <Select value={detailConsultationType} onValueChange={setDetailConsultationType}>
                    <SelectTrigger data-testid="select-consultation-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONSULTATION_TYPE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={detailStatus} onValueChange={setDetailStatus}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={detailNotes}
                    onChange={(e) => setDetailNotes(e.target.value)}
                    placeholder="Add notes about this appointment..."
                    rows={4}
                    data-testid="input-detail-notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveDetail} disabled={isSaving} data-testid="button-save-detail">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventPopover({
  appointment,
  getPersonDisplayName,
  getInitials,
  onClose,
  onEdit,
}: {
  appointment: Appointment;
  getPersonDisplayName: (p: any) => string;
  getInitials: (p: any) => string;
  onClose: () => void;
  onEdit: () => void;
}) {
  const config = CONSULTATION_TYPE_CONFIG[appointment.consultationType || "other"];
  const scheduledTime = new Date(appointment.scheduledAt);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className={`w-1 h-12 rounded ${config.borderColor.replace('border-l-', 'bg-')}`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{appointment.title}</h4>
          <p className="text-sm text-muted-foreground">
            {scheduledTime.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <p className="text-sm text-muted-foreground">
            {scheduledTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} - {appointment.durationMinutes} min
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={appointment.borrower?.profileImageUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {getInitials(appointment.borrower)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {getPersonDisplayName(appointment.borrower)}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {appointment.borrower?.email}
          </p>
        </div>
      </div>

      <Badge variant="secondary" className={`${config.bgColor} ${config.color}`}>
        {config.label}
      </Badge>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {appointment.meetingUrl && (
          <a
            href={appointment.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <Video className="h-3.5 w-3.5" />
            Join Meeting
          </a>
        )}
        {appointment.borrower?.phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {appointment.borrower.phone}
          </span>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t">
        <Button size="sm" onClick={onEdit} data-testid="button-edit-appointment">
          Edit
        </Button>
      </div>
    </div>
  );
}
