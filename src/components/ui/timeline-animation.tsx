"use client";

import React from "react";
import { motion, useInView, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  as?: keyof React.JSX.IntrinsicElements;
  animationNum: number;
  timelineRef: React.RefObject<HTMLElement | null>;
  customVariants?: Variants;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const defaultVariants: Variants = {
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.25,
      duration: 0.5,
    },
  }),
  hidden: {
    filter: "blur(10px)",
    y: -20,
    opacity: 0,
  },
};

export function TimelineContent({
  as = "div",
  animationNum,
  timelineRef,
  customVariants = defaultVariants,
  className,
  children,
  style,
}: TimelineContentProps) {
  const isInView = useInView(timelineRef, { once: true, margin: "-80px" });
  const MotionTag = (motion as unknown as Record<string, React.ComponentType<any>>)[as] || motion.div;

  return (
    <MotionTag
      custom={animationNum}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={customVariants}
      className={cn(className)}
      style={style}
    >
      {children}
    </MotionTag>
  );
}
