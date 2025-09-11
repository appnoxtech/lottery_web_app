const checkAlreadySelected = (
  items: Record<string, string>[],
  key: string,
  value: string
) => {
  if (items == null || items?.length === 0) {
    return false;
  }

  return items?.some((item) => item[key] === value);
};

const euroConversion = (amount: number) => {
  const euro = amount * 0.6;
  return euro.toFixed(2);
};
const dollarConversion = (amount: number) => {
  const dollar = amount / 1.75;
  return dollar.toFixed(2);
};

export { checkAlreadySelected, euroConversion, dollarConversion };
