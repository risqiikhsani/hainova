export const AUTH_COOKIE_NAME = "site_session";

/**
 * Computes SHA-256 hash of password using standard Web Crypto API.
 * Compatible with Next.js Edge Middleware and Node.js environments.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`hainova-salt:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Checks if WEBSITE_PASSWORD is set in environment variables.
 */
export function isPasswordProtectionEnabled(): boolean {
  const password = process.env.WEBSITE_PASSWORD;
  return typeof password === "string" && password.trim().length > 0;
}

/**
 * Verifies if a provided session cookie token matches the expected password hash.
 */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!isPasswordProtectionEnabled()) {
    return true; // Protection disabled
  }

  if (!token) {
    return false;
  }

  const expectedHash = await hashPassword(process.env.WEBSITE_PASSWORD!.trim());
  return token === expectedHash;
}
