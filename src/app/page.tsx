'use client'

import { useRef, useState } from 'react'
import StoryboardTable from '../components/StoryboardTable'
import FileUpload from '../components/FileUpload'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic';

const VideoRecorder = dynamic(() => import('../components/VideoRecorder'), { ssr: false });

export default function Home() {
  const [data, setData] = useState([])
  const tableRef = useRef(null)

  const handleFileUpload = (excelData) => {
    setData(excelData)
  }

  return (
    <main className="container mx-auto p-0 mt-8 max-w-3xl bg-gray-900 dark">
      <Card className="bg-gray-800 text-white border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <CardTitle className="text-2xl font-bold">视频分镜头拆解</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <FileUpload onUpload={handleFileUpload} />
            <VideoRecorder tableRef={tableRef} />
          </div>
          <StoryboardTable data={data} setData={setData} ref={tableRef} />
        </CardContent>
      </Card>
    </main>
  )
}