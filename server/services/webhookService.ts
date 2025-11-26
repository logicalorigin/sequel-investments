interface CommentNotificationPayload {
  event: "document_comment_added";
  timestamp: string;
  data: {
    commentId: string;
    documentId: string;
    documentName: string;
    applicationId: string;
    propertyAddress: string | null;
    loanType: string;
    commenterName: string;
    commenterEmail: string | null;
    recipientEmail: string | null;
    recipientName: string | null;
    comment: string;
    isInternal: boolean;
  };
}

export async function sendCommentNotification(payload: CommentNotificationPayload): Promise<boolean> {
  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log("[Webhook] CRM_WEBHOOK_URL not configured, skipping notification");
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Source": "secured-asset-funding",
        "X-Webhook-Event": payload.event,
        ...(process.env.CRM_WEBHOOK_SECRET && {
          "X-Webhook-Secret": process.env.CRM_WEBHOOK_SECRET
        })
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[Webhook] Failed to send notification: ${response.status} ${response.statusText}`);
      return false;
    }

    console.log(`[Webhook] Comment notification sent successfully for document ${payload.data.documentId}`);
    return true;
  } catch (error) {
    console.error("[Webhook] Error sending notification:", error);
    return false;
  }
}

export function buildCommentNotificationPayload(
  comment: {
    id: string;
    content: string;
    isInternal: boolean;
  },
  document: {
    id: string;
    name: string;
  },
  application: {
    id: string;
    propertyAddress: string | null;
    loanType: string;
  },
  commenter: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  },
  recipient: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null
): CommentNotificationPayload {
  return {
    event: "document_comment_added",
    timestamp: new Date().toISOString(),
    data: {
      commentId: comment.id,
      documentId: document.id,
      documentName: document.name,
      applicationId: application.id,
      propertyAddress: application.propertyAddress,
      loanType: application.loanType,
      commenterName: [commenter.firstName, commenter.lastName].filter(Boolean).join(" ") || "Unknown",
      commenterEmail: commenter.email,
      recipientEmail: recipient?.email || null,
      recipientName: recipient ? [recipient.firstName, recipient.lastName].filter(Boolean).join(" ") || null : null,
      comment: comment.content,
      isInternal: comment.isInternal,
    },
  };
}
