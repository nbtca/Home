import dayjs from "dayjs"

/**
 * Common date format patterns used across the application
 */
export const DateFormats = {
  /** Format: YYYY-MM-DD HH:mm (e.g., 2024-01-15 13:45) */
  DATETIME: "YYYY-MM-DD HH:mm",
  /** Format: YYYY-MM-DD (e.g., 2024-01-15) */
  DATE: "YYYY-MM-DD",
  /** Format: MM-DD HH:mm (e.g., 01-15 13:45) */
  SHORT_DATETIME: "MM-DD HH:mm",
} as const

/**
 * Formats a date string or Date object to datetime format (YYYY-MM-DD HH:mm)
 */
export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format(DateFormats.DATETIME)
}

/**
 * Formats a date string or Date object to date format (YYYY-MM-DD)
 */
export const formatDate = (date: string | Date): string => {
  return dayjs(date).format(DateFormats.DATE)
}

/**
 * Formats a date string or Date object to short datetime format (MM-DD HH:mm)
 */
export const formatShortDateTime = (date: string | Date): string => {
  return dayjs(date).format(DateFormats.SHORT_DATETIME)
}
