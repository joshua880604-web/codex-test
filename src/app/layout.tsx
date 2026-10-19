import type { Metadata } from "next";
import { Header, Footer } from "@/components/Shell";
import "./globals.css";
import { siteConfig } from "@/lib/site";
const config = siteConfig();
export const metadata: Metadata = {
  ...(config.origin ? { metadataBase: new URL(config.origin) } : {}),
  robots: { index: config.indexable, follow: true },
  title: {
    default: "Financial Calculators",
    template: "%s | Financial Calculators",
  },
  description:
    "Free financial calculators for mortgages, loans, investments, retirement, taxes, and everyday money decisions.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
