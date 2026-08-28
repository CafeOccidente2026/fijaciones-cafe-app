import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { FormField } from "../../src/components/FormField";
import { Select } from "../../src/components/Select";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { UsersApi } from "../../src/api/usersApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { UserRole } from "../../src/types/auth.types";

const ROLE_OPTIONS = [
  { label: "Productor", value: "PRODUCER" },
  { label: "Encargado de precios", value: "PRICE_MANAGER" },
  { label: "Administrador", value: "ADMIN" },
];

function generatePassword(): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 10; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${result}1!`;
}

/**
 * ADMIN "crear usuario": username, password (typed or generated),
 * fullName, municipality and role. Calls POST /api/users.
 */
export default function CreateUserScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [role, setRole] = useState<UserRole | null>("PRODUCER");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!username.trim() || !password || !fullName.trim() || !role) {
      setFormError("Completa usuario, contraseña, nombre y rol");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await UsersApi.create({
        username: username.trim(),
        password,
        fullName: fullName.trim(),
        municipality: municipality.trim() || undefined,
        role,
      });
      router.back();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Crear usuario" showBack>
      <Card>
        <FormField
          label="Usuario"
          placeholder="nombre.usuario"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <FormField
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          autoCapitalize="none"
          secureToggle
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setPassword(generatePassword())} className="mb-5 -mt-3 self-start">
          <Text className="text-sm font-semibold text-primary-light">Generar contraseña</Text>
        </Pressable>

        <FormField
          label="Nombre completo"
          placeholder="Nombre y apellido"
          value={fullName}
          onChangeText={setFullName}
        />

        <FormField
          label="Municipio"
          placeholder="Ej. Ancuya"
          value={municipality}
          onChangeText={setMunicipality}
        />

        <Select
          label="Rol"
          value={role}
          options={ROLE_OPTIONS}
          onChange={(value) => setRole(value as UserRole)}
        />

        {formError ? <Text className="mb-3 text-sm text-danger">{formError}</Text> : null}

        <PrimaryButton label="Crear usuario" onPress={submit} loading={submitting} />
      </Card>

      <View className="h-8" />
    </Screen>
  );
}
