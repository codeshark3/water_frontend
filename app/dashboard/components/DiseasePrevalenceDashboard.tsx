'use client';

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  Eye,
  Bug,
  Heart,
  Zap
} from "lucide-react";
import ChartCard from "~/components/ChartCard";

interface DiseaseStats {
  totalTests: number;
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

interface Props {
  stats: DiseaseStats;
}

export default function DiseasePrevalenceDashboard({ stats }: Props) {
  const totalPositives = Object.values(stats.diseases).reduce((sum, disease) => sum + disease.positive, 0);
  const overallRate = stats.totalTests > 0 ? Math.round((totalPositives / stats.totalTests) * 100 * 10) / 10 : 0;

  // Mock data for charts - you can replace this with real data later
  const mockChartData = [
    { name: "Jan", positive: 12, negative: 88 },
    { name: "Feb", positive: 19, negative: 81 },
    { name: "Mar", positive: 15, negative: 85 },
    { name: "Apr", positive: 22, negative: 78 },
    { name: "May", positive: 18, negative: 82 },
    { name: "Jun", positive: 25, negative: 75 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time tests conducted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Infection Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalPositives} positive cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent.tests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recent.rate}% positive (30 days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Co-infections</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(stats.coInfections).reduce((sum, count) => sum + count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Multiple disease cases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Disease Tabs */}
      <Tabs defaultValue="oncho" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="oncho" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Onchocerciasis
          </TabsTrigger>
          <TabsTrigger value="schistosomiasis" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Schistosomiasis
          </TabsTrigger>
          <TabsTrigger value="lf" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Lymphatic Filariasis
          </TabsTrigger>
          <TabsTrigger value="helminths" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Soil-transmitted Helminths
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oncho" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Onchocerciasis Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-primary">{stats.diseases.oncho.rate}%</div>
                      <div className="text-sm text-muted-foreground">Infection Rate</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold">{stats.diseases.oncho.positive}</div>
                      <div className="text-sm text-muted-foreground">Positive Cases</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold">{stats.diseases.oncho.total}</div>
                      <div className="text-sm text-muted-foreground">Total Tests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-7">
              <ChartCard data={mockChartData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schistosomiasis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5" />
                    Schistosomiasis Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-primary">{stats.diseases.schistosomiasis.rate}%</div>
                      <div className="text-sm text-muted-foreground">Infection Rate</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold">{stats.diseases.schistosomiasis.positive}</div>
                      <div className="text-sm text-muted-foreground">Positive Cases</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold">{stats.diseases.schistosomiasis.total}</div>
                      <div className="text-sm text-muted-foreground">Total Tests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-7">
              <ChartCard data={mockChartData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lf" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Lymphatic Filariasis Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-primary">{stats.diseases.lf.rate}%</div>
                      <div className="text-sm text-muted-foreground">Infection Rate</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold">{stats.diseases.lf.positive}</div>
                      <div className="text-sm text-muted-foreground">Positive Cases</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold">{stats.diseases.lf.total}</div>
                      <div className="text-sm text-muted-foreground">Total Tests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-7">
              <ChartCard data={mockChartData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="helminths" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Soil-transmitted Helminths Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-primary">{stats.diseases.helminths.rate}%</div>
                      <div className="text-sm text-muted-foreground">Infection Rate</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold">{stats.diseases.helminths.positive}</div>
                      <div className="text-sm text-muted-foreground">Positive Cases</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold">{stats.diseases.helminths.total}</div>
                      <div className="text-sm text-muted-foreground">Total Tests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-7">
              <ChartCard data={mockChartData} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Overall Co-infection Summary */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Overall Co-infection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.coInfections.onchoSchisto}</div>
              <div className="text-sm text-muted-foreground">Oncho + Schisto</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.coInfections.onchoLf}</div>
              <div className="text-sm text-muted-foreground">Oncho + LF</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.coInfections.schistoLf}</div>
              <div className="text-sm text-muted-foreground">Schisto + LF</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.coInfections.allFour}</div>
              <div className="text-sm text-muted-foreground">All Four</div>
            </div>
          </div>
        </CardContent> </Card> */}
     
    </div>
  );
} 