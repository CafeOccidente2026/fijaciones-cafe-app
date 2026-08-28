import React, { useCallback, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "./Screen";
import { Card } from "./Card";
import { StateView } from "./StateView";
import { FormField } from "./FormField";
import { PrimaryButton } from "./PrimaryButton";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../auth/AuthContext";
import { UsersApi } from "../api/usersApi";
import { getApiErrorMessage } from "../api/apiError";
import { AppUser } from "../types/user.types";
import { roleLabel } from "../utils/format";

/**
 * Single responsibility: the profile tab, identical for every role -
 * read-only identity data from GET /users/me, a "change photo" action
 * (URL only for now, no file upload), and log out.
 */
export function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { data: user, isLoading, error, reload } = useAsync<AppUser>(() => UsersApi.getMe());

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await logout();
    router.replace("/login");
  }, [logout, router]);

  async function savePhoto() {
    if (!photoUrl.trim()) {
      setPhotoError("Ingresa una URL de imagen");
      return;
    }
    setSavingPhoto(true);
    setPhotoError(null);
    try {
      await UsersApi.updateProfilePhoto(photoUrl.trim());
      setPhotoModalOpen(false);
      setPhotoUrl("");
      reload();
    } catch (err) {
      setPhotoError(getApiErrorMessage(err));
    } finally {
      setSavingPhoto(false);
    }
  }

  return (
    <Screen title="Perfil">
      <StateView isLoading={isLoading} error={error} onRetry={reload}>
        {user ? (
          <>
            <Card className="items-center">
              <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-accent-light">
                {user.profilePhotoUrl ? (
                  <Image source={{ uri: user.profilePhotoUrl }} className="h-24 w-24" />
                ) : (
                  <Text className="text-3xl">👤</Text>
                )}
              </View>
              <Text className="mt-3 text-xl font-bold text-primary">{user.fullName}</Text>
              <Text className="text-sm text-muted">{roleLabel(user.role)}</Text>
            </Card>

            <Card>
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Usuario</Text>
              <Text className="mb-3 text-base text-primary">{user.username}</Text>
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Municipio</Text>
              <Text className="text-base text-primary">{user.municipality ?? "No registrado"}</Text>
            </Card>

            <PrimaryButton label="Cambiar foto de perfil" onPress={() => setPhotoModalOpen(true)} />

            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              className="mt-2 items-center rounded-2xl border border-danger py-4"
            >
              <Text className="text-base font-semibold text-danger">
                {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
              </Text>
            </Pressable>
          </>
        ) : null}
      </StateView>

      <Modal visible={photoModalOpen} transparent animationType="fade" onRequestClose={() => setPhotoModalOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <View className="w-full rounded-2xl bg-card p-6">
            <Text className="mb-1 text-lg font-bold text-primary">Foto de perfil</Text>
            <Text className="mb-4 text-sm text-muted">
              Pega la URL de una imagen. La subida de archivos se agregará más adelante.
            </Text>
            <FormField
              label="URL de la imagen"
              placeholder="https://..."
              autoCapitalize="none"
              value={photoUrl}
              onChangeText={setPhotoUrl}
            />
            {photoError ? <Text className="mb-3 text-sm text-danger">{photoError}</Text> : null}
            <View className="flex-row justify-end gap-3">
              <Pressable
                onPress={() => setPhotoModalOpen(false)}
                className="rounded-xl border border-border px-5 py-3"
              >
                <Text className="font-semibold text-muted">Cancelar</Text>
              </Pressable>
              <View className="min-w-[120px]">
                <PrimaryButton label="Guardar" onPress={savePhoto} loading={savingPhoto} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
