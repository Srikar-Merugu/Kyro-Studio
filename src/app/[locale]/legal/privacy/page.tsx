import { getTranslations } from "next-intl/server";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-display mb-12">{t('privacy_title')}</h1>
      <div className="prose prose-invert prose-brand max-w-none text-neutral-300">
        <p className="mb-6">Last updated: March 2024</p>
        <section className="mb-10">
          <h2 className="text-2xl font-display text-white mb-4 uppercase">1. Introduction</h2>
          <p>This Privacy Policy explains how Kyro Studio (we, our, or us) collects, uses, and protects your information when you visit our website at kyrostudio.eu.</p>
        </section>
        <section className="mb-10">
          <h2 className="text-2xl font-display text-white mb-4 uppercase">2. Information We Collect</h2>
          <p>We may collect personal information such as your name, email address, and any other information you voluntarily submit through our contact forms.</p>
        </section>
        <section className="mb-10">
          <h2 className="text-2xl font-display text-white mb-4 uppercase">3. How We Use Your Information</h2>
          <p>We use the information we collect to respond to your inquiries, provide our services, and improve our website functionality.</p>
        </section>
        <section className="mb-10">
          <h2 className="text-2xl font-display text-white mb-4 uppercase">4. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at hello@kyrostudio.eu.</p>
        </section>
      </div>
    </div>
  );
}
