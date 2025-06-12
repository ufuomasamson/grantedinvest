export const formatNumber = (value: number): string => {
  if (isNaN(value)) return '0.00';
  
  // For large numbers (>= 1), show 2 decimal places
  if (Math.abs(value) >= 1) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  
  // For small numbers (< 1), show up to 8 decimal places
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}; 