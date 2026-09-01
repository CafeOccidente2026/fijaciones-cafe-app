import React, { useCallback, useState } from "react";
import { Image, Modal, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { AppText } from "./AppText";
import { Screen } from "./Screen";
import { Card } from "./Card";
import { StateView } from "./StateView";
import { PrimaryButton } from "./PrimaryButton";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../auth/AuthContext";
import { useTheme, ThemePreference } from "../theme/ThemeContext";
import { useFontScale, FontScalePreference } from "../theme/FontScaleContext";
import { UsersApi } from "../api/usersApi";
import { getApiErrorMessage } from "../api/apiError";
import { AppUser } from "../types/user.types";
import { roleLabel } from "../utils/format";
import { strings } from "../constants/strings";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: strings.profile.themeLight },
  { value: "dark", label: strings.profile.themeDark },
  { value: "system", label: strings.profile.themeSystem },
];

const FONT_SCALE_OPTIONS: { value: FontScalePreference; label: string }[] = [
  { value: "small", label: strings.fontScale.small },
  { value: "normal", label: strings.fontScale.normal },
  { value: "large", label: strings.fontScale.large },
  { value: "extraLarge", label: strings.fontScale.extraLarge },
];

/**
 * Single responsibility: the profile tab, identical for every role -
 * read-only identity data from GET /users/me, a "change photo" action
 * (camera or gallery), the theme selector, and log out.
 */
export function ProfileScreen() {
  const router = useRouter();
  const { logout, updateUser } = useAuth();
  const { themePreference, setThemePreference } = useTheme();
  const { fontScalePreference, setFontScalePreference } = useFontScale();
  const { data: user, isLoading, error, reload } = useAsync<AppUser>(() => UsersApi.getMe());

  const [sheetOpen, setSheetOpen] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await logout();
    router.replace("/login");
  }, [logout, router]);

  async function pickAndUpload(source: "camera" | "gallery") {
    setPhotoError(null);

    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setPhotoError(
        source === "camera"
          ? strings.profile.cameraPermissionDenied
          : strings.profile.galleryPermissionDenied
      );
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6 });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    setSheetOpen(false);
    setUploading(true);
    try {
      const updated = await UsersApi.uploadProfilePhoto({
        uri: asset.uri,
        name: asset.fileName ?? `profile-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });
      updateUser({ profilePhotoUrl: updated.profilePhotoUrl });
      reload();
    } catch (err) {
      setPhotoError(getApiErrorMessage(err, strings.profile.uploadError));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Screen title={strings.profile.title}>
      <StateView isLoading={isLoading} error={error} onRetry={reload}>
        {user ? (
          <>
            <Card className="items-center">
              <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-metal-copper bg-accent-soft dark:bg-accent-soft-dark">
                {user.profilePhotoUrl ? (
                  <Image source={{ uri: user.profilePhotoUrl }} className="h-24 w-24" />
                ) : (
                  <AppText className="text-3xl">👤</AppText>
                )}
              </View>
              <AppText className="mt-3 text-xl font-bold text-primary dark:text-white">
                {user.fullName}
              </AppText>
              <AppText className="text-sm text-muted dark:text-muted-dark">{roleLabel(user.role)}</AppText>
            </Card>

            <Card>
              <AppText className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
                {strings.profile.usernameLabel}
              </AppText>
              <AppText className="mb-3 text-base text-primary dark:text-white">{user.username}</AppText>
              <AppText className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
                {strings.profile.municipalityLabel}
              </AppText>
              <AppText className="text-base text-primary dark:text-white">
                {user.municipality ?? strings.profile.noMunicipality}
              </AppText>
            </Card>

            {photoError ? (
              <AppText className="text-sm text-danger dark:text-danger-dark">{photoError}</AppText>
            ) : null}

            <PrimaryButton
              label={strings.profile.changePhoto}
              onPress={() => setSheetOpen(true)}
              loading={uploading}
            />

            <Card>
              <AppText className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
                {strings.profile.appearanceTitle}
              </AppText>
              <View className="flex-row gap-2">
                {THEME_OPTIONS.map((option) => {
                  const active = option.value === themePreference;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setThemePreference(option.value)}
                      className={`flex-1 items-center rounded-xl border py-2.5 ${
                        active
                          ? "border-accent bg-accent-soft dark:border-accent-dark dark:bg-accent-soft-dark"
                          : "border-border dark:border-border-dark"
                      }`}
                    >
                      <AppText
                        className={`text-sm font-semibold ${
                          active
                            ? "text-primary dark:text-white"
                            : "text-muted dark:text-muted-dark"
                        }`}
                      >
                        {option.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Card>
              <AppText className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
                {strings.fontScale.title}
              </AppText>
              <View className="flex-row gap-2">
                {FONT_SCALE_OPTIONS.map((option) => {
                  const active = option.value === fontScalePreference;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setFontScalePreference(option.value)}
                      className={`flex-1 items-center rounded-xl border py-2.5 ${
                        active
                          ? "border-accent bg-accent-soft dark:border-accent-dark dark:bg-accent-soft-dark"
                          : "border-border dark:border-border-dark"
                      }`}
                    >
                      <AppText
                        className={`text-sm font-semibold ${
                          active
                            ? "text-primary dark:text-white"
                            : "text-muted dark:text-muted-dark"
                        }`}
                      >
                        {option.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Pressable
              onPress={() => router.push("/change-password")}
              className="items-center rounded-2xl border border-border bg-card/90 py-4 dark:border-border-dark dark:bg-card-dark/90"
            >
              <AppText className="text-base font-semibold text-primary dark:text-white">
                {strings.profile.changePassword}
              </AppText>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              className="mt-2 items-center rounded-2xl border border-danger bg-card/90 py-4 dark:border-danger-dark dark:bg-card-dark/90"
            >
              <AppText className="text-base font-semibold text-danger dark:text-danger-dark">
                {loggingOut ? strings.profile.loggingOut : strings.profile.logout}
              </AppText>
            </Pressable>
          </>
        ) : null}
      </StateView>

      <Modal
        visible={sheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setSheetOpen(false)}
        >
          <View className="rounded-t-3xl bg-card p-6 dark:bg-card-dark">
            <AppText className="mb-1 text-lg font-bold text-primary dark:text-white">
              {strings.profile.photoSheetTitle}
            </AppText>
            <AppText className="mb-4 text-sm text-muted dark:text-muted-dark">
              {strings.profile.photoSheetHint}
            </AppText>

            <Pressable
              onPress={() => pickAndUpload("camera")}
              className="mb-2 items-center rounded-xl border border-border py-3 dark:border-border-dark"
            >
              <AppText className="text-base font-semibold text-primary dark:text-white">
                {strings.profile.takePhoto}
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => pickAndUpload("gallery")}
              className="mb-2 items-center rounded-xl border border-border py-3 dark:border-border-dark"
            >
              <AppText className="text-base font-semibold text-primary dark:text-white">
                {strings.profile.chooseFromGallery}
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => setSheetOpen(false)}
              className="items-center rounded-xl py-3"
            >
              <AppText className="text-base font-semibold text-muted dark:text-muted-dark">
                {strings.common.cancel}
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}
