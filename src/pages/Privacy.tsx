import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "../components/Logo";
import { LEGAL as L } from "../lib/legal";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="grid gap-3">
    <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
    {children}
  </section>
);

const Table = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <div className="overflow-x-auto rounded-xl border border-line">
    <table className="w-full text-left text-sm">
      <thead className="bg-ink-100 text-ink">
        <tr>
          {head.map((h) => (
            <th key={h} className="px-3 py-2 font-semibold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((r, i) => (
          <tr key={i} className="align-top">
            {r.map((c, j) => (
              <td key={j} className={`px-3 py-2 ${j === 0 ? "font-semibold text-ink" : ""}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Public page: no sign-in needed. The text follows what the apps really do (docs/PRIVACY_POLICY.md). */
export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-ink-700">
      <header className="bg-hero text-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <LogoMark size={36} />
          <span className="font-display text-xl font-extrabold tracking-tight">
            Hopi<span className="text-gold-400">Suerte</span>
          </span>
          <Link to="/" className="ml-auto text-sm font-medium text-white/80 hover:text-white">Back to the app</Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-3xl gap-8 px-4 py-8 leading-relaxed">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Privacy Policy</h1>
          <p className="mt-1 text-sm text-muted">Last updated: {L.lastUpdated}</p>
          <p className="mt-4">
            This policy explains what personal information HopiSuerte collects when you use the HopiSuerte app or website, why, who it is shared with, how long it is kept, and how you can see, correct or delete it.
          </p>
        </div>

        <Section title="1. Who we are">
          <p>
            HopiSuerte is run by <b>{L.company}</b>, {L.address}, Curaçao, Chamber of Commerce number {L.kvk}. We sell tickets for {L.lotteries} as {L.licence}.
          </p>
          <p>Questions about your data: <b>{L.privacyEmail}</b> or WhatsApp <b>{L.supportWhatsapp}</b>.</p>
        </Section>

        <Section title="2. What we collect">
          <Table
            head={["What", "When and why"]}
            rows={[
              ["Phone number", "You sign in with it; there is no password. We send a one-time code to it by SMS or WhatsApp. It also identifies your account, your tickets and your top-ups."],
              ["Name", "Only if you type it in. Shown on your account and your tickets."],
              ["Login codes", "Stored only in scrambled (hashed) form, never the code itself, with the time and the IP address of the request, to stop misuse. Deleted after 30 days."],
              ["Tickets", "The games, draws, numbers and amounts you buy, with date and time, so we can confirm your ticket, check results and pay prizes."],
              ["Balance and transactions", "Top-ups, ticket purchases, prizes and any corrections, with the balance after each one."],
              ["Top-up details", "When you top up, you pay through a payment page of our payment provider and then tell us on WhatsApp. We record the amount and the reference. Your card or bank details go to the payment provider, not to us."],
              ["Notification token", "Only if you allow notifications on your phone: a code that lets us send notifications to that phone, and whether it is Android or iPhone."],
              ["Technical logs", "Our server logs requests and errors, including IP addresses. Used only to keep the service working and secure. Deleted after 14 days."],
            ]}
          />
          <p>
            <b>What we do not collect:</b> your location, contacts, photos, camera, microphone or files. There are no ads, no advertising ID, no analytics or tracking tools, and we never sell your information.
          </p>
          <p>On your phone or browser we keep only what is needed to keep you signed in and which message you read last. We do not use tracking cookies.</p>
        </Section>

        <Section title="3. Why we use it">
          <ul className="list-disc space-y-1 pl-5">
            <li>To sign you in and keep your account safe.</li>
            <li>To sell you tickets, check them against the results and pay your prizes.</li>
            <li>To keep your balance and show you your history.</li>
            <li>To send you notifications you can switch off in your phone settings: ticket confirmed, top-up added, results, prizes, and important messages from us (for example a delayed draw).</li>
            <li>To answer your questions on WhatsApp.</li>
            <li>To prevent fraud and misuse, for example limits on how often a code can be requested, and suspending accounts that break the rules.</li>
            <li>To meet our legal duties, such as keeping financial records and lottery records.</li>
          </ul>
          <p>We rely on: the agreement with you when you use the service, our legal obligations, and our legitimate interest in preventing fraud.</p>
        </Section>

        <Section title="4. Who we share it with">
          <p>Only with the companies that help us run the service, and only what they need:</p>
          <Table
            head={["Company", "What for", "What they receive"]}
            rows={[
              [L.hosting, `Runs our servers, in ${L.hostingCountry}`, "All data above, stored for us"],
              ["Twilio", "Sends your login code by SMS", "Your phone number and the code"],
              ["Stripe", "Takes your top-up payment", "The payment details you enter on its page and the amount"],
              ["Expo (650 Industries, USA)", "Delivers notifications to your phone", "Notification token and the notification text"],
              ["Google (Firebase Cloud Messaging)", "Delivers notifications on Android", "Notification token and the notification text"],
              ["Apple (Push Notification service)", "Delivers notifications on iPhone", "Notification token and the notification text"],
            ]}
          />
          <p>When you write to us on WhatsApp, that chat is handled by WhatsApp under its own privacy policy.</p>
          <p>We also share information when the law requires it, for example with the police, the courts, the tax office or the gaming regulator.</p>
          <p>Some of these companies process data outside Curaçao, mainly in the United States. We only use companies that protect it with appropriate safeguards.</p>
        </Section>

        <Section title="5. How long we keep it">
          <Table
            head={["What", "How long"]}
            rows={[
              ["Phone number and name", "Until your account is deleted"],
              ["Tickets, prizes, balance and transactions", `${L.recordYears} years, because financial and lottery records must be kept. After your account is deleted they are kept without your name and phone number.`],
              ["Login codes", "30 days"],
              ["Technical logs", "14 days"],
              ["Notification token", "Until you sign out, your account is deleted, or the token stops working"],
              ["Backups", "Up to 14 days, after which they are overwritten"],
            ]}
          />
        </Section>

        <Section title="6. Your rights">
          <p>You can ask us to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>show you the personal information we hold about you;</li>
            <li>correct it (you can also change your name yourself in the app);</li>
            <li>delete your account (see section 7);</li>
            <li>stop using it for a purpose you object to, unless the law requires us to keep it.</li>
          </ul>
          <p>
            Write to <b>{L.privacyEmail}</b> or WhatsApp <b>{L.supportWhatsapp}</b>. We answer within 30 days. If you are not satisfied, you can complain to {L.authority}.
          </p>
        </Section>

        <Section title="7. Deleting your account">
          <ul className="list-disc space-y-1 pl-5">
            <li><b>In the app or on the website:</b> sign in, go to <b>Balance</b>, scroll to <b>Your account</b> and tap <b>Delete my account</b>.</li>
            <li><b>Or</b> send us a WhatsApp message from the phone number of your account.</li>
          </ul>
          <p>
            Before we delete it, we pay out your remaining balance and any prizes, and we wait for the results of tickets you already bought. Until then you can change your mind with <b>Keep my account</b>. We delete it within 30 days of your request.
          </p>
          <p>
            When your account is deleted, your name and phone number are erased, you are signed out everywhere and notifications stop. Tickets and transactions stay in our records without your name or number, as explained in section 5. If you sign in again later with the same number, you start a new, empty account.
          </p>
        </Section>

        <Section title="8. Age">
          <p>HopiSuerte is only for people aged <b>{L.minAge}</b> or older. We do not knowingly allow younger people to use it. If we find out that an account belongs to someone underage, we close it and return the balance.</p>
        </Section>

        <Section title="9. Security">
          <p>
            All connections to our servers are encrypted (HTTPS). Login codes are stored only in scrambled form. Staff can only see what their role needs, and every change they make is logged. The database is backed up every night. No system is perfectly safe; if a breach affects you, we will tell you and the authorities as the law requires.
          </p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>If we change this policy, we update the date at the top. For important changes we also send a message in the app.</p>
        </Section>

        <Section title="11. Contact">
          <p>
            {L.company}, {L.address}, Curaçao<br />
            E-mail: {L.privacyEmail}<br />
            WhatsApp: {L.supportWhatsapp}
          </p>
        </Section>
      </main>
    </div>
  );
}
