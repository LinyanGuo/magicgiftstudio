// Next.js config. This does NOT make next/image accept OS absolute paths (e.g. "D:\...").
// You still must pass either:
//  - a public-relative path (starts with '/') for files placed in <project>/public,
//  - a static import (import img from 'public/...'), or
//  - an external URL whose hostname is listed under images.domains or matched by images.remotePatterns.
//
// Example usage in a component (preferred for files under public):
//   <Image src="/products/ChristmasLittleTree1.jpg" width={600} height={400} alt="Tree" />
//
// If you load images from remote hosts, add the hostname below (example):
// images: { domains: ['example.com'] }
// or use remotePatterns for more control.
const nextConfig = {
	reactStrictMode: true,
	images: {
		// allow external placeholder images (and other external hosts you use)
		domains: ['via.placeholder.com'],
		// disable Next.js image optimizer so /_next/image won't proxy upstream (fixes the optimizer fetch failure)
		unoptimized: true
	},

	// Use a safer source-map in development so webpack does not rely on eval/inline scripts
	// which triggers the browser CSP errors you saw.
	webpack(config, { dev, isServer }) {
		if (dev) {
			// avoid "eval" based devtools to eliminate "unsafe-eval" / inline script requirement
			config.devtool = 'cheap-module-source-map';
		}
		return config;
	},

	// Add development-only headers to relax CSP so HMR/inline scripts work while developing.
	// IMPORTANT: do not enable these relaxations in production.
	async headers() {
		// Only return relaxed headers in development mode
		if (process.env.NODE_ENV === 'development') {
			return [
				{
					source: '/(.*)',
					headers: [
						{
							key: 'Content-Security-Policy',
							// Allow inline and eval only for local development tooling (HMR, dev overlay).
							// Keep this narrow and development-only. Remove or tighten for production.
							value: "default-src 'self' http: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https:; connect-src 'self' ws: http: https:; img-src 'self' data: http: https:; style-src 'self' 'unsafe-inline' http: https:; font-src 'self' data:;"
						}
					]
				}
			];
		}
		// In production return no custom headers here (Next uses defaults or your production settings)
		return [];
	}
};

module.exports = nextConfig;
