"use client";

import { motion } from "framer-motion";
import { MOTION_EASE, SECTION_TRANSITION_SECONDS } from "./animation";

type SectionProgressIndicatorProps = {
  activeSection: number;
  sectionNames: string[];
  prefersReducedMotion: boolean;
};

// ============================================
// SECTION: Vertical Section Progress
// ============================================

export default function SectionProgressIndicator({
  activeSection,
  sectionNames,
  prefersReducedMotion,
}: SectionProgressIndicatorProps) {
  const thumbTravel = 144;
  const sectionStep = thumbTravel / (sectionNames.length - 1);

  return (
    <div
      className="section-progress"
      role="progressbar"
      aria-label="Portfolio section progress"
      aria-valuemin={0}
      aria-valuemax={sectionNames.length - 1}
      aria-valuenow={activeSection}
      aria-valuetext={sectionNames[activeSection]}
    >
      <div className="section-progress-track">
        <motion.span
          className="section-progress-thumb"
          aria-hidden="true"
          initial={false}
          animate={{ y: activeSection * sectionStep }}
          transition={{
            duration: prefersReducedMotion ? 0.05 : SECTION_TRANSITION_SECONDS,
            ease: MOTION_EASE,
          }}
        />
      </div>
    </div>
  );
}
