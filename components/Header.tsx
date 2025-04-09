"use client";

import Link from "next/link";
import React from "react";
import { Button, buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Search } from "lucide-react";
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
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8" />
          </div>
        </div>
      </div>
    </div>
  );
}