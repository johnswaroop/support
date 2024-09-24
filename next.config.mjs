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
  },
  async headers() {
    return [
      {
        source: "/floating", // Replace with your chatbot route
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL", // You can change this to allow specific domains if needed
          },
        ],
      },
    ];
  },
};

export default nextConfig;
