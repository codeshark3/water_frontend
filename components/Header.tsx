"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import Image from "next/image";
import { authClient } from "~/lib/auth-client";
import SignOutButton from "./SignOutButton";

export default function Header() {
  // const { data, isPending } = authClient.useSession();
  // const [isClient, setIsClient] = useState(false);
  
  // const isAdmin = data?.user?.role === "admin";
  // const isLoggedIn = data?.user?.id;
  
 

  // useEffect(() => {
  //   setIsClient(true);
  // }, []);

  return (
    <div className="border-b px-4">
      <div className="mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/assets/images/logo.png" alt="Logo" width={40} height={40} />
          <span className="text-xl font-bold">Water ML</span>
        </div>
        <div className="flex items-center gap-4">
          {/* {isClient && !isPending && isLoggedIn && ( */}
            <div className="relative flex items-center gap-4">
              {/* {isAdmin && ( */}
                <Link 
                  href="/admin" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100 transition-all duration-200 ease-in-out"
                >
                  Admin
                </Link>
              {/* )} */}
              <Link 
                href="/" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100 transition-all duration-200 ease-in-out"
              >
                Dashboard
              </Link>
              <Link 
                href="/tests" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-100 transition-all duration-200 ease-in-out "
              >
                Tests
              </Link>
              {/* <SignOutButton /> */}
            </div>
          {/* )} */}
        </div>
      </div>
    </div>
  );
}