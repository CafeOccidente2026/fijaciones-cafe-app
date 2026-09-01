import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useThemeColors } from "../theme/useThemeColors";
import { PriceFixingsApi } from "../api/priceFixingsApi";
import { getApiErrorMessage } from "../api/apiError";
import { strings } from "../constants/strings";

interface DownloadReportButtonProps {
  /** Omitted = current week, same as the chart it sits under. */
  weekStart?: string;
}

/**
 * Single responsibility: fetch the weekly PDF report and hand it to the
 * OS share sheet. Expo has no universal "Downloads" folder across
 * platforms, so sharing (save / send via WhatsApp / etc.) is the
 * standard way to let the user keep the file.
 */
export function DownloadReportButton({ weekStart }: DownloadReportButtonProps) {
  const colors = useThemeColors();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setError(null);
    setDownloading(true);
    try {
      const buffer = await PriceFixingsApi.weeklyReportPdf(weekStart);

      const file = new File(Paths.cache, `reporte-semanal-${weekStart ?? "actual"}.pdf`);
      if (file.exists) file.delete();
      file.create();
      file.write(new Uint8Array(buffer));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: "application/pdf" });
      }
    } catch (err) {
      setError(getApiErrorMessage(err, strings.adminChart.downloadError));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <View>
      <Pressable
        onPress={download}
        disabled={downloading}
        accessibilityRole="button"
        className="flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card/90 py-3.5 hover:opacity-90 active:opacity-80 dark:border-border-dark dark:bg-card-dark/90"
      >
        <Ionicons name="download-outline" size={18} color={colors.primary} />
        <Text className="text-sm font-semibold text-primary dark:text-white">
          {downloading ? strings.adminChart.downloading : strings.adminChart.downloadReport}
        </Text>
      </Pressable>
      {error ? (
        <Text className="mt-2 text-xs text-danger dark:text-danger-dark">{error}</Text>
      ) : null}
    </View>
  );
}
