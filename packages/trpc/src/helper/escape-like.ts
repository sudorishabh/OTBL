/**
 * Escapes MySQL LIKE special characters in a user-supplied search string.
 * Without escaping, a user can craft inputs like "%a%a%a%a%" that cause
 * catastrophic backtracking in the DB engine (SQL-LIKE ReDoS).
 *
 * MySQL LIKE special characters:
 *   %  — matches any sequence of characters
 *   _  — matches any single character
 *   \  — escape character itself
 *
 * Usage:
 *   like(table.column, `%${escapeLike(userInput)}%`)
 */
export const escapeLike = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
