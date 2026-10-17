import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Procurement Intelligence Module',
  description: 'Unit price forecasts and market context for better procurement decisions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
