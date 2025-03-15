"use client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SignInSchema } from "~/schemas";
import { Form } from "~/components/ui/form";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import { Button } from "../ui/button";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

// type SignInFormData = {
//   email: string;
//   password: string;
// };

const SignInForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignInSchema>) {
    const { email, password } = values;
    const { data, error } = await authClient.signIn.email({
      email,

      password,
      // callbackURL: "/",
      fetchOptions: {
        onRequest: () => {
         toast.loading("Requesting...")
        },
        onSuccess: (val) => {
        toast.success("Login Successful")
          form.reset();
          router.push("/customer");
          // if (val.data?.user?.role === "admin") {
          //   router.push("/admin");
          // }

          // if (val.data?.user?.role === "staff") {
          //   router.push("/staff");
          // }

          // if (val.data?.user?.role === "user") {
          //   router.push("/user");
          // }
          // router.push("/sign-in"); // redirect to login page
        },

        onError: () => {
         toast.error("Login Failed!")
        },
      },
    });
    console.log(values);
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <div className="flex flex-col items-center justify-center pb-4">
          <Image
            src="/assets/images/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="pb-4"
          />
          <h1 className="text-bold text-xl">CSIR Database Management System</h1>
        </div>

        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Welcome back! Please sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="email"
              label="Email"
              placeholder="user@email.com"
            // iconSrc="/assets/icons/email.svg"
            // iconAlt="email"
            />
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.PASSWORD}
              name="password"
              label="Password"
              placeholder="*******"
            // iconSrc="/assets/icons/email.svg"
            // iconAlt="email"
            />
            <Button type="submit" className="w-full bg-primary">
              Sign In
              {/* <span className="ms-1">🔑</span> */}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignInForm;
