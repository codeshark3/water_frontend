// components/TestInfoCard.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

  type TestInfoCardProps = {
    total: number
    positive: number
    negative: number
  }
  
  export default function TestInfoCards({ total, positive, negative }: TestInfoCardProps) {
    return (
      <div className="flex-col w-full">
        {/* Total */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{total}</p>
          </CardContent>
        </Card>
  
  <div className="flex w-full">
        {/* Positive */}
        <Card className="p-4 border-l-4 border-green-500 w-1/2 m-2">
          <CardHeader>
            <CardTitle>Positive Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-green-600">{positive}</p>
          </CardContent>
        </Card>
  
        {/* Negative */}
        <Card className="p-4 border-l-4 border-red-500 w-1/2 m-2">
          <CardHeader>
            <CardTitle>Negative Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-red-600">{negative}</p>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }
  
 