/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,           // مهم: حذف Powered by Vercel
  compress: true,
  generateEtags: false,
  trailingSlash: false,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
