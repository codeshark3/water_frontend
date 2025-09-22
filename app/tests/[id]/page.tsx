import { redirect } from "next/navigation";

const TestDetailsPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  // Redirect to tests page since we now use modals for viewing details
  redirect("/tests");
};

export default TestDetailsPage;