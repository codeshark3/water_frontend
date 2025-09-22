import React from "react";
import { getUser } from "~/app/src/server/queries";

type Props = { params: Promise<{ id: string }> };

const Page = async ({ params }: Props) => {
  const { id } = await params;
  try {
    const details = await getUser(id);
    return (
      <div>
        page id: {id} {details.name}
      </div>
    );
  } catch (e) {
    return <div>user not found</div>;
  }
};

export default Page;


