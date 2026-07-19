// Security headers applied to every response (Lab 3 — security foundation).
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' }, // no clickjacking / embedding
  { key: 'X-Content-Type-Options', value: 'nosniff' }, // no MIME sniffing
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse pulls in pdfjs-dist, which breaks when webpack-bundled in the
  // server runtime. Externalize so it is required at runtime from node_modules.
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdfjs-dist'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
