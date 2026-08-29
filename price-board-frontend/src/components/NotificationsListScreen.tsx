import React from "react";
import { Screen } from "./Screen";
import { NotificationsInboxList } from "./NotificationsInboxList";
import { strings } from "../constants/strings";

/**
 * Single responsibility: the notifications inbox tab, identical for
 * every role - just the shared page shell around NotificationsInboxList.
 */
export function NotificationsListScreen() {
  return (
    <Screen title={strings.notificationsInbox.title} scroll={false}>
      <NotificationsInboxList />
    </Screen>
  );
}
