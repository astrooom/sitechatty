import { z } from "zod";

export const AuthSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password must be no more than 128 characters long")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
})