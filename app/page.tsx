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
    <Tabs defaultValue="oncho" className="w-full p-4">
      <TabsList className="w-full">
        <TabsTrigger value="oncho">Onchocerciasis</TabsTrigger>
        <TabsTrigger value="schisto">Schistosomiasis</TabsTrigger>
        <TabsTrigger value="lf">LF</TabsTrigger>
        <TabsTrigger value="helminths">Helminths</TabsTrigger>
      </TabsList>
      <TabsContent value="oncho" className='w-full flex  mx-4'>
        <div className='w-2/3'>
        <ChartCard data={data}/></div>
     <div className='w-1/3'>
     <div className="grid gap-4 px-4">
       <TestInfoCard 
         total={240}
         positive={150} 
         negative={90}
       />
     </div>
     </div>

      </TabsContent>
      <TabsContent value="schisto" className='w-full flex  mx-4'>     <div className='w-2/3'>
        <ChartCard data={data}/></div>
     <div className='w-1/3'>
     <div className="grid gap-4 px-4">
       <TestInfoCard 
         total={240}
         positive={150} 
         negative={90}
       />
     </div>
     </div></TabsContent>
      <TabsContent value="lf"className='w-full flex  mx-4'>    <div className='w-2/3'>
        <ChartCard data={data}/></div>
     <div className='w-1/3'>
     <div className="grid gap-4 px-4">
       <TestInfoCard 
         total={240}
         positive={150} 
         negative={90}
       />
     </div>
     </div></TabsContent>
      <TabsContent value="helminths" className='w-full flex mx-4'>  
          <div className='w-2/3'>
        <ChartCard data={data}/></div>
     <div className='w-1/3'>
     <div className="grid gap-4 px-4">
       <TestInfoCard 
         total={240}
         positive={150} 
         negative={90}
       />
     </div>
     </div></TabsContent>
    </Tabs>
  </>
  )
}
