/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Set desired value here
    }
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  }
};

export default nextConfig;
