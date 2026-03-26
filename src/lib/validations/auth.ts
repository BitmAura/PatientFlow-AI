import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  rememberMe: z.boolean().default(false),
})

export const signupSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  clinicName: z.string().min(2, {
    message: "Clinic name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter.",
  }).regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter.",
  }).regex(/[0-9]/, {
    message: "Password must contain at least one number.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions.",
  }),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter.",
  }).regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter.",
  }).regex(/[0-9]/, {
    message: "Password must contain at least one number.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const clinicDetailsSchema = z.object({
  name: z.string().min(2, "Clinic name is required"),
  description: z.string().optional(),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

export const addressSchema = z.object({
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
})

export const businessHoursSchema = z.object({
  schedule: z.record(z.object({
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    hasLunchBreak: z.boolean(),
    lunchStart: z.string().optional(),
    lunchEnd: z.string().optional(),
  })),
})

export const serviceSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  depositRequired: z.boolean(),
  depositAmount: z.coerce.number().optional(),
})

export const onboardingCompleteSchema = z.object({
  completed: z.boolean(),
})
