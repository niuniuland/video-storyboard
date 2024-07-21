import React, { useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"

const RecordButton = ({ isRecording, onToggle }) => {
    const mediaRecorderRef = useRef(null)
    const recordedChunksRef = useRef([])

    useEffect(() => {
        if (isRecording) {
            startRecording()
        } else {
            stopRecording()
        }
    }, [isRecording])

    const startRecording = async () => {
        const tableElement = document.querySelector('.overflow-hidden')
        if (!tableElement) return

        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                displaySurface: "browser",
                cursor: "always"
            },
            audio: false
        })

        mediaRecorderRef.current = new MediaRecorder(stream)
        mediaRecorderRef.current.ondataavailable = handleDataAvailable
        mediaRecorderRef.current.onstop = handleStop

        mediaRecorderRef.current.start()
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop()
        }
    }

    const handleDataAvailable = (event) => {
        if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data)
        }
    }

    const handleStop = () => {
        const blob = new Blob(recordedChunksRef.current, {
            type: "video/webm"
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        document.body.appendChild(a)
        a.style = "display: none"
        a.href = url
        a.download = "table-recording.webm"
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const handleToggle = () => {
        onToggle(!isRecording)
    }

    return (
        <Button
            onClick={handleToggle}
            className={isRecording ? 'bg-red-500' : ''}
        >
            {isRecording ? '停止录制' : '开始录制'}
        </Button>
    )
}

export default RecordButton