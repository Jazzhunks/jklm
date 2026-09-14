import { queryClient } from "@/queryClient";

const CHANNEL_NAME = "northend_realtime_sync";

let channel = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      const data = event.data;
      if (data && data.type === "MUTATION") {
        // Silently invalidate all queries so UI updates in real-time
        queryClient.invalidateQueries();
      }
    };
  } catch (e) {
    console.warn("BroadcastChannel not supported in this environment", e);
  }
}

/**
 * Broadcasts a mutation event to update all active queries across all tabs/windows instantly.
 * @param {string} entity - e.g. "student", "payment", "expense", "lead", "attendance"
 * @param {string} action - e.g. "create", "update", "delete"
 * @param {any} payload - optional context
 */
export function broadcastMutation(entity, action, payload = {}) {
  // 1. Invalidate current client's queries immediately
  try {
    queryClient.invalidateQueries();
  } catch (e) {
    console.warn("Failed to invalidate queries on local client", e);
  }

  // 2. Broadcast to other tabs/windows
  if (channel) {
    try {
      channel.postMessage({
        type: "MUTATION",
        entity,
        action,
        payload,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn("Failed to post message on BroadcastChannel", e);
    }
  }
}
