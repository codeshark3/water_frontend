'use client';

import { useEffect, useState } from "react";
import DiseasePrevalenceDashboard from "./components/DiseasePrevalenceDashboard";

// Force dynamic rendering to avoid build-time database connections
export const dynamic = 'force-dynamic';

// Import the type from the dashboard queries
interface DiseaseStats {
  totalTests: number;
  anyDiseaseProbability: string;
  anyDiseaseCount: number;
  diseases: {
    oncho: { positive: number; total: number; rate: string };
    schistosomiasis: { positive: number; total: number; rate: string };
    lf: { positive: number; total: number; rate: string };
    helminths: { positive: number; total: number; rate: string };
  };
  coInfections: {
    onchoSchisto: number;
    onchoLf: number;
    onchoHelminths: number;
    schistoLf: number;
    schistoHelminths: number;
    lfHelminths: number;
    allFour: number;
  };
  recent: {
    tests: number;
    positives: number;
    rate: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DiseaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Disease Prevalence Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time analysis of water-borne disease testing results</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Disease Prevalence Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time analysis of water-borne disease testing results</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading dashboard: {error}</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Disease Prevalence Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time analysis of water-borne disease testing results</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Disease Prevalence Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time analysis of water-borne disease testing results</p>
      </div>
      
      <DiseasePrevalenceDashboard stats={stats} />
    </div>
  );
} 