"use client";

import React, { useState } from "react";
import CreateUserDialog from "~/components/CreateUserDialog";

const Page = () => {
  const [open, setOpen] = useState(true);
  return <CreateUserDialog isOpen={open} onClose={() => setOpen(false)} />;
};

export default Page;


