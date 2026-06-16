"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Bot, Cpu, Zap, Share2, BarChart3, Workflow } from "lucide-react";
import Pipeline from "@/components/Pipeline";
import Magnetic from "@/components/Magnetic";

const EASE = [0.16, 1, 0.3, 1] as const;

const AiAutomation = () => {
  const t = useTranslations("ai_automation");

  const icons = [
    <Bot key="1" className="w-5 h-5" />,
    <Workflow key="2" className="w-5 h-5" />,
    <Share2 key="3" className="w-5 h-5" />,
    <Cpu key="4" className="w-5 h-5" />,
    <BarChart3 key="5" className="w-5 h-5" />,
    <Zap key="6" className="w-5 h-5" />,
  ];

  return (
    <section id="automation" className="bg-transparent py-32 px-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-navy/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: EASE }}
              className="type-eyebrow text-brand-yellow mb-6 font-sans text-xs font-bold tracking-[0.12em] uppercase"
            >
              {t("eyebrow")}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              className="type-h2 mb-8 font-display text-5xl font-normal leading-[1.05] tracking-[-0.05em] uppercase"
            >
              {t("headline")} <span className="text-brand-yellow">{t("headline_accent")}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
              className="type-body-lead text-neutral-400 mb-10 max-w-xl font-sans text-lg font-normal leading-[1.65]"
            >
              {t("description")}
            </motion.p>

            <div className="flex flex-wrap gap-4 mb-12">
              {["Make", "Zapier", "n8n"].map((tool, i) => (
                <motion.span
                  key={tool}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.3 + i * 0.1 }}
                  className="px-6 py-2 rounded-full border border-brand-yellow/30 text-brand-yellow type-eyebrow font-sans text-xs font-bold tracking-[0.12em] uppercase"
                >
                  {tool}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.08 * i }}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-yellow/10 flex items-center justify-center text-brand-yellow mb-4 group-hover:bg-brand-yellow group-hover:text-brand-bg transition-colors">
                  {icons[i]}
                </div>
                <p className="type-capability flex items-start gap-3 font-sans text-[15px] font-medium leading-[1.65] normal-case">
                  <span className="text-brand-yellow shrink-0 mt-[2px]">→</span>
                  {t(`capabilities.${i}`)}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Magnetic strength={0.4}>
              <a
                href="https://calendar.app.google/SkMr99BXaF5DhGn98"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className="group relative inline-flex items-center gap-2 overflow-hidden bg-brand-yellow text-brand-bg font-display font-bold text-sm uppercase tracking-wider px-6 py-3 rounded-full transition-shadow shadow-[0_0_20px_rgba(212,217,63,0.2)] hover:shadow-[0_0_45px_rgba(212,217,63,0.5)]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-700 group-hover:translate-x-[200%]" />
                {t("cta_text")} →
              </a>
            </Magnetic>
            <span className="text-neutral-500 text-sm">{t("cta_sub")}</span>
          </motion.div>
        </div>

        {/* Living automation pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative z-10 mt-24 rounded-3xl border border-white/8 bg-white/[0.015] px-6 py-10 sm:px-12 backdrop-blur-sm"
        >
          <p className="mb-8 text-center type-eyebrow text-brand-yellow font-sans text-xs font-bold tracking-[0.12em] uppercase">
            From lead to conversion — on autopilot
          </p>
          <Pipeline />
        </motion.div>
      </div>
    </section>
  );
};

export default AiAutomation;
