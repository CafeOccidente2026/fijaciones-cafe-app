import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// SDK 53+ removed remote push support from Expo Go entirely (Android
// throws as soon as anything tries to obtain a token there). This is how
// the app tells it's running inside Expo Go rather than a development
// build. Exported so other push call sites (e.g. the listeners hook) can
// use the same check.
export function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

/**
 * Single responsibility: get an Expo push token for this device, asking
 * for permission if needed. Returns null whenever push isn't available
 * (Expo Go, simulator, permission denied, no EAS projectId) so callers
 * can treat it as "nothing to register" and keep going.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (isRunningInExpoGo()) {
    console.log(
      "Push notifications no disponibles en Expo Go — usa un development build para probarlas."
    );
    return null;
  }

  // Extra safety net: even outside Expo Go, any expo-notifications call
  // failing here must never take the rest of the app down with it.
  try {
    if (!Device.isDevice) {
      return null;
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") {
      return null;
    }

    // Android 8+ won't show a heads-up banner/sound without a channel of
    // IMPORTANCE_HIGH. Must match the "default" channelId the backend
    // sends in the push payload (pushNotification.service.ts).
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });

    // ponytail: getExpoPushTokenAsync needs an EAS projectId. Once this app
    // is linked to an EAS project (app.json extra.eas.projectId / eas.json),
    // this starts returning real tokens with no further change here.
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      return null;
    }

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (error) {
    console.error("[push] failed to get Expo push token:", error);
    return null;
  }
}
