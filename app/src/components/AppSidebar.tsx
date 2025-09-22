// import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
// import { auth } from "~/lib/auth";
// import { headers } from "next/headers";
// import { Button, buttonVariants } from "./ui/button";
// import { redirect } from "next/navigation";
// import Link from "next/link";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarFooter,
// } from "~/components/ui/sidebar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "~/components/ui/dropdown-menu";
// import { User2 } from "lucide-react";
// import { ChevronUp } from "lucide-react";
// import SignOutButton from "./SignOutButton";
// import Image from "next/image";
// // Menu items.
// const admins = [
//   {
//     title: "Home",
//     url: "/admin",
//     icon: Home,
//   },
//   {
//     title: "Manage Users",
//     url: "#",
//     icon: User2,
//   },
//   {
//     title: "Manage Datasets",
//     url: "#",
//     icon: Calendar,
//   },
// ];

// const staffs = [
//   {
//     title: "Home",
//     url: "/staff",
//     icon: Home,
//   },
//   {
//     title: "Manage Datasets",
//     url: "#",
//     icon: Inbox,
//   },
//   {
//     title: "Calendar",
//     url: "#",
//     icon: Calendar,
//   },
//   {
//     title: "Search",
//     url: "#",
//     icon: Search,
//   },
//   {
//     title: "Settings",
//     url: "#",
//     icon: Settings,
//   },
// ];
// const customers = [
//   {
//     title: "Home",
//     url: "/customer",
//     icon: Home,
//   },
//   {
//     title: "Datasets",
//     url: "#",
//     icon: Inbox,
//   },

//   {
//     title: "Settings",
//     url: "#",
//     icon: Settings,
//   },
// ];

// export async function AppSidebar() {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });
//   const user = session?.user;
//   return (
//     <Sidebar variant="floating" collapsible="icon">
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel className="">
//             <Image
//               src="/assets/images/logo.png"
//               alt="Logo"
//               width={50}
//               height={50}
//               className="pb-[60px]"
//             />
//           </SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {admins.map((admin) => (
//                 <SidebarMenuItem key={admin.title}>
//                   <SidebarMenuButton asChild>
//                     <a href={admin.url}>
//                       <admin.icon />
//                       <span>{admin.title}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//       <SidebarFooter>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <SidebarMenuButton>
//                   <User2 />
//                   {user ? user.name : ""}

//                   <ChevronUp className="ml-auto" />
//                 </SidebarMenuButton>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent
//                 side="top"
//                 className="w-[--radix-popper-anchor-width]"
//               >
//                 <DropdownMenuItem>
//                   <span>Account</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <span>Billing</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <SignOutButton />
//                   {/* {session ? (
//                     <form
//                       action={async () => {
//                         "use server";
//                         await auth.api.signOut({
//                           headers: await headers(),
//                         });
//                         redirect("/");
//                       }}
//                     >
//                       <Button type="submit">Sign Out</Button>
//                     </form>
//                   ) : (
//                     <></>
//                     // <Link href="/sign-in" className={buttonVariants()}>
//                     //   <h1>Login</h1>
//                     // </Link>
//                   )} */}
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>{" "}
//     </Sidebar>
//   );
// }
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
  ChevronUp,
} from "lucide-react";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import SignOutButton from "./SignOutButton";
import Image from "next/image";
import Link from "next/link";
// Define the structure of a menu item
type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// Define roles and their corresponding menu items
const MENU_ITEMS: Record<string, MenuItem[]> = {
  admin: [
    { title: "Home", url: "/admin", icon: Home },
    { title: "Manage Users", url: "/admin/users", icon: User2 },
    { title: "Insert Dataset", url: "/datasets/create", icon: User2 },
    { title: "Manage Datasets", url: "/datasets", icon: Calendar },
    { title: "Access Requests", url: "/access", icon: Inbox },
  ],
  staff: [
    { title: "Home", url: "/staff", icon: Home },
    { title: "Manage Datasets", url: "/datasets", icon: Inbox },
    { title: "Access Requests", url: "/access", icon: Inbox },
    { title: "Calendar", url: "#", icon: Calendar },
    { title: "Search", url: "#", icon: Search },
    { title: "Settings", url: "#", icon: Settings },
  ],
  user: [
    { title: "Home", url: "/customer", icon: Home },
    { title: "Datasets", url: "/datasets", icon: Inbox },
    { title: "Settings", url: "#", icon: Settings },
  ],
};

export async function AppSidebar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  if (!user) {
    redirect("/sign-in");
    return null;
  }

  const role = user.role || "customer";

  // Redirect if user is not authenticated

  // Type-safe role-based menu items
  const menuItems: MenuItem[] = MENU_ITEMS[role] || [];

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="flex flex-col items-center justify-center">
        <Image
          src="/assets/images/logo.png"
          alt="Logo"
          width={100}
          height={100}
          className=""
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  {user.name || "User"}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
