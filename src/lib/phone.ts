import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js/min";

/** Numbers typed without a country code are Curaçao numbers (the server uses the same rule). */
const DEFAULT_COUNTRY = "CW";

export const isValidPhone = (input: string) => isValidPhoneNumber(input.trim(), DEFAULT_COUNTRY);

/** "+599 9 518 1234" style, for showing the number back to the customer. */
export function prettyPhone(input: string): string {
  return parsePhoneNumberFromString(input, DEFAULT_COUNTRY)?.formatInternational() ?? input;
}
