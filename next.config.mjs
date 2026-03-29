/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cf.geekdo-images.com",
      },
    ],
  },
};

export default nextConfig;
