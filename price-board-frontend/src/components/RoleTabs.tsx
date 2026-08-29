import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../theme/useThemeColors";
import { UnreadBadge } from "./UnreadBadge";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface RoleTab {
  /** Route file name inside the group, e.g. "index", "history". */
  name: string;
  title: string;
  icon: IoniconName;
  /** When set, mounts an UnreadBadge with this count on the tab's icon. */
  badgeCount?: number;
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
        // The tab navigator paints its own opaque scene background by
        // default, hiding the wood-texture ScreenBackground mounted at
        // the root layout. Transparent here lets it show through on
        // every tab screen of every role (visible and hidden alike).
        sceneStyle: { backgroundColor: "transparent" },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <View className="relative">
                <Ionicons name={tab.icon} color={color} size={size} />
                {tab.badgeCount !== undefined ? <UnreadBadge count={tab.badgeCount} /> : null}
              </View>
            ),
          }}
        />
      ))}
      {hidden.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
