"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, Mail, Calendar, Send, CheckCircle } from "lucide-react";
import CityVideo from "@/components/CityVideo";

const EASE = [0.16, 1, 0.3, 1] as const;

const CTA = () => {
  const t = useTranslations("cta");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const label =
    "block mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500";
  const field =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-neutral-600 transition-all focus:border-brand-yellow/60 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-brand-yellow/15";

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-black py-28 md:py-36"
    >
      <CityVideo dark={0.86} />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-12">
        {/* Headline */}
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: EASE }}
            className="font-display font-medium uppercase leading-[0.95] tracking-[-0.04em] text-[clamp(34px,6vw,84px)] text-white"
          >
            {t("headline_1")}{" "}
            <span className="text-brand-yellow">{t("headline_accent")}</span>{" "}
            {t("headline_2")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400"
          >
            {t("subtext")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Book a Call */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="flex min-h-[440px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md transition-colors duration-500 hover:border-brand-yellow/30 md:p-10"
          >
            <div>
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/10 text-brand-yellow">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-display text-xl font-medium uppercase tracking-[-0.02em] text-white">
                {t("card_call_title")}
              </h3>
              <p className="leading-relaxed text-neutral-400">
                {t("card_call_desc")}
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <Link
                href="https://calendar.app.google/SkMr99BXaF5DhGn98"
                target="_blank"
                data-cursor="hover"
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-8 py-4 font-display text-base font-bold uppercase tracking-[-0.02em] text-black shadow-[0_0_30px_rgba(212,217,63,0.25)] transition-all hover:shadow-[0_0_55px_rgba(212,217,63,0.5)]"
              >
                {t("button")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="mailto:hello@kyrostudio.eu"
                data-cursor="hover"
                className="flex items-center justify-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" />
                hello@kyrostudio.eu
              </Link>
            </div>
          </motion.div>

          {/* Send a Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="flex min-h-[440px] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md transition-colors duration-500 focus-within:border-brand-yellow/40 md:p-10"
          >
            {status === "success" ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <CheckCircle className="h-12 w-12 text-brand-yellow" />
                <h3 className="font-display text-2xl text-white">
                  {t("form.success_title")}
                </h3>
                <p className="text-neutral-400">{t("form.success_text")}</p>
                <button
                  onClick={() => setStatus("idle")}
                  data-cursor="hover"
                  className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-brand-yellow hover:underline"
                >
                  {t("form.send_another")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow/10 text-brand-yellow">
                  <Send className="h-5 w-5" />
                </div>
                <h3 className="mb-6 font-display text-xl font-medium uppercase tracking-[-0.02em] text-white">
                  {t("card_form_title")}
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label}>{t("form.name_label")}</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder={t("form.name_placeholder")}
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label}>{t("form.email_label")}</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder={t("form.email_placeholder")}
                      className={field}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col">
                  <label className={label}>{t("form.message_label")}</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder={t("form.message_placeholder")}
                    className={`${field} flex-1 resize-none`}
                  />
                </div>

                {status === "error" && (
                  <p className="mt-3 text-sm text-red-400">{t("form.error")}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  data-cursor="hover"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 font-display text-base font-bold uppercase tracking-[-0.02em] text-white transition-all hover:border-brand-yellow hover:bg-brand-yellow hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === "loading" ? t("form.sending") : t("form.submit")}
                  {status !== "loading" && <Send className="h-4 w-4" />}
                </button>
                <p className="mt-4 text-center text-xs text-neutral-500">
                  By submitting this form, you agree to our{" "}
                  <Link
                    href="/en/legal/privacy"
                    className="text-brand-yellow underline hover:no-underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
