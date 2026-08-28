import React from "react";
import { FormField } from "./FormField";

interface PrefixedNumberInputProps {
  label: string;
  /** Fixed, non-erasable text shown before the number, e.g. "Kg: ". */
  prefix: string;
  /** Source of truth: raw digits only, e.g. "27". */
  value: string;
  onChangeValue: (rawDigits: string) => void;
}

/**
 * Single responsibility: a numeric field whose text always starts with a
 * fixed prefix the user can't delete (e.g. "Kg: 27"). Only the digits
 * after the prefix are editable; the caller gets just those digits.
 */
export function PrefixedNumberInput({ label, prefix, value, onChangeValue }: PrefixedNumberInputProps) {
  return (
    <FormField
      label={label}
      keyboardType="numeric"
      value={`${prefix}${value}`}
      onChangeText={(text) => {
        const withoutPrefix = text.startsWith(prefix) ? text.slice(prefix.length) : text;
        onChangeValue(withoutPrefix.replace(/\D/g, ""));
      }}
    />
  );
}
