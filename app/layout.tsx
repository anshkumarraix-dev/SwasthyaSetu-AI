import type { Metadata } from 'next';
import './globals.css';
import Shell from '@/components/layout/Shell';

export const metadata: Metadata = {
  title: 'SwasthyaSetu AI — Health Resilience Copilot for PHCs',
  description: 'Predict shortages. Coordinate care. Protect communities. Explainable, offline-first health resilience copilot for Primary Health Centres and district health officers.',
  openGraph: {
    title: 'SwasthyaSetu AI — Health Resilience Copilot',
    description: 'Predict shortages. Coordinate care. Protect communities. Human-approved medicine redistribution and emergency response.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwasthyaSetu AI',
    description: 'Explainable, offline-first health resilience copilot for Primary Health Centres.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased" suppressHydrationWarning>
      <body className="min-h-full font-sans text-slate-900 bg-slate-50 flex flex-col" suppressHydrationWarning>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
