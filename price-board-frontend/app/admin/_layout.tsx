import React from "react";
import { RoleGuard } from "../../src/components/RoleGuard";
import { RoleTabs } from "../../src/components/RoleTabs";
import { strings } from "../../src/constants/strings";

export default function AdminLayout() {
  return (
    <RoleGuard role="ADMIN">
      <RoleTabs
        tabs={[
          { name: "index", title: strings.tabs.admin.users, icon: "people-outline" },
          { name: "coffee-types", title: strings.tabs.admin.coffeeTypes, icon: "cafe-outline" },
          { name: "history", title: strings.tabs.admin.history, icon: "time-outline" },
          { name: "chart", title: strings.tabs.admin.chart, icon: "bar-chart-outline" },
          { name: "notify", title: strings.tabs.admin.notify, icon: "send-outline" },
          { name: "profile", title: strings.tabs.admin.profile, icon: "person-outline" },
        ]}
        hidden={[
          "create-user",
          "notifications-history",
          "weekly-history",
          "weekly-detail",
          "weekly-by-user/[coffeeTypeId]",
          "weekly-by-user/[coffeeTypeId]/[userId]",
        ]}
      />
    </RoleGuard>
  );
}
