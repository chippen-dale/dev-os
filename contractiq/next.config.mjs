/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse pulls in pdfjs-dist, which breaks when webpack-bundled in the
  // server runtime. Externalize so it is required at runtime from node_modules.
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdfjs-dist'],
  },
};

export default nextConfig;
