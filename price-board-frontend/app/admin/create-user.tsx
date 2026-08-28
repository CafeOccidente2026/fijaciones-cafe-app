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
import { strings } from "../../src/constants/strings";

const ROLE_OPTIONS = [
  { label: strings.roles.PRODUCER, value: "PRODUCER" },
  { label: strings.roles.PRICE_MANAGER, value: "PRICE_MANAGER" },
  { label: strings.roles.ADMIN, value: "ADMIN" },
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
      setFormError(strings.createUser.missingFields);
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
    <Screen title={strings.createUser.title} showBack>
      <Card>
        <FormField
          label={strings.createUser.usernameLabel}
          placeholder={strings.createUser.usernamePlaceholder}
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <FormField
          label={strings.createUser.passwordLabel}
          placeholder={strings.createUser.passwordPlaceholder}
          autoCapitalize="none"
          secureToggle
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setPassword(generatePassword())} className="mb-5 -mt-3 self-start">
          <Text className="text-sm font-semibold text-primary-light dark:text-accent">
            {strings.createUser.generatePassword}
          </Text>
        </Pressable>

        <FormField
          label={strings.createUser.fullNameLabel}
          placeholder={strings.createUser.fullNamePlaceholder}
          value={fullName}
          onChangeText={setFullName}
        />

        <FormField
          label={strings.createUser.municipalityLabel}
          placeholder={strings.createUser.municipalityPlaceholder}
          value={municipality}
          onChangeText={setMunicipality}
        />

        <Select
          label={strings.createUser.roleLabel}
          value={role}
          options={ROLE_OPTIONS}
          onChange={(value) => setRole(value as UserRole)}
        />

        {formError ? (
          <Text className="mb-3 text-sm text-danger dark:text-danger-dark">{formError}</Text>
        ) : null}

        <PrimaryButton
          label={strings.createUser.createButton}
          onPress={submit}
          loading={submitting}
        />
      </Card>

      <View className="h-8" />
    </Screen>
  );
}
