import crypto from "crypto";
import { storage } from "../storage";

const RETRY_DELAYS = [60000, 300000, 1800000, 7200000];

function signPayload(payload: any, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
}

async function deliverWebhook(
  eventId: string,
  endpointId: string,
  targetUrl: string,
  secret: string,
  payload: any
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const signature = signPayload(payload, secret);

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SAF-Signature": `sha256=${signature}`,
        "X-SAF-Event": payload.event,
        "X-SAF-Timestamp": new Date().toISOString(),
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.text();
    
    return {
      success: response.ok,
      statusCode: response.status,
      error: response.ok ? undefined : responseBody.substring(0, 1000),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function processWebhookEvents(): Promise<void> {
  const workerId = `worker-${process.pid}-${Date.now()}`;
  
  try {
    const pendingEvents = await storage.getPendingWebhookEvents(10);
    
    for (const event of pendingEvents) {
      const lockedEvent = await storage.lockWebhookEvent(event.id, workerId);
      if (!lockedEvent) {
        continue;
      }

      const activeEndpoints = await storage.getActiveWebhookEndpoints();
      
      for (const endpoint of activeEndpoints) {
        const subscribedEvents = endpoint.subscribedEvents as string[] || [];
        const eventType = event.eventType;
        
        const isSubscribed = subscribedEvents.includes(eventType) || 
                            subscribedEvents.includes("*") ||
                            subscribedEvents.some(sub => eventType.startsWith(sub.replace(".*", "")));
        
        if (!isSubscribed) {
          continue;
        }

        const existingLogs = await storage.getWebhookDeliveryLogs(event.id);
        const existingLog = existingLogs.find(l => l.endpointId === endpoint.id);
        
        if (existingLog && existingLog.status === "delivered") {
          continue;
        }

        if (existingLog) {
          if (existingLog.nextRetryAt && new Date(existingLog.nextRetryAt) > new Date()) {
            continue;
          }

          const result = await deliverWebhook(
            event.id,
            endpoint.id,
            endpoint.targetUrl,
            endpoint.secret,
            event.payload
          );

          const attemptCount = existingLog.attemptCount + 1;
          const nextRetryIndex = attemptCount - 1;
          const shouldRetry = !result.success && nextRetryIndex < RETRY_DELAYS.length;

          await storage.updateWebhookDeliveryLog(existingLog.id, {
            status: result.success ? "delivered" : (shouldRetry ? "pending" : "failed"),
            responseCode: result.statusCode,
            responseBody: result.error?.substring(0, 500),
            errorMessage: result.error,
            attemptCount,
            lastAttemptAt: new Date(),
            nextRetryAt: shouldRetry 
              ? new Date(Date.now() + RETRY_DELAYS[nextRetryIndex])
              : null,
          });
        } else {
          const result = await deliverWebhook(
            event.id,
            endpoint.id,
            endpoint.targetUrl,
            endpoint.secret,
            event.payload
          );

          const shouldRetry = !result.success;

          await storage.createWebhookDeliveryLog({
            eventId: event.id,
            endpointId: endpoint.id,
            status: result.success ? "delivered" : (shouldRetry ? "pending" : "failed"),
            responseCode: result.statusCode,
            responseBody: result.error?.substring(0, 500),
            errorMessage: result.error,
            attemptCount: 1,
            lastAttemptAt: new Date(),
            nextRetryAt: shouldRetry ? new Date(Date.now() + RETRY_DELAYS[0]) : null,
          });
        }
      }

      await storage.markWebhookEventProcessed(event.id);
    }
  } catch (error) {
    console.error("Error processing webhook events:", error);
  }
}

let webhookWorkerInterval: NodeJS.Timeout | null = null;

export function startWebhookWorker(intervalMs: number = 5000): void {
  if (webhookWorkerInterval) {
    console.log("Webhook worker already running");
    return;
  }

  console.log(`Starting webhook worker (interval: ${intervalMs}ms)`);
  
  webhookWorkerInterval = setInterval(async () => {
    try {
      await processWebhookEvents();
    } catch (error) {
      console.error("Webhook worker error:", error);
    }
  }, intervalMs);
}

export function stopWebhookWorker(): void {
  if (webhookWorkerInterval) {
    clearInterval(webhookWorkerInterval);
    webhookWorkerInterval = null;
    console.log("Webhook worker stopped");
  }
}
