import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import TableComponent from "./TableComponent";
// import { headers } from "next/headers";

// async function getData(): Promise<Users[]> {
//   try {
//     const response = await authClient.admin.listUsers({
//       query: { limit: 10 },
//     });

//     if (response.data && response.data.users) {
//       // return response.data.users as Users[];

//       return response.data.users as Users[];
//     } else {
//       console.warn("No users found or response data is null.");
//       return [];
//     }
//   } catch (error) {
//     console.error("Failed to fetch users:", error);
//     return [];
//   }
// }

const page = async () => {
  //const session = await auth.api.getSession({
  //   headers: await headers(),
  // });

  // if (!session) {
  //   return redirect("/sign-in");
  // }
  // const user = session?.user;
  // const data = await getData();
  return (
    <>
      {" "}
      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video items-center justify-center rounded-xl bg-muted/50">
          {" "}
          <h1>Hello World {user.name}</h1>
          <h1>Hello World {user.email}</h1>
          <h1>h2 {user.role}</h1>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />{" "}
      ; */}
      {/* <DataTable columns={columns} data={data} /> */}
      <TableComponent />
    </>
  );
};

export default page;
