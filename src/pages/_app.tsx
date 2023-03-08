import '@/styles/globals.css'
import type {AppProps} from 'next/app'
import Script from "next/script";
import {Analytics} from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Script async src="https://www.googletagmanager.com/gtag/js?id=G-4T3SKXVG57"></Script>
    <Script id="google-analytics" strategy="afterInteractive">
      {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-4T3SKXVG57');`}
    </Script>
    <Component {...pageProps} />
    <Analytics />
  </>
}
