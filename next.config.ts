import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/financial-calculator.html",
        permanent: true,
      },
    ];
  },
};
export default config;
