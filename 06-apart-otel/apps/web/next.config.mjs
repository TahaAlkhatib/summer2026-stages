/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proje klasoru disindaki package-lock.json'lari dikkate alma
  turbopack: {
    root: import.meta.dirname,
  },
  // Yapay zeka araclari icin dosya uretmesin
  agentRules: false,
  // Gelistirme modundaki koseye yapisan rozeti gizle
  devIndicators: false,
};

export default nextConfig;
