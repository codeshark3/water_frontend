import { NextResponse } from 'next/server';
import { getDiseaseStats } from "~/server/dashboard_queries";

export async function GET() {
  try {
    const stats = await getDiseaseStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 