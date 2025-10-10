"use client";

import { io, Socket } from "socket.io-client";
import { getTokensInfo } from "../auth/auth-tokens-info";

class SocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const tokens = getTokensInfo();
    if (!tokens?.token) {
      console.log("No token available for socket connection");
      return;
    }

    // Socket.IO should connect to the main server, not the API endpoint
    const serverUrl = "http://localhost:3000";

    console.log("Connecting to Socket.IO server:", serverUrl);
    console.log("Token available:", !!tokens.token);

    try {
      // Try connecting without explicit namespace first
      this.socket = io(serverUrl, {
        auth: {
          token: tokens.token,
        },
        transports: ["polling"],
        timeout: 10000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to create socket connection:", error);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;

      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on("balance-update", (data) => {
      console.log("Balance update received:", data);
      this.handleBalanceUpdate(data);
    });

    this.socket.on("notification", (data) => {
      console.log("Notification received:", data);
      this.handleNotification(data);
    });

    this.socket.on("connected", (data) => {
      console.log("Server welcome:", data);
    });

    this.socket.on("pong", (data) => {
      console.log("Pong received:", data);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleBalanceUpdate(data: any): void {
    // Dispatch custom event for balance update
    const event = new CustomEvent("balance-update", {
      detail: {
        userId: data.userId,
        balance: data.balance,
        lockedBalance: data.lockedBalance,
        timestamp: data.timestamp,
      },
    });
    window.dispatchEvent(event);
  }

  private handleNotification(data: any): void {
    // Dispatch custom event for notification
    const event = new CustomEvent("socket-notification", {
      detail: {
        message: data.message,
        type: data.type,
        timestamp: data.timestamp,
      },
    });
    window.dispatchEvent(event);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log("Socket disconnected manually");
    }
  }

  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit("join-room", { room });
    }
  }

  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit("leave-room", { room });
    }
  }

  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit("ping");
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Create singleton instance
export const socketClient = new SocketClient();
