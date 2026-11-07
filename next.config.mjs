/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The storage adapter scans data/. Never bundle legacy accounts or runtime reports.
  outputFileTracingExcludes: {
    '/*': [
      './data/users.json',
      './data/notification_logs.json',
      './data/email_config.json',
      './data/mistake_reports.json',
    ],
  },
};

export default nextConfig;
