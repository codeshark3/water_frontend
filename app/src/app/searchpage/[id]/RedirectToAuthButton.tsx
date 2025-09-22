"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "~/lib/auth-client";

const RedirectToAuthButton = () => {
  const router = useRouter();

  const { data: session } = useSession();

  const handleClick = () => {
    if (session) {
      router.push("/customer");
    }

    router.push("/signin");
  };

  return (
    <div>
      <Button onClick={handleClick}>Request Access</Button>
    </div>
  );
};

export default RedirectToAuthButton;
