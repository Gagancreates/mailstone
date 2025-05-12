"use client";

import { useState, useEffect } from 'react';
import { AlertCircle, WifiOff, Wifi } from 'lucide-react';
import { getFirebaseConnectionStatus, checkFirebaseConnection } from '@/lib/firebase';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);

  useEffect(() => {
    // Check connection status initially and on mount
    const checkConnection = async () => {
      const isConnected = navigator.onLine && await getFirebaseConnectionStatus();
      setIsOnline(isConnected);
      setShowAlert(!isConnected);
    };

    checkConnection();

    // Set up event listeners for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      checkFirebaseConnection()
        .then(isConnected => {
          if (!isConnected) {
            setIsOnline(false);
            setShowAlert(true);
          }
        });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection status periodically (every 30 seconds)
    const interval = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleRetryConnection = async () => {
    setCheckingConnection(true);
    
    try {
      // Force a recheck of the Firebase connection
      const isConnected = await checkFirebaseConnection();
      setIsOnline(isConnected && navigator.onLine);
      
      if (isConnected && navigator.onLine) {
        setShowAlert(false);
      }
    } catch (error) {
      console.error("Failed to verify connection:", error);
    } finally {
      setCheckingConnection(false);
    }
  };

  if (!showAlert) return null;

  return (
    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
            {isOnline ? "Connected" : "Connection Issue"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {!isOnline ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      Unable to connect to our servers
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      This may affect your ability to save data. Please check your internet connection.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                Connection restored! You can now continue using the application.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button 
            onClick={handleRetryConnection} 
            disabled={checkingConnection}
            variant={isOnline ? "default" : "outline"}
          >
            {checkingConnection ? "Checking..." : isOnline ? "Dismiss" : "Retry Connection"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 