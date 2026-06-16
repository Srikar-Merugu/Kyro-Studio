"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["services", "why-kyro", "process", "contact"];

const Nav = () => {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const observers: IntersectionObserver[] = [];
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [mounted]);

  const navLinks = [
    { name: t("services"), href: "#services" },
    { name: t("why"), href: "#why-kyro" },
    { name: t("process"), href: "#process" },
    { name: t("contact"), href: "#contact" },
  ];

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "hr" : "en";
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPathname;
  };

  if (!mounted) return null;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 w-full z-100 transition-all duration-500 px-6 py-4",
        isScrolled
          ? "bg-[#08080e]/70 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)] py-3"
          : "bg-transparent"
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[999] bg-[#D4D93F] text-[#08080E] px-4 py-2 rounded font-bold text-sm"
      >
        Skip to main content
      </a>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="relative h-8 w-24" aria-label="Kyro Studio — Go to homepage">
          <Image
            src="/logo.svg"
            alt="Kyro Studio Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              data-cursor="hover"
              className={cn(
                "type-nav transition-colors font-sans text-sm font-normal leading-[1.5] relative inline-block after:absolute after:left-0 after:-bottom-1.5 after:h-px after:bg-brand-yellow after:transition-all after:duration-300",
                activeSection === link.href.slice(1)
                  ? "text-brand-yellow after:w-full"
                  : "hover:text-brand-yellow after:w-0 hover:after:w-full"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center">
          <div className="relative group">
            <button
              type="button"
              onClick={toggleLocale}
              data-cursor="hover"
              aria-label={locale === "en" ? "Switch language to Croatian" : "Switch language to English"}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-current text-xs font-bold uppercase hover:bg-white hover:text-black dark:hover:bg-brand-yellow dark:hover:text-black transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "HR" : "EN"}</span>
            </button>
            <span className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white/10 backdrop-blur-sm px-2.5 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {locale === "en" ? "Switch to Croatian" : "Switch to English"}
            </span>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            id="mobile-menu"
            className="fixed inset-0 top-[70px] bg-brand-bg/95 backdrop-blur-xl z-50 flex flex-col p-8 space-y-6 lg:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-4xl font-display uppercase transition-colors",
                    activeSection === link.href.slice(1) && "text-brand-yellow"
                  )}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pt-6 border-t border-white/10 flex flex-col space-y-6"
            >
              <button
                type="button"
                onClick={toggleLocale}
                aria-label={locale === "en" ? "Switch language to Croatian" : "Switch language to English"}
                className="flex items-center space-x-2 text-xl"
              >
                <Globe />
                <span>{locale === "en" ? "Hrvatski" : "English"}</span>
              </button>
              <Link
                href="https://calendar.app.google/SkMr99BXaF5DhGn98"
                target="_blank"
                className="bg-brand-yellow text-brand-bg text-center py-5 rounded-xl type-button"
              >
                {t("cta")}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Nav;
