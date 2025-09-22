"use client";

import { useRouter } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import { Button } from "./ui/button";
import { Link } from "lucide-react";
import { toast } from "~/hooks/use-toast";
const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onRequest: () => {
            toast({
              // title: { success },
              description: " Signing out...",
              variant: "default",
              className: "bg-blue-500 text-white font-bold ",
            });
          },
          onSuccess: () => {
            toast({
              // title: { success },
              description: "Signed out successfully",
              variant: "default",
              className: "bg-emerald-500 text-white font-bold ",
            });

            router.push("/sign-in"); // redirect to login page
          },
        },
      });
    } catch (error) {
      console.log("signout error", error);
    }
  };
  return (
    <Button
      onClick={handleSignOut}
      className="h-10 bg-transparent p-0 text-primary hover:bg-primary hover:text-white"
      variant="outline"
    >
      Sign Out
    </Button>
  );
};

export default SignOutButton;
