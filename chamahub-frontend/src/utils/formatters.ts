// chamahub-frontend/src/utils/formatters.ts
/**
 * Formatters for currency, dates, and other data types
 */

/**
 * Format currency for Kenyan Shillings (KES)
 * @param amount - The amount to format
 * @param currency - Currency code (default: KES)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'KES'): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date with customizable options
 * @param dateString - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat('en-KE', options).format(date);
};

/**
 * Format phone number to Kenyan format
 * @param phoneNumber - Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format for Kenyan numbers
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    return `+254${cleaned}`;
  }
  
  return phoneNumber;
};

/**
 * Format percentage with decimal places
 * @param value - Percentage value (e.g., 0.15 for 15%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  const percentage = value * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Abbreviate large numbers (e.g., 1000 -> 1K, 1000000 -> 1M)
 * @param num - Number to abbreviate
 * @param decimals - Number of decimal places
 * @returns Abbreviated number string
 */
export const abbreviateNumber = (num: number, decimals: number = 1): string => {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(decimals)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(decimals)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(decimals)}K`;
  }
  return num.toString();
};

/**
 * Format file size in human readable format
 * @param bytes - Size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
