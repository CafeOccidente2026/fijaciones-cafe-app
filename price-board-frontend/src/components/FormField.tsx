import React, { useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";

interface FormFieldProps extends TextInputProps {
  label: string;
  /**
   * Muestra un boton de "ojo" a la derecha para revelar u ocultar el
   * texto. Pensado para campos de contraseña; el campo empieza oculto.
   */
  secureToggle?: boolean;
}

/**
 * Single responsibility: one styled labeled text input, reused across
 * every form in the app (login, create user, etc.) for visual consistency.
 */
export function FormField({ label, secureToggle = false, ...inputProps }: FormFieldProps) {
  const [isHidden, setIsHidden] = useState(true);
  const isSecure = secureToggle ? isHidden : inputProps.secureTextEntry;

  return (
    <View className="mb-5">
      <Text className="mb-2 text-xs font-semibold tracking-wide text-muted">
        {label.toUpperCase()}
      </Text>
      <View>
        <TextInput
          placeholderTextColor="#B79A94"
          className={`rounded-xl border border-border bg-background px-4 py-3 text-base text-primary ${
            secureToggle ? "pr-12" : ""
          }`}
          {...inputProps}
          secureTextEntry={isSecure}
        />
        {secureToggle && (
          <Pressable
            onPress={() => setIsHidden((prev) => !prev)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isHidden ? "Mostrar contraseña" : "Ocultar contraseña"}
            className="absolute bottom-0 right-1 top-0 justify-center px-2"
          >
            <Text className="text-lg">{isHidden ? "👁️" : "🙈"}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
