import QRCode from "qrcode";
import { DIGIT_TYPES, type DigitType } from "./entry";
import { fmtDateTime } from "./time";
import type { Ticket } from "./types";

/** Serial as shown to people: HS-XXXXX-XXXXX. */
export const prettySerial = (serial: string): string => `HS-${serial.slice(0, 5)}-${serial.slice(5)}`;

/** The QR code holds only the serial: nothing private is in it. */
export const qrDataUrl = (serial: string): Promise<string> => QRCode.toDataURL(serial, { margin: 1, width: 240, errorCorrectionLevel: "M" });

export interface RepeatData {
  games: string[];
  lines: { number: string; stake: string; digits: number }[];
}

/**
 * Turns the lines of an old ticket into what the purchase screen needs. A 3 or 2 digit line that is just the tail of a longer
 * line with the same amount is dropped, because the screen creates it again from the digit types.
 */
export function repeatToForm(data: RepeatData): { games: string[]; digits: DigitType[]; text: string } {
  const keep = data.lines.filter(
    (l) => !data.lines.some((o) => o.digits > l.digits && o.stake === l.stake && o.number.endsWith(l.number)),
  );
  const digits = DIGIT_TYPES.filter((d) => data.lines.some((l) => l.digits === d));
  return { games: data.games, digits, text: keep.map((l) => `${l.number}x${l.stake}`).join(" ") };
}

/** A picture of the ticket (serial, QR, numbers, total) to save or share. Drawn locally, nothing is uploaded. */
export async function ticketImage(ticket: Ticket): Promise<Blob> {
  const entries = ticket.entries ?? [];
  const W = 600;
  const rowH = 30;
  const H = 470 + entries.length * rowH + 60;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;

  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, W, H);
  c.fillStyle = "#0b3fa8";
  c.fillRect(0, 0, W, 90);
  c.fillStyle = "#ffffff";
  c.font = "bold 36px sans-serif";
  c.textAlign = "center";
  c.fillText("HopiSuerte", W / 2, 58);

  c.fillStyle = "#14213d";
  c.font = "bold 34px monospace";
  c.fillText(prettySerial(ticket.serial), W / 2, 150);
  c.fillStyle = "#5b6b86";
  c.font = "20px sans-serif";
  c.fillText(`${fmtDateTime(ticket.created_at)} · Curaçao time`, W / 2, 182);

  const qr = new Image();
  qr.src = await qrDataUrl(ticket.serial);
  await new Promise((resolve, reject) => {
    qr.onload = resolve;
    qr.onerror = reject;
  });
  c.drawImage(qr, (W - 240) / 2, 200, 240, 240);

  let y = 480;
  c.textAlign = "left";
  c.fillStyle = "#14213d";
  for (const e of entries) {
    c.font = "bold 22px monospace";
    c.fillText(`${e.game_code}  ${e.number}`, 40, y);
    c.font = "22px sans-serif";
    c.textAlign = "right";
    c.fillText(e.stake, W - 40, y);
    c.textAlign = "left";
    y += rowH;
  }
  c.fillStyle = "#14213d";
  c.fillRect(40, y - 12, W - 80, 2);
  c.font = "bold 26px sans-serif";
  c.fillText("Total", 40, y + 28);
  c.textAlign = "right";
  c.fillText(`XCG ${ticket.total}`, W - 40, y + 28);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not draw the ticket."))), "image/png"));
}

/** Share the picture with the phone's share sheet when it can, otherwise download it. Returns what happened. */
export async function shareTicket(ticket: Ticket): Promise<"shared" | "saved"> {
  const blob = await ticketImage(ticket);
  const file = new File([blob], `${prettySerial(ticket.serial)}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "My HopiSuerte ticket", text: `Ticket ${prettySerial(ticket.serial)}` });
      return "shared";
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return "shared"; // the customer closed the share sheet
    }
  }
  await saveTicket(ticket, blob);
  return "saved";
}

export async function saveTicket(ticket: Ticket, blob?: Blob): Promise<void> {
  const url = URL.createObjectURL(blob ?? (await ticketImage(ticket)));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${prettySerial(ticket.serial)}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
