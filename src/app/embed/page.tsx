"use client";
import { KarbonFxWidget } from '@/components/KarbonFxWidget';
import React, { useEffect } from 'react';

export default function EmbedPage() {
    useEffect(() => {
        const sendHeight = () => {
            if (window.parent) {
                const height = document.body.scrollHeight;
                window.parent.postMessage({ type: 'karbon-height-update', height }, '*');
            }
        };

        sendHeight();

        const observer = new ResizeObserver(() => sendHeight());
        observer.observe(document.body);

        // Also recalculate on transitions
        const timer = setInterval(sendHeight, 300);

        return () => {
            observer.disconnect();
            clearInterval(timer);
        };
    }, []);
  return (
    <main className="bg-transparent">
        <KarbonFxWidget />
    </main>
  );
}
