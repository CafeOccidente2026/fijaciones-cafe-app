import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/useThemeColors";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface RoleTab {
  /** Route file name inside the group, e.g. "index", "history". */
  name: string;
  title: string;
  icon: IoniconName;
}

/**
 * Single responsibility: render the bottom tab bar for a role group with
 * the app palette, plus hide any non-tab routes passed in `hidden`.
 */
export function RoleTabs({ tabs, hidden = [] }: { tabs: RoleTab[]; hidden?: string[] }) {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} color={color} size={size} />,
          }}
        />
      ))}
      {hidden.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
