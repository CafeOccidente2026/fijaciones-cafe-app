import React from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Single responsibility: a yes/no confirmation dialog with the app's
 * card styling. Used for "fijar precio", delete user, etc.
 */
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <View className="w-full rounded-2xl bg-card p-6">
          {title ? <Text className="mb-2 text-lg font-bold text-primary">{title}</Text> : null}
          <Text className="mb-6 text-base text-primary-light">{message}</Text>

          <View className="flex-row justify-end gap-3">
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="rounded-xl border border-border px-5 py-3"
            >
              <Text className="font-semibold text-muted">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="min-w-[96px] items-center rounded-xl bg-primary px-5 py-3"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-semibold text-white">{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
