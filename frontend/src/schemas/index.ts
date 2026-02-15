import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be at most 100 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be at most 100 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const createTransactionSchema = z.object({
  user_id: z.uuid("Invalid user ID"),
  type: z.enum(["CREDIT", "DEBIT"]),
  amount: z.number().positive("Amount must be positive"),
});

export const createTransactionFormSchema = z.object({
  type: z.enum(["CREDIT", "DEBIT"]),
  amount: z
    .number({ error: "Amount must be a positive number" })
    .positive("Amount must be a positive number"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
export type CreateTransactionFormInput = z.infer<
  typeof createTransactionFormSchema
>;
