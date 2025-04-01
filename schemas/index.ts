//import { number, z } from "zod";
import * as z from "zod";

export const SignInSchema = z.object({
  //   name: z.string().min(1),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address ",
    })
    .min(2)
    .max(50),
  password: z
    .string()
    .min(8, {
      message: "Minimum password length is 8 characters",
    })
    .max(50, "Password should not exceed 50 characters"),
  // password: z.string().min(6),
});

// interface FormData {
//   password: string;
//   confirm_password: string;
// }
export const SignUpSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name should be at least 2 characters  " })
      .max(50, { message: "Name should not exceed 50 characters" }),
    email: z
      .string()
      .email({
        message: "Please enter a valid email address ",
      })
      .min(2)
      .max(50),
    password: z
      .string()
      .min(8, {
        message: "Minimum password length is 8 characters",
      })
      .max(50, "Password should not exceed 50 characters"),
    confirm_password: z
      .string()
      .min(8, {
        message: "Minimum password length is 8 characters",
      })
      .max(50, "Password should not exceed 50 characters"),
  })
  .refine((val) => val.password === val.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// export const datasetSchema = z.object({
//   title: z.string(),
//   year: z.string(),
//   pi_name: z.string(),
//   description: z.string().optional(),
//   division: z.string(),
//   userId: z.string(),
//   papers: z.string().optional(),
//   tagIds: z.array(z.number()).optional(),
// });

export const testSchema = z.object({
  id: z.string(),
  name: z.string(),
  gender: z.string(),
  age: z.number(),
  location: z.string(),
  userId: z.string(),
  oncho: z.string(),
  schistosomiasis: z.string(),
  lf: z.string(),
  helminths: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// TypeScript type inference
export type TestInput = z.infer<typeof testSchema>;


export const accessRequestSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

export type AccessRequestInput = z.infer<typeof accessRequestSchema>;
