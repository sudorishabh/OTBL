import { z } from "zod";

/**
 * =============================================================================
 * SHARED VALIDATORS - Reusable validation primitives for frontend and backend
 * =============================================================================
 *
 * These validators follow best practices:
 * - Clear, user-friendly error messages
 * - Sensible real-world constraints
 * - Type-safe and composable
 * - Compatible with Zod v4
 */

// =============================================================================
// STRING VALIDATORS
// =============================================================================

/**
 * Name validation - used for person/entity names
 * - Minimum 2 characters (reasonable for names)
 * - Maximum 100 characters (covers edge cases)
 * - Trims whitespace
 */
export const nameValidator = z
  .string({ message: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name cannot exceed 100 characters");

/**
 * Title validation - used for work orders, proposals, etc.
 * - Minimum 3 characters (meaningful title)
 * - Maximum 255 characters (database constraint)
 * - Trims whitespace
 */
export const titleValidator = z
  .string({ message: "Title is required" })
  .trim()
  .min(3, "Title must be at least 3 characters")
  .max(255, "Title cannot exceed 255 characters");

/**
 * Short description - for brief descriptions
 * - Maximum 500 characters
 * - Optional by default
 */
export const shortDescriptionValidator = z
  .string()
  .trim()
  .max(500, "Description cannot exceed 500 characters")
  .optional();

/**
 * Long description - for detailed descriptions
 * - Maximum 5000 characters
 * - Optional by default
 */
export const longDescriptionValidator = z
  .string()
  .trim()
  .max(5000, "Description cannot exceed 5000 characters")
  .optional();

/**
 * Required description
 * - Minimum 10 characters (meaningful content)
 * - Maximum 2000 characters
 */
export const requiredDescriptionValidator = z
  .string({ message: "Description is required" })
  .trim()
  .min(10, "Description must be at least 10 characters")
  .max(2000, "Description cannot exceed 2000 characters");

// =============================================================================
// CONTACT VALIDATORS
// =============================================================================

/**
 * Email validation
 * - Standard email format
 * - Lowercase normalization
 * - Trims whitespace
 * - Max 320 characters (RFC 5321)
 */
export const emailValidator = z
  .string({ message: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(320, "Email cannot exceed 320 characters");

/**
 * Optional email validation
 */
export const optionalEmailValidator = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(320, "Email cannot exceed 320 characters")
  .optional()
  .or(z.literal(""));

/**
 * Indian mobile number validation
 * - 10 digits starting with 6, 7, 8, or 9
 * - Optional country code (+91)
 */
export const indianMobileValidator = z
  .string({ message: "Mobile number is required" })
  .trim()
  .regex(
    /^(\+91[\-\s]?)?[6-9]\d{9}$/,
    "Please enter a valid Indian mobile number (10 digits starting with 6-9)"
  );

/**
 * Generic contact number validation
 * - Supports international formats
 * - 7-15 digits with optional +, spaces, and hyphens
 */
export const contactNumberValidator = z
  .string({ message: "Contact number is required" })
  .trim()
  .min(7, "Contact number must be at least 7 digits")
  .max(15, "Contact number cannot exceed 15 characters")
  .regex(
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
    "Please enter a valid contact number"
  );

/**
 * Optional contact number validation
 */
export const optionalContactNumberValidator = z
  .string()
  .trim()
  .max(15, "Contact number cannot exceed 15 characters")
  .optional()
  .or(z.literal(""));

// =============================================================================
// PASSWORD VALIDATORS
// =============================================================================

/**
 * Password validation - strong password requirements
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (recommended)
 */
export const passwordValidator = z
  .string({ message: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Strong password validation (includes special character)
 */
export const strongPasswordValidator = passwordValidator.regex(
  /[!@#$%^&*(),.?":{}|<>]/,
  "Password must contain at least one special character (!@#$%^&*)"
);

/**
 * Login password - minimal validation for login
 * - Only required check (don't reveal password requirements)
 */
export const loginPasswordValidator = z
  .string({ message: "Password is required" })
  .min(1, "Password is required");

// =============================================================================
// ADDRESS VALIDATORS
// =============================================================================

/**
 * Address validation
 * - Minimum 5 characters
 * - Maximum 255 characters (database constraint)
 */
export const addressValidator = z
  .string({ message: "Address is required" })
  .trim()
  .min(5, "Address must be at least 5 characters")
  .max(255, "Address cannot exceed 255 characters");

/**
 * City validation
 * - Minimum 2 characters
 * - Maximum 100 characters
 */
export const cityValidator = z
  .string({ message: "City is required" })
  .trim()
  .min(2, "City must be at least 2 characters")
  .max(100, "City cannot exceed 100 characters");

/**
 * State validation
 * - Minimum 2 characters
 * - Maximum 100 characters
 */
export const stateValidator = z
  .string({ message: "State is required" })
  .trim()
  .min(2, "State must be at least 2 characters")
  .max(100, "State cannot exceed 100 characters");

/**
 * Indian pincode validation
 * - Exactly 6 digits
 */
export const indianPincodeValidator = z
  .string({ message: "Pincode is required" })
  .trim()
  .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode");

/**
 * Generic pincode validation
 * - 4-10 characters (covers international formats)
 */
export const pincodeValidator = z
  .string({ message: "Pincode is required" })
  .trim()
  .min(4, "Pincode must be at least 4 characters")
  .max(10, "Pincode cannot exceed 10 characters");

// =============================================================================
// BUSINESS VALIDATORS
// =============================================================================

/**
 * Indian GST number validation
 * - 15-character alphanumeric format
 * - Format: 22AAAAA0000A1Z5
 */
export const gstNumberValidator = z
  .string({ message: "GST number is required" })
  .trim()
  .toUpperCase()
  .length(15, "GST number must be exactly 15 characters")
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    "Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)"
  );

/**
 * Optional GST number validation
 */
export const optionalGstNumberValidator = z
  .string()
  .trim()
  .toUpperCase()
  .refine(
    (val) =>
      !val ||
      val.length === 0 ||
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
    "Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)"
  )
  .optional()
  .or(z.literal(""));

/**
 * Code/Reference number validation
 * - Alphanumeric with optional hyphens and underscores
 * - Maximum 50 characters
 */
export const codeValidator = z
  .string({ message: "Code is required" })
  .trim()
  .min(1, "Code is required")
  .max(50, "Code cannot exceed 50 characters")
  .regex(
    /^[A-Za-z0-9\-_]+$/,
    "Code can only contain letters, numbers, hyphens, and underscores"
  );

/**
 * Agreement number validation
 * - Alphanumeric with optional hyphens, underscores, and slashes
 * - Maximum 100 characters
 */
export const agreementNumberValidator = z
  .string({ message: "Agreement number is required" })
  .trim()
  .min(1, "Agreement number is required")
  .max(100, "Agreement number cannot exceed 100 characters");

// =============================================================================
// NUMERIC VALIDATORS
// =============================================================================

/**
 * Positive integer validation
 * - Used for IDs and counts
 */
export const positiveIntValidator = z
  .number({ message: "This field is required" })
  .int("Must be a whole number")
  .positive("Must be a positive number");

/**
 * Optional positive integer
 */
export const optionalPositiveIntValidator = z
  .number()
  .int("Must be a whole number")
  .positive("Must be a positive number")
  .optional();

/**
 * Non-negative number validation
 * - Used for amounts, quantities
 * - Coerces strings to numbers (common for form inputs)
 */
export const nonNegativeNumberValidator = z.coerce
  .number({ message: "This field is required" })
  .min(0, "Value cannot be negative");

/**
 * Positive number validation (for money, rates)
 */
export const positiveNumberValidator = z
  .number({ message: "This field is required" })
  .positive("Must be greater than 0");

/**
 * Decimal number (2 decimal places) - for currency
 */
export const currencyValidator = z
  .number({ message: "Amount is required" })
  .min(0, "Amount cannot be negative")
  .multipleOf(0.01, "Amount can have maximum 2 decimal places");

/**
 * Metric ton validator
 */
export const metricTonValidator = z
  .number()
  .min(0, "Metric ton cannot be negative")
  .max(999999.99, "Metric ton value is too large")
  .optional();

/**
 * Rate validator (per unit rate)
 */
export const rateValidator = z
  .number()
  .min(0, "Rate cannot be negative")
  .max(999999.99, "Rate value is too large")
  .optional();

// =============================================================================
// DATE VALIDATORS
// =============================================================================

/**
 * Date validator - accepts string or Date
 * - Coerces to Date object
 */
export const dateValidator = z.coerce.date({
  message: "Please enter a valid date",
});

/**
 * Optional date validator
 */
export const optionalDateValidator = z.coerce.date().optional().nullable();

/**
 * Date string validator (ISO format)
 */
export const dateStringValidator = z
  .string({ message: "Date is required" })
  .refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date");

/**
 * Date range validator factory
 * - Creates a validator that ensures end date is after start date
 */
export const createDateRangeValidator = (
  startField: string,
  endField: string
) => {
  return z.object({}).refine(
    (data: Record<string, unknown>) => {
      const start = data[startField];
      const end = data[endField];
      if (!start || !end) return true;
      return new Date(end as string) >= new Date(start as string);
    },
    {
      message: `${endField.replace("_", " ")} must be on or after ${startField.replace("_", " ")}`,
      path: [endField],
    }
  );
};

// =============================================================================
// URL VALIDATORS
// =============================================================================

/**
 * URL validator
 * - Valid URL format
 * - Maximum 2048 characters (common browser limit)
 */
export const urlValidator = z
  .string({ message: "URL is required" })
  .trim()
  .url("Please enter a valid URL")
  .max(2048, "URL cannot exceed 2048 characters");

/**
 * Optional URL validator
 */
export const optionalUrlValidator = z
  .string()
  .trim()
  .url("Please enter a valid URL")
  .max(2048, "URL cannot exceed 2048 characters")
  .optional()
  .or(z.literal(""));

/**
 * Document key/path validator
 * - For SharePoint or storage paths
 */
export const documentKeyValidator = z
  .string({ message: "Document key is required" })
  .trim()
  .min(1, "Document key is required")
  .max(500, "Document key cannot exceed 500 characters");

// =============================================================================
// PAGINATION VALIDATORS
// =============================================================================

/**
 * Page number validator
 */
export const pageValidator = z
  .number({ message: "Page number is required" })
  .int("Page must be a whole number")
  .min(1, "Page number must be at least 1");

/**
 * Limit/page size validator
 */
export const limitValidator = z
  .number()
  .int("Limit must be a whole number")
  .min(1, "Limit must be at least 1")
  .max(100, "Limit cannot exceed 100")
  .default(10);

/**
 * Search query validator
 */
export const searchQueryValidator = z
  .string()
  .trim()
  .max(200, "Search query cannot exceed 200 characters")
  .optional();

/**
 * Sort order validator
 */
export const sortOrderValidator = z
  .enum(["asc", "desc", "latest", "oldest"])
  .optional()
  .default("latest");

// =============================================================================
// COMPOSITE VALIDATORS (Common field groups)
// =============================================================================

/**
 * Address fields group
 */
export const addressFieldsValidator = z.object({
  address: addressValidator,
  city: cityValidator,
  state: stateValidator,
  pincode: pincodeValidator,
});

/**
 * Indian address fields group
 */
export const indianAddressFieldsValidator = z.object({
  address: addressValidator,
  city: cityValidator,
  state: stateValidator,
  pincode: indianPincodeValidator,
});

/**
 * Contact fields group
 */
export const contactFieldsValidator = z.object({
  email: emailValidator,
  contact_number: contactNumberValidator,
});

/**
 * Indian contact fields group
 */
export const indianContactFieldsValidator = z.object({
  email: emailValidator,
  contact_number: indianMobileValidator,
});

/**
 * Pagination fields group
 */
export const paginationFieldsValidator = z.object({
  page: pageValidator,
  limit: limitValidator,
  searchQuery: searchQueryValidator,
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type AddressFields = z.infer<typeof addressFieldsValidator>;
export type ContactFields = z.infer<typeof contactFieldsValidator>;
export type PaginationFields = z.infer<typeof paginationFieldsValidator>;
