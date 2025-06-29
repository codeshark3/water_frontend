import { getDiseaseStats } from "~/server/dashboard_queries";
import DiseasePrevalenceDashboard from "./components/DiseasePrevalenceDashboard";

export default async function DashboardPage() {
  const stats = await getDiseaseStats();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Disease Prevalence Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time analysis of water-borne disease testing results</p>
      </div>
      
      <DiseasePrevalenceDashboard stats={stats} />
    </div>
  );
} 