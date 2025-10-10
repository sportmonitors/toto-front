"use client";

import { useEffect, useState, useCallback } from "react";
import { socketClient } from "./socket-client";
import useAuth from "../auth/use-auth";

interface BalanceUpdateData {
  userId: number;
  balance: number;
  lockedBalance: number;
  timestamp: string;
}

interface NotificationData {
  message: string;
  type: "success" | "error" | "info";
  timestamp: string;
}

export default function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined>();
  const { user, isLoaded } = useAuth();

  const connect = useCallback(() => {
    if (user && isLoaded) {
      socketClient.connect();
    }
  }, [user, isLoaded]);

  const disconnect = useCallback(() => {
    socketClient.disconnect();
  }, []);

  const joinRoom = useCallback((room: string) => {
    socketClient.joinRoom(room);
  }, []);

  const leaveRoom = useCallback((room: string) => {
    socketClient.leaveRoom(room);
  }, []);

  const ping = useCallback(() => {
    socketClient.ping();
  }, []);

  useEffect(() => {
    // Connect when user is loaded and authenticated
    if (user && isLoaded) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [user, isLoaded, connect, disconnect]);

  useEffect(() => {
    // Update connection status
    const updateStatus = () => {
      setIsConnected(socketClient.getConnectionStatus());
      setSocketId(socketClient.getSocketId());
    };

    // Initial status
    updateStatus();

    // Update status periodically
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Listen for balance updates
    const handleBalanceUpdate = (event: CustomEvent<BalanceUpdateData>) => {
      console.log("Balance update received in hook:", event.detail);
      // You can add additional logic here if needed
    };

    // Listen for notifications
    const handleNotification = (event: CustomEvent<NotificationData>) => {
      console.log("Notification received in hook:", event.detail);
      // You can add additional logic here if needed
    };

    window.addEventListener(
      "balance-update",
      handleBalanceUpdate as EventListener
    );
    window.addEventListener(
      "socket-notification",
      handleNotification as EventListener
    );

    return () => {
      window.removeEventListener(
        "balance-update",
        handleBalanceUpdate as EventListener
      );
      window.removeEventListener(
        "socket-notification",
        handleNotification as EventListener
      );
    };
  }, []);

  return {
    isConnected,
    socketId,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    ping,
  };
}
