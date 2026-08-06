import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./Products.module.css";
import { ProcessIcon } from "./Processtopics";
import { PROCESS_TOPICS } from "./processTopicsData";

/* ══════════════════════════════════════════════════════════════
   ProcessMenu — left-side scrollable "capability roadmap" panel
══════════════════════════════════════════════════════════════ */

/* ── Popover geometry ──────────────────────────────────────────
   Computed relative to the viewport (position: fixed) so the
   portal placement is independent of any scrolling ancestor.
──────────────────────────────────────────────────────────────── */
const POPOVER_WIDTH = 260;
const POPOVER_WIDTH_SM = 220;
const POPOVER_GAP = 14;
const VIEWPORT_MARGIN = 12;
const MOBILE_BREAKPOINT = 900;

function computePopoverGeometry(anchorRect) {
  if (!anchorRect) return null;

  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  const width = window.innerWidth <= 480 ? POPOVER_WIDTH_SM : POPOVER_WIDTH;

  if (isMobile) {
    // Rail is a horizontal wrapped strip — popover drops below the icon,
    // arrow points up, horizontally centered on the icon but clamped
    // so it never runs off either edge of the viewport.
    let left = anchorRect.left + anchorRect.width / 2 - width / 2;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - width - VIEWPORT_MARGIN));

    const top = anchorRect.bottom + POPOVER_GAP;
    const arrowLeft = anchorRect.left + anchorRect.width / 2 - left;

    return {
      placement: "below",
      style: { position: "fixed", left, top, width },
      arrowStyle: {
        left: Math.max(14, Math.min(arrowLeft, width - 14)),
        top: -6,
        transform: "rotate(45deg)",
      },
    };
  }

  // Desktop — rail sits on the left edge; popover opens to the right
  // of the icon, vertically centered on it, clamped to stay on-screen.
  let top = anchorRect.top + anchorRect.height / 2;
  const halfHeightGuess = 90; // rough guard before real height is measured
  top = Math.max(VIEWPORT_MARGIN + halfHeightGuess, Math.min(top, window.innerHeight - VIEWPORT_MARGIN - halfHeightGuess));

  const left = anchorRect.right + POPOVER_GAP;

  return {
    placement: "right",
    style: { position: "fixed", left, top, width, transform: "translateY(-50%)" },
    arrowStyle: {
      left: -6,
      top: "50%",
      transform: "translateY(-50%) rotate(45deg)",
    },
  };
}

/* Portal-rendered popover — escapes the scrollable rail container so
   it never gets clipped by overflow:auto on .processMenu. */
