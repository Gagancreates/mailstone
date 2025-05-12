"use client";

import dynamic from 'next/dynamic';

// Use dynamic import with ssr:false in this client component
const NetworkStatus = dynamic(() => import('@/components/NetworkStatus'), { 
  ssr: false 
});

export default function ClientNetworkStatus() {
  return <NetworkStatus />;
} 