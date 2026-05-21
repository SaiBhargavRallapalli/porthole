import type { Metadata } from 'next';
import Script from 'next/script';
import { ADSENSE_CLIENT, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'porthole — instant localhost tunnels',
  description:
    'Expose your local server to the internet with a single command. Self-hosted, open source, no accounts.',
  openGraph: {
    title: 'porthole — instant localhost tunnels',
    description: 'Expose your local server to the internet with a single command.',
    url: SITE_URL,
    siteName: 'porthole',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'porthole — instant localhost tunnels',
    description: 'Expose your local server to the internet with a single command.',
  },
  other: {
    'google-adsense-account': ADSENSE_CLIENT,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕳</text></svg>" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased">
        {children}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
