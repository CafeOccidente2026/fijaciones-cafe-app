import React from "react";
import { RoleGuard } from "../../src/components/RoleGuard";
import { RoleTabs } from "../../src/components/RoleTabs";

export default function PriceManagerLayout() {
  return (
    <RoleGuard role="PRICE_MANAGER">
      <RoleTabs
        tabs={[
          { name: "index", title: "Hoy", icon: "today-outline" },
          { name: "history", title: "Historial", icon: "time-outline" },
          { name: "update-price", title: "Precio", icon: "cash-outline" },
          { name: "send-notification", title: "Notificar", icon: "send-outline" },
          { name: "profile", title: "Perfil", icon: "person-outline" },
        ]}
        hidden={["today-detail/[coffeeTypeId]"]}
      />
    </RoleGuard>
  );
}
