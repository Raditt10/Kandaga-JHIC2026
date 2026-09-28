"use client";

/**
 * FlowingMenu — ReactBits component (MIT + Commons Clause, DavidHDev)
 * Source: https://github.com/DavidHDev/react-bits
 * Converted from JSX + CSS to TypeScript + Tailwind inline styles by Kandaga team.
 * GSAP handles the marquee slide-in/out animation on mouseenter/mouseleave.
 */

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

export interface FlowingMenuItemProps {
  link: string;
  text: string;
  image: string;
}

interface FlowingMenuProps {
  items?: FlowingMenuItemProps[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
}

export default function FlowingMenu({
  items = [],
  speed = 15,
  textColor = "#fff",
  bgColor = "#1A1A1A",
  marqueeBgColor = "#fff",
  marqueeTextColor = "#1A1A1A",
  borderColor = "rgba(255,255,255,0.15)",
}: FlowingMenuProps) {
  return (
    <div style={{ backgroundColor: bgColor, width: "100%", height: "100%", overflow: "hidden" }}>
      <nav style={{ display: "flex", flexDirection: "column", height: "100%", margin: 0, padding: 0 }}>
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
          />
        ))}
      </nav>
    </div>
  );
}

interface MenuItemProps extends FlowingMenuItemProps {
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
  isFirst: boolean;
}

function MenuItem({
  link,
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isFirst,
}: MenuItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: "expo" };

  const distMetric = (x: number, y: number, x2: number, y2: number) => {
    return (x - x2) ** 2 + (y - y2) ** 2;
  };

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  // Hitung berapa banyak repetisi marquee yang diperlukan untuk mengisi layar
  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector<HTMLElement>(".marquee-part");
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };
    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [text, image]);

  // Setup GSAP marquee loop — berulang tanpa henti selama hover
  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector<HTMLElement>(".marquee-part");
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) animationRef.current.kill();

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) animationRef.current.kill();
    };
  }, [text, image, repetitions, speed]);

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  return (
    <div
      ref={itemRef}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        borderTop: isFirst ? "none" : `1px solid ${borderColor}`,
      }}
    >
      <a
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          position: "relative",
          cursor: "pointer",
          textTransform: "uppercase",
          textDecoration: "none",
          whiteSpace: "nowrap",
          fontWeight: 600,
          fontSize: "4vh",
          color: textColor,
        }}
      >
        {text}
      </a>

      {/* Marquee pita — meluncur masuk/keluar saat hover */}
      <div
        ref={marqueeRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          overflow: "hidden",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          transform: "translate3d(0, 101%, 0)",
          backgroundColor: marqueeBgColor,
        }}
      >
        <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
          <div
            ref={marqueeInnerRef}
            aria-hidden="true"
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              height: "100%",
              width: "fit-content",
              willChange: "transform",
            }}
          >
            {Array.from({ length: repetitions }).map((_, idx) => (
              <div
                key={idx}
                className="marquee-part"
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  color: marqueeTextColor,
                }}
              >
                <span
                  style={{
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                    fontWeight: 400,
                    fontSize: "4vh",
                    lineHeight: 1,
                    padding: "0 1vw",
                  }}
                >
                  {text}
                </span>
                <div
                  style={{
                    width: 200,
                    height: "7vh",
                    margin: "2em 2vw",
                    padding: "1em 0",
                    borderRadius: 50,
                    backgroundSize: "cover",
                    backgroundPosition: "50% 50%",
                    backgroundImage: `url(${image})`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
