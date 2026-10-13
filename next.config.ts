import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The e2e container builds into its own folder so it never clobbers the dev server's .next.
  distDir: process.env.ARCANA_DIST_DIR ?? '.next',
  // Small self-contained server; only the production image build turns this on.
  output: process.env.ARCANA_STANDALONE ? 'standalone' : undefined,
  // The card art is already a small lossy WebP; 75 (the default) would compress it a second time.
  images: { qualities: [90] },
};

export default nextConfig;
