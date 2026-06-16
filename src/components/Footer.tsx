"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Magnetic from "@/components/Magnetic";

const EASE = [0.16, 1, 0.3, 1] as const;

const Footer = () => {
  const t = useTranslations("footer");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/kyrostudio-agency/",
      icon: <Linkedin className="w-5 h-5" />,
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/kyrostudio.eu/",
      icon: <Instagram className="w-5 h-5" />,
    },
    {
      name: "Email",
      href: "mailto:hello@kyrostudio.eu",
      icon: <Mail className="w-5 h-5" />,
    },
  ];

  const quickLinks = [
    { name: "Services", href: "#services" },
    { name: "Why Kyro", href: "#why-kyro" },
    { name: "Process", href: "#process" },
    { name: t("contact"), href: "#contact" },
  ];

  const legalLinks = [
    { name: t("legal.privacy"), href: `/${locale}/legal/privacy` },
    { name: t("legal.terms"), href: `/${locale}/legal/terms` },
  ];

  const underline =
    "relative inline-block after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-brand-yellow after:transition-all after:duration-300 hover:after:w-full";

  return (
    <footer className="relative border-t border-brand-yellow/10 bg-brand-bg pt-20 pb-10 px-6 overflow-hidden">
      <div className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-yellow/50 to-transparent" />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="lg:col-span-2"
          >
            <Magnetic strength={0.25}>
              <Link
                href={`/${locale}`}
                data-cursor="hover"
                className="relative h-10 w-28 block mb-6"
              >
                <Image
                  src="/logo.svg"
                  alt="Kyro Studio Logo"
                  fill
                  className="object-contain"
                />
              </Link>
            </Magnetic>
            <p className="type-eyebrow text-neutral-500 mb-8 font-sans text-xs font-bold tracking-[0.12em] uppercase">
              Web · Marketing · AI Automation
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <Magnetic key={social.name} strength={0.45}>
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    aria-label={social.name}
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-brand-yellow hover:text-brand-yellow hover:shadow-[0_0_20px_-4px_rgba(212,217,63,0.6)] transition-all"
                  >
                    {social.icon}
                  </Link>
                </Magnetic>
              ))}
            </div>
          </motion.div>

          <div className="hidden lg:block"></div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            <h4 className="type-eyebrow mb-6 text-white font-sans text-xs font-bold tracking-[0.12em] uppercase">
              LINKS
            </h4>
            <div className="flex flex-col space-y-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  data-cursor="hover"
                  className={`type-nav text-neutral-400 hover:text-brand-yellow transition-colors font-sans text-sm font-normal leading-[1.5] w-fit ${underline}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/5 text-xs text-neutral-500 gap-6">
          <p className="type-copyright font-sans text-xs font-normal leading-[1.5]">
            © {currentYear} Kyro Studio. All rights reserved.
          </p>
          <div className="flex space-x-8">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                data-cursor="hover"
                className={`type-legal hover:text-brand-yellow transition-colors font-sans text-xs font-normal leading-[1.5] ${underline}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
