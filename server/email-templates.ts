const BRAND_COLOR = "#D4A01D";
const DARK_BG = "#1a1a1a";
const CARD_BG = "#252525";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#a0a0a0";

function baseTemplate(content: string, unsubscribeUrl?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sequel Investments</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${DARK_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${DARK_BG};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${BRAND_COLOR}; letter-spacing: 2px;">
                SEQUEL INVESTMENTS
              </h1>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td style="background-color: ${CARD_BG}; border-radius: 12px; padding: 40px; border: 1px solid #333;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="margin: 0 0 10px; font-size: 13px; color: ${TEXT_SECONDARY};">
                Sequel Investments | 800 5th Avenue, Suite 4100, Miami Beach, FL 33139
              </p>
              <p style="margin: 0 0 10px; font-size: 13px; color: ${TEXT_SECONDARY};">
                <a href="tel:302-388-8860" style="color: ${TEXT_SECONDARY}; text-decoration: none;">302.388.8860</a>
                 | 
                <a href="mailto:josh@fundwithsequel.com" style="color: ${TEXT_SECONDARY}; text-decoration: none;">josh@fundwithsequel.com</a>
              </p>
              ${unsubscribeUrl ? `
              <p style="margin: 20px 0 0; font-size: 12px;">
                <a href="${unsubscribeUrl}" style="color: ${TEXT_SECONDARY}; text-decoration: underline;">Unsubscribe from emails</a>
              </p>
              ` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function button(text: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
      <tr>
        <td style="background-color: ${BRAND_COLOR}; border-radius: 8px;">
          <a href="${url}" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: ${DARK_BG}; text-decoration: none;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function statusBadge(status: string): string {
  const colors: Record<string, { bg: string; text: string }> = {
    submitted: { bg: "#3b82f6", text: "#ffffff" },
    in_review: { bg: "#f59e0b", text: "#000000" },
    approved: { bg: "#22c55e", text: "#000000" },
    funded: { bg: "#10b981", text: "#000000" },
    denied: { bg: "#ef4444", text: "#ffffff" },
  };
  const style = colors[status] || { bg: "#6b7280", text: "#ffffff" };
  const label = status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  
  return `<span style="display: inline-block; padding: 6px 14px; background-color: ${style.bg}; color: ${style.text}; border-radius: 4px; font-size: 13px; font-weight: 600; text-transform: uppercase;">${label}</span>`;
}

export const emailTemplates = {
  applicationSubmitted: (data: {
    borrowerName: string;
    loanType: string;
    propertyAddress?: string;
    applicationId: string;
    portalUrl: string;
  }) => {
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600;">
        Application Received
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.borrowerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        Thank you for submitting your <strong style="color: ${BRAND_COLOR};">${data.loanType}</strong> loan application${data.propertyAddress ? ` for <strong style="color: ${TEXT_PRIMARY};">${data.propertyAddress}</strong>` : ''}.
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        Our team will review your application and be in touch within 24-48 hours. You can track your application status anytime through your borrower portal.
      </p>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid ${BRAND_COLOR};">
        <p style="margin: 0 0 8px; font-size: 13px; color: ${TEXT_SECONDARY}; text-transform: uppercase; letter-spacing: 1px;">What's Next</p>
        <ul style="margin: 0; padding-left: 20px; color: ${TEXT_SECONDARY}; font-size: 15px; line-height: 1.8;">
          <li>Upload any required documents</li>
          <li>Our underwriting team will review your file</li>
          <li>Receive your term sheet for approval</li>
        </ul>
      </div>
      
      ${button("View Application", `${data.portalUrl}/portal/application/${data.applicationId}`)}
      
      <p style="margin: 25px 0 0; font-size: 14px; color: ${TEXT_SECONDARY};">
        Questions? Reply to this email or call us at <a href="tel:302-388-8860" style="color: ${BRAND_COLOR}; text-decoration: none;">302.388.8860</a>
      </p>
    `;
    
    return {
      subject: `Application Received - ${data.loanType} Loan`,
      html: baseTemplate(content),
      text: `Hello ${data.borrowerName}, Thank you for submitting your ${data.loanType} loan application. Our team will review and be in touch within 24-48 hours. View your application at: ${data.portalUrl}/portal/application/${data.applicationId}`
    };
  },

  statusChange: (data: {
    borrowerName: string;
    loanType: string;
    propertyAddress?: string;
    applicationId: string;
    previousStatus: string;
    newStatus: string;
    portalUrl: string;
    message?: string;
  }) => {
    const statusMessages: Record<string, string> = {
      in_review: "Your application is now under review by our underwriting team.",
      approved: "Congratulations! Your loan has been approved. Check your portal for next steps.",
      funded: "Your loan has been funded! Thank you for choosing Sequel Investments.",
      denied: "After careful review, we're unable to proceed with your application at this time.",
    };
    
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600;">
        Application Status Update
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.borrowerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        Your <strong style="color: ${BRAND_COLOR};">${data.loanType}</strong> loan application${data.propertyAddress ? ` for ${data.propertyAddress}` : ''} has been updated.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 10px; font-size: 13px; color: ${TEXT_SECONDARY}; text-transform: uppercase; letter-spacing: 1px;">New Status</p>
        ${statusBadge(data.newStatus)}
      </div>
      
      <p style="margin: 20px 0; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        ${data.message || statusMessages[data.newStatus] || "Your application status has been updated."}
      </p>
      
      ${button("View Application Details", `${data.portalUrl}/portal/application/${data.applicationId}`)}
    `;
    
    const statusLabel = data.newStatus.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return {
      subject: `Application Status: ${statusLabel}`,
      html: baseTemplate(content),
      text: `Hello ${data.borrowerName}, Your ${data.loanType} loan application status has changed to: ${statusLabel}. ${statusMessages[data.newStatus] || ""} View details at: ${data.portalUrl}/portal/application/${data.applicationId}`
    };
  },

  documentRequest: (data: {
    borrowerName: string;
    loanType: string;
    applicationId: string;
    documentNames: string[];
    message?: string;
    portalUrl: string;
  }) => {
    const documentList = data.documentNames.map(name => 
      `<li style="margin-bottom: 8px;">${name}</li>`
    ).join('');
    
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600;">
        Documents Requested
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.borrowerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        To continue processing your <strong style="color: ${BRAND_COLOR};">${data.loanType}</strong> loan application, we need the following documents:
      </p>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid ${BRAND_COLOR};">
        <p style="margin: 0 0 12px; font-size: 13px; color: ${TEXT_SECONDARY}; text-transform: uppercase; letter-spacing: 1px;">Required Documents</p>
        <ul style="margin: 0; padding-left: 20px; color: ${TEXT_PRIMARY}; font-size: 15px; line-height: 1.8;">
          ${documentList}
        </ul>
      </div>
      
      ${data.message ? `
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <p style="margin: 0 0 8px; font-size: 13px; color: ${TEXT_SECONDARY}; text-transform: uppercase; letter-spacing: 1px;">Additional Notes</p>
        <p style="margin: 0; font-size: 15px; color: ${TEXT_SECONDARY}; line-height: 1.6;">${data.message}</p>
      </div>
      ` : ''}
      
      ${button("Upload Documents", `${data.portalUrl}/portal/application/${data.applicationId}/documents`)}
      
      <p style="margin: 25px 0 0; font-size: 14px; color: ${TEXT_SECONDARY};">
        Uploading these documents promptly will help us process your application faster.
      </p>
    `;
    
    return {
      subject: `Documents Needed for Your Loan Application`,
      html: baseTemplate(content),
      text: `Hello ${data.borrowerName}, To continue processing your ${data.loanType} loan application, we need the following documents: ${data.documentNames.join(", ")}. ${data.message || ""} Upload at: ${data.portalUrl}/portal/application/${data.applicationId}/documents`
    };
  },

  drawApproved: (data: {
    borrowerName: string;
    loanNumber: string;
    propertyAddress: string;
    drawNumber: number;
    approvedAmount: number;
    fundedDate?: string;
    portalUrl: string;
  }) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(data.approvedAmount);
    
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600;">
        Draw Request Approved
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.borrowerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        Great news! Your draw request has been approved and will be funded shortly.
      </p>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 25px; margin: 25px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Loan Number</span><br>
              <span style="font-size: 16px; color: ${TEXT_PRIMARY}; font-weight: 600;">${data.loanNumber}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Property</span><br>
              <span style="font-size: 16px; color: ${TEXT_PRIMARY};">${data.propertyAddress}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Draw #${data.drawNumber} Amount</span><br>
              <span style="font-size: 24px; color: ${BRAND_COLOR}; font-weight: 700;">${formattedAmount}</span>
            </td>
          </tr>
        </table>
      </div>
      
      ${button("View Loan Details", data.portalUrl + "/portal/loans")}
      
      <p style="margin: 25px 0 0; font-size: 14px; color: ${TEXT_SECONDARY};">
        Funds typically disburse within 1-2 business days after approval.
      </p>
    `;
    
    return {
      subject: `Draw #${data.drawNumber} Approved - ${formattedAmount}`,
      html: baseTemplate(content),
      text: `Hello ${data.borrowerName}, Great news! Draw #${data.drawNumber} for ${formattedAmount} has been approved for ${data.propertyAddress}. Funds typically disburse within 1-2 business days.`
    };
  },

  paymentReminder: (data: {
    borrowerName: string;
    loanNumber: string;
    propertyAddress: string;
    paymentAmount: number;
    dueDate: string;
    daysUntilDue: number;
    portalUrl: string;
  }) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(data.paymentAmount);
    
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600;">
        Payment Reminder
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.borrowerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        This is a friendly reminder that your loan payment is due in <strong style="color: ${BRAND_COLOR};">${data.daysUntilDue} days</strong>.
      </p>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 5px; font-size: 13px; color: ${TEXT_SECONDARY}; text-transform: uppercase; letter-spacing: 1px;">Amount Due</p>
        <p style="margin: 0 0 15px; font-size: 32px; color: ${BRAND_COLOR}; font-weight: 700;">${formattedAmount}</p>
        <p style="margin: 0; font-size: 14px; color: ${TEXT_SECONDARY};">Due Date: <strong style="color: ${TEXT_PRIMARY};">${data.dueDate}</strong></p>
      </div>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 5px 0;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Loan Number:</span>
              <span style="font-size: 14px; color: ${TEXT_PRIMARY}; float: right;">${data.loanNumber}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Property:</span>
              <span style="font-size: 14px; color: ${TEXT_PRIMARY}; float: right;">${data.propertyAddress}</span>
            </td>
          </tr>
        </table>
      </div>
      
      ${button("View Loan Details", data.portalUrl + "/portal/loans")}
    `;
    
    return {
      subject: `Payment Reminder: ${formattedAmount} due ${data.dueDate}`,
      html: baseTemplate(content),
      text: `Hello ${data.borrowerName}, This is a reminder that your payment of ${formattedAmount} for loan ${data.loanNumber} is due on ${data.dueDate}. View details at: ${data.portalUrl}/portal/loans`
    };
  },

  payoffStatementReady: (data: {
    borrowerName: string;
    loanNumber: string;
    propertyAddress: string;
    payoffAmount: number;
    validUntil: string;
    portalUrl: string;
  }) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(data.payoffAmount);
    
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600;">
        Payoff Statement Ready
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.borrowerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        Your payoff statement is now available for loan <strong style="color: ${BRAND_COLOR};">${data.loanNumber}</strong>.
      </p>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 5px; font-size: 13px; color: ${TEXT_SECONDARY}; text-transform: uppercase; letter-spacing: 1px;">Payoff Amount</p>
        <p style="margin: 0 0 15px; font-size: 32px; color: ${BRAND_COLOR}; font-weight: 700;">${formattedAmount}</p>
        <p style="margin: 0; font-size: 14px; color: ${TEXT_SECONDARY};">Valid until: <strong style="color: ${TEXT_PRIMARY};">${data.validUntil}</strong></p>
      </div>
      
      <p style="margin: 0 0 20px; font-size: 15px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        <strong style="color: ${TEXT_PRIMARY};">Property:</strong> ${data.propertyAddress}
      </p>
      
      ${button("View Payoff Details", data.portalUrl + "/portal/loans")}
      
      <p style="margin: 25px 0 0; font-size: 14px; color: ${TEXT_SECONDARY};">
        Please note: The payoff amount may change daily due to per diem interest. Contact us for the most current figure on your closing date.
      </p>
    `;
    
    return {
      subject: `Payoff Statement Ready - Loan ${data.loanNumber}`,
      html: baseTemplate(content),
      text: `Hello ${data.borrowerName}, Your payoff statement for loan ${data.loanNumber} is ready. Payoff amount: ${formattedAmount}, valid until ${data.validUntil}. View details at: ${data.portalUrl}/portal/loans`
    };
  },

  appointmentConfirmation: (data: {
    borrowerName: string;
    staffName: string;
    appointmentDate: string;
    appointmentTime: string;
    title: string;
    portalUrl: string;
  }) => {
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600;">
        Consultation Confirmed
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.borrowerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        Your consultation has been scheduled successfully. We look forward to speaking with you!
      </p>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 25px; margin: 25px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #333;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Consultation:</span>
              <span style="font-size: 14px; color: ${BRAND_COLOR}; float: right; font-weight: 600;">${data.title}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #333;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Date:</span>
              <span style="font-size: 14px; color: ${TEXT_PRIMARY}; float: right;">${data.appointmentDate}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #333;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Time:</span>
              <span style="font-size: 14px; color: ${TEXT_PRIMARY}; float: right;">${data.appointmentTime}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">With:</span>
              <span style="font-size: 14px; color: ${TEXT_PRIMARY}; float: right;">${data.staffName}</span>
            </td>
          </tr>
        </table>
      </div>
      
      ${button("View My Appointments", data.portalUrl + "/portal/appointments")}
      
      <p style="margin: 25px 0 0; font-size: 14px; color: ${TEXT_SECONDARY};">
        Need to reschedule? You can manage your appointments in your borrower portal.
      </p>
    `;
    
    return baseTemplate(content);
  },

  appointmentReminder: (data: {
    borrowerName: string;
    staffName: string;
    appointmentDate: string;
    appointmentTime: string;
    title: string;
    meetingUrl?: string;
    portalUrl: string;
  }) => {
    const content = `
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600;">
        Consultation Tomorrow
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.borrowerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        This is a friendly reminder about your upcoming consultation.
      </p>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 10px; font-size: 20px; color: ${BRAND_COLOR}; font-weight: 600;">${data.title}</p>
        <p style="margin: 0 0 5px; font-size: 18px; color: ${TEXT_PRIMARY};">${data.appointmentDate}</p>
        <p style="margin: 0; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 700;">${data.appointmentTime}</p>
        <p style="margin: 15px 0 0; font-size: 14px; color: ${TEXT_SECONDARY};">with ${data.staffName}</p>
      </div>
      
      ${data.meetingUrl ? button("Join Meeting", data.meetingUrl) : button("View Appointment Details", data.portalUrl + "/portal/appointments")}
      
      <p style="margin: 25px 0 0; font-size: 14px; color: ${TEXT_SECONDARY};">
        If you need to cancel or reschedule, please do so at least 2 hours in advance.
      </p>
    `;
    
    return baseTemplate(content);
  },

  signatureRequested: (data: {
    signerName: string;
    documentName: string;
    requestedByName: string;
    signingUrl: string;
    expiresAt: Date;
    propertyAddress?: string;
  }) => {
    const expiresFormatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(data.expiresAt));

    const content = `
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600;">
        Signature Required
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.signerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        ${data.requestedByName} has requested your signature on a document.
      </p>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid ${BRAND_COLOR};">
        <p style="margin: 0 0 8px; font-size: 13px; color: ${TEXT_SECONDARY}; text-transform: uppercase; letter-spacing: 1px;">Document Details</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #333;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Document:</span>
              <span style="font-size: 14px; color: ${BRAND_COLOR}; float: right; font-weight: 600;">${data.documentName}</span>
            </td>
          </tr>
          ${data.propertyAddress ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #333;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Property:</span>
              <span style="font-size: 14px; color: ${TEXT_PRIMARY}; float: right;">${data.propertyAddress}</span>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Expires:</span>
              <span style="font-size: 14px; color: ${TEXT_PRIMARY}; float: right;">${expiresFormatted}</span>
            </td>
          </tr>
        </table>
      </div>
      
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        Click the button below to review and sign the document securely online.
      </p>
      
      ${button("Review & Sign Document", data.signingUrl)}
      
      <p style="margin: 25px 0 0; font-size: 14px; color: ${TEXT_SECONDARY};">
        This signing link will expire on ${expiresFormatted}. If you have any questions, please contact our team directly.
      </p>
    `;
    
    return baseTemplate(content);
  },

  signatureCompleted: (data: {
    signerName: string;
    documentName: string;
    signedAt: Date;
  }) => {
    const signedFormatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    }).format(new Date(data.signedAt));

    const content = `
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; width: 60px; height: 60px; background-color: #22c55e; border-radius: 50%; line-height: 60px;">
          <span style="font-size: 28px; color: #ffffff;">&#10003;</span>
        </div>
      </div>
      
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600; text-align: center;">
        Document Signed Successfully
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.signerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        Thank you for signing <strong style="color: ${BRAND_COLOR};">${data.documentName}</strong>. Your signature has been successfully recorded.
      </p>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 13px; color: ${TEXT_SECONDARY}; text-transform: uppercase; letter-spacing: 1px;">Signed On</p>
        <p style="margin: 0; font-size: 18px; color: ${TEXT_PRIMARY}; font-weight: 600;">${signedFormatted}</p>
      </div>
      
      <p style="margin: 25px 0 0; font-size: 14px; color: ${TEXT_SECONDARY};">
        A copy of this confirmation has been saved to your file. If you have any questions about your loan application, please contact your loan officer.
      </p>
    `;
    
    return baseTemplate(content);
  },

  paymentConfirmation: (data: {
    borrowerName: string;
    feeType: string;
    amount: string;
    propertyAddress?: string;
    applicationId: string;
  }) => {
    const content = `
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; width: 60px; height: 60px; background-color: #22c55e; border-radius: 50%; line-height: 60px;">
          <span style="font-size: 28px; color: #ffffff;">&#10003;</span>
        </div>
      </div>
      
      <h2 style="margin: 0 0 20px; font-size: 24px; color: ${TEXT_PRIMARY}; font-weight: 600; text-align: center;">
        Payment Confirmed
      </h2>
      <p style="margin: 0 0 15px; font-size: 16px; color: ${TEXT_PRIMARY}; line-height: 1.6;">
        Hello ${data.borrowerName},
      </p>
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        Thank you for your payment. Your <strong style="color: ${BRAND_COLOR};">${data.feeType}</strong> has been successfully processed.
      </p>
      
      <div style="background-color: ${DARK_BG}; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid ${BRAND_COLOR};">
        <p style="margin: 0 0 8px; font-size: 13px; color: ${TEXT_SECONDARY}; text-transform: uppercase; letter-spacing: 1px;">Payment Details</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #333;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Fee Type:</span>
              <span style="font-size: 14px; color: ${BRAND_COLOR}; float: right; font-weight: 600;">${data.feeType}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #333;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Amount:</span>
              <span style="font-size: 14px; color: #22c55e; float: right; font-weight: 600;">${data.amount}</span>
            </td>
          </tr>
          ${data.propertyAddress ? `
          <tr>
            <td style="padding: 8px 0;">
              <span style="font-size: 13px; color: ${TEXT_SECONDARY};">Property:</span>
              <span style="font-size: 14px; color: ${TEXT_PRIMARY}; float: right;">${data.propertyAddress}</span>
            </td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <p style="margin: 0 0 20px; font-size: 16px; color: ${TEXT_SECONDARY}; line-height: 1.6;">
        Your loan application will continue to be processed. You can track the status anytime through your borrower portal.
      </p>
      
      ${button("View Application", `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : ''}/portal/application/${data.applicationId}`)}
      
      <p style="margin: 25px 0 0; font-size: 14px; color: ${TEXT_SECONDARY};">
        If you have any questions about your payment or application, please contact your loan officer.
      </p>
    `;
    
    return baseTemplate(content);
  },
};
