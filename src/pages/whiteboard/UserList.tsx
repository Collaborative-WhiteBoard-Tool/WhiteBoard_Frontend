import React from 'react';
import { Users, Wifi, WifiOff, Activity } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCanvasStore } from '@/store/CanvasStore';




export const UserList: React.FC = () => {
    const { users, isConnected, fps, strokes } = useCanvasStore();
    const [showStats, setShowStats] = React.useState(false);

    return (
        <Card className="absolute top-4 right-4 w-72 shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Online ({users.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <Badge variant="default" className="bg-green-500">
                                <Wifi className="h-3 w-3 mr-1" />
                                Connected
                            </Badge>
                        ) : (
                            <Badge variant="destructive">
                                <WifiOff className="h-3 w-3 mr-1" />
                                Offline
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* User list */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {users.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No users online
                        </p>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.userId}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback
                                        style={{ backgroundColor: user.color }}
                                        className="text-white text-xs font-semibold"
                                    >
                                        {(user.displayName ?? user.userName)?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {user.displayName ?? user.userName}
                                    </p>
                                    {/* <p className="text-xs text-gray-500">
                                        {user.lastActiveAt && !isNaN(new Date(user.lastActiveAt).getTime())
                                            ? `${formatDistanceToNow(new Date(user.lastActiveAt))} ago`
                                            : 'Just now'}
                                    </p> */}
                                </div>
                                <div
                                    className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                                    title="Online"
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Stats toggle */}
                <button
                    onClick={() => setShowStats(!showStats)}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                >
                    <Activity className="h-3 w-3" />
                    {showStats ? 'Hide' : 'Show'} Stats
                </button>

                {/* Performance stats */}
                {showStats && (
                    <div className="border-t pt-3 space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                            <span>FPS:</span>
                            <span className="font-mono">{fps}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Strokes:</span>
                            <span className="font-mono">{strokes.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Memory:</span>
                            <span className="font-mono">
                                {((strokes.length * 100) / 1024).toFixed(2)} KB
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
