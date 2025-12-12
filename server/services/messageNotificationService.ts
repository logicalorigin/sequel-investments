import { storage } from "../storage";
import { sendEmail, getPortalUrl } from "../email";
import { emailTemplates } from "../email-templates";

function isWithinQuietHours(
  quietHoursStart: string | null,
  quietHoursEnd: string | null,
  timezone: string | null
): boolean {
  if (!quietHoursStart || !quietHoursEnd) {
    return false;
  }

  try {
    const tz = timezone || "America/New_York";
    const now = new Date();
    
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    
    const currentTime = formatter.format(now);
    const [currentHour, currentMinute] = currentTime.split(":").map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = quietHoursStart.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    
    const [endHour, endMinute] = quietHoursEnd.split(":").map(Number);
    const endMinutes = endHour * 60 + endMinute;
    
    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  } catch (error) {
    console.error("Error checking quiet hours:", error);
    return false;
  }
}

export async function processOfflineStaffNotifications(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
}> {
  const result = { processed: 0, sent: 0, skipped: 0 };
  
  try {
    const offlineStaff = await storage.getOfflineStaffForNotification(2);
    const portalUrl = getPortalUrl();
    
    for (const { user, preferences, unreadCount } of offlineStaff) {
      result.processed++;
      
      if (!user.email) {
        result.skipped++;
        continue;
      }
      
      if (preferences.quietHoursEnabled && isWithinQuietHours(
        preferences.quietHoursStart,
        preferences.quietHoursEnd,
        preferences.quietHoursTimezone
      )) {
        result.skipped++;
        continue;
      }
      
      const staffName = user.firstName || user.username || "Team Member";
      const emailContent = emailTemplates.newMessagesDigest({
        staffName,
        unreadCount,
        portalUrl,
      });
      
      const emailResult = await sendEmail({
        to: user.email,
        subject: `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''} from borrowers`,
        html: emailContent,
        text: `Hello ${staffName}, You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''} from borrowers waiting for your response. Log in to the admin portal to review: ${portalUrl}/admin`,
        userId: user.id,
        emailType: "message_notification",
      });
      
      if (emailResult.success) {
        await storage.updateStaffLastNotified(user.id);
        result.sent++;
        console.log(`[MessageNotification] Sent digest email to ${user.email} (${unreadCount} unread)`);
      } else {
        result.skipped++;
        console.error(`[MessageNotification] Failed to send email to ${user.email}:`, emailResult.error);
      }
    }
    
    return result;
  } catch (error) {
    console.error("[MessageNotification] Error processing notifications:", error);
    return result;
  }
}

let notificationInterval: NodeJS.Timeout | null = null;

export function startMessageNotificationProcessor(intervalMinutes: number = 1): void {
  if (notificationInterval) {
    console.log("[MessageNotification] Processor already running");
    return;
  }
  
  console.log(`[MessageNotification] Starting processor (interval: ${intervalMinutes} min)`);
  
  notificationInterval = setInterval(async () => {
    const result = await processOfflineStaffNotifications();
    if (result.processed > 0) {
      console.log(`[MessageNotification] Processed: ${result.processed}, Sent: ${result.sent}, Skipped: ${result.skipped}`);
    }
  }, intervalMinutes * 60 * 1000);
  
  setTimeout(async () => {
    const result = await processOfflineStaffNotifications();
    if (result.processed > 0) {
      console.log(`[MessageNotification] Initial run - Processed: ${result.processed}, Sent: ${result.sent}, Skipped: ${result.skipped}`);
    }
  }, 5000);
}

export function stopMessageNotificationProcessor(): void {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    console.log("[MessageNotification] Processor stopped");
  }
}
