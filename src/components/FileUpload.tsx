import React from 'react'
import { Button } from "@/components/ui/button"
import * as XLSX from 'xlsx'

const FileUpload = ({ onUpload }) => {
    const processExcelData = (excelData) => {
        return excelData.map((row, index) => ({
            id: index + 1,
            shot: row['镜号'] || '',
            angle: row['景别'] || '',
            camera: row['机位'] || '',
            movement: row['运镜'] || '',
            script: row['镜头分析'] || '',
            duration: row['时长'] || 120,
            image: ''  // Excel 不包含图片，所以我们初始化为空字符串
        }))
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result)
                    const workbook = XLSX.read(data, { type: 'array' })
                    const sheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[sheetName]
                    const excelData = XLSX.utils.sheet_to_json(worksheet)
                    const processedData = processExcelData(excelData)
                    onUpload(processedData)
                } catch (error) {
                    console.error('Error parsing Excel:', error)
                }
            }
            reader.readAsArrayBuffer(file)
        }
    }

    return (
        <div>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="fileInput"
            />
            <Button onClick={() => document.getElementById('fileInput').click()}>
                上传 Excel 文件
            </Button>
        </div>
    )
}

export default FileUpload