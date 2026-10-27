// ===================================================================
// GymFlow — Centralized Indian Localization & Formatting Utilities
// ===================================================================

/**
 * Formats a numeric currency value into Indian Rupees (INR).
 * Never format currency independently in individual components.
 * Example: 125000 -> ₹1,25,000.00
 */
export const formatINR = (
  value: number,
  options?: {
    showDecimals?: boolean;
  }
): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '₹0.00';
  }
  const num = Number(value);
  const showDecimals = options?.showDecimals ?? true;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);
};

/**
 * Indian digit grouping for numbers, counts, and metrics:
 * 1000 -> 1,000
 * 100000 -> 1,00,000
 * 1250000 -> 12,50,000
 */
export const formatNumber = (
  value: number,
  options?: { maxFractionDigits?: number }
): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: options?.maxFractionDigits ?? 2,
  }).format(Number(value));
};

/**
 * Displays percentages with sensible precision, for example 12.5%.
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0%';
  }
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Consistent date formatting: DD MMM YYYY (e.g. 27 Oct 2026)
 * Retains valid ISO dates or timestamps internally without timezone drift.
 */
export const formatDate = (
  dateInput: string | number | Date | null | undefined
): string => {
  if (!dateInput) return '—';
  try {
    // If string in YYYY-MM-DD format, parse parts directly to avoid UTC shift
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split('-').map(Number);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`;
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
};

/**
 * Formats date and time: DD MMM YYYY, hh:mm A
 */
export const formatDateTime = (
  dateInput: string | number | Date | null | undefined
): string => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const dateStr = formatDate(d);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${dateStr}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  } catch {
    return String(dateInput);
  }
};
