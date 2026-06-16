import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for the workspace root inference issue
  outputFileTracingRoot: path.join(__dirname),
  // Don't let ESLint stylistic rules block production builds on Vercel.
  // TypeScript type-checking still runs during the build.
  eslint: {
    ignoreDuringBuilds: true,
  },
};
 
export default withNextIntl(nextConfig);
