const checkAlreadySelected = (items: any[], key: string, value: string) => {
  console.log("line 2", items);
  if(items==null || items?.length === 0){
    return false;
  }

  return items?.some((item: any) => item[key] === value);
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
