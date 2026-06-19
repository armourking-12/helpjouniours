import { z } from "zod";

/** Login form schema */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

/** Registration form schema */
export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterFormData = z.infer<typeof registerSchema>;

/** Contact form schema */
export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be less than 2000 characters"),
});
export type ContactFormData = z.infer<typeof contactSchema>;

/** Search query schema */
export const searchSchema = z.object({
  query: z.string().min(1, "Please enter a search term"),
  type: z.string().optional(),
  university: z.string().optional(),
  semester: z.number().optional(),
  subject: z.string().optional(),
});
export type SearchFormData = z.infer<typeof searchSchema>;

/** Upload resource form schema */
export const uploadSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description is too long"),
  type: z.string().min(1, "Please select a resource type"),
  university: z.string().min(2, "Please enter a university"),
  course: z.string().min(2, "Please enter a course"),
  semester: z.number().min(1).max(8),
  subject: z.string().min(2, "Please enter a subject"),
  year: z.number().min(2000).max(new Date().getFullYear()),
  examType: z.string().optional(),
  tags: z.string().optional(), // Store as comma-separated string in form state
});
export type UploadFormData = z.infer<typeof uploadSchema>;
