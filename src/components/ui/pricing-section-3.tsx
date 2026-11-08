"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { BookOpen, CheckCheck, Compass, HeartHandshake, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import React, { useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

interface PricingSwitchProps {
  onSwitch: (value: string) => void;
  className?: string;
  labels: {
    first: string;
    second: string;
    badge: string;
  };
}

const PricingSwitch = ({
  onSwitch,
  className,
  labels,
}: PricingSwitchProps) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("ps3-switch-wrap flex justify-center", className)}>
      <div className="ps3-switch-track relative z-10 mx-auto flex w-fit rounded-full bg-neutral-50 border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => handleSwitch("0")}
          className={cn(
            "ps3-switch-btn relative z-10 w-fit sm:h-12 cursor-pointer h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "0"
              ? "ps3-switch-btn-active text-black"
              : "ps3-switch-btn-inactive text-muted-foreground hover:text-black",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="ps3-switch-pill absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-4 shadow-sm shadow-neutral-300 border-neutral-300 bg-gradient-to-t from-neutral-100 via-neutral-200 to-neutral-300"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="ps3-switch-label relative">{labels.first}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitch("1")}
          className={cn(
            "ps3-switch-btn relative z-10 w-fit cursor-pointer sm:h-12 h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors",
            selected === "1"
              ? "ps3-switch-btn-active text-black"
              : "ps3-switch-btn-inactive text-muted-foreground hover:text-black",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="ps3-switch-pill absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-4 shadow-sm shadow-neutral-300 border-neutral-300 bg-gradient-to-t from-neutral-100 via-neutral-200 to-neutral-300"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="ps3-switch-label relative flex items-center gap-2">
            {labels.second}
            <span className="ps3-switch-badge rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-black">
              {labels.badge}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection4() {
  const { t, language } = useLanguage();
  const [isMottoView, setIsMottoView] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.22,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsMottoView(Number.parseInt(value) === 1);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const copy = {
    id: {
      heading: `${t.visiLabel} & ${t.misiLabel} ${t.osmisName}`,
      subheading: `${t.orgNameLong} — Landasan arah perjuangan, cita-cita bersama, serta semboyan pengabdian pengurus santri.`,
      switchFirst: "Visi & Misi",
      switchSecond: "Makna Semboyan",
      switchBadge: "3 Pilar",
      popularBadge: "AMANAH UTAMA",
      cards: [
        {
          name: isMottoView ? (t.mottoWords?.[0]?.word || "MEMBINA") : t.visiLabel,
          description: isMottoView
            ? (t.mottoWords?.[0]?.desc || "Mewakili visi membina lingkungan yang santun dan sopan.")
            : `"${t.visiText}"`,
          metric: isMottoView ? 2017 : 1,
          metricPrefix: isMottoView ? "EST. " : "0",
          metricUnit: isMottoView ? "awal berdiri" : "pilar visi utama",
          popular: false,
          buttonText: "Lihat Struktur Pengurus",
          buttonVariant: "outline" as const,
          targetId: "organization",
          features: [
            { text: "Al-Qur'an & As-Sunnah", icon: <BookOpen size={20} /> },
            { text: "Adab & Kesantunan", icon: <Compass size={20} /> },
            { text: "Keteladanan Santri", icon: <HeartHandshake size={20} /> },
          ],
          includes: isMottoView
            ? [
                "Wujud Pembinaan Santri:",
                "Membina lingkungan ma'had yang santun dan sopan",
                "Meningkatkan rasa kebersamaan antar santri",
                "Menumbuhkan karakter tanggung jawab sejak dini",
              ]
            : [
                "Intisari Visi OSMIS:",
                "Berlandaskan nilai Al-Qur'an dan As-Sunnah",
                "Membina lingkungan pondok yang santun & sopan",
                "Menjadi wadah teladan adab dan ukhuwah santri",
              ],
        },
        {
          name: isMottoView ? (t.mottoWords?.[1]?.word || "MENJAGA") : t.misiLabel,
          description: isMottoView
            ? (t.mottoWords?.[1]?.desc || "Mewakili upaya menjaga ibadah, nilai-nilai Islami, ketertiban, serta kenyamanan pondok.")
            : "Tiga langkah strategis pengurus OSMIS dalam mengemban amanah serta mewujudkan visi organisasi.",
          metric: isMottoView ? 6 : 3,
          metricPrefix: "0",
          metricUnit: isMottoView ? "divisi penjaga" : "poin misi aktif",
          popular: true,
          buttonText: "Lihat 6 Divisi & Proker",
          buttonVariant: "default" as const,
          targetId: "divisions",
          features: [
            { text: "Ibadah & Sunnah", icon: <BookOpen size={20} /> },
            { text: "Ketertiban Pondok", icon: <ShieldCheck size={20} /> },
            { text: "Ukhuwah Positif", icon: <HeartHandshake size={20} /> },
          ],
          includes: isMottoView
            ? [
                "Fokus Penjagaan Ma'had:",
                "Menjaga pelaksanaan ibadah sesuai salafus shalih",
                "Menjaga ketertiban, keamanan, dan kenyamanan pondok",
                "Menjaga kemurnian nilai-nilai Islami dalam keseharian",
              ]
            : [
                "3 Poin Misi OSMIS:",
                ...(t.misiItems || []),
              ],
        },
        {
          name: isMottoView ? (t.mottoWords?.[2]?.word || "MENGABDI") : "SEMBOYAN & NILAI",
          description: isMottoView
            ? (t.mottoWords?.[2]?.desc || "Mewakili fungsi OSMIS sebagai organisasi yang bekerja dan berkontribusi untuk santri serta pondok.")
            : `"${t.heroSubtitle}" — Nilai dasar yang mengikat seluruh aktivitas kepengurusan dari generasi ke generasi.`,
          metric: isMottoView ? 10 : 4,
          metricPrefix: isMottoView ? "" : "0",
          metricUnit: isMottoView ? "generasi khidmah" : "nilai inti organisasi",
          popular: false,
          buttonText: "Jelajahi Sejarah OSMIS",
          buttonVariant: "outline" as const,
          targetId: "history",
          features: [
            { text: "Khidmah Tulus", icon: <HeartHandshake size={20} /> },
            { text: "Disiplin & Amanah", icon: <ShieldCheck size={20} /> },
            { text: "Kontribusi Nyata", icon: <Compass size={20} /> },
          ],
          includes: isMottoView
            ? [
                "Wujud Pengabdian OSMIS:",
                "Bekerja dan berkontribusi penuh untuk santri & ma'had",
                "Menyelenggarakan kegiatan yang positif dan membangun",
                "Mewariskan jejak kebaikan lintas periode kepengurusan",
              ]
            : [
                "Pilar Semboyan & Nilai:",
                `Membina · Menjaga · Mengabdi`,
                `${t.values.amanah} & ${t.values.disiplin} dalam bertugas`,
                `${t.values.khidmah} & ${t.values.ukhuwah} sesama santri`,
              ],
        },
      ],
    },
    en: {
      heading: `${t.visiLabel} & ${t.misiLabel} OF ${t.osmisName}`,
      subheading: `${t.orgNameLong} — Our foundational direction, shared ideals, and the motto of student stewardship.`,
      switchFirst: "Vision & Mission",
      switchSecond: "Motto Pillars",
      switchBadge: "3 Pillars",
      popularBadge: "CORE MANDATE",
      cards: [
        {
          name: isMottoView ? (t.mottoWords?.[0]?.word || "NURTURING") : t.visiLabel,
          description: isMottoView
            ? (t.mottoWords?.[0]?.desc || "")
            : `"${t.visiText}"`,
          metric: isMottoView ? 2017 : 1,
          metricPrefix: isMottoView ? "EST. " : "0",
          metricUnit: isMottoView ? "founding year" : "foundational vision",
          popular: false,
          buttonText: "View Organization Board",
          buttonVariant: "outline" as const,
          targetId: "organization",
          features: [],
          includes: isMottoView
            ? [
                "Nurturing Pillars:",
                "Cultivating a courteous and disciplined environment",
                "Strengthening brotherhood and student unity",
                "Building student responsibility through mentorship",
              ]
            : [
                "Core Vision Pillars:",
                "Grounded in the values of the Qur'an and Sunnah",
                "Cultivating a courteous and respectful boarding life",
                "Exemplifying noble Islamic character and etiquette",
              ],
        },
        {
          name: isMottoView ? (t.mottoWords?.[1]?.word || "GUARDING") : t.misiLabel,
          description: isMottoView
            ? (t.mottoWords?.[1]?.desc || "")
            : "Three strategic commitments carried out by the OSMIS board to realize our organizational vision.",
          metric: isMottoView ? 6 : 3,
          metricPrefix: "0",
          metricUnit: isMottoView ? "active divisions" : "active mission points",
          popular: true,
          buttonText: "Explore 6 Divisions",
          buttonVariant: "default" as const,
          targetId: "divisions",
          features: [],
          includes: isMottoView
            ? [
                "Guarding Commitments:",
                "Preserving worship in accordance with the salafus shalih",
                "Maintaining order, safety, and comfort across the ma'had",
                "Upholding Islamic values in daily student life",
              ]
            : [
                "3 Core Mission Points:",
                ...(t.misiItems || []),
              ],
        },
        {
          name: isMottoView ? (t.mottoWords?.[2]?.word || "SERVING") : "MOTTO & VALUES",
          description: isMottoView
            ? (t.mottoWords?.[2]?.desc || "")
            : `"${t.heroSubtitle}" — Core principles guiding every generation of student leadership.`,
          metric: isMottoView ? 10 : 4,
          metricPrefix: isMottoView ? "" : "0",
          metricUnit: isMottoView ? "generations" : "core values",
          popular: false,
          buttonText: "Explore OSMIS History",
          buttonVariant: "outline" as const,
          targetId: "history",
          features: [],
          includes: isMottoView
            ? [
                "Service in Action:",
                "Working and contributing for students and the boarding school",
                "Organizing positive and constructive student programs",
                "Leaving a legacy of service across every period",
              ]
            : [
                "Motto & Core Values:",
                "Nurturing · Guarding · Serving",
                `${t.values.amanah} & ${t.values.disiplin} in leadership`,
                `${t.values.khidmah} & ${t.values.ukhuwah} among students`,
              ],
        },
      ],
    },
    ar: {
      heading: `${t.visiLabel} و${t.misiLabel} — ${t.osmisName}`,
      subheading: `${t.orgNameLong} — الأساس والتوجه المشترك وشعار الخدمة الطلابية في المعهد.`,
      switchFirst: "الرؤية والرسالة",
      switchSecond: "معاني الشعار",
      switchBadge: "٣ ركائز",
      popularBadge: "الأمانة الأساسية",
      cards: [
        {
          name: isMottoView ? (t.mottoWords?.[0]?.word || "تربية") : t.visiLabel,
          description: isMottoView
            ? (t.mottoWords?.[0]?.desc || "")
            : `"${t.visiText}"`,
          metric: isMottoView ? 2017 : 1,
          metricPrefix: isMottoView ? "" : "0",
          metricUnit: isMottoView ? "سنة التأسيس" : "ركيزة الرؤية",
          popular: false,
          buttonText: "عرض الهيكل التنظيمي",
          buttonVariant: "outline" as const,
          targetId: "organization",
          features: [],
          includes: isMottoView
            ? [
                "محاور التربية:",
                "تهيئة بيئة معهدية تتسم بالأدب والاحترام",
                "تعزيز روح التعاون والأخوة بين الطلاب",
                "تنمية روح المسؤولية والقدوة الحسنة",
              ]
            : [
                "مرتكزات الرؤية:",
                "قائمة على قيم القرآن الكريم والسنة النبوية",
                "بناء بيئة يسودها الأدب والاحترام المتبادل",
                "ترسيخ الأخلاق الإسلامية والآداب اليومية",
              ],
        },
        {
          name: isMottoView ? (t.mottoWords?.[1]?.word || "حفاظ") : t.misiLabel,
          description: isMottoView
            ? (t.mottoWords?.[1]?.desc || "")
            : "ثلاث خطوات رئيسية يقوم بها إداريو جمعية الطلاب لتحقيق رؤية المنظمة.",
          metric: isMottoView ? 6 : 3,
          metricPrefix: "0",
          metricUnit: isMottoView ? "أقسام عاملة" : "نقاط الرسالة",
          popular: true,
          buttonText: "استكشف الأقسام والبرامج",
          buttonVariant: "default" as const,
          targetId: "divisions",
          features: [],
          includes: isMottoView
            ? [
                "محاور الحفاظ:",
                "الحفاظ على أداء العبادات وفق فهم السلف الصالح",
                "الحفاظ على النظام والأمن والراحة في المعهد",
                "تطبيق القيم الإسلامية في حياة الطلاب اليومية",
              ]
            : [
                "نقاط رسالة جمعية الطلاب:",
                ...(t.misiItems || []),
              ],
        },
        {
          name: isMottoView ? (t.mottoWords?.[2]?.word || "خدمة") : "الشعار والقيم",
          description: isMottoView
            ? (t.mottoWords?.[2]?.desc || "")
            : `"${t.heroSubtitle}" — القيم الأساسية التي تجمع كل جيل من أجيال الإدارة.`,
          metric: isMottoView ? 10 : 4,
          metricPrefix: isMottoView ? "" : "0",
          metricUnit: isMottoView ? "أجيال متتالية" : "قيم أساسية",
          popular: false,
          buttonText: "تصفح تاريخ المنظمة",
          buttonVariant: "outline" as const,
          targetId: "history",
          features: [],
          includes: isMottoView
            ? [
                "مظاهر الخدمة:",
                "العمل والمساهمة الفاعلة لصالح الطلاب والمعهد",
                "إقامة الأنشطة الإيجابية والبناءة",
                "ترك أثر طيب يتوارثه الطلاب جيلاً بعد جيل",
              ]
            : [
                "الشعار والقيم الأربع:",
                "تربية · حفاظ · خدمة",
                `${t.values.amanah} و${t.values.disiplin}`,
                `${t.values.khidmah} و${t.values.ukhuwah}`,
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
          max-width: 1240px;
          margin: 0 auto;
          padding: 5.5rem 1.5rem 5rem;
          position: relative;
        }
        .ps3-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        @media (min-width: 768px) {
          .ps3-header {
            flex-direction: row;
            align-items: center;
          }
        }
        .ps3-header-text {
          text-align: left;
          max-width: 680px;
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
          font-size: 1.02rem;
          line-height: 1.65;
          color: var(--color-muted-foreground, #56635b);
          margin: 0;
          max-width: 580px;
        }
        .ps3-switch-wrap {
          display: flex;
          justify-content: center;
          flex-shrink: 0;
        }
        .ps3-switch-track {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          width: fit-content;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(23, 56, 38, 0.14);
          padding: 4px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        [data-theme='dark'] .ps3-switch-track {
          background: rgba(15, 23, 34, 0.85);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .ps3-switch-btn {
          position: relative;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: var(--font-sans);
          border: none;
          background: transparent;
          cursor: pointer;
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .ps3-switch-btn-active {
          color: #111827;
        }
        [data-theme='dark'] .ps3-switch-btn-active {
          color: #0b0f19;
        }
        .ps3-switch-btn-inactive {
          color: #64748b;
        }
        [data-theme='dark'] .ps3-switch-btn-inactive {
          color: #94a3b8;
        }
        .ps3-switch-pill {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 3px solid #d4d8dd;
          background: linear-gradient(to top, #f3f4f6, #e5e7eb, #d1d5db);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }
        [data-theme='dark'] .ps3-switch-pill {
          border-color: #34d399;
          background: linear-gradient(to top, #a7f3d0, #6ee7b7, #34d399);
        }
        .ps3-switch-label {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ps3-switch-badge {
          border-radius: 9999px;
          background: rgba(46, 89, 66, 0.12);
          color: #173826;
          padding: 2px 8px;
          font-size: 0.72rem;
          font-weight: 700;
          font-family: var(--font-mono);
        }
        [data-theme='dark'] .ps3-switch-badge {
          background: rgba(11, 15, 25, 0.18);
          color: #064e3b;
        }
        .ps3-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          margin: 0 auto;
          background: linear-gradient(180deg, rgba(235, 231, 220, 0.72) 0%, rgba(224, 219, 206, 0.85) 100%);
          padding: 1rem;
          border-radius: 20px;
          border: 1px solid rgba(23, 56, 38, 0.1);
        }
        [data-theme='dark'] .ps3-grid {
          background: linear-gradient(180deg, rgba(17, 24, 39, 0.75) 0%, rgba(11, 15, 25, 0.9) 100%);
          border-color: rgba(255, 255, 255, 0.08);
        }
        @media (min-width: 900px) {
          .ps3-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1.25rem;
            padding: 1.15rem;
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
          border-radius: 16px;
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
        @media (min-width: 900px) {
          .ps3-card-popular {
            transform: scale(1.045);
          }
        }
        .ps3-card-content {
          padding: 1.5rem 1.5rem 0.75rem;
        }
        .ps3-card-footer {
          padding: 0.75rem 1.5rem 1.5rem;
          display: flex;
          align-items: center;
        }
        .ps3-popular-pill-row {
          padding-top: 0.25rem;
          margin-bottom: 0.5rem;
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
          margin-bottom: 0.75rem;
        }
        .ps3-metric-num {
          font-size: 2.35rem;
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
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.55rem 0;
          line-height: 1.2;
        }
        .ps3-plan-desc {
          font-size: 0.94rem;
          line-height: 1.65;
          margin: 0 0 1.15rem 0;
          opacity: 0.88;
        }
        .ps3-divider {
          border-top: 1px solid rgba(23, 56, 38, 0.14);
          padding-top: 1rem;
          margin-top: 0.5rem;
        }
        [data-theme='dark'] .ps3-divider {
          border-top-color: rgba(255, 255, 255, 0.12);
        }
        .ps3-card-popular .ps3-divider {
          border-top-color: rgba(255, 255, 255, 0.18);
        }
        .ps3-includes-heading {
          font-size: 0.92rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          font-family: var(--font-mono);
          letter-spacing: 0.03em;
        }
        .ps3-includes-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .ps3-includes-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.9rem;
          line-height: 1.55;
          font-weight: 500;
        }
        .ps3-check-badge {
          width: 24px;
          height: 24px;
          border-radius: 9999px;
          display: grid;
          place-content: center;
          flex-shrink: 0;
          margin-top: 1px;
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
            className="ps3-subheading text-gray-600 w-[80%]"
          >
            {activeCopy.subheading}
          </TimelineContent>
        </div>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch
            onSwitch={togglePricingPeriod}
            className="shrink-0"
            labels={{
              first: activeCopy.switchFirst,
              second: activeCopy.switchSecond,
              badge: activeCopy.switchBadge,
            }}
          />
        </TimelineContent>
      </article>

      <TimelineContent
        as="div"
        animationNum={2}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="ps3-grid grid md:grid-cols-3 gap-4 mx-auto bg-gradient-to-b from-neutral-100 to-neutral-200 sm:p-3 rounded-lg"
      >
        {plans.map((plan, index) => (
          <TimelineContent
            as="div"
            key={`${plan.name}-${index}`}
            animationNum={index + 3}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="ps3-card-wrapper"
          >
            <Card
              className={cn(
                "ps3-card relative flex-col flex justify-between",
                plan.popular
                  ? "ps3-card-popular scale-110 ring-2 ring-neutral-900 bg-gradient-to-t from-black to-neutral-900 text-white"
                  : "ps3-card-default border-none shadow-none bg-transparent pt-4 text-gray-900",
              )}
            >
              <CardContent className="ps3-card-content pt-0">
                <div className="space-y-2 pb-3">
                  {plan.popular && (
                    <div className="ps3-popular-pill-row pt-4">
                      <span className="ps3-popular-pill bg-neutral-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {activeCopy.popularBadge}
                      </span>
                    </div>
                  )}

                  <div className="ps3-metric-row flex items-baseline">
                    <span className="ps3-metric-num text-4xl font-semibold">
                      {plan.metricPrefix}
                      <NumberFlow
                        value={plan.metric}
                        className="text-4xl font-semibold"
                      />
                    </span>
                    <span
                      className={cn(
                        "ps3-metric-unit",
                        plan.popular
                          ? "text-neutral-200 ml-1"
                          : "text-gray-600 ml-1",
                      )}
                    >
                      / {plan.metricUnit}
                    </span>
                  </div>
                </div>

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
