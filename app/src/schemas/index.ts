import { number, z } from "zod";

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

export const papersSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().min(1, "Reference is required"),
});

export const datasetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  year: z
    .string()
    .length(4)
    .regex(/^\d{4}$/, "Year must be in YYYY format"),
  pi_name: z.string().min(1, "PI name is required"),
  description: z.string(),
  division: z.string().min(1, "Division is required"),

  papers: z.array(papersSchema).optional(),
  tags: z.string().optional(), // Ensure IDs match DB type
  fileUrl: z.string().optional(),
});

// TypeScript type inference
export type DatasetInput = z.infer<typeof datasetSchema>;

export const datasetInsertSchema = datasetSchema.pick({
  title: true,
  year: true,
  pi_name: true,
  division: true,
  description: true,
  papers: true,

  tags: true, // Optional but needed for insert
});

export const accessRequestSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

export type AccessRequestInput = z.infer<typeof accessRequestSchema>;
