
import SiteLink from "@/components/SiteLink";
export const metadata = { robots: { index: false, follow: true } };
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <h1>Calculator not found</h1>
      <p>
        Find a tool in the{" "}
        <SiteLink href="/financial-calculator.html">financial calculator directory</SiteLink>.
      </p>
    </main>
  );
}
