import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'porthole — instant localhost tunnels',
  description:
    'Expose your local server to the internet with a single command. Self-hosted, open source, no accounts.',
  metadataBase: new URL('https://porthole.devbench.co.in'),
  openGraph: {
    title: 'porthole — instant localhost tunnels',
    description: 'Expose your local server to the internet with a single command.',
    url: 'https://porthole.devbench.co.in',
    siteName: 'porthole',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'porthole — instant localhost tunnels',
    description: 'Expose your local server to the internet with a single command.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕳</text></svg>" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased">{children}</body>
    </html>
  );
}
