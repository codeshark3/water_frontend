"use client"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useEffect, useState } from "react"

// Types for chart data structure
interface ChartDataPoint {
  name: string;                    // Month name (e.g., "2023-01")
  total_tests?: number;            // Historical total tests
  positive_cases?: number;         // Historical positive cases
  forecasted_total_tests?: number; // Predicted total tests
  forecasted_positive_cases?: number; // Predicted positive cases
  is_forecast?: boolean;           // Whether this is forecast data
}

// Props for the ChartCard component
interface ChartCardProps {
  diseaseType?: string;            // Disease type to fetch data for (e.g., "oncho", "schistosomiasis")
  title?: string;                  // Chart title
  data?: ChartDataPoint[];         // Pre-provided data (optional)
}

// API response structure from Flask backend
interface ForecastApiResponse {
  disease_type: string;
  historical_data: any[];
  forecast_data: any[];
  combined_data: any[];
  source: string;
}

export default function ChartCard({ 
  diseaseType, 
  data, 
  title = "Monthly Data" 
}: ChartCardProps) {
  // State for chart data and loading status
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch forecast data from Flask API
  const fetchForecastData = async (disease: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:5238/flask-api/forecast/${disease}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch forecast data: ${response.status}`)
      }
      
      const result: ForecastApiResponse = await response.json()
      
      // Transform API data to chart format
      const transformedData = result.combined_data.map((item: any) => ({
        name: item.month,                                    // Month as chart label
        total_tests: item.total_tests || null,               // Historical tests
        positive_cases: item.positive_cases || null,         // Historical cases
        forecasted_total_tests: item.forecasted_total_tests || null,     // Predicted tests
        forecasted_positive_cases: item.forecasted_positive_cases || null, // Predicted cases
        is_forecast: item.is_forecast                        // Forecast flag
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
          <CardTitle>{title}</CardTitle>
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
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Main chart component
  return (
    <Card className="w-full min-w-[8rem]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            {/* Chart axes */}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            
            {/* Historical Data - Solid Lines */}
            <Line
              type="monotone"
              dataKey="total_tests"
              stroke="#3b82f6"        // Blue color
              strokeWidth={2}
              name="Total Tests"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="positive_cases"
              stroke="#22c55e"        // Green color
              strokeWidth={2}
              name="Positive Cases"
              dot={false}
            />
            
            {/* Forecasted Data - Dashed Lines */}
            <Line
              type="monotone"
              dataKey="forecasted_total_tests"
              stroke="#3b82f6"        // Same blue as historical
              strokeDasharray="5 5"   // Dashed line pattern
              strokeWidth={2}
              name="Forecasted Total Tests"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="forecasted_positive_cases"
              stroke="#22c55e"        // Same green as historical
              strokeDasharray="5 5"   // Dashed line pattern
              strokeWidth={2}
              name="Forecasted Positive Cases"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
