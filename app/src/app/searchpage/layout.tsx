import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/AppSidebar";

import { Separator } from "~/components/ui/separator";
import Header from "~/components/Header";

export default function SearchPageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />

      <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
    </>
  );
}

{
  /* <SidebarProvider>
          {" "}
          <AppSidebar />
          <main>
            <div className="flex h-screen flex-col">
              <SidebarTrigger /> {children}
            </div>
          </main>
        </SidebarProvider> */
}
