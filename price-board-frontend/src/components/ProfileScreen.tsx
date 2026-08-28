import React, { useCallback, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Screen } from "./Screen";
import { Card } from "./Card";
import { StateView } from "./StateView";
import { PrimaryButton } from "./PrimaryButton";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../auth/AuthContext";
import { useTheme, ThemePreference } from "../theme/ThemeContext";
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

/**
 * Single responsibility: the profile tab, identical for every role -
 * read-only identity data from GET /users/me, a "change photo" action
 * (camera or gallery), the theme selector, and log out.
 */
export function ProfileScreen() {
  const router = useRouter();
  const { logout, updateUser } = useAuth();
  const { themePreference, setThemePreference } = useTheme();
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
                  <Text className="text-3xl">👤</Text>
                )}
              </View>
              <Text className="mt-3 text-xl font-bold text-primary dark:text-white">
                {user.fullName}
              </Text>
              <Text className="text-sm text-muted dark:text-muted-dark">{roleLabel(user.role)}</Text>
            </Card>

            <Card>
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
                {strings.profile.usernameLabel}
              </Text>
              <Text className="mb-3 text-base text-primary dark:text-white">{user.username}</Text>
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
                {strings.profile.municipalityLabel}
              </Text>
              <Text className="text-base text-primary dark:text-white">
                {user.municipality ?? strings.profile.noMunicipality}
              </Text>
            </Card>

            {photoError ? (
              <Text className="text-sm text-danger dark:text-danger-dark">{photoError}</Text>
            ) : null}

            <PrimaryButton
              label={strings.profile.changePhoto}
              onPress={() => setSheetOpen(true)}
              loading={uploading}
            />

            <Card>
              <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted dark:text-muted-dark">
                {strings.profile.appearanceTitle}
              </Text>
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
                      <Text
                        className={`text-sm font-semibold ${
                          active
                            ? "text-primary dark:text-white"
                            : "text-muted dark:text-muted-dark"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              className="mt-2 items-center rounded-2xl border border-danger py-4 dark:border-danger-dark"
            >
              <Text className="text-base font-semibold text-danger dark:text-danger-dark">
                {loggingOut ? strings.profile.loggingOut : strings.profile.logout}
              </Text>
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
            <Text className="mb-1 text-lg font-bold text-primary dark:text-white">
              {strings.profile.photoSheetTitle}
            </Text>
            <Text className="mb-4 text-sm text-muted dark:text-muted-dark">
              {strings.profile.photoSheetHint}
            </Text>

            <Pressable
              onPress={() => pickAndUpload("camera")}
              className="mb-2 items-center rounded-xl border border-border py-3 dark:border-border-dark"
            >
              <Text className="text-base font-semibold text-primary dark:text-white">
                {strings.profile.takePhoto}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => pickAndUpload("gallery")}
              className="mb-2 items-center rounded-xl border border-border py-3 dark:border-border-dark"
            >
              <Text className="text-base font-semibold text-primary dark:text-white">
                {strings.profile.chooseFromGallery}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSheetOpen(false)}
              className="items-center rounded-xl py-3"
            >
              <Text className="text-base font-semibold text-muted dark:text-muted-dark">
                {strings.common.cancel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}
