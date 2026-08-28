import React from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { strings } from "../constants/strings";

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
  confirmLabel = strings.common.accept,
  cancelLabel = strings.common.cancel,
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <View className="w-full rounded-2xl bg-card p-6 dark:bg-card-dark">
          {title ? (
            <Text className="mb-2 text-lg font-bold text-primary dark:text-white">{title}</Text>
          ) : null}
          <Text className="mb-6 text-base text-primary-light dark:text-muted-dark">{message}</Text>

          <View className="flex-row justify-end gap-3">
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="rounded-xl border border-border px-5 py-3 dark:border-border-dark"
            >
              <Text className="font-semibold text-muted dark:text-muted-dark">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="min-w-[96px] items-center rounded-xl bg-primary px-5 py-3 dark:bg-primary-dark"
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
