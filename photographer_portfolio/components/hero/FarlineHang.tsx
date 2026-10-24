"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProjectItem } from "@/types";

interface FarlineHangProps {
  projects: ProjectItem[];
}

const He = {
  camX: 0.74,
  camY: 0.243,
  dolly: 0,
  fov: 87,
  yaw: -24,
  roll: 3,
  size: 0.51,
  stepX: 0.14,
  stepY: -0.138,
  stepZ: 15,
  pushX: 0.5,
  pushY: 0.4,
  pushZ: 0.3,
  sway: 1,
  breeze: 0.35,
  sag: 0.06,
};

const Z = Math.PI / 180;
const Y = (val: number, min = 0, max = 1) => Math.min(Math.max(val, min), max);
const Fe = (e: number, t: number) => ((e % t) + t) % t;
const Ie = (e: number) => String(e).padStart(2, "0");
const pegStyle: React.CSSProperties & { "--peg": string } = { "--peg": "#C7B78D" };

function pointInQuad(quad: number[], px: number, py: number): boolean {
  let r = 0;
  for (let i = 0; i < 4; i++) {
    const a = quad[2 * i];
    const o = quad[2 * i + 1];
    const s = quad[((i + 1) % 4) * 2];
    const c = quad[((i + 1) % 4) * 2 + 1];
    const l = (s - a) * (py - o) - (c - o) * (px - a);
    if (l === 0) continue;
    const u = l > 0 ? 1 : -1;
    if (r === 0) r = u;
    else if (u !== r) return false;
  }
  return true;
}

