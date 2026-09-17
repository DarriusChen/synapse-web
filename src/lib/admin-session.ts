export const ADMIN_COOKIE = "synapse_admin";

const SESSION_PAYLOAD = "synapse-admin-session";

export async function createAdminSessionToken(secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(SESSION_PAYLOAD),
  );

  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function equalHex(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function isAdminSessionToken(token: string | undefined) {
  const secret = process.env.ADMIN_PASSWORD;

  if (!secret || !token) {
    return false;
  }

  const expected = await createAdminSessionToken(secret);
  return equalHex(token, expected);
}

export function safeAdminPath(from: string | null | undefined) {
  if (
    !from ||
    !from.startsWith("/admin") ||
    from.startsWith("//") ||
    from.includes("://") ||
    from.startsWith("/admin/login")
  ) {
    return "/admin/topics";
  }

  return from;
}
