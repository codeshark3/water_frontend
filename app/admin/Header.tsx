"use client";

import Link from "next/link";
import { useSession } from "~/lib/auth-client";

type AdminHeaderProps = {
  title?: string;
  actions?: React.ReactNode;
};

const AdminHeader = ({ title = "Admin", actions }: AdminHeaderProps) => {
  const { data: session, isPending } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b px-4">
      <div className="flex items-center gap-3">
        {session && (
          <>
            <Link href="/" className="text-base font-semibold">
              CSIR WRI DBMS
            </Link>
            <span className="text-muted-foreground">/</span>
          </>
        )}
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
};

export default AdminHeader;


