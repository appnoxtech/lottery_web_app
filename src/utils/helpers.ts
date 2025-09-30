 const truncateString = (str: string, maxLength: number = 15): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
};
export default truncateString;