import type { MetadataRoute } from 'next';

// Served at /manifest.webmanifest; Next auto-injects <link rel="manifest">.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Capital Clear',
    short_name: 'Capital Clear',
    description:
      'Ottawa snow removal, lawn care, and seasonal property maintenance marketplace.',
    // localePrefix:'always' means '/' redirects — open the installed app at /en.
    start_url: '/en',
    display: 'standalone',
    background_color: '#0A0708',
    theme_color: '#0A0708',
    lang: 'en-CA',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}
