/** Stripe payment links the customer uses to pay a top-up. The payment is converted and credited in XCG. */
export const PAY_LINKS = [
  { label: "Pay in Dollars", url: "https://buy.stripe.com/eVq28s1eS6gbcmp1TO5Ne0o" },
  { label: "Pay in Euro", url: "https://buy.stripe.com/4gMcN64r4bAv5Y12XS5Ne0p" },
  { label: "Pay in XCG", url: "https://buy.stripe.com/cNibJ2g9McEzdqtdCw5Ne0q" },
] as const;

export const PAY_INTRO = "Use one of these links to pay in Dollars, Euro or XCG, whichever suits your country. Your payment is converted and credited to your HopiSuerte balance in XCG. All prizes are in XCG.";
export const PAY_NOTE = "When your payment is done, tap \"I have paid\" so we can credit your balance.";
