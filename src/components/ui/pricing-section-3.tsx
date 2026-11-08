"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import React, { useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function PricingSection4() {
  const { t, language } = useLanguage();
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copy = {
    id: {
      heading: `${t.visiLabel} & ${t.misiLabel} ${t.osmisName}`,
      subheading: `${t.orgNameLong} — Landasan arah perjuangan dan cita-cita bersama pengurus santri.`,
      popularBadge: "AMANAH UTAMA",
      cards: [
        {
          name: t.visiLabel,
          description: `"${t.visiText}"`,
          metric: 1,
          metricPrefix: "0",
          metricUnit: "pilar visi utama",
          popular: false,
          buttonText: "Lihat Struktur Pengurus",
          buttonVariant: "outline" as const,
          targetId: "organization",
          includes: [
            "Intisari Visi OSMIS:",
            "Berlandaskan nilai Al-Qur'an dan As-Sunnah",
            "Membina lingkungan pondok yang santun & sopan",
            "Menjadi wadah teladan adab dan ukhuwah santri",
          ],
        },
        {
          name: t.misiLabel,
          description:
            "Tiga langkah strategis pengurus OSMIS dalam mengemban amanah serta mewujudkan visi organisasi.",
          metric: 3,
          metricPrefix: "0",
          metricUnit: "poin misi aktif",
          popular: true,
          buttonText: "Lihat 6 Divisi & Proker",
          buttonVariant: "default" as const,
          targetId: "divisions",
          includes: [
            "3 Poin Misi OSMIS:",
            ...(t.misiItems || []),
          ],
        },
      ],
    },
    en: {
      heading: `${t.visiLabel} & ${t.misiLabel} OF ${t.osmisName}`,
      subheading: `${t.orgNameLong} — Our foundational direction and shared ideals of student stewardship.`,
      popularBadge: "CORE MANDATE",
      cards: [
        {
          name: t.visiLabel,
          description: `"${t.visiText}"`,
          metric: 1,
          metricPrefix: "0",
          metricUnit: "foundational vision",
          popular: false,
          buttonText: "View Organization Board",
          buttonVariant: "outline" as const,
          targetId: "organization",
          includes: [
            "Core Vision Pillars:",
            "Grounded in the values of the Qur'an and Sunnah",
            "Cultivating a courteous and respectful boarding life",
            "Exemplifying noble Islamic character and etiquette",
          ],
        },
        {
          name: t.misiLabel,
          description:
            "Three strategic commitments carried out by the OSMIS board to realize our organizational vision.",
          metric: 3,
          metricPrefix: "0",
          metricUnit: "active mission points",
          popular: true,
          buttonText: "Explore 6 Divisions",
          buttonVariant: "default" as const,
          targetId: "divisions",
          includes: [
            "3 Core Mission Points:",
            ...(t.misiItems || []),
          ],
        },
      ],
    },
    ar: {
      heading: `${t.visiLabel} و${t.misiLabel} — ${t.osmisName}`,
      subheading: `${t.orgNameLong} — الأساس والتوجه المشترك للإدارة الطلابية في المعهد.`,
      popularBadge: "الأمانة الأساسية",
      cards: [
        {
          name: t.visiLabel,
          description: `"${t.visiText}"`,
          metric: 1,
          metricPrefix: "0",
          metricUnit: "ركيزة الرؤية",
          popular: false,
          buttonText: "عرض الهيكل التنظيمي",
          buttonVariant: "outline" as const,
          targetId: "organization",
          includes: [
            "مرتكزات الرؤية:",
            "قائمة على قيم القرآن الكريم والسنة النبوية",
            "بناء بيئة يسودها الأدب والاحترام المتبادل",
            "ترسيخ الأخلاق الإسلامية والآداب اليومية",
          ],
        },
        {
          name: t.misiLabel,
          description:
            "ثلاث خطوات رئيسية يقوم بها إداريو جمعية الطلاب لتحقيق رؤية المنظمة.",
          metric: 3,
          metricPrefix: "0",
          metricUnit: "نقاط الرسالة",
          popular: true,
          buttonText: "استكشف الأقسام والبرامج",
          buttonVariant: "default" as const,
          targetId: "divisions",
          includes: [
            "نقاط رسالة جمعية الطلاب:",
            ...(t.misiItems || []),
          ],
        },
      ],
    },
  };

  const activeCopy = copy[language] || copy.id;
  const plans = activeCopy.cards;

  return (
    <div
      className="ps3-root px-4 pt-20 max-w-7xl mx-auto relative"
      ref={pricingRef}
    >
      <style>{`
        .ps3-root {
          max-width: 1080px;
          margin: 0 auto;
          padding: 5.5rem 1.5rem 5rem;
          position: relative;
        }
        .ps3-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .ps3-header-text {
          text-align: left;
          max-width: 720px;
        }
        [dir='rtl'] .ps3-header-text {
          text-align: right;
        }
        .ps3-heading {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 600;
          line-height: 1.25;
          color: var(--text-color);
          margin: 0 0 0.85rem 0;
        }
        .ps3-subheading {
          font-size: 1.04rem;
          line-height: 1.65;
          color: var(--color-muted-foreground, #56635b);
          margin: 0;
          max-width: 620px;
        }
        .ps3-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin: 0 auto;
          background: linear-gradient(180deg, rgba(235, 231, 220, 0.72) 0%, rgba(224, 219, 206, 0.85) 100%);
          padding: 1.25rem;
          border-radius: 22px;
          border: 1px solid rgba(23, 56, 38, 0.1);
        }
        [data-theme='dark'] .ps3-grid {
          background: linear-gradient(180deg, rgba(17, 24, 39, 0.75) 0%, rgba(11, 15, 25, 0.9) 100%);
          border-color: rgba(255, 255, 255, 0.08);
        }
        @media (min-width: 768px) {
          .ps3-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1.75rem;
            padding: 1.5rem;
            align-items: stretch;
          }
        }
        .ps3-card-wrapper {
          display: flex;
          height: 100%;
        }
        .ps3-card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100%;
          border-radius: 18px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: left;
        }
        [dir='rtl'] .ps3-card {
          text-align: right;
        }
        .ps3-card-default {
          background: transparent;
          border: none;
          box-shadow: none;
          padding-top: 0.75rem;
          color: var(--text-color);
        }
        .ps3-card-popular {
          background: linear-gradient(to top, #09150f 0%, #132a1f 60%, #1a3829 100%);
          color: #ffffff;
          border: 2px solid #0f2419;
          box-shadow: 0 24px 48px -12px rgba(9, 21, 15, 0.45);
          z-index: 2;
        }
        [data-theme='dark'] .ps3-card-popular {
          background: linear-gradient(to top, #050a08 0%, #0d2118 60%, #133022 100%);
          border-color: rgba(0, 255, 136, 0.35);
          box-shadow: 0 24px 50px -12px rgba(0, 0, 0, 0.75);
        }
        @media (min-width: 768px) {
          .ps3-card-popular {
            transform: scale(1.03);
          }
        }
        .ps3-card-content {
          padding: 1.75rem 1.75rem 0.85rem;
        }
        .ps3-card-footer {
          padding: 0.85rem 1.75rem 1.75rem;
          display: flex;
          align-items: center;
        }
        .ps3-popular-pill-row {
          padding-top: 0.25rem;
          margin-bottom: 0.6rem;
        }
        .ps3-popular-pill {
          display: inline-block;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #f8fafc;
          padding: 0.28rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 600;
          font-family: var(--font-mono);
          letter-spacing: 0.06em;
        }
        .ps3-metric-row {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
          margin-bottom: 0.85rem;
        }
        .ps3-metric-num {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.1;
          font-family: var(--font-display);
          letter-spacing: -0.02em;
        }
        .ps3-metric-unit {
          font-size: 0.85rem;
          font-family: var(--font-mono);
          opacity: 0.72;
        }
        .ps3-plan-title {
          font-family: var(--font-display);
          font-size: 1.9rem;
          font-weight: 700;
          margin: 0 0 0.65rem 0;
          line-height: 1.2;
        }
        .ps3-plan-desc {
          font-size: 0.98rem;
          line-height: 1.68;
          margin: 0 0 1.25rem 0;
          opacity: 0.88;
        }
        .ps3-divider {
          border-top: 1px solid rgba(23, 56, 38, 0.14);
          padding-top: 1.15rem;
          margin-top: 0.5rem;
        }
        [data-theme='dark'] .ps3-divider {
          border-top-color: rgba(255, 255, 255, 0.12);
        }
        .ps3-card-popular .ps3-divider {
          border-top-color: rgba(255, 255, 255, 0.18);
        }
        .ps3-includes-heading {
          font-size: 0.94rem;
          font-weight: 600;
          margin: 0 0 0.85rem 0;
          font-family: var(--font-mono);
          letter-spacing: 0.03em;
        }
        .ps3-includes-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ps3-includes-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.92rem;
          line-height: 1.6;
          font-weight: 500;
        }
        .ps3-check-badge {
          width: 24px;
          height: 24px;
          border-radius: 9999px;
          display: grid;
          place-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .ps3-check-badge-default {
          background: #ffffff;
          color: #111827;
          border: 1px solid #111827;
        }
        [data-theme='dark'] .ps3-check-badge-default {
          background: rgba(255, 255, 255, 0.1);
          color: #f8fafc;
          border-color: rgba(255, 255, 255, 0.3);
        }
        .ps3-check-badge-popular {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.35);
        }
        .ps3-cta-btn {
          width: 100%;
          padding: 0.95rem 1.25rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
          font-family: var(--font-sans);
        }
        .ps3-cta-btn:hover {
          transform: translateY(-2px);
        }
        .ps3-cta-popular {
          background: linear-gradient(to top, #e5e7eb, #ffffff);
          color: #09150f;
          border: 1px solid #d1d5db;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35);
        }
        .ps3-cta-outline {
          background: linear-gradient(to top, #111827, #374151);
          color: #ffffff;
          border: 1px solid #374151;
          box-shadow: 0 10px 20px -5px rgba(17, 24, 39, 0.25);
        }
        [data-theme='dark'] .ps3-cta-outline {
          background: linear-gradient(to top, #1e293b, #334155);
          border-color: rgba(255, 255, 255, 0.15);
        }
        @media (max-width: 767px) {
          .ps3-root {
            padding: 3.5rem 1rem 3rem;
          }
          .ps3-header {
            margin-bottom: 1.5rem;
          }
          .ps3-heading {
            font-size: clamp(1.75rem, 6.5vw, 2.25rem);
          }
          .ps3-subheading {
            font-size: 0.94rem;
            line-height: 1.58;
          }
          .ps3-grid {
            padding: 1rem;
            gap: 1.15rem;
            border-radius: 18px;
          }
          .ps3-card-content {
            padding: 1.35rem 1.25rem 0.75rem;
          }
          .ps3-card-footer {
            padding: 0.75rem 1.25rem 1.35rem;
          }
          .ps3-plan-title {
            font-size: 1.55rem;
          }
          .ps3-cta-btn {
            min-height: 48px;
            font-size: 0.95rem;
            padding: 0.85rem 1rem;
          }
        }
      `}</style>

      <article className="ps3-header flex sm:flex-row flex-col sm:pb-0 pb-4 sm:items-center items-start justify-between">
        <div className="ps3-header-text text-left mb-6">
          <h2 className="ps3-heading text-4xl font-medium leading-[130%] text-gray-900 mb-4">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.15}
              staggerFrom="first"
              reverse={true}
              containerClassName="justify-start"
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 40,
                delay: 0,
              }}
            >
              {activeCopy.heading}
            </VerticalCutReveal>
          </h2>

          <TimelineContent
            as="p"
            animationNum={0}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="ps3-subheading text-gray-600"
          >
            {activeCopy.subheading}
          </TimelineContent>
        </div>
      </article>

      <TimelineContent
        as="div"
        animationNum={1}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="ps3-grid grid md:grid-cols-2 gap-4 mx-auto bg-gradient-to-b from-neutral-100 to-neutral-200 sm:p-3 rounded-lg"
      >
        {plans.map((plan, index) => (
          <TimelineContent
            as="div"
            key={`${plan.name}-${index}`}
            animationNum={index + 2}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="ps3-card-wrapper"
          >
            <Card
              className={cn(
                "ps3-card relative flex-col flex justify-between",
                plan.popular
                  ? "ps3-card-popular scale-105 ring-2 ring-neutral-900 bg-gradient-to-t from-black to-neutral-900 text-white"
                  : "ps3-card-default border-none shadow-none bg-transparent pt-4 text-gray-900",
              )}
            >
              <CardContent className="ps3-card-content pt-0">
                <div className="flex justify-between">
                  <h3 className="ps3-plan-title text-3xl font-semibold mb-2">
                    {plan.name}
                  </h3>
                </div>
                <p
                  className={cn(
                    "ps3-plan-desc",
                    plan.popular
                      ? "text-sm text-neutral-200 mb-4"
                      : "text-sm text-gray-600 mb-4",
                  )}
                >
                  {plan.description}
                </p>

                <div className="ps3-divider space-y-3 pt-4 border-t border-neutral-200">
                  <h4 className="ps3-includes-heading font-medium text-base mb-3">
                    {plan.includes[0]}
                  </h4>
                  <ul className="ps3-includes-list space-y-2 font-semibold">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="ps3-includes-item flex items-center"
                      >
                        <span
                          className={cn(
                            "ps3-check-badge",
                            plan.popular
                              ? "ps3-check-badge-popular text-white h-6 w-6 bg-neutral-600 border border-neutral-500 rounded-full grid place-content-center mt-0.5 mr-3"
                              : "ps3-check-badge-default text-black h-6 w-6 bg-white border border-black rounded-full grid place-content-center mt-0.5 mr-3",
                          )}
                        >
                          <CheckCheck className="h-4 w-4" size={15} />
                        </span>
                        <span
                          className={
                            plan.popular
                              ? "text-sm text-neutral-100"
                              : "text-sm text-gray-600"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="ps3-card-footer">
                <button
                  type="button"
                  onClick={() => scrollToSection(plan.targetId)}
                  className={cn(
                    "ps3-cta-btn w-full mb-6 p-4 text-xl rounded-xl",
                    plan.popular
                      ? "ps3-cta-popular bg-gradient-to-t from-neutral-100 to-neutral-300 font-semibold shadow-lg shadow-neutral-500 border border-neutral-400 text-black"
                      : plan.buttonVariant === "outline"
                        ? "ps3-cta-outline bg-gradient-to-t from-neutral-900 to-neutral-600 shadow-lg shadow-neutral-900 border border-neutral-700 text-white"
                        : "",
                  )}
                >
                  {plan.buttonText}
                </button>
              </CardFooter>
            </Card>
          </TimelineContent>
        ))}
      </TimelineContent>
    </div>
  );
}
