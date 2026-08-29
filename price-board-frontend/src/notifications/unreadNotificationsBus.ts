type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Single responsibility: a minimal pub/sub so every mounted
 * useUnreadNotificationsCount() instance can be told "refetch now" from
 * wherever the unread count might have changed - a notification marked
 * as read, or a push arriving while the app is open - without all of
 * them needing to share one piece of state.
 */
export function notifyUnreadNotificationsChanged(): void {
  listeners.forEach((listener) => listener());
}

export function onUnreadNotificationsChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
