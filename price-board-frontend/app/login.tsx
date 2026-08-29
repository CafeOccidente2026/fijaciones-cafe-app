import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";
import { FormField } from "../src/components/FormField";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { strings } from "../src/constants/strings";
import { images } from "../src/constants/images";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!username.trim() || !password) {
      setErrorMessage(strings.auth.missingFields);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      router.replace("/home");
    } catch {
      setErrorMessage(strings.auth.invalidCredentials);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="mx-5 rounded-3xl border border-border bg-card p-6 dark:border-border-dark dark:bg-card-dark">
          {/* The new logo is transparent, so the circle keeps a fixed light
              backdrop here regardless of theme - an intentional exception,
              not a change to the app's general background. */}
          <View className="mb-4 h-24 w-24 self-center items-center justify-center overflow-hidden rounded-full bg-white">
            <Image source={images.logo} resizeMode="contain" className="h-20 w-20" />
          </View>

          <Text className="text-center text-2xl font-bold text-primary dark:text-white">
            {strings.auth.portalTitle}
          </Text>
          <Text className="mb-6 text-center text-sm text-muted dark:text-muted-dark">
            {strings.auth.portalSubtitle}
          </Text>

          <FormField
            label={strings.auth.usernameLabel}
            placeholder={strings.auth.usernamePlaceholder}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <FormField
            label={strings.auth.passwordLabel}
            placeholder={strings.auth.passwordPlaceholder}
            secureToggle
            value={password}
            onChangeText={setPassword}
          />

          {errorMessage ? (
            <Text className="mb-4 text-center text-sm text-danger dark:text-danger-dark">
              {errorMessage}
            </Text>
          ) : null}

          <PrimaryButton
            label={strings.auth.loginButton}
            onPress={handleSubmit}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
