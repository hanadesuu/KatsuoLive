import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'KatsuoLive - JPOP公演・選抽情報プラットフォーム',
  description: 'JPOPライブイベントとチケット選抽情報のプラットフォーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
