import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/**
 * Format date consistently across the app
 * @param date - Date string or Date object
 * @param format - Format type: 'short' | 'long' | 'relative'
 * @returns Formatted date string
 */
export const formatDate = (
    date: string | Date,
    format: "short" | "long" | "relative" = "short"
): string => {
    if (!date) return "";

    const dateObj = dayjs(date);

    switch (format) {
        case "short":
            // DD/MM/YYYY format
            return dateObj.format("DD/MM/YYYY");
        case "long":
            // e.g., "January 15, 2025"
            return dateObj.format("MMMM DD, YYYY");
        case "relative":
            // e.g., "2 days ago"
            return dateObj.fromNow();
        default:
            return dateObj.format("DD/MM/YYYY");
    }
};

/**
 * Format date and time
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
    if (!date) return "";
    return dayjs(date).format("DD/MM/YYYY HH:mm");
};

/**
 * Format date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export const formatDateRange = (
    startDate: string | Date,
    endDate: string | Date
): string => {
    if (!startDate || !endDate) return "";
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Currency symbols map
 */
const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
};

/**
 * Format currency with proper symbol
 * @param amount - Amount to format
 * @param currency - Currency code (USD, EUR, GBP, INR)
 * @returns Formatted currency string
 */
export const formatCurrency = (
    amount: number,
    currency: string = "USD"
): string => {
    const symbol = currencySymbols[currency.toUpperCase()] || currency;
    const formattedAmount = amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${symbol}${formattedAmount}`;
};

/**
 * Format price per night
 * @param price - Price amount
 * @param currency - Currency code
 * @returns Formatted price string with "per night"
 */
export const formatPricePerNight = (
    price: number,
    currency: string = "USD"
): string => {
    return `${formatCurrency(price, currency)}/night`;
};
