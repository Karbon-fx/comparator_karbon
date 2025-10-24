import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MicrosoftClarity } from '@/components/MicrosoftClarity';

export const metadata: Metadata = {
  title: 'FX Savings Ace',
  description: 'A USD to INR FX Savings Calculator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full bg-transparent">
        {children}
        <Toaster />
        <MicrosoftClarity />
      </body>
    </html>
  );
}
