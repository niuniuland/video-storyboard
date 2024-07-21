import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Edit, Save } from "lucide-react";
import ImageUpload from './ImageUpload';

const StoryboardTable = forwardRef(({ data, setData }, ref) => {
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const containerRef = useRef(null);
    const scrollAnimationRef = useRef(null);
    const intervalRef = useRef(null);
    const recording = useRef(false);

    useImperativeHandle(ref, () => ({
        scrollToNext: () => {
            if (highlightedIndex < data.length - 1) {
                setHighlightedIndex(highlightedIndex + 1);
            }
        },
        startAutoScroll: () => {
            recording.current = true;
            setHighlightedIndex(0);
            setTimeout(() => {
                setHighlightedIndex(1);
                setTimeout(() => {
                    setHighlightedIndex(2);
                }, 2000);
            }, 2000);
            setTimeout(() => {
                intervalRef.current = setInterval(() => {
                    setHighlightedIndex((prevIndex) => {
                        const nextIndex = prevIndex + 1;
                        if (nextIndex >= 2) {
                            const row = containerRef.current.querySelector(`tr:nth-child(${nextIndex + 1})`);
                            if (row) {
                                smoothScroll(containerRef.current, row.offsetTop, 500);
                            }
                        }
                        return nextIndex;
                    });

                    if (highlightedIndex >= data.length - 1) {
                        clearInterval(intervalRef.current);
                    }
                }, 2000);
            }, 4000);
        },
        stopAutoScroll: () => {
            recording.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
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

    const toggleEditMode = () => {
        setEditMode(!editMode);
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
                    className="w-full bg-gray-700 text-white border-gray-600"
                    style={cellStyle}
                />
            );
        }
        return <div style={cellStyle} className="text-gray-100 text-center">{row[field]}</div>;
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

    return (
        <div className="overflow-hidden" style={{ height: 'calc(70vh - 100px)' }}>
            <div className="flex justify-between items-center mb-4">
                <Button onClick={toggleEditMode} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                    {editMode ? <><Save className="mr-2 h-4 w-4" /> 保存</> : <><Edit className="mr-2 h-4 w-4" /> 编辑</>}
                </Button>
                {editMode && (
                    <Button onClick={addRow} variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
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
                <Table className="border-gray-700">
                    <TableHeader className="sticky top-0 bg-gray-800 z-10">
                        <TableRow className="border-b border-gray-700">
                            <TableHead style={{ width: '60px' }} className="text-gray-100 font-bold text-center">镜号</TableHead>
                            <TableHead style={{ width: '120px' }} className="text-gray-100 font-bold text-center">画面</TableHead>
                            <TableHead style={{ width: '60px' }} className="text-gray-100 font-bold text-center">景别</TableHead>
                            <TableHead style={{ width: '60px' }} className="text-gray-100 font-bold text-center">机位</TableHead>
                            <TableHead style={{ width: '60px' }} className="text-gray-100 font-bold text-center">运镜</TableHead>
                            <TableHead style={{ width: '240px' }} className="text-gray-100 font-bold text-center">镜头分析</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={row.id} className={`border-b border-gray-700 ${index === highlightedIndex ? 'bg-sky-700' : 'bg-gray-800'}`}>
                                <TableCell className='p-2 border-r border-gray-700'>{renderCell(row, index, 'shot', '60px')}</TableCell>
                                <TableCell className='p-2 border-r border-gray-700' style={{ width: '120px' }}>
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
                                <TableCell className='p-2 border-r border-gray-700'>{renderCell(row, index, 'angle', '60px')}</TableCell>
                                <TableCell className='p-2 border-r border-gray-700'>{renderCell(row, index, 'camera', '60px')}</TableCell>
                                <TableCell className='p-2 border-r border-gray-700'>{renderCell(row, index, 'movement', '60px')}</TableCell>
                                <TableCell className='p-2'>{renderCell(row, index, 'script', '240px')}</TableCell>
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
