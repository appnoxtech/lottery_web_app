import { AsYouType, getCountries, getCountryCallingCode, getExampleNumber, isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/max";
import examples from "libphonenumber-js/examples.mobile.json";

/** Numbers typed without a country code are Curaçao numbers (the server uses the same rule). */
export const DEFAULT_COUNTRY: CountryCode = "CW";

/**
 * Uses the full ("max") metadata so the check matches the server, which validates with the complete
 * libphonenumber: each country's real number length and pattern, not just a plausible length.
 * `country` is the one picked in the country selector; a number typed with its own "+" code wins over it.
 */
export const isValidPhone = (input: string, country: CountryCode = DEFAULT_COUNTRY) => isValidPhoneNumber(input.trim(), country);

/** E.164 ("+59995181234") for what the customer typed, or null if it is not a number. */
export const toE164 = (input: string, country: CountryCode = DEFAULT_COUNTRY) => parsePhoneNumberFromString(input.trim(), country)?.number ?? null;

/** "+599 9 518 1234" style, for showing the number back to the customer. */
export function prettyPhone(input: string): string {
  return parsePhoneNumberFromString(input, DEFAULT_COUNTRY)?.formatInternational() ?? input;
}

export type Country = { code: CountryCode; name: string; dial: string };

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

/** Every country libphonenumber knows, Curaçao first, the rest by name. */
export const COUNTRIES: Country[] = getCountries()
  .map((code) => ({ code, name: regionNames?.of(code) ?? code, dial: getCountryCallingCode(code) }))
  .sort((a, b) => (a.code === DEFAULT_COUNTRY ? -1 : b.code === DEFAULT_COUNTRY ? 1 : a.name.localeCompare(b.name)));

const maxDigitsCache = new Map<CountryCode, number>();

/**
 * The most digits a mobile number of the country has, without the country code (India 10, Curaçao 8,
 * Brazil 11). libphonenumber only lists loose per-country lengths (they include toll-free and
 * short numbers), so this starts from the country's example mobile number and probes longer lengths
 * against the real mobile patterns. Worked out once per country.
 */
export function maxDigits(country: CountryCode): number {
  const cached = maxDigitsCache.get(country);
  if (cached) return cached;
  const example = getExampleNumber(country, examples);
  let best = example?.nationalNumber.length ?? 15;
  if (example) {
    const nsn = example.nationalNumber;
    const dial = getCountryCallingCode(country);
    const head = nsn.slice(0, 3);
    for (let len = best + 1; len <= 15 - dial.length; len++) {
      for (let d = 0; d < 10; d++) {
        const p = parsePhoneNumberFromString(`+${dial}${head}${String(d).repeat(len - head.length)}`);
        if (p?.country === country && p.isValid() && (p.getType() === "MOBILE" || p.getType() === "FIXED_LINE_OR_MOBILE")) {
          best = len;
          break;
        }
      }
    }
  }
  maxDigitsCache.set(country, best);
  return best;
}

/** True once the input has more digits than a number of the selected country (or of the "+" code typed) can have. */
export function hasTooManyDigits(input: string, country: CountryCode = DEFAULT_COUNTRY): boolean {
  const text = input.trim();
  const digits = text.replace(/\D/g, "");
  if (!text.startsWith("+")) return digits.length > maxDigits(country);

  if (digits.length > 15) return true; // E.164 never has more than 15 digits
  const dial = getCallingCode(text);
  if (!dial) return false; // the code itself is still being typed
  const caps = getCountries().filter((c) => getCountryCallingCode(c) === dial).map(maxDigits);
  return digits.length - dial.length > Math.max(...caps);
}

/** The calling code at the start of a "+..." number ("91" for "+9198765"), once it is complete. */
function getCallingCode(text: string): string | undefined {
  const typer = new AsYouType();
  typer.input(text);
  return typer.getCallingCode();
}

/** A sample local number for the country ("9 518 1234"), shown as the placeholder. */
export const examplePhone = (country: CountryCode) => getExampleNumber(country, examples)?.formatNational() ?? "";

/** Keeps only what a phone number can contain, so letters and symbols never reach the field. */
export const cleanPhoneInput = (value: string) => value.replace(/[^\d+\s()\-.]/g, "").replace(/(?!^)\+/g, "");

export const flagUrl = (code: string) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
