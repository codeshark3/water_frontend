'use client';

import { useEffect, useState } from "react";
import DiseasePrevalenceDashboard from "./DiseasePrevalenceDashboard";

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

interface DashboardClientProps {
  initialStats: DiseaseStats | null;
}

export default function DashboardClient({ initialStats }: DashboardClientProps) {
  const [stats, setStats] = useState<DiseaseStats | null>(initialStats);
  const [loading, setLoading] = useState(!initialStats);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have initial stats from server-side, we're done
    if (initialStats) {
      return;
    }

    // Otherwise, fetch from API
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
  }, [initialStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading dashboard: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">No data available</div>
      </div>
    );
  }

  return <DiseasePrevalenceDashboard stats={stats} />;
} 