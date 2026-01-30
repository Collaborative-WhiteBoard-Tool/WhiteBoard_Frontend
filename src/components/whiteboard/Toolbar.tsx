import React from 'react';
import {
    Pen, Eraser, Minus, Square, Circle, MousePointer,
    Grid3x3,
    Undo,
    Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCanvasStore } from '@/store/CanvasStore';
import { DrawTool } from '@/types/canvas.type';


export const Toolbar: React.FC<{ onUndo: () => void, onRedo: () => void }> = ({ onRedo, onUndo }) => {
    const { showGrid, setShowGrid, canUndo, canRedo } = useCanvasStore();
    const { tool, color, width, setTool, setColor, setWidth } = useCanvasStore();


    const tools: { icon: React.ReactNode; value: DrawTool; label: string; shortcut: string }[] = [
        { icon: <Pen className="h-4 w-4" />, value: 'pen', label: 'Pen', shortcut: 'P' },
        { icon: <Eraser className="h-4 w-4" />, value: 'eraser', label: 'Eraser', shortcut: 'E' },
        { icon: <Minus className="h-4 w-4" />, value: 'line', label: 'Line', shortcut: 'L' },
        { icon: <Square className="h-4 w-4" />, value: 'rectangle', label: 'Rectangle', shortcut: 'R' },
        { icon: <Circle className="h-4 w-4" />, value: 'circle', label: 'Circle', shortcut: 'C' },
        { icon: <MousePointer className="h-4 w-4" />, value: 'select', label: 'Select', shortcut: 'V' },
    ];

    const colors = [
        { name: 'Black', value: '#000000' },
        { name: 'Red', value: '#FF0000' },
        { name: 'Green', value: '#00FF00' },
        { name: 'Blue', value: '#0000FF' },
        { name: 'Yellow', value: '#FFFF00' },
        { name: 'Magenta', value: '#FF00FF' },
        { name: 'Cyan', value: '#00FFFF' },
        { name: 'Orange', value: '#FFA500' },
        { name: 'Purple', value: '#800080' },
        { name: 'Pink', value: '#FFC0CB' },
    ];

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Don't trigger if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'p':
                    setTool('pen');
                    break;
                case 'e':
                    setTool('eraser');
                    break;
                case 'l':
                    setTool('line');
                    break;
                case 'r':
                    setTool('rectangle');
                    break;
                case 'c':
                    setTool('circle');
                    break;
                case 'v':
                    setTool('select');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [setTool]);

    return (
        <div className="flex items-center gap-4 p-4 bg-white border-b shadow-sm">
            <TooltipProvider>
                {/* Tools */}
                <div className="flex gap-1">
                    {tools.map((t) => (
                        <Tooltip key={t.value}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={tool === t.value ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => {
                                        setTool(t.value)
                                    }}
                                    className="relative"
                                >
                                    {t.icon}
                                    {tool === t.value && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-500 rounded-full"></div>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t.label} ({t.shortcut})</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-300" />

                {/* Colors */}
                <div className="flex gap-1">
                    {colors.map((c) => (
                        <Tooltip key={c.value}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setColor(c.value)}
                                    className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${color === c.value
                                        ? 'border-violet-500 ring-2 ring-violet-200'
                                        : 'border-gray-300'
                                        }`}
                                    style={{ backgroundColor: c.value }}
                                    aria-label={c.name}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{c.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-300" />

                {/* Stroke width */}
                <div className="flex items-center gap-3 min-w-[200px]">
                    <span className="text-sm font-medium text-gray-700 ">Width:</span>
                    <Slider
                        value={[width]}
                        onValueChange={(values: number[]) => setWidth(values[0])}
                        min={1}
                        max={20}
                        step={1}
                        className="flex-1 bg-gray-300 rounded-2xl"
                    />
                    <span className="text-sm font-medium w-10 text-right">{width}px</span>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-300" />

                {/* Additional tools */}
                <div className="flex gap-1">
                    {/* 
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Zoom In</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Zoom Out</p>
                        </TooltipContent>
                    </Tooltip> */}

                    <Button
                        variant="outline"
                        size="icon"
                        className='hover:bg-gray-300'
                        onClick={onUndo}
                        disabled={!canUndo}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className='hover:bg-gray-300'
                        onClick={onRedo}
                        disabled={!canRedo}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>

                    <Button
                        variant={showGrid ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowGrid(!showGrid)}
                    >
                        <Grid3x3 className="h-4 w-4 mr-2" />
                        Grid
                    </Button>
                </div>
            </TooltipProvider>
        </div>
    );
};