export function FarlineHang({ projects }: FarlineHangProps) {
  const L = projects.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sheetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wireRefs = useRef<(SVGSVGElement | null)[]>([]);
  const wirePathRefs = useRef<(SVGPathElement | null)[]>([]);
  const pegRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [activeHoverIdx, setActiveHoverIdx] = useState<number>(-1);
  const [counterText, setCounterText] = useState<string>("01 — 11");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [selectedProjectIdx, setSelectedProjectIdx] = useState<number | null>(null);

  const stateRef = useRef({
    n: L,
    posCur: 0,
    posTarget: 0,
    tiltX: 0,
    tiltY: 0,
    tiltTX: 0,
    tiltTY: 0,
    hover: Array(L).fill(0),
    hoverTarget: -1,
    clock: 0,
    introT: 0,
    introRank: Array.from({ length: L }, (_, index) => index),
    introOpacity: Array(L).fill(-1),
    wireProgress: Array(L).fill(-1),
    last: 0,
    quads: Array.from({ length: L }, () => Array(8).fill(0)),
    onStage: Array(L).fill(false),
    depth: Array(L).fill(0),
    lift: Array(L).fill(-1),
    vis: Array(L).fill(-1),
    opac: Array(L).fill(-1),
    sz: Array(L).fill(0),
    szv: Array(L).fill(0),
    sx: Array(L).fill(0),
    sxv: Array(L).fill(0),
    sheetT: Array(L).fill(""),
    vel: 0,
    lastPos: 0,
    rest: Array.from({ length: L }, () => [0, 0, 0, 0, 0, 0, 0]),
    boxW: 0,
    px: 0,
    py: 0,
    inside: false,
    dragging: false,
    motionEnabled: true,
    dragStartX: 0,
    dragStartY: 0,
    dragMoved: 0,
    pointerX: -1,
    pointerY: -1,
    windX: 0,
    windY: 0,
  });

  const activeProject = activeHoverIdx >= 0 ? projects[activeHoverIdx] : null;

  // Key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedProjectIdx !== null) {
        if (e.key === "Escape") {
          e.preventDefault();
          setSelectedProjectIdx(null);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          setSelectedProjectIdx((selectedProjectIdx - 1 + L) % L);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setSelectedProjectIdx((selectedProjectIdx + 1) % L);
        }
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        stateRef.current.posTarget -= 1;
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        stateRef.current.posTarget += 1;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [L, selectedProjectIdx]);

  // Main 3D simulation loop
  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage || !L) return;

    let animId = 0;
    let timerId = 0;
    const s = stateRef.current;
    const initialOrder = Array.from({ length: L }, (_, index) => index);
    initialOrder.sort((a, b) => {
      const relA = Fe(a + 2.6, L) - 2.6;
      const relB = Fe(b + 2.6, L) - 2.6;
      return relA - relB;
    });
    initialOrder.forEach((index, rank) => {
      s.introRank[index] = rank;
    });

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const handleResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      s.boxW = 0;
    };
    window.addEventListener("resize", handleResize);

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateLayoutProperties = () => {
      const isMobile = width < 760;
      const leftPad = Math.min(78, Math.max(20, 0.042 * width));
      container.style.setProperty("--pm-left", `${leftPad}px`);
      container.style.setProperty("--pm-w", `${width}px`);
      container.style.setProperty("--pm-h", `${height}px`);
      container.style.setProperty("--pm-top", `${isMobile ? Math.min(110, Math.max(84, 0.11 * height)) : Math.min(168, Math.max(84, 0.18 * height))}px`);
      container.style.setProperty("--pm-labelMax", `${Math.min(340, 0.4 * width).toFixed(1)}px`);

      if (titleRef.current) {
        let fs = Math.min(141, Math.max(46, 0.09576 * width));
        titleRef.current.style.fontSize = `${fs}px`;
        const avail = width - 2 * leftPad;
        const sw = titleRef.current.scrollWidth;
        if (sw > avail && sw > 0) {
          fs = (avail / sw) * fs;
        }
        titleRef.current.style.fontSize = `${fs.toFixed(2)}px`;
        container.style.setProperty("--pm-rule", `${Math.max(20, 0.313 * fs).toFixed(1)}px`);
      }
    };

    updateLayoutProperties();

    // Wheel listener
    const onWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        e.preventDefault();
        s.posTarget += 0.0032 * e.deltaY;
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    // Animation frame tick
    const loop = (timestamp: number) => {
      timerId = window.setTimeout(() => {
        animId = requestAnimationFrame(loop);
      }, 16);
      const dt = s.last ? Math.min(0.05, (timestamp - s.last) / 1000) : 0;
      s.last = timestamp;

      if (!isReducedMotion && s.motionEnabled) {
        s.clock += 0.006;
      }
      s.introT += dt;
      s.windX *= Math.pow(0.035, dt);
      s.windY *= Math.pow(0.035, dt);

      // Smooth position
      s.posCur += (s.posTarget - s.posCur) * 0.1;
      if (Math.abs(s.posTarget - s.posCur) < 0.0001) s.posCur = s.posTarget;

      // Parallax lerp
      s.tiltX += (s.tiltTX - s.tiltX) * 0.06;
      s.tiltY += (s.tiltTY - s.tiltY) * 0.06;

      const aspectDiff = Y(1.5 - width / height);
      const scaleW = 1 + 1.3 * aspectDiff;
      const isMobile = aspectDiff > 0.5;
      const cardScale = isMobile ? He.size * 0.8 : He.size * scaleW;
      const stepX = He.stepX * scaleW * (1 - 0.67 * aspectDiff);
      const stepY = He.stepY * (1 - 0.24 * aspectDiff);

      for (let e = 0; e < L; e++) {
        const target = +(s.hoverTarget === e);
        s.hover[e] += (target - s.hover[e]) * 0.14;
      }

      const fovRad = He.fov * Z;
      const fovDist = (width / 2 / Math.tan(fovRad / 2)) * scaleW;
      const camParallaxX = s.tiltX * He.pushX * 0.045;
      const camParallaxY = s.tiltY * He.pushY * 0.035;
      const camOriginX = He.camX + camParallaxX;
      const camOriginY = He.camY + camParallaxY;

      stage.style.perspective = `${fovDist.toFixed(2)}px`;
      stage.style.perspectiveOrigin = `${(100 * camOriginX).toFixed(3)}% ${(100 * camOriginY).toFixed(3)}%`;

      const boxWidth = width * Math.max(cardScale, 0.4) * 1.02;
      const boxHeight = boxWidth / 1.3;

      if (Math.abs(boxWidth - s.boxW) >= 1) {
        s.boxW = boxWidth;
        for (let t = 0; t < L; t++) {
          const card = cardRefs.current[t];
          if (card) {
            card.style.width = `${boxWidth.toFixed(2)}px`;
            card.style.height = `${boxHeight.toFixed(2)}px`;
          }
          const peg = pegRefs.current[t];
          if (peg) {
            const pw = 0.05 * boxWidth;
            const ph = 0.09 * boxWidth;
            peg.style.width = `${pw.toFixed(2)}px`;
            peg.style.height = `${ph.toFixed(2)}px`;
            peg.style.setProperty("--pw", `${pw.toFixed(2)}px`);
            peg.style.setProperty("--ph", `${ph.toFixed(2)}px`);
          }
        }
      }

      // Compute card positions
      for (let e = 0; e < L; e++) {
        const card = cardRefs.current[e];
        if (!card) continue;

        const relIdx = Fe(e - s.posCur + 2.6, L) - 2.6;
        const hoverLift = s.hover[e];

        const posX = (0.208 + stepX * relIdx) * width;
        const posY = (1.08 + stepY * relIdx) * height;
        const posZ = (-15 - He.stepZ * relIdx + 26 * hoverLift) * scaleW + He.dolly;

        const rotY = He.yaw;
        const rotZ = He.roll;

        s.rest[e][0] = posX;
        s.rest[e][1] = posY;
        s.rest[e][2] = posZ;
        s.rest[e][3] = rotY;
        s.rest[e][4] = rotZ;
        s.rest[e][5] = cardScale;

        // Sway & breeze physics
        if (!isReducedMotion && s.motionEnabled && dt > 0) {
          const oscSpeed = s.clock * 60 / 36;
          const kStiff = 30 * (0.84 + 0.32 * ((e * 0.618) % 1));
          const kDamp = 1.9;
          const hoverWind = s.hover[e] * 48;
          const pointerWeight = s.hoverTarget === e ? 1 : 0;
          s.szv[e] += (-kStiff * s.sz[e] - kDamp * s.szv[e] + He.breeze * 14 * Math.sin(oscSpeed * 0.7 + e * 2.3) + hoverWind * Math.sin(oscSpeed * 1.8 + e * 1.4) + s.windX * pointerWeight * 0.5) * dt;
          s.sz[e] = Y(s.sz[e] + s.szv[e] * dt, -14, 14);

          const sBreeze = He.breeze * 70 * (Math.sin(oscSpeed * 0.9 + e * 1.7) + 0.55 * Math.sin(oscSpeed * 2.3 + e * 0.9)) + hoverWind * Math.sin(oscSpeed * 1.15 + e * 2.1) + s.windY * pointerWeight * 0.65;
          s.sxv[e] += (-kStiff * s.sx[e] - kDamp * s.sxv[e] + sBreeze) * dt;
          s.sx[e] = Y(s.sx[e] + s.sxv[e] * dt, -10, 18);
        }

        // Screen projection for quad hit-testing
        const radY = rotY * Z;
        const radZ = rotZ * Z;
        const cosZ = Math.cos(radZ);
        const sinZ = Math.sin(radZ);
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);

        const cardW = width * cardScale;
        const cardH = cardW / 1.3;
        const halfW = cardW / 2;
        const halfH = cardH / 2;

        const quad = s.quads[e];
        let onScreen = true;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        for (let q = 0; q < 4; q++) {
          const cornerX = q === 0 || q === 3 ? -halfW : halfW;
          const cornerY = q === 0 || q === 1 ? -halfH : halfH;

          const rx = cornerX * cosZ - cornerY * sinZ;
          const ry = cornerX * sinZ + cornerY * cosZ;
          const rz = posZ - rx * sinY;

          if (rz > fovDist - 24) {
            onScreen = false;
            break;
          }

          const projScale = fovDist / (fovDist - rz);
          const screenX = camOriginX * width + (posX + rx * cosY - camOriginX * width) * projScale;
          const screenY = camOriginY * height + (posY + ry - camOriginY * height) * projScale;

          quad[2 * q] = screenX;
          quad[2 * q + 1] = screenY;

          if (screenX < minX) minX = screenX;
          if (screenX > maxX) maxX = screenX;
          if (screenY < minY) minY = screenY;
          if (screenY > maxY) maxY = screenY;
        }

        const isVisible = onScreen && maxX > -12 && minX < width + 12 && maxY > -12 && minY < height + 12;
        s.onStage[e] = isVisible;
        s.depth[e] = posZ;

        card.style.visibility = isVisible ? "visible" : "hidden";
        if (isVisible) {
          const reveal = isReducedMotion ? 1 : Y((s.introT - s.introRank[e] * 0.095) / 0.34);
          const easedReveal = reveal * reveal * (3 - 2 * reveal);
          if (Math.abs(easedReveal - s.introOpacity[e]) > 0.006) {
            s.introOpacity[e] = easedReveal;
            card.style.opacity = `${easedReveal.toFixed(3)}`;
          }
          card.style.transform = `translate3d(${(posX - boxWidth / 2).toFixed(2)}px, ${(posY - boxHeight / 2).toFixed(2)}px, ${posZ.toFixed(2)}px) rotateY(${rotY.toFixed(3)}deg) rotateZ(${rotZ.toFixed(3)}deg) scale(${(cardW / boxWidth).toFixed(5)})`;

          const sheet = sheetRefs.current[e];
          if (sheet) {
            const sheetRot = !isReducedMotion ? `rotateZ(${s.sz[e].toFixed(2)}deg) rotateX(${s.sx[e].toFixed(2)}deg)` : "";
            if (sheetRot !== s.sheetT[e]) {
              s.sheetT[e] = sheetRot;
              sheet.style.transform = sheetRot;
            }
            sheet.style.opacity = "1";
          }
        }
      }

      // Draw hanging wire segments and attach pegs
      const sortedIdxs = Array.from({ length: L }, (_, i) => i);
      const getRel = (idx: number) => Fe(idx - s.posCur + 2.6, L) - 2.6;
      sortedIdxs.sort((a, b) => getRel(a) - getRel(b));

      for (let d = 0; d < L; d++) {
        const curIdx = sortedIdxs[d];
        const nextIdx = sortedIdxs[d + 1];

        const peg = pegRefs.current[curIdx];
        if (peg && s.onStage[curIdx]) {
          const rest = s.rest[curIdx];
          peg.style.visibility = "visible";
          peg.style.opacity = `${isReducedMotion ? 1 : s.introOpacity[curIdx]}`;
          peg.style.transform = `translate3d(${(rest[0] - (0.05 * s.boxW) / 2).toFixed(2)}px, ${(rest[1] - s.boxW / 2.6 - (0.09 * s.boxW) * 0.32).toFixed(2)}px, ${(rest[2] + 1.5).toFixed(2)}px) rotateY(${rest[3].toFixed(3)}deg) rotateZ(${rest[4].toFixed(3)}deg) scale(${(width * rest[5] / s.boxW).toFixed(5)})`;
        } else if (peg) {
          peg.style.visibility = "hidden";
        }

        if (nextIdx !== undefined && Math.abs(getRel(nextIdx) - getRel(curIdx)) < 1.6) {
          const r1 = s.rest[curIdx];
          const r2 = s.rest[nextIdx];
          const anchorY = s.boxW / 2.6;
          const dx = r2[0] - r1[0];
          const dy = r2[1] - r1[1];
          const dz = r2[2] - r1[2];
          const len = Math.hypot(dx, dy, dz);

          const wire = wireRefs.current[curIdx];
          const path = wirePathRefs.current[curIdx];
          if (wire && path && len > 0.5 && r1[2] < fovDist - 30) {
            const rotYWire = (Math.atan2(-dz, dx) / Z);
            const rotZWire = (Math.asin(Y(dy / len, -1, 1)) / Z);
            const rank = d;
            const reveal = isReducedMotion ? 1 : Y((s.introT - rank * 0.095) / 0.34);
            const easedReveal = reveal * reveal * (3 - 2 * reveal);
            const sag = Math.max(8, Math.min(38, len * (0.09 + 0.055 * ((curIdx * 0.618) % 1))));
            const breezeSag = !isReducedMotion && s.motionEnabled
              ? Math.sin(s.clock * 36 + curIdx * 1.73) * 3.2
              : 0;
            const curveSag = Math.max(2, sag + breezeSag);
            const pathData = `M 0 1 Q ${(len / 2).toFixed(2)} ${(curveSag + 1).toFixed(2)} ${(len + 1).toFixed(2)} 1`;
            if (path.getAttribute("d") !== pathData) {
              path.setAttribute("d", pathData);
              wire.setAttribute("viewBox", `0 0 ${(len + 1).toFixed(2)} ${(curveSag + 2).toFixed(2)}`);
              wire.style.width = `${(len + 1).toFixed(2)}px`;
              wire.style.height = `${(curveSag + 2).toFixed(2)}px`;
            }
            if (Math.abs(easedReveal - s.wireProgress[curIdx]) > 0.006) {
              s.wireProgress[curIdx] = easedReveal;
              path.style.strokeDashoffset = `${(100 * (1 - easedReveal)).toFixed(2)}`;
            }
            wire.style.visibility = "visible";
            wire.style.transform = `translate3d(${r1[0].toFixed(2)}px, ${(r1[1] - anchorY - 1).toFixed(2)}px, ${r1[2].toFixed(2)}px) rotateY(${rotYWire.toFixed(3)}deg) rotateZ(${rotZWire.toFixed(3)}deg)`;
          } else if (wire) {
            wire.style.visibility = "hidden";
          }
        }
      }

      // Hit-testing hovered print
      if (s.inside && !s.dragging) {
        let bestIdx = -1;
        let maxDepth = -Infinity;
        for (let e = 0; e < L; e++) {
          if (s.onStage[e] && pointInQuad(s.quads[e], s.px, s.py) && s.depth[e] > maxDepth) {
            maxDepth = s.depth[e];
            bestIdx = e;
          }
        }
        if (bestIdx !== s.hoverTarget) {
          s.hoverTarget = bestIdx;
          container.style.cursor = bestIdx >= 0 ? "pointer" : "default";
          setActiveHoverIdx(bestIdx);
        }
      }

      // Counter text
      const activeIdx = s.hoverTarget >= 0 ? s.hoverTarget : Fe(Math.round(s.posCur), L);
      const text = `${Ie(activeIdx + 1)} — ${Ie(L)}`;
      setCounterText(text);
    };

    loop(performance.now());

    return () => {
      window.clearTimeout(timerId);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("wheel", onWheel);
    };
  }, [L]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent) => {
    const s = stateRef.current;
    s.dragging = true;
    s.dragStartX = e.clientX;
    s.dragStartY = e.clientY;
    s.dragMoved = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = stateRef.current;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    s.px = e.clientX - rect.left;
    s.py = e.clientY - rect.top;
    s.inside = true;
    if (s.pointerX >= 0 && s.pointerY >= 0) {
      s.windX = Y(s.windX + (s.px - s.pointerX) * 0.8, -48, 48);
      s.windY = Y(s.windY + (s.py - s.pointerY) * 0.8, -48, 48);
    }
    s.pointerX = s.px;
    s.pointerY = s.py;

    s.tiltTX = Y((s.px / Math.max(1, rect.width)) * 2 - 1, -1, 1);
    s.tiltTY = Y((s.py / Math.max(1, rect.height)) * 2 - 1, -1, 1);

    if (s.dragging) {
      const dx = e.clientX - s.dragStartX;
      const dy = e.clientY - s.dragStartY;
      s.dragMoved += Math.hypot(dx, dy);
      s.posTarget -= dx * 0.0035;
      s.dragStartX = e.clientX;
      s.dragStartY = e.clientY;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const s = stateRef.current;
    s.dragging = false;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      s.px = e.clientX - rect.left;
      s.py = e.clientY - rect.top;
    }

    let hitIdx = -1;
    let maxDepth = -Infinity;
    for (let i = 0; i < L; i++) {
      if (s.onStage[i] && pointInQuad(s.quads[i], s.px, s.py) && s.depth[i] > maxDepth) {
        hitIdx = i;
        maxDepth = s.depth[i];
      }
    }

    // Open a print only when the pointer was released without dragging.
    if (s.dragMoved < 6 && hitIdx >= 0) {
      s.hoverTarget = hitIdx;
      setActiveHoverIdx(hitIdx);
      setSelectedProjectIdx(hitIdx);
    }
  };

  const handlePointerLeave = () => {
    const s = stateRef.current;
    s.inside = false;
    s.tiltTX = 0;
    s.tiltTY = 0;
    s.hoverTarget = -1;
    setActiveHoverIdx(-1);
    if (containerRef.current) {
      containerRef.current.style.cursor = "default";
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-screen overflow-hidden select-none bg-[#FDFDFD]"
      style={{ touchAction: "none" }}
    >
      {/* 3D World Stage */}
      <div
        ref={stageRef}
        className="absolute inset-0 preserve-3d pointer-events-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Wire Segments */}
        {projects.map((_, i) => (
          <svg
            key={`wire-${i}`}
            ref={(el) => {
              wireRefs.current[i] = el;
            }}
            className="pm-wire"
            aria-hidden="true"
          >
            <path
              ref={(el) => {
                wirePathRefs.current[i] = el;
              }}
              pathLength="100"
              d="M 0 1 Q 50 12 100 1"
            />
          </svg>
        ))}

        {/* 3D Wooden Pegs */}
        {projects.map((_, i) => (
          <div
            key={`peg-${i}`}
            ref={(el) => {
              pegRefs.current[i] = el;
            }}
            className="pm-peg"
            style={pegStyle}
          >
            <div className="pm-jaw pm-jf">
              <i className="pm-fo" />
              <i className="pm-fl" />
              <i className="pm-fr" />
              <i className="pm-ft" />
            </div>
            <div className="pm-jaw pm-jb">
              <i className="pm-fo" />
              <i className="pm-fl" />
              <i className="pm-fr" />
              <i className="pm-ft" />
            </div>
            <i className="pm-coil" />
          </div>
        ))}

        {/* 3D Photographic Prints */}
        {projects.map((proj, i) => (
          <div
            key={proj.slug}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="pm-card"
          >
            <div
              ref={(el) => {
                sheetRefs.current[i] = el;
              }}
              className="pm-sheet relative bg-[#F8F8F8] border border-black/10 overflow-hidden"
              style={{
                transition: "box-shadow 0.3s ease",
              }}
            >
              <img
                src={proj.heroImage}
                alt={proj.title}
                className="w-full h-full object-cover"
                loading={i < 7 ? "eager" : "lazy"}
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Editorial Header Typography Overlay */}
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          top: "var(--pm-top, 84px)",
          left: "var(--pm-left, 20px)",
          maxWidth: "var(--pm-labelMax, 340px)",
        }}
      >
        <h1
          ref={titleRef}
          className="pm-title font-anton text-[#14130E] leading-[0.84] tracking-[-0.005em] uppercase"
        >
          FARLINE
        </h1>

        <div className="pm-meta mt-5">
          <span className="block w-11 h-[1px] bg-[#E4E4E4] mb-3" />

          {/* Dynamic Crossfade Metadata */}
          <div className="min-h-[90px]" style={{ maxWidth: "var(--pm-labelMax, 340px)" }}>
            {activeProject ? (
              <div className="space-y-1 transition-opacity duration-300">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#969696]">
                  {activeProject.number} — {activeProject.series} · {activeProject.year}
                </p>
                <p className="font-sans text-[15px] font-medium text-[#14130E]">
                  {activeProject.title}
                </p>
                <p className="font-sans text-[13px] text-[#6A6863] leading-relaxed line-clamp-2">
                  {activeProject.description}
                </p>
                <p className="font-mono text-[11px] text-[#969696] pt-1">
                  {activeProject.place}, {activeProject.country} · {activeProject.camera}
                </p>
              </div>
            ) : (
              <p className="font-sans text-[14px] text-[#6A6863] leading-relaxed">
                Landscape and aerial work from salt, sand and open water. Eleven
                prints, hung on one line running away from you.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Frame Counter in Top Right */}
      <div
        ref={counterRef}
        className="pm-counter fixed top-4 right-5 z-40 font-mono text-[12px] font-medium tracking-[0.06em] text-[#14130E] uppercase pointer-events-none"
      >
        {counterText}
      </div>

      <div className="pm-settings fixed left-5 z-50">
        <section
          id="farline-settings"
          className="pm-settings-panel"
          aria-label="Display settings"
          hidden={!settingsOpen}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="pm-settings-heading">
            <span>DISPLAY</span>
            <button
              type="button"
              className="pm-settings-close"
              aria-label="Close settings"
              onClick={() => setSettingsOpen(false)}
            >
              ×
            </button>
          </div>
          <button
            type="button"
            className="pm-motion-toggle"
            role="switch"
            aria-checked={motionEnabled}
            onClick={() => {
              const enabled = !motionEnabled;
              setMotionEnabled(enabled);
              stateRef.current.motionEnabled = enabled;
            }}
          >
            <span>Ambient movement</span>
            <span className="pm-switch" aria-hidden="true">
              <i />
            </span>
          </button>
          <p>Drag or scroll to move along the line. Select a print to explore the series.</p>
        </section>
        <button
          type="button"
          className="pm-settings-button"
          aria-expanded={settingsOpen}
          aria-controls="farline-settings"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setSettingsOpen((open) => !open)}
        >
          <span className="pm-settings-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M3 6h14M3 14h14" />
              <circle cx="7" cy="6" r="2" />
              <circle cx="13" cy="14" r="2" />
            </svg>
          </span>
          <span>Settings</span>
        </button>
      </div>

      {selectedProjectIdx !== null && projects[selectedProjectIdx] && (
        <div
          className="pm-project-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`${projects[selectedProjectIdx].title} print details`}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerMove={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={() => setSelectedProjectIdx(null)}
        >
          <button
            type="button"
            className="pm-viewer-close"
            aria-label="Close print details"
            onClick={() => setSelectedProjectIdx(null)}
          >
            ×
          </button>
          <button
            type="button"
            className="pm-viewer-arrow pm-viewer-prev"
            aria-label="Previous print"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedProjectIdx((selectedProjectIdx - 1 + L) % L);
            }}
          >
            ‹
          </button>
          <article
            className="pm-viewer-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pm-viewer-image-wrap">
              <img
                key={projects[selectedProjectIdx].slug}
                src={projects[selectedProjectIdx].heroImage}
                alt={projects[selectedProjectIdx].title}
                className="pm-viewer-image"
              />
            </div>
            <div className="pm-viewer-caption">
              <div>
                <p className="pm-viewer-kicker">
                  {projects[selectedProjectIdx].number} — {projects[selectedProjectIdx].total}
                  <span>{projects[selectedProjectIdx].series} · {projects[selectedProjectIdx].year}</span>
                </p>
                <h2>{projects[selectedProjectIdx].title}</h2>
                <p className="pm-viewer-description">
                  {projects[selectedProjectIdx].description}
                </p>
                <p className="pm-viewer-location">
                  {projects[selectedProjectIdx].place}, {projects[selectedProjectIdx].country}
                </p>
              </div>
              <Link
                href={`/contact?subject=${encodeURIComponent(`Print Enquiry - ${projects[selectedProjectIdx].title}`)}`}
                className="pm-viewer-enquire"
                onClick={(event) => event.stopPropagation()}
              >
                Enquire <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
          <button
            type="button"
            className="pm-viewer-arrow pm-viewer-next"
            aria-label="Next print"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedProjectIdx((selectedProjectIdx + 1) % L);
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
