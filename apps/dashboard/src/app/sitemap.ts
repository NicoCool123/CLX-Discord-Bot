import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://clx.gg', changeFrequency: 'monthly', priority: 1 },
    { url: 'https://clx.gg/docs', changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://clx.gg/support', changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://clx.gg/status', changeFrequency: 'hourly', priority: 0.6 },
    { url: 'https://clx.gg/team', changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://clx.gg/legal', changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://clx.gg/legal/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://clx.gg/legal/tos', changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://clx.gg/legal/impressum', changeFrequency: 'yearly', priority: 0.3 },
  ];
}
