"use client"
import Image from 'next/image'
import Link from 'next/link'
import  ChartCard  from '~/components/ChartCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import Header from '~/components/Header'
import TestInfoCard from '~/components/TestInfoCard'

const data = [
  { name: "Jan", positive: 40, negative: 20 },
  { name: "Feb", positive: 50, negative: 10 },
  { name: "Mar", positive: 60, negative: 30 },
  { name: "Apr", positive: 70, negative: 25 },
  { name: "May", positive: 80, negative: 40 },
]
export default function Home() {
  return (
    <>
    <Header/>
    
  </>
  )
}
