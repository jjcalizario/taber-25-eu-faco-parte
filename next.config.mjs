/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  async rewrites() {
    // URL curta e estável para o QR Code: https://dominio/25anos
    return [{ source: "/25anos", destination: "/" }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // O painel nunca pode ser embutido em outro site
      { source: "/admin/:path*", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
    ];
  },
};

export default nextConfig;
