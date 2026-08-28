import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { StateView } from "../../src/components/StateView";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { useAsync } from "../../src/hooks/useAsync";
import { UsersApi } from "../../src/api/usersApi";
import { NotificationsApi } from "../../src/api/notificationsApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { AppUser } from "../../src/types/user.types";

/**
 * PRICE_MANAGER "enviar notificación": a message plus a target - all
 * producers, or a hand-picked subset.
 */
export default function SendNotificationScreen() {
  const { data: producers, isLoading, error, reload } = useAsync<AppUser[]>(() =>
    UsersApi.list("PRODUCER")
  );

  const [message, setMessage] = useState("");
  const [toAll, setToAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const recipientIds = useMemo(() => {
    if (toAll) return (producers ?? []).map((producer) => producer.id);
    return Array.from(selectedIds);
  }, [toAll, producers, selectedIds]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    setSuccessMessage(null);
    if (!message.trim()) {
      setFormError("Escribe un mensaje");
      return;
    }
    if (recipientIds.length === 0) {
      setFormError("Selecciona al menos un destinatario");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await NotificationsApi.send({ message: message.trim(), recipientIds });
      setSuccessMessage(`Notificación enviada a ${result.recipientCount} persona(s)`);
      setMessage("");
      setSelectedIds(new Set());
      setToAll(true);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Enviar notificación">
      <Card>
        <Text className="mb-2 text-xs font-semibold tracking-wide text-muted">MENSAJE</Text>
        <TextInput
          placeholder="Escribe el mensaje para los productores"
          placeholderTextColor="#B79A94"
          multiline
          value={message}
          onChangeText={setMessage}
          className="min-h-[96px] rounded-xl border border-border bg-background px-4 py-3 text-base text-primary"
          style={{ textAlignVertical: "top" }}
        />
      </Card>

      <Card>
        <Pressable
          onPress={() => setToAll(true)}
          className={`mb-2 flex-row items-center gap-3 rounded-xl border p-3 ${
            toAll ? "border-accent bg-accent-light" : "border-border"
          }`}
        >
          <View className={`h-4 w-4 rounded-full border ${toAll ? "border-accent bg-accent" : "border-muted"}`} />
          <Text className="text-base text-primary">A todos los productores</Text>
        </Pressable>
        <Pressable
          onPress={() => setToAll(false)}
          className={`flex-row items-center gap-3 rounded-xl border p-3 ${
            !toAll ? "border-accent bg-accent-light" : "border-border"
          }`}
        >
          <View className={`h-4 w-4 rounded-full border ${!toAll ? "border-accent bg-accent" : "border-muted"}`} />
          <Text className="text-base text-primary">Elegir productores específicos</Text>
        </Pressable>
      </Card>

      {!toAll ? (
        <StateView
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && !error && (producers?.length ?? 0) === 0}
          emptyText="No hay productores registrados."
          onRetry={reload}
        >
          <Card>
            {(producers ?? []).map((producer) => {
              const checked = selectedIds.has(producer.id);
              return (
                <Pressable
                  key={producer.id}
                  onPress={() => toggle(producer.id)}
                  className="flex-row items-center gap-3 border-b border-border py-3"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded border ${
                      checked ? "border-accent bg-accent" : "border-muted"
                    }`}
                  >
                    {checked ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base text-primary">{producer.fullName}</Text>
                    <Text className="text-xs text-muted">
                      {producer.municipality ?? "Sin municipio"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        </StateView>
      ) : null}

      {formError ? <Text className="text-sm text-danger">{formError}</Text> : null}
      {successMessage ? (
        <View className="rounded-xl bg-accent-light p-3">
          <Text className="text-center text-sm font-semibold text-primary">{successMessage}</Text>
        </View>
      ) : null}

      <PrimaryButton label="Enviar" onPress={submit} loading={submitting} />
    </Screen>
  );
}
