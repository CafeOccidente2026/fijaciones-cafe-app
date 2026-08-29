import React from "react";
import { RoleGuard } from "../../src/components/RoleGuard";
import { RoleTabs } from "../../src/components/RoleTabs";
import { strings } from "../../src/constants/strings";

export default function PriceManagerLayout() {
  return (
    <RoleGuard role="PRICE_MANAGER">
      <RoleTabs
        tabs={[
          { name: "index", title: strings.tabs.priceManager.today, icon: "today-outline" },
          { name: "history", title: strings.tabs.priceManager.history, icon: "time-outline" },
          { name: "update-price", title: strings.tabs.priceManager.updatePrice, icon: "cash-outline" },
          { name: "send-notification", title: strings.tabs.priceManager.sendNotification, icon: "send-outline" },
          { name: "profile", title: strings.tabs.priceManager.profile, icon: "person-outline" },
        ]}
        hidden={["today-detail/[coffeeTypeId]", "notifications-history"]}
      />
    </RoleGuard>
  );
}
