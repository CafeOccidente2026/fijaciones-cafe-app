import { DeviceTokenRepository } from "../modules/users/deviceToken.repository";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
// Expo's push API caps each request at 100 messages.
const BATCH_SIZE = 100;

interface ExpoPushTicket {
  status: "ok" | "error";
  message?: string;
}

/**
 * Single responsibility: deliver push notifications to a set of users via
 * Expo's push API (plain fetch, no SDK). Never throws - a delivery
 * failure must never break the operation that triggered it, so every
 * error here is logged and swallowed.
 */
export class PushNotificationService {
  static async sendPushToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    if (userIds.length === 0) return;

    let tokens: string[];
    try {
      tokens = await DeviceTokenRepository.findTokensByUserIds(userIds);
    } catch (error) {
      console.error("[push] failed to load device tokens:", error);
      return;
    }

    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      await this.sendBatch(tokens.slice(i, i + BATCH_SIZE), title, body, data);
    }
  }

  private static async sendBatch(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(tokens.map((to) => ({ to, title, body, data }))),
      });

      if (!response.ok) {
        console.error(`[push] Expo push API responded ${response.status}`);
        return;
      }

      const result = (await response.json()) as { data?: ExpoPushTicket[] };
      result.data?.forEach((ticket, index) => {
        if (ticket.status === "error") {
          console.error(`[push] token ${tokens[index]} failed: ${ticket.message ?? "unknown error"}`);
        }
      });
    } catch (error) {
      console.error("[push] batch send failed:", error);
    }
  }
}
