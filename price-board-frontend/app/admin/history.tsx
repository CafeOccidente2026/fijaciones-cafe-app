import React, { useState } from "react";
import { Screen } from "../../src/components/Screen";
import { SegmentedControl } from "../../src/components/SegmentedControl";
import { FixingHistoryView } from "../../src/components/FixingHistoryView";
import { PriceHistoryView } from "../../src/components/PriceHistoryView";
import { strings } from "../../src/constants/strings";

type Tab = "fixings" | "prices";

/** ADMIN's Historial: fijaciones (existing) or cambios de precio, one tap apart. */
export default function AdminHistoryScreen() {
  const [tab, setTab] = useState<Tab>("fixings");

  return (
    <Screen title={strings.history.title} scroll={false}>
      <SegmentedControl
        options={[
          { key: "fixings" as const, label: strings.priceHistory.fixingsTab },
          { key: "prices" as const, label: strings.priceHistory.pricesTab },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "fixings" ? <FixingHistoryView allowUserFilter embedded /> : <PriceHistoryView />}
    </Screen>
  );
}
