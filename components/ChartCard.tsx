"use client"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useEffect, useState } from "react"

// Types for chart data structure
interface ChartDataPoint {
  name: string;                    // Month name (e.g., "2023-01")
  total_tests?: number;            // Historical total tests
  positive_cases?: number;         // Historical positive cases
  infection_rate?: number;         // Historical infection rate
  forecasted_total_tests?: number; // Predicted total tests
  forecasted_positive_cases?: number; // Predicted positive cases
  forecasted_infection_rate?: number; // Predicted infection rate
  is_forecast?: boolean;           // Whether this is forecast data
}

// Props for the ChartCard component
interface ChartCardProps {
  diseaseType?: string;            // Disease type to fetch data for (e.g., "oncho", "schistosomiasis")
  title?: string;                  // Chart title
  data?: ChartDataPoint[];         // Pre-provided data (optional)
}

// Color scheme for different metrics
const metricColors = {
  totalTests: "#3b82f6",    // Blue for total tests
  positiveCases: "#22c55e", // Green for positive cases
  infectionRate: "#f43f5e"  // Red for infection rate
}

// Disease labels
const diseaseLabels = {
  oncho: "Onchocerciasis",
  schistosomiasis: "Schistosomiasis",
  lf: "Lymphatic Filariasis",
  helminths: "Soil-transmitted Helminths"
}

export default function ChartCard({ 
  diseaseType = "oncho", 
  data, 
  title 
}: ChartCardProps) {
  // State for chart data and loading status
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noData, setNoData] = useState(false)

  // Get disease label
  const diseaseLabel = diseaseLabels[diseaseType as keyof typeof diseaseLabels] || diseaseLabels.oncho
  const defaultTitle = `${diseaseLabel} Trends`

  // Fetch forecast data from API
  const fetchForecastData = async (disease: string) => {
    setLoading(true)
    setError(null)
    setNoData(false)
    
    try {
      const response = await fetch(`/api/forecast?disease=${disease}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch forecast data: ${response.status}`)
      }
      
      const { data: result, status } = await response.json()
      
      if (status === "no_data") {
        setNoData(true)
        setChartData([])
        return
      }
      
      // Transform database data to chart format
      const transformedData = result.map((item: any) => ({
        name: item.month,
        total_tests: item.totalTests || null,
        positive_cases: item.positiveCases || null,
        infection_rate: item.infectionRate || null,
        forecasted_total_tests: item.forecastedTotalTests || null,
        forecasted_positive_cases: item.forecastedPositiveCases || null,
        forecasted_infection_rate: item.forecastedInfectionRate || null,
        is_forecast: item.isForecast
      }))
      
      setChartData(transformedData)
      
    } catch (error) {
      console.error('Error fetching forecast data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Effect to handle data fetching
  useEffect(() => {
    // If data is provided directly, use it
    if (data) {
      setChartData(data)
      return
    }

    // If no disease type specified, don't fetch
    if (!diseaseType) {
      return
    }

    // Fetch forecast data for the specified disease
    fetchForecastData(diseaseType)
  }, [diseaseType, data])

  // Loading state
  if (loading) {
    return (
      <Card className="w-full min-w-[8rem]">
        <CardHeader>
          <CardTitle>{title || defaultTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full min-w-[8rem]">
        <CardHeader>
          <CardTitle>{title || defaultTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (noData) {
    return (
      <Card className="w-full min-w-[8rem]">
        <CardHeader>
          <CardTitle>{title || defaultTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-muted-foreground">
              No forecast data available for {diseaseLabel}. Please generate forecasts first.
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Main chart component
  return (
    <Card className="w-full min-w-[8rem]">
      <CardHeader>
        <CardTitle>{title || defaultTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            {/* Chart axes */}
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            
            {/* Historical Data - Solid Lines */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="total_tests"
              stroke={metricColors.totalTests}
              strokeWidth={2}
              name="Total Tests"
              dot={false}
              opacity={0.7}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="positive_cases"
              stroke={metricColors.positiveCases}
              strokeWidth={2}
              name="Positive Cases"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="infection_rate"
              stroke={metricColors.infectionRate}
              strokeWidth={2}
              name="Infection Rate (%)"
              dot={false}
            />
            
            {/* Forecasted Data - Dashed Lines */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="forecasted_total_tests"
              stroke={metricColors.totalTests}
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Forecasted Total Tests"
              dot={false}
              opacity={0.7}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="forecasted_positive_cases"
              stroke={metricColors.positiveCases}
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Forecasted Positive Cases"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="forecasted_infection_rate"
              stroke={metricColors.infectionRate}
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Forecasted Infection Rate (%)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
