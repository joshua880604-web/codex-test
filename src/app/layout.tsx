import type { Metadata } from "next";
import { Header, Footer } from "@/components/Shell";
import "./globals.css";
import { siteConfig,siteName } from "@/lib/site";
import { browserSupportScript } from "@/lib/browser-support";
const config = siteConfig();
export const metadata: Metadata = {
  ...(config.origin ? { metadataBase: new URL(config.origin) } : {}),
  robots: { index: config.indexable, follow: true },
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description:
    "Free financial calculators for mortgages, loans, investments, retirement, taxes, and everyday money decisions.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: browserSupportScript }} />
        <link rel="describedby" href="/llms.txt" />
        <script
          async
          fetchPriority="low"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <p id="browser-support-notice" className="browser-support-notice" hidden suppressHydrationWarning role="status">
          Update your browser to use these calculators. On iPhone or iPad, update iOS or use a newer device.
        </p>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
