import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Edit, Save } from "lucide-react";
import ImageUpload from './ImageUpload';
import { saveAs } from 'file-saver';


const StoryboardTable = forwardRef(({ data, setData }, ref) => {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [editMode, setEditMode] = useState(false);
    const containerRef = useRef(null);
    const scrollAnimationRef = useRef(null);
    const intervalRef = useRef(null);
    const recording = useRef(false);

    useImperativeHandle(ref, () => ({
        startAutoScroll: () => {
            toggleEditMode(false);
            recording.current = true;
            setHighlightedIndex(0);
            const scrollNext = (index) => {
                if (index >= data.length) {
                    recording.current = false;
                    return;
                }

                const duration = parseInt(data[index - 1].duration) || 120; // 默认2秒
                const seconds = Math.floor(duration / 60) + (duration % 60) / 60;
                console.log(`第 ${index + 1} 行停留 ${seconds}s`)

                setTimeout(() => {
                    setHighlightedIndex(index);
                    if (recording.current) {
                        if (index >= 2) {
                            const row = containerRef.current.querySelector(`tr:nth-child(${index + 1})`);
                            if (row) {
                                smoothScroll(containerRef.current, row.offsetTop, 100);
                            }
                        }
                        scrollNext(index + 1);
                    }
                }, Math.ceil(seconds * 1000));
            };

            scrollNext(1);
        },
        stopAutoScroll: () => {
            recording.current = false;
            smoothScroll(containerRef.current, 0, 500);
            setHighlightedIndex(0);
        },
        getContainer: () => containerRef.current
    }));

    const smoothScroll = (element, to, duration) => {
        const start = element.scrollTop + 100;
        const change = to - start;
        const startTime = performance.now();

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const scrollTop = start + change * progress;
            element.scrollTop = scrollTop - 100;

            if (progress < 1) {
                scrollAnimationRef.current = requestAnimationFrame(animateScroll);
            }
        };

        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    };

    const toggleEditMode = (isEdit?: boolean) => {
        setEditMode(isEdit === undefined ? !editMode : isEdit);
    };

    const renderCell = (row, index, field, width) => {
        const cellStyle = {
            width: width,
            maxWidth: width,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
        };

        if (editMode) {
            return (
                <Input
                    value={row[field]}
                    onChange={(e) => handleInputChange(index, field, e.target.value)}
                    className="w-full bg-gray-700 text-white border-white"
                    style={cellStyle}
                />
            );
        }
        return <div style={cellStyle} className="text-gray-100 text-center text-lg">{row[field]}</div>;
    };

    const handleInputChange = (index, field, value) => {
        const newData = [...data];
        newData[index][field] = value;
        setData(newData);
    };

    const handleImageUpload = (index, imageUrl) => {
        const newData = [...data];
        newData[index].image = imageUrl;
        setData(newData);
    };

    const handleImageRemove = (index) => {
        const newData = [...data];
        newData[index].image = '';
        setData(newData);
    };

    const addRow = () => {
        setData([...data, { id: Date.now(), shot: '', angle: '', camera: '', movement: '', content: '', script: '', duration: '', image: '' }]);
    };

    const exportToHTML = () => {
        let html = `<table border="1">
            <tr><th>镜号</th><th>图片</th><th>景别</th><th>机位</th><th>运镜</th><th>镜头分析</th></tr>`;

        data.forEach(row => {
            const imageHtml = row.image ? `<img src="${row.image}" alt="镜头${row.shot}" style="max-width:100px;">` : '';
            html += `<tr>
                <td>${row.shot}</td>
                <td>${imageHtml}</td>
                <td>${row.angle}</td>
                <td>${row.camera}</td>
                <td>${row.movement}</td>
                <td>${row.script}</td>
                <td>${row.duration || 120}</td>
            </tr>`;
        });

        html += '</table>';
        return html;
    };

    const handleExportHTML = () => {
        const html = exportToHTML();
        const blob = new Blob([html], { type: 'text/html' });
        saveAs(blob, 'storyboard.html');
    };


    return (
        <div className="overflow-hidden" style={{ height: 'calc(70vh - 100px)' }}>
            <div className="flex justify-between items-center mb-4">
                <Button onClick={() => toggleEditMode(!editMode)} variant="outline" className="text-white border-white hover:bg-gray-700">
                    {editMode ? <><Save className="mr-2 h-4 w-4" /> 保存</> : <><Edit className="mr-2 h-4 w-4" /> 编辑</>}
                </Button>
                <Button onClick={handleExportHTML} variant="outline" className="text-white border-white hover:bg-gray-700">
                    导出 HTML
                </Button>
                {editMode && (
                    <Button onClick={addRow} variant="outline" className="text-white border-white hover:bg-gray-700">
                        <Plus className="mr-2 h-4 w-4" /> 添加行
                    </Button>
                )}
            </div>
            <div
                ref={containerRef}
                className="hide-scrollbar"
                style={{
                    height: 'calc(70vh - 150px)',
                    overflowY: 'scroll',
                }}
            >
                <Table className="border-white">
                    <TableHeader className="sticky top-0 bg-black z-10">
                        <TableRow className="border-b-2 border-white text-lg">
                            <TableHead style={{ width: '70px' }} className="text-gray-100 font-bold text-center">镜号</TableHead>
                            <TableHead style={{ width: '120px' }} className="text-gray-100 font-bold text-center">画面</TableHead>
                            <TableHead style={{ width: '70px' }} className="text-gray-100 font-bold text-center">景别</TableHead>
                            <TableHead style={{ width: '70px' }} className="text-gray-100 font-bold text-center">运镜</TableHead>
                            <TableHead className="text-gray-100 font-bold text-center">镜头分析</TableHead>
                            {editMode && <TableHead style={{ width: '70px' }} className="text-gray-100 font-bold text-center">时长</TableHead>}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={row.id} className={`border-b-2 border-white ${index === highlightedIndex ? 'bg-teal-800 highlighted-row' : 'bg-black'}`}>
                                <TableCell className='p-2 border-r-2 border-white'>{renderCell(row, index, 'shot', '70px')}</TableCell>
                                <TableCell className='p-2 border-r-2 border-white' style={{ width: '120px' }}>
                                    {editMode && !row.image && <ImageUpload onUpload={(url) => handleImageUpload(index, url)} />}
                                    {row.image && (
                                        <div className="relative group">
                                            <img src={row.image} alt="Scene" className="w-full h-16 object-cover rounded" style={{ objectFit: 'cover' }} />
                                            {editMode && (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleImageRemove(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className='p-2 border-r-2 border-white'>{renderCell(row, index, 'angle', '70px')}</TableCell>
                                <TableCell className='p-2 border-r-2 border-white'>{renderCell(row, index, 'movement', '70px')}</TableCell>
                                <TableCell className={`p-2 ${editMode && 'border-r-2 border-white'}`}>{renderCell(row, index, 'script')}</TableCell>
                                {editMode && <TableCell className='p-2'>{renderCell(row, index, 'duration', '70px')}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
});

StoryboardTable.displayName = 'StoryboardTable';

export default StoryboardTable;
