
import SiteLink from "@/components/SiteLink";
import Directory from "@/components/DirectoryEntry";
import { Sidebar } from "@/components/Shell";
export default function Home() {
  return (
    <div className="page-wrap">
      <main id="main">
        <div className="breadcrumb">
          <SiteLink href="/">home</SiteLink> / financial
        </div>
        <h1>Financial Calculators</h1>
        <Directory />
      </main>
      <Sidebar />
    </div>
  );
}
