import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertLeadSchema, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface LeadFormProps {
  onSubmitSuccess?: () => void;
  defaultLoanType?: string;
  defaultLocation?: string;
  compact?: boolean;
}

export function LeadForm({ onSubmitSuccess, defaultLoanType, defaultLocation, compact = false }: LeadFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      loanType: (defaultLoanType as any) || "DSCR",
      propertyLocation: defaultLocation || "",
      message: "",
      howHeardAboutUs: "",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: InsertLead) => {
      const response = await apiRequest("POST", "/api/leads", data);
      return response;
    },
    onSuccess: () => {
      form.reset({
        name: "",
        email: "",
        phone: "",
        loanType: (defaultLoanType as any) || "DSCR",
        propertyLocation: "",
        message: "",
        howHeardAboutUs: "",
      });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        toast({
          title: "Thank you for your interest!",
          description: "A loan specialist will contact you within 24 hours.",
        });
      }
    },
    onError: (error: any) => {
      console.error("Error submitting lead:", error);
      
      let errorMessage = "Failed to submit form. Please try again.";
      
      if (error?.body?.message) {
        errorMessage = error.body.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      if (error?.body?.fieldErrors) {
        Object.entries(error.body.fieldErrors).forEach(([field, message]) => {
          form.setError(field as any, {
            type: "server",
            message: message as string,
          });
        });
        
        toast({
          title: "Validation Error",
          description: "Please check the form for errors and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        form.setError("root", {
          message: errorMessage,
        });
      }
    },
  });

  const onSubmit = async (data: InsertLead) => {
    createLeadMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-label="Contact form" data-testid="form-lead-capture">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Smith" 
                  {...field} 
                  data-testid="input-lead-name"
                  aria-required="true"
                  aria-invalid={!!fieldState.error}
                  aria-describedby={fieldState.error ? "name-error" : undefined}
                />
              </FormControl>
              <FormMessage id="name-error" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                    data-testid="input-lead-email"
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "email-error" : undefined}
                  />
                </FormControl>
                <FormMessage id="email-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...field}
                    data-testid="input-lead-phone"
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "phone-error" : undefined}
                  />
                </FormControl>
                <FormMessage id="phone-error" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="loanType"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Loan Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger 
                    data-testid="select-lead-loantype"
                    aria-required="true"
                    aria-invalid={!!fieldState.error}
                    aria-describedby={fieldState.error ? "loantype-error" : undefined}
                  >
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DSCR">DSCR Loan</SelectItem>
                  <SelectItem value="Fix & Flip">Fix & Flip Loan</SelectItem>
                  <SelectItem value="New Construction">New Construction Loan</SelectItem>
                  <SelectItem value="Hard Money">Hard Money (Other)</SelectItem>
                  <SelectItem value="Both">Multiple Loan Types</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage id="loantype-error" />
            </FormItem>
          )}
        />

        {!compact && (
          <>
            <FormField
              control={form.control}
              name="propertyLocation"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Property Location (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="City, State"
                      {...field}
                      data-testid="input-lead-location"
                      aria-describedby={fieldState.error ? "location-error" : undefined}
                    />
                  </FormControl>
                  <FormMessage id="location-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your investment goals..."
                      className="resize-none min-h-24"
                      {...field}
                      data-testid="textarea-lead-message"
                      aria-describedby={fieldState.error ? "message-error" : undefined}
                    />
                  </FormControl>
                  <FormMessage id="message-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="howHeardAboutUs"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>How did you hear about us? (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger 
                        data-testid="select-lead-source"
                        aria-describedby={fieldState.error ? "source-error" : undefined}
                      >
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Google Search">Google Search</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Advertisement">Advertisement</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage id="source-error" />
                </FormItem>
              )}
            />
          </>
        )}

        {form.formState.errors.root && (
          <div className="text-sm text-destructive" role="alert" aria-live="polite" data-testid="text-form-error">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          size="lg" 
          disabled={createLeadMutation.isPending}
          data-testid="button-lead-submit"
          aria-label="Submit contact form"
        >
          {createLeadMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Submitting...</span>
            </>
          ) : (
            "Connect with a Loan Specialist"
          )}
        </Button>
      </form>
    </Form>
  );
}
