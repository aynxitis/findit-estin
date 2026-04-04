import { z } from "zod";

export const ALLOWED_EMAIL_DOMAIN = "estin.dz";

/**
 * Validates that an email belongs to the allowed domain
 */
export const emailDomainSchema = z
  .string()
  .email("Invalid email address")
  .refine(
    (email) => email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`),
    `Only @${ALLOWED_EMAIL_DOMAIN} accounts are allowed`
  );

/**
 * User profile schema
 */
export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: emailDomainSchema,
  photo: z.string().url().nullable().optional(),
});

/**
 * Auth error codes
 */
export const AUTH_ERROR_CODES = {
  INVALID_DOMAIN: "auth/invalid-domain",
  POPUP_CLOSED: "auth/popup-closed-by-user",
  NETWORK_ERROR: "auth/network-request-failed",
  CANCELLED: "auth/cancelled-popup-request",
} as const;

/**
 * Get user-friendly error message for auth errors
 */
export function getAuthErrorMessage(code: string): string {
  switch (code) {
    case AUTH_ERROR_CODES.INVALID_DOMAIN:
      return `Only @${ALLOWED_EMAIL_DOMAIN} accounts are accepted.`;
    case AUTH_ERROR_CODES.POPUP_CLOSED:
      return "Sign-in was cancelled. Please try again.";
    case AUTH_ERROR_CODES.NETWORK_ERROR:
      return "Network error. Please check your connection.";
    case AUTH_ERROR_CODES.CANCELLED:
      return "Sign-in was cancelled. Please try again.";
    default:
      return "An error occurred during sign-in. Please try again.";
  }
}
