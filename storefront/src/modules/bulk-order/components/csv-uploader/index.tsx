"use client"

import React, { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"
import Papa from "papaparse"
import { Upload, FileText, AlertCircle, FileDigit } from "lucide-react"
import { Heading } from "@medusajs/ui"

interface CSVUploaderProps {
  onUpload: (data: { name: string; size: string }[]) => void
}

export function CSVUploader({ onUpload }: CSVUploaderProps) {
  const [error, setError] = React.useState<string | null>(null)

  const processData = (data: any[]) => {
    if (data.length === 0) {
      setError("The file is empty.")
      return
    }

    // Dynamically find name and size columns
    const headers = Object.keys(data[0])
    const nameKey = headers.find(h => ["name", "crew member", "member", "person", "full name"].includes(h.toLowerCase().trim()))
    const sizeKey = headers.find(h => ["size", "sizing", "shirt size", "t-shirt size"].includes(h.toLowerCase().trim()))

    if (!nameKey || !sizeKey) {
      setError(`Missing required columns. Please ensure your file has "Name" and "Size" headers. Found: ${headers.join(", ")}`)
      return
    }

    const formatted = data
      .map(row => ({
        name: row[nameKey]?.toString() || "",
        size: row[sizeKey]?.toString().toUpperCase() || ""
      }))
      .filter(item => item.name && item.size)
    
    if (formatted.length === 0) {
      setError("No valid crew members found. Check common formatting issues.")
      return
    }

    onUpload(formatted)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    setError(null)

    if (!file) return

    const fileExt = file.name.split('.').pop()?.toLowerCase()

    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processData(results.data),
        error: (error) => setError(`CSV Parse Error: ${error.message}`)
      })
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const ab = e.target?.result
          const wb = XLSX.read(ab, { type: 'array' })
          const firstSheetName = wb.SheetNames[0]
          const worksheet = wb.Sheets[firstSheetName]
          const data = XLSX.utils.sheet_to_json(worksheet)
          processData(data)
        } catch (err) {
          setError("Error parsing Excel file. Please ensure it's a valid .xlsx or .xls file.")
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"]
    },
    multiple: false
  })

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-[32px] p-16 transition-all cursor-pointer
        ${isDragActive ? "border-maritime-gold bg-maritime-gold/5" : "border-slate-100 hover:border-slate-200 bg-slate-50"}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col gap-8">
        <Heading className="text-xl font-black uppercase tracking-tight text-slate-900 text-left">Mass Upload Crew</Heading>
        
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
            <Upload className={isDragActive ? "text-maritime-gold" : "text-slate-300"} size={32} />
          </div>
          <div className="space-y-2">
            <p className="font-black text-2xl text-slate-900 tracking-tight">Drop your crew roster here</p>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Upload a .csv, .xlsx or .xls with "Name" and "Size" columns</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-3 text-red-400 text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
