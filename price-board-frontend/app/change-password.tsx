import React, { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../src/components/Screen";
import { Card } from "../src/components/Card";
import { FormField } from "../src/components/FormField";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { AuthApi } from "../src/api/authApi";
import { SecureTokenStorage } from "../src/auth/secureTokenStorage";
import { getApiErrorMessage } from "../src/api/apiError";
import { strings } from "../src/constants/strings";

/** How long the success message stays visible before returning to Profile. */
const SUCCESS_NAVIGATE_DELAY_MS = 1200;

/**
 * Single screen reused by all 3 roles (linked from ProfileScreen). Verifies
 * the current password server-side, then swaps in the fresh access/refresh
 * pair the backend issues so the session stays alive after the change.
 */
export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setFormError(null);
    setSuccessMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError(strings.changePassword.missingFields);
      return;
    }
    if (newPassword.length < 8) {
      setFormError(strings.changePassword.tooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError(strings.changePassword.passwordsDontMatch);
      return;
    }

    setSubmitting(true);
    try {
      const { accessToken, refreshToken } = await AuthApi.changePassword(
        currentPassword,
        newPassword
      );
      await SecureTokenStorage.saveTokens(accessToken, refreshToken);
      setSuccessMessage(strings.changePassword.success);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => router.back(), SUCCESS_NAVIGATE_DELAY_MS);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title={strings.changePassword.title} showBack>
      <Card>
        <FormField
          label={strings.changePassword.currentPasswordLabel}
          placeholder={strings.changePassword.currentPasswordPlaceholder}
          autoCapitalize="none"
          secureToggle
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <FormField
          label={strings.changePassword.newPasswordLabel}
          placeholder={strings.changePassword.newPasswordPlaceholder}
          autoCapitalize="none"
          secureToggle
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <FormField
          label={strings.changePassword.confirmPasswordLabel}
          placeholder={strings.changePassword.confirmPasswordPlaceholder}
          autoCapitalize="none"
          secureToggle
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {formError ? (
          <Text className="mb-3 text-sm text-danger dark:text-danger-dark">{formError}</Text>
        ) : null}
        {successMessage ? (
          <Text className="mb-3 rounded-xl bg-accent-soft p-3 text-center text-sm font-semibold text-primary dark:bg-accent-soft-dark dark:text-white">
            {successMessage}
          </Text>
        ) : null}

        <PrimaryButton
          label={strings.changePassword.saveButton}
          onPress={submit}
          loading={submitting}
        />
      </Card>
    </Screen>
  );
}
