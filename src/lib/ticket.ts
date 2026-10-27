/** Serial as shown to people: HS-XXXXX-XXXXX. */
export const prettySerial = (serial: string): string => `HS-${serial.slice(0, 5)}-${serial.slice(5)}`;
