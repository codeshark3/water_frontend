'use client';

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
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

interface Props {
  stats: DiseaseStats;
}

export default function DiseasePrevalenceDashboard({ stats }: Props) {
  const totalPositives = Object.values(stats.diseases).reduce((sum, disease) => sum + disease.positive, 0);

 

  return (
    <div className="w-full space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full justify-center items-center">
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
            <CardTitle className="text-sm font-medium">Disease Probability</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.anyDiseaseProbability}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.anyDiseaseCount} people with at least one disease
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

        <TabsContent value="oncho" className="space-y-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 w-full justify-center items-center">
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
              <ChartCard diseaseType="oncho" title="Onchocerciasis Trends" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schistosomiasis" className="space-y-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 w-full justify-center items-center">
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
              <ChartCard diseaseType="schistosomiasis" title="Schistosomiasis Trends" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lf" className="space-y-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 w-full justify-center items-center">
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
                <ChartCard diseaseType="lf" title="Lymphatic Filariasis Trends" />
              </div>
            </div>
          </TabsContent>

        <TabsContent value="helminths" className="space-y-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 w-full justify-center items-center">
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
              <ChartCard diseaseType="helminths" title="Soil-transmitted Helminths Trends" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Comprehensive Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Disease Prevalence Summary Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Individual Disease Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Individual Disease Statistics</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Disease</TableHead>
                    <TableHead className="text-right">Total Tests</TableHead>
                    <TableHead className="text-right">Positive Cases</TableHead>
                    <TableHead className="text-right">Infection Rate</TableHead>
                    <TableHead className="text-right">Percentage of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Onchocerciasis</TableCell>
                    <TableCell className="text-right">{stats.diseases.oncho.total.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{stats.diseases.oncho.positive.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{stats.diseases.oncho.rate}%</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.diseases.oncho.total / stats.totalTests) * 100 * 10) / 10 : 0}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Schistosomiasis</TableCell>
                    <TableCell className="text-right">{stats.diseases.schistosomiasis.total.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{stats.diseases.schistosomiasis.positive.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{stats.diseases.schistosomiasis.rate}%</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.diseases.schistosomiasis.total / stats.totalTests) * 100 * 10) / 10 : 0}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Lymphatic Filariasis</TableCell>
                    <TableCell className="text-right">{stats.diseases.lf.total.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{stats.diseases.lf.positive.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{stats.diseases.lf.rate}%</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.diseases.lf.total / stats.totalTests) * 100 * 10) / 10 : 0}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Soil-transmitted Helminths</TableCell>
                    <TableCell className="text-right">{stats.diseases.helminths.total.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{stats.diseases.helminths.positive.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{stats.diseases.helminths.rate}%</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.diseases.helminths.total / stats.totalTests) * 100 * 10) / 10 : 0}%
                    </TableCell>
                  </TableRow>
              
                </TableBody>
              </Table>
            </div>

            {/* Co-infection Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Co-infection Analysis</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Co-infection Type</TableHead>
                    <TableHead className="text-right">Number of Cases</TableHead>
                    <TableHead className="text-right">Percentage of Total Tests</TableHead>
                    <TableHead className="text-right">Percentage of Positive Cases</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Onchocerciasis + Schistosomiasis</TableCell>
                    <TableCell className="text-right">{stats.coInfections.onchoSchisto.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.coInfections.onchoSchisto / stats.totalTests) * 100 * 100) / 100 : 0}%
                    </TableCell>
                    <TableCell className="text-right">
                      {totalPositives > 0 ? Math.round((stats.coInfections.onchoSchisto / totalPositives) * 100 * 100) / 100 : 0}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Onchocerciasis + Lymphatic Filariasis</TableCell>
                    <TableCell className="text-right">{stats.coInfections.onchoLf.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.coInfections.onchoLf / stats.totalTests) * 100 * 100) / 100 : 0}%
                    </TableCell>
                    <TableCell className="text-right">
                      {totalPositives > 0 ? Math.round((stats.coInfections.onchoLf / totalPositives) * 100 * 100) / 100 : 0}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Onchocerciasis + Helminths</TableCell>
                    <TableCell className="text-right">{stats.coInfections.onchoHelminths.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.coInfections.onchoHelminths / stats.totalTests) * 100 * 100) / 100 : 0}%
                    </TableCell>
                    <TableCell className="text-right">
                      {totalPositives > 0 ? Math.round((stats.coInfections.onchoHelminths / totalPositives) * 100 * 100) / 100 : 0}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Schistosomiasis + Lymphatic Filariasis</TableCell>
                    <TableCell className="text-right">{stats.coInfections.schistoLf.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.coInfections.schistoLf / stats.totalTests) * 100 * 100) / 100 : 0}%
                    </TableCell>
                    <TableCell className="text-right">
                      {totalPositives > 0 ? Math.round((stats.coInfections.schistoLf / totalPositives) * 100 * 100) / 100 : 0}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Schistosomiasis + Helminths</TableCell>
                    <TableCell className="text-right">{stats.coInfections.schistoHelminths.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.coInfections.schistoHelminths / stats.totalTests) * 100 * 100) / 100 : 0}%
                    </TableCell>
                    <TableCell className="text-right">
                      {totalPositives > 0 ? Math.round((stats.coInfections.schistoHelminths / totalPositives) * 100 * 100) / 100 : 0}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Lymphatic Filariasis + Helminths</TableCell>
                    <TableCell className="text-right">{stats.coInfections.lfHelminths.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.coInfections.lfHelminths / stats.totalTests) * 100 * 100) / 100 : 0}%
                    </TableCell>
                    <TableCell className="text-right">
                      {totalPositives > 0 ? Math.round((stats.coInfections.lfHelminths / totalPositives) * 100 * 100) / 100 : 0}%
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-destructive/10">
                    <TableCell className="font-semibold text-destructive">All Four Diseases</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">{stats.coInfections.allFour.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {stats.totalTests > 0 ? Math.round((stats.coInfections.allFour / stats.totalTests) * 100 * 100) / 100 : 0}%
                    </TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {totalPositives > 0 ? Math.round((stats.coInfections.allFour / totalPositives) * 100 * 100) / 100 : 0}%
                    </TableCell>
                  </TableRow>
               
                </TableBody>
              </Table>
            </div>

            {/* Recent Activity Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Activity (Last 30 Days)</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Tests Conducted</TableCell>
                    <TableCell className="text-right">{stats.recent.tests.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {stats.totalTests > 0 ? Math.round((stats.recent.tests / stats.totalTests) * 100 * 10) / 10 : 0}% of total
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Positive Cases</TableCell>
                    <TableCell className="text-right">{stats.recent.positives.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {totalPositives > 0 ? Math.round((stats.recent.positives / totalPositives) * 100 * 10) / 10 : 0}% of total positives
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-semibold">Infection Rate</TableCell>
                    <TableCell className="text-right font-semibold">{stats.recent.rate}%</TableCell>
                    <TableCell className="text-right font-semibold">
                      vs {stats.anyDiseaseProbability}% disease probability
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
     
    </div>
  );
} 