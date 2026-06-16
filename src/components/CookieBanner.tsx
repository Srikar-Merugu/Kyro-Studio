"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const GA4_ID = "G-SCRQZF2PGD";

const loadGA4 = () => {
  if (typeof window === "undefined" || document.getElementById("ga4-script")) return;
  const src = document.createElement("script");
  src.id = "ga4-script";
  src.async = true;
  src.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(src);

  const cfg = document.createElement("script");
  cfg.id = "ga4-config";
  cfg.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');`;
  document.head.appendChild(cfg);
};

const loadGTM = () => {
  if (typeof window === "undefined" || document.getElementById("gtm-script")) return;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-XXXXXXX";
  const script = document.createElement("script");
  script.id = "gtm-script";
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${gtmId}');`;
  document.head.appendChild(script);
};

const CookieBanner = () => {
  const t = useTranslations("cookie");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (consent === "all") {
      loadGA4();
      loadGTM();
    } else if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (level: "all" | "none") => {
    localStorage.setItem("cookie_consent", level);
    setShow(false);
    if (level === "all") { loadGA4(); loadGTM(); }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 lg:left-auto lg:right-12 lg:max-w-md z-150"
        >
          <div className="glass dark:glass p-6 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-2xl border border-white/10">
            <button 
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display uppercase text-lg mb-2">COOKIES</h3>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              {t("message")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleConsent("all")}
                className="flex-1 bg-brand-yellow text-brand-bg px-6 py-2.5 rounded-full text-sm font-bold hover:scale-[1.02] transition-transform"
              >
                {t("accept")}
              </button>
              <button
                onClick={() => handleConsent("none")}
                className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
              >
                {t("decline")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
