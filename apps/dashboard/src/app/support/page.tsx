import type { Metadata } from 'next';
import { MarketingNav } from '../../components/MarketingNav';
import { MarketingFooter } from '../../components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get support for the CLX Discord bot.',
};

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNav />
      <main className="flex-1 flex items-center justify-center px-8 py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Support</h1>
          <p className="text-[#e5e7eb]/55 mt-3">Coming soon.</p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
