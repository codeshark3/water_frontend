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
import { toast } from "~/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SignUpSchema } from "~/schemas";
import { Form } from "~/components/ui/form";
import CustomFormField from "../CustomFormField";
import { FormFieldType } from "../CustomFormField";
import { Button } from "../ui/button";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SignUpSchema>) {
    const { name, email, password, confirm_password } = values;
    const { data, error } = await authClient.signUp.email({
      email,
      name,
      password,
      callbackURL: "/sign-in ",
      fetchOptions: {
        onRequest: () => {
          toast({
            // title: { success },
            description: " requesting",
            variant: "default",
            className: "bg-blue-500 text-white font-bold ",
          });
        },
        onSuccess: () => {
          toast({
            // title: { success },
            description: " successfully",
            variant: "default",
            className: "bg-emerald-500 text-white font-bold ",
          });
          form.reset();
          router.push("/sign-in"); // redirect to login page
        },

        onError: () => {
          toast({
            // title: { error },
            description: " failed",
            variant: "default",
            className: "bg-red-500 text-white font-bold ",
          });
        },
      },
    });
    console.log(values);
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create your account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="name"
              label="Name"
              placeholder="John Doe"
              // iconSrc="/assets/icons/email.svg"
              // iconAlt="email"
            />
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
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.PASSWORD}
              name="confirm_password"
              label="Confirm Password"
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
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
