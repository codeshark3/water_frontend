"use client";

import { useRouter } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import { Button } from "./ui/button";
import { Link } from "lucide-react";
import { toast } from "sonner";
const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onRequest: () => {
              toast.loading("Signing out...", {
              
                className: "bg-blue-500 text-white font-bold",
              });
          },
          onSuccess: () => {
            toast.success("Signed out successfully",  {
              // title: { success },
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
