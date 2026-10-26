import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export",
  poweredByHeader: false,
  // The export compatibility pass also transforms framework chunks. Keep those
  // URLs distinct from previously cached, modern-only versions of the same file.
  deploymentId: "safari14-v1",
};
export default config;
