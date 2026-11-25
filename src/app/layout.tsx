import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { appConfig } from '@/config/app.config';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: `${appConfig.brand.name} — Business Operating System`,
  description: appConfig.brand.tagline,
  openGraph: {
    title: `${appConfig.brand.name} — Business Operating System`,
    description: appConfig.brand.tagline,
    type: 'website',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
