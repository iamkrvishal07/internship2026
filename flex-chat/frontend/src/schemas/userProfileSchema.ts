import { z } from "zod";

export const userProfileSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters"),

    email: z
        .email("Invalid email address"),

    fullName: z
        .string()
        .min(1),
    
    bio: z
        .string(),
    
    statusMessage: z
        .string(),
});