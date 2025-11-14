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
  compact?: boolean;
}

export function LeadForm({ onSubmitSuccess, defaultLoanType, compact = false }: LeadFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      loanType: (defaultLoanType as any) || "DSCR",
      propertyLocation: "",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Smith" {...field} data-testid="input-lead-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                    data-testid="input-lead-email"
                  />
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
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...field}
                    data-testid="input-lead-phone"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="loanType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-lead-loantype">
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DSCR">DSCR Loan</SelectItem>
                  <SelectItem value="Hard Money">Hard Money Loan</SelectItem>
                  <SelectItem value="Both">Both Options</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!compact && (
          <>
            <FormField
              control={form.control}
              name="propertyLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Location (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="City, State"
                      {...field}
                      data-testid="input-lead-location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your investment goals..."
                      className="resize-none min-h-24"
                      {...field}
                      data-testid="textarea-lead-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="howHeardAboutUs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How did you hear about us? (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-lead-source">
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {form.formState.errors.root && (
          <div className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          size="lg" 
          disabled={createLeadMutation.isPending}
          data-testid="button-lead-submit"
        >
          {createLeadMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Connect with a Loan Specialist"
          )}
        </Button>
      </form>
    </Form>
  );
}
