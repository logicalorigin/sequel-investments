import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import type { LeadFormSectionConfig } from "@shared/schema";

const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal("")),
  loanType: z.string().min(1, "Please select a loan type"),
  propertyValue: z.string().optional(),
  message: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormSectionProps {
  config: LeadFormSectionConfig;
}

export function LeadFormSection({ config }: LeadFormSectionProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      loanType: "DSCR",
      propertyValue: "",
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: LeadFormValues) => {
      return apiRequest("POST", "/api/leads", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "We'll be in touch within 24 hours.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormValues) => {
    submitMutation.mutate(data);
  };

  const title = config.title || "Get Your Free Quote";
  const description = config.description || "Fill out the form below and we'll get back to you within 24 hours.";
  const ctaText = config.ctaText || "Submit";

  if (submitted) {
    return (
      <section 
        className="py-12 sm:py-20"
        style={config.backgroundColor ? { backgroundColor: config.backgroundColor } : undefined}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2" data-testid="text-form-success">Thank You!</h3>
              <p className="text-muted-foreground">
                We've received your information and will be in touch within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="py-12 sm:py-20"
      style={config.backgroundColor ? { backgroundColor: config.backgroundColor } : undefined}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl" data-testid="text-lead-form-title">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Smith"
                            data-testid="input-lead-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="john@example.com"
                            data-testid="input-lead-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {config.showPhone !== false && (
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="(555) 123-4567"
                            data-testid="input-lead-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="loanType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-lead-loan-type">
                            <SelectValue placeholder="Select loan type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DSCR">DSCR Loan</SelectItem>
                          <SelectItem value="Fix & Flip">Fix & Flip</SelectItem>
                          <SelectItem value="New Construction">New Construction</SelectItem>
                          <SelectItem value="Hard Money">Hard Money</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {config.showLoanAmount && (
                  <FormField
                    control={form.control}
                    name="propertyValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Property Value</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="$500,000"
                            data-testid="input-lead-property-value"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {config.showPropertyType && (
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Details</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Tell us about your project..."
                            data-testid="input-lead-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={submitMutation.isPending}
                  data-testid="button-lead-submit"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    ctaText
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
