import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";
import { FormField } from "../src/components/FormField";
import { PrimaryButton } from "../src/components/PrimaryButton";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!username.trim() || !password) {
      setErrorMessage("Ingresa tu usuario y contraseña");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      router.replace("/home");
    } catch {
      setErrorMessage("Usuario o contraseña incorrectos");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="mx-5 rounded-3xl bg-card p-6 shadow-sm">
          {/* Cuando tengas el logo, reemplaza este bloque por:
              <Image source={require("../assets/logo.png")} className="h-24 w-24 self-center" /> */}
          <View className="mb-4 h-20 w-20 self-center items-center justify-center rounded-full bg-accent-light">
            <Text className="text-2xl">☕</Text>
          </View>

          <Text className="text-center text-2xl font-bold text-primary">Portal Operativo</Text>
          <Text className="mb-6 text-center text-sm text-muted">
            Gestión y Control Agrícola
          </Text>

          <FormField
            label="Usuario"
            placeholder="Ingrese su usuario"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <FormField
            label="Contraseña"
            placeholder="••••••••"
            secureToggle
            value={password}
            onChangeText={setPassword}
          />

          <Text className="mb-5 text-right text-sm text-primary-light">
            ¿Olvidó su contraseña?
          </Text>

          {errorMessage && (
            <Text className="mb-4 text-center text-sm text-danger">{errorMessage}</Text>
          )}

          <PrimaryButton label="Entrar" onPress={handleSubmit} loading={isSubmitting} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
