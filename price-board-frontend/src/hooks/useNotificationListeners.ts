import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { useAuth } from "../auth/AuthContext";
import { isRunningInExpoGo } from "../notifications/pushRegistration";
import { notifyUnreadNotificationsChanged } from "../notifications/unreadNotificationsBus";

// Show incoming notifications while the app is in the foreground too, not
// just in the system tray. Skipped in Expo Go and guarded with try/catch:
// SDK 53+ removed remote push there, and touching the handler must never
// be able to crash the app before a development build exists.
if (!isRunningInExpoGo()) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.error("[push] failed to set notification handler:", error);
  }
}

// Only PRODUCER has a dedicated notifications screen today; the other
// roles fall back to their home tab until one exists for them too.
const NOTIFICATIONS_ROUTE_BY_ROLE: Record<string, string> = {
  PRODUCER: "/producer/notifications",
  PRICE_MANAGER: "/price-manager",
  ADMIN: "/admin",
};

/**
 * Single responsibility: react to push notifications while the app is
 * open. Tapping one navigates to the current role's notifications screen.
 */
export function useNotificationListeners(): void {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (isRunningInExpoGo()) {
      return undefined;
    }

    try {
      const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
        const route = user ? NOTIFICATIONS_ROUTE_BY_ROLE[user.role] : undefined;
        if (route) {
          router.push(route as never);
        }
      });

      // Received-while-foregrounded notifications are shown by the
      // handler above (banner); here we just tell every mounted unread
      // badge to refetch, since a new one just arrived.
      const receivedSub = Notifications.addNotificationReceivedListener(() => {
        notifyUnreadNotificationsChanged();
      });

      return () => {
        responseSub.remove();
        receivedSub.remove();
      };
    } catch (error) {
      console.error("[push] failed to register notification listeners:", error);
      return undefined;
    }
  }, [user, router]);
}
