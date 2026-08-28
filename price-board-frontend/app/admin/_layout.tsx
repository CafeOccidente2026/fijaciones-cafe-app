import React from "react";
import { RoleGuard } from "../../src/components/RoleGuard";
import { RoleTabs } from "../../src/components/RoleTabs";

export default function AdminLayout() {
  return (
    <RoleGuard role="ADMIN">
      <RoleTabs
        tabs={[
          { name: "index", title: "Usuarios", icon: "people-outline" },
          { name: "coffee-types", title: "Precios", icon: "cafe-outline" },
          { name: "history", title: "Historial", icon: "time-outline" },
          { name: "chart", title: "Gráfico", icon: "bar-chart-outline" },
          { name: "profile", title: "Perfil", icon: "person-outline" },
        ]}
        hidden={["create-user"]}
      />
    </RoleGuard>
  );
}
