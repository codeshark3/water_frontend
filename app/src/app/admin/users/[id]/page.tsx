import React from "react";
import { getUser } from "~/server/queries";
interface Props {
  params: {
    id: string;
  };
}

// export type Users = {
//   id: string;
//   name: string;
//   email: string;
//   emailVerified: boolean;

//   createdAt: Date;
//   updatedAt: Date;
//   role: string;
//   banned: string;
//   banReason: string | null;
//   banExpires: number;
// };
const page = async ({ params: { id } }: Props) => {
  const details = await getUser(id);
  return (
    <div>
      page id: {id} {details.name}
    </div>
  );
};

export default page;
