import { z } from "zod";
import {
  nameValidator,
  titleValidator,
  emailValidator,
  addressValidator,
  cityValidator,
  stateValidator,
  pincodeValidator,
  gstNumberValidator,
  mobileValidator,
  codeValidator,
  agreementNumberValidator,
  requiredDescriptionValidator,
  positiveIntValidator,
  optionalPositiveIntValidator,
  nonNegativeNumberValidator,
  metricTonValidator,
  rateValidator,
  dateValidator,
  documentKeyValidator,
  optionalUrlValidator,
  pageValidator,
  limitValidator,
  searchQueryValidator,
} from "../validators";

// Enums
export const workOrderStatusEnum = z.enum([
  "pending",
  "completed",
  "cancelled",
]);