function ProcessPopover({ topic, anchorEl, onClose, onMouseEnter, onMouseLeave }) {
  const [geometry, setGeometry] = useState(() => computePopoverGeometry(anchorEl?.getBoundingClientRect()));
  const [imgBroken, setImgBroken] = useState(false);
  const popoverRef = useRef(null);

  const reposition = useCallback(() => {
    if (!anchorEl) return;
    setGeometry(computePopoverGeometry(anchorEl.getBoundingClientRect()));
  }, [anchorEl]);

  useLayoutEffect(() => {
    reposition();
  }, [reposition]);

  useEffect(() => {
    window.addEventListener("scroll", reposition, true); // capture: catches rail's internal scroll too
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [reposition]);

  if (!geometry) return null;

  return ReactDOM.createPortal(
    <div
      ref={popoverRef}
      className={styles.processPopover}
      style={geometry.style}
      role="dialog"
      aria-label={topic.title}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className={styles.processPopoverArrow} style={geometry.arrowStyle} aria-hidden="true" />
      <button
        type="button"
        className={styles.processPopoverClose}
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <div className={styles.processPopoverTitle}>{topic.title}</div>
      {topic.image && !imgBroken && (
        <img
          className={styles.processPopoverImage}
          src={topic.image}
          alt={topic.title}
          loading="lazy"
          onError={() => setImgBroken(true)}
        />
      )}
      <div className={styles.processPopoverDesc}>{topic.desc}</div>
    </div>,
    document.body
  );
}

export default function ProcessMenu() {
  const [openId, setOpenId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [scrollState, setScrollState] = useState({ canUp: false, canDown: false });
  const rootRef = useRef(null);
  const railRef = useRef(null);
  const anchorRefs = useRef({});
  const hoverCloseTimerRef = useRef(null);

  const toggleOpen = useCallback((id) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const close = useCallback(() => setOpenId(null), []);

  const clearHoverCloseTimer = useCallback(() => {
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }, []);

  const setHoveredTopic = useCallback(
    (id) => {
      clearHoverCloseTimer();
      setHoveredId(id);
    },
    [clearHoverCloseTimer]
  );

  const scheduleHoverClear = useCallback(
    (id) => {
      clearHoverCloseTimer();
      hoverCloseTimerRef.current = window.setTimeout(() => {
        setHoveredId((prev) => (prev === id ? null : prev));
        hoverCloseTimerRef.current = null;
      }, 80);
    },
    [clearHoverCloseTimer]
  );

  // Close the description popover on outside click / Escape
  useEffect(() => {
    if (!openId) return;

    const handlePointerDown = (e) => {
      const clickedAnchor = rootRef.current && rootRef.current.contains(e.target);
      const clickedPopover = e.target.closest && e.target.closest(`.${styles.processPopover}`);
      if (!clickedAnchor && !clickedPopover) close();
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openId, close]);

  useEffect(() => {
    return () => {
      clearHoverCloseTimer();
    };
  }, [clearHoverCloseTimer]);

  // Track whether the rail can scroll further up/down so the arrow
  // buttons can hide themselves at either end.
  const updateScrollState = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const canUp = el.scrollTop > 4;
    const canDown = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
    setScrollState((prev) => (prev.canUp === canUp && prev.canDown === canDown ? prev : { canUp, canDown }));
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    // Re-measure once layout has settled and whenever the rail's own
    // content size changes (e.g. responsive breakpoint swap).
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateScrollState);
      ro.observe(el);
    }

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      if (ro) ro.disconnect();
    };
  }, [updateScrollState]);

  const scrollByStep = useCallback((direction) => {
    const el = railRef.current;
    if (!el) return;
    const step = Math.max(el.clientHeight * 0.7, 120);
    el.scrollBy({ top: direction * step, behavior: "smooth" });
  }, []);

  // The popover (description) shows for whichever item is either
  // hovered/focused OR click-pinned open. Click-pin takes priority so
  // it stays put even after the mouse leaves (needed for touch/mobile).
  const activeId = openId || hoveredId;
  const openTopic = activeId ? PROCESS_TOPICS.find((t) => t.id === activeId) : null;

  return (
    <div ref={rootRef} className={styles.processRailWrap}>
      <button
        type="button"
        className={`${styles.processScrollBtn} ${styles.processScrollBtnUp} ${
          !scrollState.canUp ? styles.processScrollBtnHidden : ""
        }`}
        onClick={() => scrollByStep(-1)}
        aria-label="Scroll up"
        tabIndex={scrollState.canUp ? 0 : -1}
      >
        ▲
      </button>

      <aside
        ref={railRef}
        className={styles.processMenu}
        aria-label="Process and technology introductions"
      >
        {PROCESS_TOPICS.map((topic) => {
          const isOpen = openId === topic.id;
          const isActive = activeId === topic.id;
          return (
            <div
              key={topic.id}
              ref={(el) => {
                anchorRefs.current[topic.id] = el;
              }}
              className={`${styles.processItem} ${isOpen ? styles.processItemOpen : ""} ${
                isActive ? styles.processItemActive : ""
              }`}
              onMouseEnter={() => setHoveredTopic(topic.id)}
              onMouseLeave={() => scheduleHoverClear(topic.id)}
            >
              <button
                type="button"
                className={styles.processIconBtn}
                onClick={() => toggleOpen(topic.id)}
                onFocus={() => setHoveredTopic(topic.id)}
                onBlur={() => scheduleHoverClear(topic.id)}
                aria-expanded={isOpen}
                aria-label={topic.title}
              >
                <ProcessIcon name={topic.icon} />
              </button>

              <span className={styles.processTitleInline}>{topic.title}</span>
            </div>
          );
        })}
      </aside>

      <button
        type="button"
        className={`${styles.processScrollBtn} ${styles.processScrollBtnDown} ${
          !scrollState.canDown ? styles.processScrollBtnHidden : ""
        }`}
        onClick={() => scrollByStep(1)}
        aria-label="Scroll down"
        tabIndex={scrollState.canDown ? 0 : -1}
      >
        ▼
      </button>

      {openTopic && (
        <ProcessPopover
          key={openTopic.id}
          topic={openTopic}
          anchorEl={anchorRefs.current[openTopic.id]}
          onClose={close}
          onMouseEnter={() => setHoveredTopic(openTopic.id)}
          onMouseLeave={() => scheduleHoverClear(openTopic.id)}
        />
      )}
    </div>
  );
}