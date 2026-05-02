import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import BottomNav from '@/components/BottomNav';
import PushNotificationListener from '@/components/PushNotificationListener';

export const metadata: Metadata = {
  title: 'Roommate Tasker',
  description: 'Manage and rotate household chores with your roommates in real-time.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Tasker' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#08080e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <BottomNav />
          <PushNotificationListener />
        </AuthProvider>
      </body>
    </html>
  );
}
