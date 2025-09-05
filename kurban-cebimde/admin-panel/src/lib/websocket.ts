import { io, Socket } from 'socket.io-client';

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  token?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export class WebSocketManager {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private eventListeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: WebSocketConfig) {
    this.config = {
      autoReconnect: true,
      reconnectInterval: 3000,
      ...config
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url, {
          auth: {
            token: this.config.token
          },
          transports: ['websocket', 'polling'],
          autoConnect: true,
          reconnection: this.config.autoReconnect,
          reconnectionDelay: this.config.reconnectInterval,
          reconnectionAttempts: this.maxReconnectAttempts
        });

        this.socket.on('connect', () => {
          console.log('WebSocket bağlantısı kuruldu');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket bağlantısı kesildi:', reason);
          this.emit('disconnected', { reason });
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket bağlantı hatası:', error);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(error);
          }
        });

        this.socket.on('error', (error) => {
          console.error('WebSocket hatası:', error);
          this.emit('error', error);
        });

        // Genel olay dinleyicisi
        this.socket.onAny((eventName: string, ...args: any[]) => {
          this.emit(eventName, ...args);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(room: string, data?: any): void {
    if (this.socket) {
      this.socket.emit('join_room', { room, ...data });
    }
  }

  leaveRoom(room: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', { room });
    }
  }

  // Admin odaları
  joinAdminRoom(adminId: string): void {
    this.joinRoom('admin', { admin_id: adminId });
  }

  joinUserRoom(userId: string): void {
    this.joinRoom('user', { user_id: userId });
  }

  joinOrderRoom(orderId: string): void {
    this.joinRoom('order', { order_id: orderId });
  }

  // Olay dinleyicileri
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Event listener error for ${event}:`, error);
        }
      });
    }
  }

  // Durum kontrolü
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export const getWebSocketManager = (config?: WebSocketConfig): WebSocketManager => {
  if (!wsManager && config) {
    wsManager = new WebSocketManager(config);
  }
  return wsManager!;
};

export const initWebSocket = async (config: WebSocketConfig): Promise<WebSocketManager> => {
  if (wsManager) {
    wsManager.disconnect();
  }
  
  wsManager = new WebSocketManager(config);
  await wsManager.connect();
  return wsManager;
};

export const disconnectWebSocket = (): void => {
  if (wsManager) {
    wsManager.disconnect();
    wsManager = null;
  }
};

// React Hook
export const useWebSocket = (config: WebSocketConfig) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        const manager = await initWebSocket(config);
        
        if (!mounted) return;

        manager.on('connect', () => {
          setIsConnected(true);
          setError(null);
        });

        manager.on('disconnect', () => {
          setIsConnected(false);
        });

        manager.on('error', (err) => {
          setError(err);
        });

        // Genel olay dinleyicisi
        manager.on('*', (event: WebSocketEvent) => {
          setLastEvent(event);
        });

      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      disconnectWebSocket();
    };
  }, [config.url, config.token]);

  return {
    isConnected,
    error,
    lastEvent,
    manager: wsManager
  };
};

// Import React hooks
import { useEffect, useState } from 'react';

