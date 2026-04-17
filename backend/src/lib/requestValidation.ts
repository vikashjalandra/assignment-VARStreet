import { HttpError } from "./httpError.js";
import type { ErrorDetails } from "./httpError.js";

export const PRIORITY_VALUES = ["Low", "Medium", "High", "Critical"] as const;
export const STATUS_VALUES = ["Todo", "InProgress", "Review", "Done"] as const;

export type PriorityValue = (typeof PRIORITY_VALUES)[number];
export type StatusValue = (typeof STATUS_VALUES)[number];

export const throwValidationError = (errors: ErrorDetails): never => {
  throw new HttpError(400, "Validation failed", errors);
};

export const parseIdParam = (
  value: string | string[] | undefined,
  fieldName: string
): number => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throwValidationError({ [fieldName]: `${fieldName} must be a positive integer` });
  }

  return parsed;
};

export const getQueryParam = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
};

export const parseOptionalDate = (value: unknown, fieldName: string): Date | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throwValidationError({ [fieldName]: `${fieldName} must be a valid date` });
  }

  return parsed;
};

export const isEnumValue = <T extends readonly string[]>(
  value: string,
  allowedValues: T
): value is T[number] => allowedValues.includes(value);