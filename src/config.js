const contact = String(
  import.meta.env.VITE_PRIVACY_CONTACT || ""
).trim();

export const config = Object.freeze({
  endpoint: String(import.meta.env.VITE_ENDPOINT || "").trim(),
  privacyContact: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    ? contact
    : "",
  privacyVersion: "2026-11-02",
  retentionDays: 90,
  schemaVersion: 1
});

export const isRemote = Boolean(config.endpoint);
export const emailEnabled = Boolean(config.privacyContact);

export function publicAsset(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
