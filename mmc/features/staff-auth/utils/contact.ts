import type { Contact } from "../types";

export function maskIndianMobile(mobile: string) {
  if (!mobile) return "";
  const lastFour = mobile.slice(-4);
  const maskedCount = Math.max(mobile.length - lastFour.length, 0);
  const maskedHead = "*".repeat(Math.min(maskedCount, 5));
  const maskedMid = "*".repeat(Math.max(maskedCount - 5, 0));
  return `${maskedHead} ${maskedMid}${lastFour}`.trim();
}

export function maskEmail(email: string) {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visibleHead = local.slice(0, 2);
  const maskedTail = "*".repeat(Math.max(local.length - visibleHead.length, 1));
  return `${visibleHead}${maskedTail}@${domain}`;
}

/** Returns a privacy-masked, human-readable display string for a contact. */
export function formatContactDisplay(contact: Contact) {
  if (contact.kind === "phone") {
    const masked = maskIndianMobile(contact.value);
    return masked ? `+91 ${masked}` : "";
  }
  return maskEmail(contact.value);
}
