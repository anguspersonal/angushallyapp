'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered successfully:', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              console.log('🔄 Service Worker update found');
            });
          })
          .catch((registrationError) => {
            console.error('❌ Service Worker registration failed:', registrationError);
          });
      });
    }
  }, []);

  return null; // This component doesn't render anything
} 