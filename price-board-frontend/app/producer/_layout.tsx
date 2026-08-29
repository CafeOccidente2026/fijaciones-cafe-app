import React from "react";
import { RoleGuard } from "../../src/components/RoleGuard";
import { RoleTabs } from "../../src/components/RoleTabs";
import { useUnreadNotificationsCount } from "../../src/hooks/useUnreadNotificationsCount";
import { strings } from "../../src/constants/strings";

export default function ProducerLayout() {
  const unreadCount = useUnreadNotificationsCount();

  return (
    <RoleGuard role="PRODUCER">
      <RoleTabs
        tabs={[
          { name: "index", title: strings.tabs.producer.fix, icon: "pricetag-outline" },
          { name: "history", title: strings.tabs.producer.history, icon: "time-outline" },
          {
            name: "notifications",
            title: strings.tabs.producer.notifications,
            icon: "notifications-outline",
            badgeCount: unreadCount,
          },
          { name: "profile", title: strings.tabs.producer.profile, icon: "person-outline" },
        ]}
      />
    </RoleGuard>
  );
}
