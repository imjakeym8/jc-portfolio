"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { MOTION_EASE, SECTION_TRANSITION_SECONDS } from "./animation";
import SectionProgressIndicator from "./SectionProgressIndicator";

// ============================================
// SECTION: Portfolio Configuration
// ============================================

const CONTACT_EMAIL = "jc.tacogue@gmail.com";
const NAVIGATION_REVEAL_ZONE_PIXELS = 120;
const NAVIGATION_HIDE_DELAY_MS = 300;
const SWIPE_THRESHOLD_PIXELS = 55;
const SCROLL_EDGE_TOLERANCE_PIXELS = 8;

const sections = [
  "Introduction",
  "Projects",
  "About",
  "Where I've Been",
  "Contact",
];

const projects = [
  [
    "Community Analytics Automation",
    "An automated reporting workflow that turns community activity into weekly and monthly client-ready analytics.",
    "Python · Automation · Analytics · APIs · Telegram · Google Sheets · MongoDB",
    "https://github.com/imjakeym8/handybot",
  ],
  [
    "Discord Support System",
    "A custom ticket-management workflow that organizes technical issues, response flow, and escalation.",
    "Python · Discord API · Workflow Automation · MongoDB",
    "https://github.com/imjakeym8/ticketprompt",
  ],
  [
    "Mirevia Skin",
    "A modern skincare shopping experience featuring curated product lineups, cart functionality, customer testimonials, newsletter signup, social calls to action, and account registration with discount incentives.",
    "Next.js · React · TypeScript · PostgreSQL · Better Auth · Stripe · Vercel",
    "https://mirevia-six.vercel.app/",
  ],
  [
    "Developer Worklog",
    "A structured daily workflow for shipped work, blockers, development time, and GitHub activity.",
    "Next.js · FastAPI · PostgreSQL · GitHub API",
    "https://worklog.imjakey.dev/",
  ],
];

const experience = [
  [
    "2022 — 2026",
    "Head of Communities",
    "BrandlessPH Digital Marketing Services",
    "Led community operations while designing systems that made support, engagement, and reporting more structured and scalable.",
  ],
  [
    "2021 — 2026",
    "Customer Service Representative",
    "Community Operations & Automation Focus · BrandlessPH",
    "Combined community support work with automation and analytics, gradually turning repetitive operational tasks into structured workflows.",
  ],
  [
    "2026 → Present",
    "Full-stack Development",
    "AI Automation · Agentic Workflows",
    "Now focused on building practical software and intelligent workflows that connect development, automation, and AI.",
  ],
];

// ============================================
// SECTION: Animation Configuration
// ============================================

const sectionVariants = {
  initial: (direction: number) => ({
    y: `${direction * 100}%`,
    opacity: 0.9,
  }),
  animate: {
    y: "0%",
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: `${direction * -100}%`,
    opacity: 0.9,
  }),
};

