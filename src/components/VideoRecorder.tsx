import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import html2canvas from 'html2canvas';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const VideoRecorder = ({ tableRef }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const framesRef = useRef([]);
    const recordingInterval = useRef(null);
    const ffmpegRef = useRef(new FFmpeg());

    useEffect(() => {
        const loadFFmpeg = async () => {
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            const ffmpeg = ffmpegRef.current;
            try {
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                });
                setFfmpegLoaded(true);
                console.log('FFmpeg loaded successfully');
            } catch (error) {
                console.error('Error loading FFmpeg:', error);
            }
        };

        loadFFmpeg();
    }, []);

    const startRecording = () => {
        setIsRecording(true);
        framesRef.current = [];
        tableRef.current.startAutoScroll();
        recordingInterval.current = setInterval(captureFrame, 100); // Capture 10 frames per second
    };

    const stopRecording = async () => {
        setIsRecording(false);
        clearInterval(recordingInterval.current);
        tableRef.current.stopAutoScroll();
        setIsProcessing(true);
        await processFrames();
        setIsProcessing(false);
    };

    const captureFrame = async () => {
        if (tableRef.current && tableRef.current.getContainer) {
            const container = tableRef.current.getContainer();
            if (container) {
                const canvas = await html2canvas(container);
                const imageData = canvas.toDataURL('image/jpeg');
                framesRef.current.push(imageData);
                console.log(`Captured frame ${framesRef.current.length}, data length: ${imageData.length}`);
            } else {
                console.error('Container is null');
            }
        } else {
            console.error('tableRef.current or getContainer is undefined');
        }
    };

    const processFrames = async () => {
        const ffmpeg = ffmpegRef.current;

        console.log(`Processing ${framesRef.current.length} frames`);

        try {
            for (let i = 0; i < framesRef.current.length; i++) {
                const imageData = framesRef.current[i].split(',')[1];
                await ffmpeg.writeFile(`frame${i}.jpg`, new Uint8Array(atob(imageData).split("").map(char => char.charCodeAt(0))));
                console.log(`Wrote frame ${i}`);
            }

            console.log('Starting FFmpeg command');

            await ffmpeg.exec([
                '-framerate', '10',
                '-i', 'frame%d.jpg',
                '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', // Ensure width and height are divisible by 2
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-pix_fmt', 'yuv420p',
                'out.mp4'
            ]);

            console.log('FFmpeg command completed');

            const data = await ffmpeg.readFile('out.mp4');
            console.log(`Output file size: ${data.byteLength} bytes`);

            if (data.byteLength > 0) {
                const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
                const a = document.createElement('a');
                a.href = url;
                a.download = 'table_recording.mp4';
                a.click();
            } else {
                console.error('Generated video has no content');
                framesRef.current = [];
            }
        } catch (error) {
            console.error('Error during video processing:', error);
            framesRef.current = [];
        }
    };

    if (!ffmpegLoaded) {
        return <Button disabled>加载中...</Button>;
    }

    return (
        <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing || !ffmpegLoaded}
            className={isRecording ? 'bg-red-500' : ''}
        >
            {isProcessing ? '处理中...' : isRecording ? '停止录制' : '开始录制'}
        </Button>
    );
};

export default VideoRecorder;
