import { db } from "./db";
import { tests } from "./db/schema";
import { sql } from "drizzle-orm";

export async function getDiseaseStats() {
  // Get total tests
  const totalTests = await db.select({
    count: sql<number>`count(*)`
  }).from(tests);

  // Get positive cases by disease
  const diseaseStats = await db.select({
    oncho_positive: sql<number>`count(case when oncho = 'positive' then 1 end)`,
    schistosomiasis_positive: sql<number>`count(case when schistosomiasis = 'positive' then 1 end)`,
    lf_positive: sql<number>`count(case when lf = 'positive' then 1 end)`,
    helminths_positive: sql<number>`count(case when helminths = 'positive' then 1 end)`,
    oncho_total: sql<number>`count(case when oncho is not null then 1 end)`,
    schistosomiasis_total: sql<number>`count(case when schistosomiasis is not null then 1 end)`,
    lf_total: sql<number>`count(case when lf is not null then 1 end)`,
    helminths_total: sql<number>`count(case when helminths is not null then 1 end)`,
  }).from(tests);

  // Get co-infection data
  const coInfections = await db.select({
    oncho_schisto: sql<number>`count(case when oncho = 'positive' and schistosomiasis = 'positive' then 1 end)`,
    oncho_lf: sql<number>`count(case when oncho = 'positive' and lf = 'positive' then 1 end)`,
    oncho_helminths: sql<number>`count(case when oncho = 'positive' and helminths = 'positive' then 1 end)`,
    schisto_lf: sql<number>`count(case when schistosomiasis = 'positive' and lf = 'positive' then 1 end)`,
    schisto_helminths: sql<number>`count(case when schistosomiasis = 'positive' and helminths = 'positive' then 1 end)`,
    lf_helminths: sql<number>`count(case when lf = 'positive' and helminths = 'positive' then 1 end)`,
    all_four: sql<number>`count(case when oncho = 'positive' and schistosomiasis = 'positive' and lf = 'positive' and helminths = 'positive' then 1 end)`,
  }).from(tests);

  // Get recent activity (last 30 days)
  const recentActivity = await db.select({
    recent_tests: sql<number>`count(case when "createdAt" >= now() - interval '30 days' then 1 end)`,
    recent_positives: sql<number>`count(case when "createdAt" >= now() - interval '30 days' and (oncho = 'positive' or schistosomiasis = 'positive' or lf = 'positive' or helminths = 'positive') then 1 end)`,
  }).from(tests);

  const stats = diseaseStats[0];
  const coInfectionStats = coInfections[0];
  const recentStats = recentActivity[0];

  return {
    totalTests: totalTests[0]?.count || 0,
    diseases: {
      oncho: {
        positive: stats?.oncho_positive || 0,
        total: stats?.oncho_total || 0,
        rate: stats?.oncho_total ? ((stats.oncho_positive / stats.oncho_total) * 100).toFixed(1) : '0'
      },
      schistosomiasis: {
        positive: stats?.schistosomiasis_positive || 0,
        total: stats?.schistosomiasis_total || 0,
        rate: stats?.schistosomiasis_total ? ((stats.schistosomiasis_positive / stats.schistosomiasis_total) * 100).toFixed(1) : '0'
      },
      lf: {
        positive: stats?.lf_positive || 0,
        total: stats?.lf_total || 0,
        rate: stats?.lf_total ? ((stats.lf_positive / stats.lf_total) * 100).toFixed(1) : '0'
      },
      helminths: {
        positive: stats?.helminths_positive || 0,
        total: stats?.helminths_total || 0,
        rate: stats?.helminths_total ? ((stats.helminths_positive / stats.helminths_total) * 100).toFixed(1) : '0'
      }
    },
    coInfections: {
      onchoSchisto: coInfectionStats?.oncho_schisto || 0,
      onchoLf: coInfectionStats?.oncho_lf || 0,
      onchoHelminths: coInfectionStats?.oncho_helminths || 0,
      schistoLf: coInfectionStats?.schisto_lf || 0,
      schistoHelminths: coInfectionStats?.schisto_helminths || 0,
      lfHelminths: coInfectionStats?.lf_helminths || 0,
      allFour: coInfectionStats?.all_four || 0
    },
    recent: {
      tests: recentStats?.recent_tests || 0,
      positives: recentStats?.recent_positives || 0,
      rate: recentStats?.recent_tests ? ((recentStats.recent_positives / recentStats.recent_tests) * 100).toFixed(1) : '0'
    }
  };
} 