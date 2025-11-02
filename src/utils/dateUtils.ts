/**
 * Utility functions for handling dates consistently across the application
 */

/**
 * Formats a date string to local date string without timezone issues
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export const formatDateString = (dateString: string): string => {
    if (!dateString) return '';
    // Add time component to avoid timezone conversion issues
    return new Date(dateString + 'T00:00:00').toLocaleDateString();
};

/**
 * Formats a date string with custom options
 * @param dateString - Date string in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDateStringWithOptions = (
    dateString: string,
    options: Intl.DateTimeFormatOptions
): string => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
};

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns Today's date string
 */
export const getTodayDateString = (): string => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Adds days to a date string
 * @param dateString - Date string in YYYY-MM-DD format
 * @param days - Number of days to add
 * @returns New date string
 */
export const addDaysToDateString = (dateString: string, days: number): string => {
    const date = new Date(dateString + 'T00:00:00');
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

/**
 * Checks if a date is in the future
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if date is in the future
 */
export const isDateInFuture = (dateString: string): boolean => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
};

/**
 * Checks if a date is today or in the past
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if date is today or in the past
 */
export const isDateTodayOrPast = (dateString: string): boolean => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
};