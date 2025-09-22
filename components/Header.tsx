"use client";

import Link from "next/link";
import React from "react";

import Image from "next/image";

export default function Header() {
  return (
    <div className="border-b px-4">
      <div className="mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
          <span className="text-xl font-bold">Water ML</span>
        </div>
        <div className="flex items-center gap-4">
         
          <div className="relative flex items-center gap-4">
          <Link href="/" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/tests" className="hover:text-primary transition-colors">
              Tests
            </Link>
           
          </div>
        </div>
      </div>
    </div>
  );
}