import AdminHeader from "./Header";
import TableComponent from "~/app/admin/TableComponent";
import { getUsers } from "~/server/queries";

const page = async () => {
  const users = (await getUsers()).map((u: any) => ({
    ...u,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
  }));


  return (
    <>
   
      <div className="mt-4">
        <TableComponent initialData={users} />
      </div>
    </>
  );
};

export default page;


