import React from "react";
import { FormField } from "./FormField";
import { formatThousands } from "../utils/format";

interface CurrencyInputProps {
  label: string;
  /** Source of truth: raw digits only, e.g. "2500000". */
  value: string;
  onChangeValue: (rawDigits: string) => void;
  placeholder?: string;
}

/**
 * Single responsibility: a price field that stores raw digits but shows
 * them grouped with thousands separators live as the user types
 * ("2500000" -> "2.500.000"). Rendering is delegated to FormField.
 */
export function CurrencyInput({ label, value, onChangeValue, placeholder }: CurrencyInputProps) {
  return (
    <FormField
      label={label}
      placeholder={placeholder}
      keyboardType="numeric"
      value={formatThousands(value)}
      onChangeText={(text) => onChangeValue(text.replace(/\D/g, ""))}
    />
  );
}
