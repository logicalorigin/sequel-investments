export const smsTemplates = {
  applicationSubmitted: () => 
    "Your Sequel Investments application has been submitted! We'll review it within 24-48 hours.",

  statusChange: (status: string) =>
    `Your loan application status changed to ${status}. Log in to view details.`,

  documentRequest: (portalUrl: string) =>
    `Action needed: Documents requested for your loan application. Upload now at ${portalUrl}`,

  drawApproved: (amount: number) =>
    `Good news! Your draw request for $${amount.toLocaleString()} has been approved.`,

  paymentReminder: (amount: number) =>
    `Reminder: Your loan payment of $${amount.toLocaleString()} is due in 3 days.`,

  approvalNotification: () =>
    "Congratulations! Your loan has been approved! Log in to review your term sheet.",

  appointmentBooked: (date: string, time: string) =>
    `Your consultation is confirmed for ${date} at ${time}. We look forward to speaking with you!`,

  appointmentReminder: (date: string, time: string) =>
    `Reminder: Your consultation is tomorrow, ${date} at ${time}. See you then!`,

  appointmentCancelled: () =>
    "Your scheduled consultation has been cancelled. Book a new time in your portal.",
};

export type SmsTemplateType = keyof typeof smsTemplates;
