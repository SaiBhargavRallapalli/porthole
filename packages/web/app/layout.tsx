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
        <Script id="gtm" strategy="beforeInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-NBTV4W35');`}</Script>
      </head>
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased">
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NBTV4W35" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        {children}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-DN9KYVJHQ2" strategy="afterInteractive" />
        <Script id="ga4-dn9kyvjhq2" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DN9KYVJHQ2');`}</Script>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-V6MSPDCYDK" strategy="afterInteractive" />
        <Script id="ga4-v6mspdcydk" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-V6MSPDCYDK');`}</Script>
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
