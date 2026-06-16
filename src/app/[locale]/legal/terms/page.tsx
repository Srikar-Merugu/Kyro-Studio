import { getTranslations } from "next-intl/server";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-display mb-12">{t('terms_title')}</h1>
      <div className="prose prose-invert prose-brand max-w-none text-neutral-300">
        <p className="mb-6">Last updated: March 2024</p>
        <section className="mb-10">
          <h2 className="text-2xl font-display text-white mb-4 uppercase">1. Acceptance of Terms</h2>
          <p>By accessing and using this website, you agree to be bound by these Terms of Service.</p>
        </section>
      </div>
    </div>
  );
}
