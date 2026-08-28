import React from "react";
import { RoleGuard } from "../../src/components/RoleGuard";
import { RoleTabs } from "../../src/components/RoleTabs";

export default function ProducerLayout() {
  return (
    <RoleGuard role="PRODUCER">
      <RoleTabs
        tabs={[
          { name: "index", title: "Fijar", icon: "pricetag-outline" },
          { name: "history", title: "Historial", icon: "time-outline" },
          { name: "notifications", title: "Avisos", icon: "notifications-outline" },
          { name: "profile", title: "Perfil", icon: "person-outline" },
        ]}
      />
    </RoleGuard>
  );
}
