import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
class SocketManager {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    initialize(): Socket {
        if (this.socket) {
            if (this.socket?.connected) {
                return this.socket;
            }
            return this.socket.connect();
        }

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.setupListeners();
        return this.socket;
    }

    private setupListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket?.id);
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);

            if (reason === 'io server disconnect') {
                // Server kicked us, need to manually reconnect
                this.socket?.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`✅ Reconnected after ${attemptNumber} attempts`);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Reconnection attempt ${attemptNumber}`);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('Reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('❌ Reconnection failed after all attempts');
        });
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.reconnectAttempts = 0;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const socketManager = new SocketManager();

// Convenience exports
export const initializeSocket = () => socketManager.initialize();
export const getSocket = () => socketManager.getSocket();
export const disconnectSocket = () => socketManager.disconnect();
export const isSocketConnected = () => socketManager.isConnected();
