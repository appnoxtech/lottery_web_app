export const useCalculateTotal = (items: any[], field: string): number => {
  return items.reduce(
    (total: number, item: any) => total + (item?.[field] || 0),
    0
  );
};
