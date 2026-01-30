import React from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCanvasStore } from '@/store/CanvasStore';


export const ConnectionStatus: React.FC = () => {
    const { isConnected, fps, strokeBatch } = useCanvasStore();

    return (
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
            {/* Connection status */}
            <Badge
                variant={isConnected ? 'default' : 'destructive'}
                className={isConnected ? 'bg-green-500' : ''}
            >
                {isConnected ? (
                    <>
                        <Wifi className="h-3 w-3 mr-1" />
                        Connected
                    </>
                ) : (
                    <>
                        <WifiOff className="h-3 w-3 mr-1" />
                        Disconnected
                    </>
                )}
            </Badge>

            {/* FPS indicator */}
            {isConnected && (
                <Badge variant="outline" className="bg-white">
                    <Activity className="h-3 w-3 mr-1" />
                    {fps} FPS
                </Badge>
            )}

            {/* Pending batch indicator */}
            {strokeBatch.length > 0 && (
                <Badge variant="secondary" className="animate-pulse">
                    Syncing {strokeBatch.length}...
                </Badge>
            )}
        </div>
    );
};