import Directory from "@/components/Directory";
import { Sidebar } from "@/components/Shell";
export default function Home() {
  return (
    <div className="page-wrap">
      <main id="main">
        <div className="breadcrumb">
          <a href="/">home</a> / financial
        </div>
        <h1>Financial Calculators</h1>
        <Directory />
      </main>
      <Sidebar />
    </div>
  );
}
