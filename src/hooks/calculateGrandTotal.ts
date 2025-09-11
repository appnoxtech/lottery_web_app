export const useCalculateTotal = (
  items: Record<string, string>[],
  field: string
): number => {
  return items.reduce(
    (total: number, item) => total + Number(item?.[field] || 0),
    0
  );
};
