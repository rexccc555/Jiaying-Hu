import { getStore } from "@netlify/blobs";
import type { Store } from "./cards.ts";

export function cardStore(): Store {
  const blobs = getStore({ name: "cards", consistency: "strong" });
  return {
    get: (key) => blobs.get(key, { type: "json" }),
    set: async (key, value) => {
      await blobs.setJSON(key, value);
    },
    delete: (key) => blobs.delete(key),
    list: async (prefix) => (await blobs.list({ prefix })).blobs.map((blob) => blob.key),
  };
}
