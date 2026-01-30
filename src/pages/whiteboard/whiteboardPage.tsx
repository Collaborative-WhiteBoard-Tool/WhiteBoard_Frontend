import { Button } from "@/components/ui/button"
import { useWhiteboard } from "@/hooks/use-whiteboard"
import { ROUTES } from "@/lib/contants/routes"
import { useCanvasStore } from "@/store/CanvasStore"
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import Canvas from "@/components/whiteboard/Canvas"
import { UserList } from "./UserList"
import { ConnectionStatus } from "./ConnectionStatus"
import { Toolbar } from "@/components/whiteboard/Toolbar"
import { useWhiteboardSocket } from "@/hooks/use-whiteboardSocket"
import { WhiteboardAutoSave } from "@/components/whiteboard/WhiteboardAutoSave"

export const WhiteboardPage = () => {

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [canvasReady, setCanvasReady] = useState(false);

    const { currentWhiteboard, isLoading: whiteboardLoading, fetchWhiteboardById } = useWhiteboard();
    const { isLoading: canvasLoading, setIsLoading: setCanvasLoading } = useCanvasStore();


    const { sendUndo, sendRedo } = useWhiteboardSocket(id, null);


    // Fetch whiteboard metadata
    useEffect(() => {
        if (id) {
            fetchWhiteboardById(id);
        }
    }, [id]);

    // 2. Quản lý Dimensions & Ready State
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setDimensions(prev => {
                        // Chỉ update nếu lệch trên 50px (chiều rộng) hoặc 50px (chiều cao)
                        if (Math.abs(prev.width - width) < 50 && Math.abs(prev.height - height) < 50) {
                            return prev;
                        }
                        return { width, height };
                    });
                    //nếu width và height > 0 thì set canvasReady là true -> render Cavnas
                    setCanvasReady(true);
                }
            }
        });

        resizeObserver.observe(el);
        return () => {
            resizeObserver.disconnect();
        }
    }, []);

    // 3. Xử lý logic Loading kết thúc
    useEffect(() => {
        if (currentWhiteboard && canvasReady) {
            // Tắt loading khi thông tin board đã có và canvasReady là true
            setCanvasLoading(false);
        }
    }, [currentWhiteboard, canvasReady, setCanvasLoading]);

    // 4.Fullscreen handling
    useEffect(() => {
        const handleFullscreenChange = () => {
            console.log('fullscreen:', document.fullscreenElement)
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    //Shortcut undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) sendRedo(); else sendUndo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sendUndo, sendRedo]);

    const handleToggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };



    console.log('🎯 Canvas render check:', {
        canvasReady,
        id,
        width: dimensions.width,
        height: dimensions.height,
        shouldRender: canvasReady && id && dimensions.width > 0 && dimensions.height > 0
    });

    const shouldRenderCanvas = canvasReady && id && dimensions.width > 0;

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            <WhiteboardAutoSave whiteboardId={id!} />
            {/* Header: Chỉ hiện khi không fullscreen */}
            {!isFullscreen && currentWhiteboard && (
                <header className="bg-white border-b shadow-sm z-20">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.DASHBOARD)}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-lg font-bold">{currentWhiteboard.title}</h1>
                                {currentWhiteboard.description && (
                                    <p className="text-sm text-gray-600">{currentWhiteboard.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {<UserList />}
                            {/* <Button variant="outline" size="sm" onClick={() => setShowUsers(!showUsers)}>
                                <UsersIcon className="h-4 w-4 mr-2" />
                                {showUsers ? 'Hide' : 'Show'} Users
                            </Button> */}
                            <Button variant="outline" size="sm" onClick={handleToggleFullscreen}>
                                {isFullscreen ? <Minimize2 className="h-2 w-2" /> : <Maximize2 className="h-2 w-2" />}
                            </Button>
                        </div>
                    </div>
                    <Toolbar onUndo={sendUndo} onRedo={sendRedo} />
                </header>
            )}


            {/* Main Area: Nơi chứa Canvas */}
            <main ref={containerRef} className="flex-1 relative bg-[#f8f9fa] overflow-hidden">
                {/* Canvas Component */}
                {shouldRenderCanvas ? (
                    <Canvas
                        whiteboardId={id}
                        width={dimensions.width}
                        height={dimensions.height}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                        <div className="animate-pulse text-gray-400">Initializing Canvas...</div>
                    </div>
                )}

                {/* Loading Overlays: Không dùng return sớm để tránh unmount Main */}
                {(whiteboardLoading || canvasLoading) && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">
                                {whiteboardLoading ? "Loading metadata..." : "Connecting to session..."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Overlays UI */}
                <ConnectionStatus />

                {isFullscreen && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
                        <Toolbar onUndo={sendUndo} onRedo={sendRedo} />
                    </div>
                )}
            </main>
        </div>
    );

}
export default WhiteboardPage;
