"use client"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,Legend } from "recharts"

interface ChartCardProps {
    data: { name: string; positive: number; negative: number }[];
  }


export default function ChartCard(
    { data }: ChartCardProps
) {
  return (
    <Card className="w-full min-w-[8rem] ">
      <CardHeader>
        <CardTitle>Monthly Data</CardTitle>
      </CardHeader>
      <CardContent>
      <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            {/* <CartesianGrid strokeDasharray="3 3" />  */}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="positive"
              stroke="#22c55e" // green
              strokeWidth={2}
              name="Positive"
            />
            <Line
              type="monotone"
              dataKey="negative"
              stroke="#ef4444" // red
              strokeWidth={2}
              name="Negative"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