function hasOffscreenSectionContent(scene: HTMLElement, direction: number) {
  const sceneBounds = scene.getBoundingClientRect();

  return Array.from(scene.children).some((child) => {
    if (getComputedStyle(child).position === "absolute") return false;

    const contentBounds = child.getBoundingClientRect();
    return direction > 0
      ? contentBounds.bottom > sceneBounds.bottom + SCROLL_EDGE_TOLERANCE_PIXELS
      : contentBounds.top < sceneBounds.top - SCROLL_EDGE_TOLERANCE_PIXELS;
  });
}

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const [navigationDirection, setNavigationDirection] = useState(1);
  const [isEmailRevealed, setIsEmailRevealed] = useState(false);
  const [isNavigationVisible, setIsNavigationVisible] = useState(false);
  const isTransitioning = useRef(false);
  const navigationHideTimer = useRef<number | null>(null);
  const touchStart = useRef<{
    y: number;
    canScrollDown: boolean;
    canScrollUp: boolean;
  } | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // ============================================
  // SECTION: Section Navigation
  // ============================================

  const navigateToSection = useCallback(
    (targetSection: number) => {
      if (targetSection < 0 || targetSection >= sections.length) return;

      if (isTransitioning.current || targetSection === activeSection) return;

      isTransitioning.current = true;
      setNavigationDirection(targetSection > activeSection ? 1 : -1);
      setActiveSection(targetSection);
    },
    [activeSection],
  );

  const cancelNavigationHide = useCallback(() => {
    if (navigationHideTimer.current) {
      window.clearTimeout(navigationHideTimer.current);
      navigationHideTimer.current = null;
    }
  }, []);

  const revealNavigation = useCallback(() => {
    cancelNavigationHide();
    setIsNavigationVisible(true);
  }, [cancelNavigationHide]);

  const scheduleNavigationHide = useCallback(() => {
    cancelNavigationHide();
    navigationHideTimer.current = window.setTimeout(() => {
      setIsNavigationVisible(false);
    }, NAVIGATION_HIDE_DELAY_MS);
  }, [cancelNavigationHide]);

  // ============================================
  // SECTION: Wheel and Keyboard Navigation
  // ============================================

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 25) return;
      const scene = document.querySelector<HTMLElement>(".desktop-sections .scene");
      if (scene) {
        if (hasOffscreenSectionContent(scene, event.deltaY)) {
          if (event.target instanceof Node && !scene.contains(event.target)) {
            event.preventDefault();
            scene.scrollBy({ top: event.deltaY });
          }
          return;
        }
      }
      event.preventDefault();
      navigateToSection(activeSection + (event.deltaY > 0 ? 1 : -1));
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusedTag = (event.target as HTMLElement)?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(focusedTag)) return;
      const scene = document.querySelector<HTMLElement>(".desktop-sections .scene");

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (scene && hasOffscreenSectionContent(scene, 1)) {
          scene.scrollBy({ top: 80, behavior: "smooth" });
          return;
        }
        navigateToSection(activeSection + 1);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (scene && hasOffscreenSectionContent(scene, -1)) {
          scene.scrollBy({ top: -80, behavior: "smooth" });
          return;
        }
        navigateToSection(activeSection - 1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSection, navigateToSection]);

  // ============================================
  // SECTION: Touch Navigation At Section Edges
  // ============================================

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      const scene = document.querySelector<HTMLElement>(".desktop-sections .scene");
      if (!scene || event.touches.length !== 1) return;
      touchStart.current = {
        y: event.touches[0].clientY,
        canScrollDown: hasOffscreenSectionContent(scene, 1),
        canScrollUp: hasOffscreenSectionContent(scene, -1),
      };
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const start = touchStart.current;
      touchStart.current = null;
      const scene = document.querySelector<HTMLElement>(".desktop-sections .scene");
      if (!scene || !start || event.changedTouches.length !== 1) return;
      const distance = start.y - event.changedTouches[0].clientY;
      if (Math.abs(distance) < SWIPE_THRESHOLD_PIXELS) return;
      const atBottom = !hasOffscreenSectionContent(scene, 1);
      const atTop = !hasOffscreenSectionContent(scene, -1);
      if (distance > 0 && atBottom && !start.canScrollDown) {
        navigateToSection(activeSection + 1);
      } else if (distance < 0 && atTop && !start.canScrollUp) {
        navigateToSection(activeSection - 1);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeSection, navigateToSection]);

  // ============================================
  // SECTION: Navigation Proximity Reveal
  // ============================================

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      if (event.target instanceof Element && event.target.closest(".section-nav")) {
        revealNavigation();
      } else if (window.innerWidth - event.clientX <= NAVIGATION_REVEAL_ZONE_PIXELS) {
        revealNavigation();
      } else {
        scheduleNavigationHide();
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelNavigationHide();
    };
  }, [revealNavigation, scheduleNavigationHide, cancelNavigationHide]);

  // ============================================
  // SECTION: Shared Section Content
  // ============================================

  const renderSectionContent = (sectionIndex: number, headingId: string) => (
    <>
      {/* SECTION: Introduction */}
      {sectionIndex === 0 && (
        <>
          <div className="hero">
            <h1 id={headingId}>
              GM! I&apos;m <em>JC</em>,<br />
              a full-stack developer
              <br />
              and <span>AI &amp; workflow automations</span> expert
              <br />
              based in the Philippines.
            </h1>
            <p>
              I build practical systems that turn repetitive work into
              reliable workflows.
            </p>
          </div>
          <button
            className="explore"
            onClick={() => navigateToSection(1)}
          >
            Scroll to explore <i>↓</i>
          </button>
        </>
      )}

      {/* SECTION: Projects */}
      {sectionIndex === 1 && (
        <>
          <header className="section-head">
            <h2 id={headingId}>
              Selected <em>Projects</em>
            </h2>
            <p>
              A selection of systems, experiments, and tools built around
              automation, productivity, and better digital workflows.
            </p>
          </header>
          <div className="projects">
            {projects.map(([title, description, tags, url], index) => (
              <article className="project" key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <small>{tags}</small>
                </div>
                <i>↗</i>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${title}${url.startsWith("https://github.com/") ? " on GitHub" : " live site"}`}
                    style={{ position: "absolute", inset: 0 }}
                  />
                )}
              </article>
            ))}
          </div>
        </>
      )}

      {/* SECTION: About Portrait and Biography */}
      {sectionIndex === 2 && (
        <div className="about">
          <div>
            <div className="portrait">
              <Image
                src="/images/jc-profile.jpg"
                alt="Portrait of John Carlo N. Tacogue"
                width={300}
                height={300}
                unoptimized
                priority
              />
            </div>
            <h2 id={headingId}>
              I build systems around the way{" "}
              <em>people actually work.</em>
            </h2>
            <p>
              My strongest work sits where AI, automation, development, and
              practical problem-solving meet.
            </p>
          </div>
          <div className="bio-copy">
            <p>
              I graduated with a BS in Business Administration in 2020.
              I&apos;ve always been drawn to systems and finding better ways
              to organize work, which eventually pulled me toward
              programming in 2021.
            </p>
            <p>
              I started by building through experimentation, and that
              curiosity developed into a deeper interest in code,
              productivity tools, and interactive web applications.
            </p>
            <p>
              Today, I use business thinking, development, and automation
              to build practical systems that help people work more
              effectively.
            </p>
          </div>
        </div>
      )}

      {/* SECTION: Bio Timeline */}
      {sectionIndex === 3 && (
        <>
          <header className="section-head">
            <h2 id={headingId}>
              Where I&apos;ve <em>Been</em>
            </h2>
          </header>
          <div className="timeline">
            {experience.map(([date, role, company, copy]) => (
              <article key={role}>
                <span className="dot" />
                <small>{date}</small>
                <h3>{role}</h3>
                <strong>{company}</strong>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </>
      )}

      {/* SECTION: Contact and Contact Links */}
      {sectionIndex === 4 && (
        <>
          <div className="contact">
            <h2 id={headingId}>
              Let&apos;s build something <em>useful.</em>
            </h2>
            <p>
              Have a workflow worth automating, a product worth building,
              or a problem that needs a practical solution? I&apos;d like to
              hear about it.
            </p>
            <a
              className={`email ${isEmailRevealed ? "revealed" : ""}`}
              href={`mailto:${CONTACT_EMAIL}`}
              onClick={(event) => {
                if (!isEmailRevealed) {
                  event.preventDefault();
                  setIsEmailRevealed(true);
                }
              }}
              onMouseEnter={() => setIsEmailRevealed(true)}
            >
              <span>
                Say hello <i>→</i>
              </span>
              <span>
                {CONTACT_EMAIL} <i>↗</i>
              </span>
            </a>
            <div className="socials">
              <a
                href="https://github.com/imjakeym8"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/jctacogue"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
          <footer>
            Designed &amp; built by JC.
            <span>@ 2026 John Carlo N. Tacogue</span>
          </footer>
        </>
      )}
    </>
  );

  const transitionDuration = prefersReducedMotion
    ? 0.05
    : SECTION_TRANSITION_SECONDS;

  return (
    <main className="portfolio">
      {/* SECTION: Section Navigation */}
      <nav
        className={`section-nav ${isNavigationVisible ? "is-visible" : ""}`}
        aria-label="Portfolio sections"
        onMouseEnter={revealNavigation}
        onMouseLeave={scheduleNavigationHide}
        onFocusCapture={revealNavigation}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            scheduleNavigationHide();
          }
        }}
      >
        <button
          aria-label="Previous section"
          onClick={() => navigateToSection(activeSection - 1)}
        >
          ↑
        </button>
        {sections.map((section, index) => (
          <button
            key={section}
            aria-label={`Go to ${section} section`}
            className={activeSection === index ? "active" : ""}
            aria-current={activeSection === index ? "page" : undefined}
            onClick={() => navigateToSection(index)}
          >
            <span>0{index + 1}</span>
            <b>{section}</b>
          </button>
        ))}
        <button
          aria-label="Next section"
          onClick={() => navigateToSection(activeSection + 1)}
        >
          ↓
        </button>
      </nav>

      {/* SECTION: Availability Indicator */}
      <div className="availability" role="status">
        <span className="availability-dot" aria-hidden="true" />
        Available to work
      </div>

      <SectionProgressIndicator
        activeSection={activeSection}
        sectionNames={sections}
        prefersReducedMotion={Boolean(prefersReducedMotion)}
      />

      <div className="desktop-sections">
        <AnimatePresence
          initial={false}
          custom={navigationDirection}
          mode="sync"
        >
          <motion.section
            key={activeSection}
            custom={navigationDirection}
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              duration: transitionDuration,
              ease: MOTION_EASE,
            }}
            onAnimationComplete={() => {
              isTransitioning.current = false;
            }}
            className={`scene scene-${activeSection}`}
            aria-labelledby={`section-${activeSection}`}
          >
            {renderSectionContent(activeSection, `section-${activeSection}`)}
          </motion.section>
        </AnimatePresence>
      </div>

    </main>
  );
}
