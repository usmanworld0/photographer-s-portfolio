"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { GalleryItem } from "@/types";
import { Plus, Minus, X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightTableProps {
  items: GalleryItem[];
}

interface TileData extends GalleryItem {
  no: string;
  x: number;
  y: number;
  rot: number;
}

export function LightTable({ items }: LightTableProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoomLevel);

  // Pan state with inertia
  const panRef = useRef({
    x: -250,
    y: -150,
    targetX: -250,
    targetY: -150,
    vx: 0,
    vy: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    dragMoved: 0,
    lastTime: 0,
  });

  // Calculate categories and counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = { All: items.length };
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return [
      { name: "All", count: counts.All },
      { name: "Ice", count: counts.Ice || 0 },
      { name: "Water", count: counts.Water || 0 },
      { name: "Salt", count: counts.Salt || 0 },
      { name: "Sand", count: counts.Sand || 0 },
      { name: "Fire", count: counts.Fire || 0 },
    ];
  }, [items]);

  // Generate deterministic scattered layout for the 40 prints
  const tiles: TileData[] = useMemo(() => {
    const cols = 8;
    const gapX = 320;
    const gapY = 270;
    const offsetX = 850;
    const offsetY = 200;

    return items.map((item, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      // Pseudo-random deterministic offsets
      const seed1 = Math.sin(idx * 997.1) * 10000;
      const seed2 = Math.cos(idx * 733.3) * 10000;
      const jitterX = (seed1 - Math.floor(seed1) - 0.5) * 60;
      const jitterY = (seed2 - Math.floor(seed2) - 0.5) * 60;
      const rot = Math.sin(idx * 43.7) * 5;

      const x = offsetX + col * gapX + jitterX;
      const y = offsetY + row * gapY + jitterY;

      return {
        ...item,
        no: String(idx + 1).padStart(2, "0"),
        x,
        y,
        rot,
      };
    });
  }, [items]);

  // Filtered tiles
  const visibleTiles = useMemo(() => {
    if (activeCategory === "All") return tiles;
    return tiles.filter((t) => t.category === activeCategory);
  }, [tiles, activeCategory]);

  const centerTile = useCallback((tile: TileData) => {
    const container = containerRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const pan = panRef.current;
    const zoom = zoomRef.current;
    const tileWidth = Math.min(240, Math.max(150, bounds.width * 0.5));
    pan.targetX = bounds.width / 2 - (tile.x + tileWidth / 2) * zoom;
    if (bounds.width < 900) {
      const toolbarBottom = container.querySelector('[role="toolbar"]')?.getBoundingClientRect().bottom ?? 0;
      const tileTop = Math.min(
        bounds.height - tileWidth * 1.05 - 56,
        Math.max(toolbarBottom + 12, bounds.height * 0.48),
      );
      pan.targetY = tileTop - tile.y * zoom;
    } else {
      pan.targetY = bounds.height / 2 - (tile.y + tileWidth * 0.48) * zoom;
    }
    pan.x = pan.targetX;
    pan.y = pan.targetY;
    pan.vx = 0;
    pan.vy = 0;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const firstVisible = activeCategory === "All"
        ? tiles[0]
        : tiles.find((tile) => tile.category === activeCategory);
      if (firstVisible) centerTile(firstVisible);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeCategory, centerTile, tiles]);

  // Keep one animation loop alive while the table is mounted.
  useEffect(() => {
    let animId = 0;
    const pan = panRef.current;
    const canvas = canvasRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bounds = containerRef.current?.getBoundingClientRect();
    const toolbarBottom = containerRef.current?.querySelector('[role="toolbar"]')?.getBoundingClientRect().bottom ?? 0;
    if (bounds && bounds.width < 900 && tiles[0]) {
      const tileWidth = Math.min(240, Math.max(150, bounds.width * 0.5));
      const tileTop = Math.min(
        bounds.height - tileWidth * 1.05 - 56,
        Math.max(toolbarBottom + 12, bounds.height * 0.48),
      );
      pan.x = pan.targetX = bounds.width / 2 - tiles[0].x - tileWidth / 2;
      pan.y = pan.targetY = tileTop - tiles[0].y;
    }

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      const dt = pan.lastTime ? Math.min(0.05, (now - pan.lastTime) / 1000) : 1 / 60;
      pan.lastTime = now;
      if (!pan.isDragging) {
        if (!reducedMotion) {
          const frames = dt * 60;
          pan.targetX += pan.vx * frames;
          pan.targetY += pan.vy * frames;
          const friction = Math.pow(0.92, frames);
          pan.vx *= friction;
          pan.vy *= friction;
        } else {
          pan.vx = 0;
          pan.vy = 0;
        }

        const ease = reducedMotion ? 1 : 1 - Math.pow(0.85, dt * 60);
        pan.x += (pan.targetX - pan.x) * ease;
        pan.y += (pan.targetY - pan.y) * ease;
      } else {
        pan.x = pan.targetX;
        pan.y = pan.targetY;
      }

      if (canvas) {
        canvas.style.transform = `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomRef.current})`;
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [tiles]);

  useEffect(() => {
    zoomRef.current = zoomLevel;
  }, [zoomLevel]);

  const setZoomAt = useCallback((nextZoom: number, point?: { x: number; y: number }) => {
    const next = Math.min(1.8, Math.max(0.6, nextZoom));
    const pan = panRef.current;
    const current = zoomRef.current;
    if (point && current !== next) {
      const ratio = next / current;
      pan.targetX = point.x - (point.x - pan.targetX) * ratio;
      pan.targetY = point.y - (point.y - pan.targetY) * ratio;
    }
    zoomRef.current = next;
    setZoomLevel(next);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const factor = Math.exp(-e.deltaY * 0.002);
      setZoomAt(zoomRef.current * factor, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      return;
    }
    e.preventDefault();
    const pan = panRef.current;
    pan.targetX -= e.deltaX;
    pan.targetY -= e.deltaY;
    pan.vx = -e.deltaX * 0.35;
    pan.vy = -e.deltaY * 0.35;
  }, [setZoomAt]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Pointer event handlers for panning
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
    const pan = panRef.current;
    pan.isDragging = true;
    pan.lastX = e.clientX;
    pan.lastY = e.clientY;
    pan.dragMoved = 0;
    pan.vx = 0;
    pan.vy = 0;
    const captureTarget = (e.target as HTMLElement).closest(".gallery-print") ?? containerRef.current;
    captureTarget?.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const pan = panRef.current;
    if (!pan.isDragging) return;

    const dx = e.clientX - pan.lastX;
    const dy = e.clientY - pan.lastY;
    pan.dragMoved += Math.abs(dx) + Math.abs(dy);

    pan.targetX += dx;
    pan.targetY += dy;

    pan.vx = dx;
    pan.vy = dy;

    pan.lastX = e.clientX;
    pan.lastY = e.clientY;
  };

  const handlePointerUp = () => {
    panRef.current.isDragging = false;
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedItemIdx === null) {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          setZoomAt(zoomRef.current + 0.1);
        } else if (e.key === "-") {
          e.preventDefault();
          setZoomAt(zoomRef.current - 0.1);
        } else if (e.key === "0") {
          e.preventDefault();
          setZoomAt(1);
        }
        return;
      }
      if (e.key === "Escape") {
        setSelectedItemIdx(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedItemIdx((prev) => (prev! > 0 ? prev! - 1 : visibleTiles.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedItemIdx((prev) => (prev! < visibleTiles.length - 1 ? prev! + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedItemIdx, visibleTiles.length, setZoomAt]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-screen overflow-hidden bg-[#FDFDFD] cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: "none" }}
    >
      {/* Movable Light Table Canvas */}
      <div
        ref={canvasRef}
        className="absolute top-0 left-0 w-[3600px] h-[2400px] pointer-events-auto will-change-transform"
        style={{ transformOrigin: "0 0" }}
      >
        {visibleTiles.map((tile, idx) => (
          <div
            key={tile.title + idx}
            onMouseEnter={() => setHoveredItem(tile.image)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (panRef.current.dragMoved < 6) {
                setSelectedItemIdx(idx);
              }
            }}
            style={{
              position: "absolute",
              left: `${tile.x.toFixed(2)}px`,
              top: `${tile.y.toFixed(2)}px`,
              ["--tile-rotation" as string]: `${tile.rot.toFixed(2)}deg`,
              ["--tile-index" as string]: idx,
            }}
            role="button"
            tabIndex={0}
            aria-label={`Open ${tile.title}, ${tile.location}, ${tile.year}`}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedItemIdx(idx);
              }
            }}
            className={`gallery-print group cursor-pointer border border-[#E4E4E4]/80 bg-white p-[6px] w-[clamp(150px,50vw,240px)] ${hoveredItem === tile.image ? "gallery-print-lifted" : ""}`}
          >
            {/* Photographic Print Inside Mat */}
            <div className="relative aspect-[4/3] bg-[#F0F0EE] overflow-hidden rounded-[1px]">
              <img
                src={tile.image}
                alt={tile.title}
                className="gallery-print-image w-full h-full object-cover select-none pointer-events-none"
                loading="lazy"
                draggable={false}
              />
            </div>

            {/* Print Editorial Caption */}
            <div className="mt-2.5 px-1 flex items-baseline justify-between text-[11px] font-mono text-[#6A6863]">
              <span className="truncate pr-2 font-medium text-[#14130E]">
                {tile.no} — {tile.title}
              </span>
              <span className="text-[#969696] shrink-0">{tile.year}</span>
            </div>
            <div className="px-1 text-[10px] font-mono text-[#969696] uppercase tracking-wider">
              {tile.location} · {tile.category}
            </div>
          </div>
        ))}
      </div>

      {/* Header Overlay (Kept Clear of Prints) */}
      <div className="fixed top-24 md:top-28 left-6 md:left-14 z-30 pointer-events-none max-w-lg">
        <h1 className="font-anton text-[56px] sm:text-[72px] md:text-[96px] tracking-[-0.01em] uppercase leading-none text-[#14130E]">
          Gallery
        </h1>

        <span className="block w-11 h-[1px] bg-[#E4E4E4] my-5" />

        <p className="font-sans text-[14px] md:text-[15px] text-[#6A6863] leading-relaxed mb-4">
          Out-takes and the frames in between, laid out on the table. Drag to
          move it, hover to lift a print, click to look closer.
        </p>

        {/* Drag Cue Badge */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[#14130E] font-mono text-[11px] uppercase tracking-wider mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14130E] animate-pulse" />
          <span>Drag to explore</span>
        </div>

        {/* Filter Toolbar Chips */}
        <div
          role="toolbar"
          aria-label="Filter the gallery"
          className="pointer-events-auto flex flex-wrap gap-2 pt-1"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  setSelectedItemIdx(null);
                  setHoveredItem(null);
                  setActiveCategory(cat.name);
                  const firstVisible = cat.name === "All"
                    ? tiles[0]
                    : tiles.find((tile) => tile.category === cat.name);
                  if (firstVisible) centerTile(firstVisible);
                }}
                className={`px-3.5 py-2 rounded-full font-mono text-[12px] uppercase tracking-[0.06em] border transition-all duration-300 ${
                  isActive
                    ? "bg-[#14130E] text-white border-[#14130E] shadow-sm"
                    : "bg-white/80 backdrop-blur-sm text-[#14130E] border-[#E4E4E4] hover:border-[#14130E]"
                }`}
              >
                {cat.name} {cat.count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame Counter in Top Right */}
      <div className="fixed top-7 right-6 md:right-14 z-40 font-mono text-[12px] font-medium tracking-[0.06em] text-[#14130E]/60 uppercase pointer-events-none">
        {visibleTiles.length} frames
      </div>

      {/* Floating Zoom Controls in Bottom Right */}
      <div className="fixed top-16 md:top-auto md:bottom-8 right-5 md:right-14 z-40 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-[#E4E4E4] rounded-full p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setZoomAt(zoomRef.current - 0.15)}
          aria-label="Zoom out"
          className="p-2 text-[#14130E] hover:bg-black/5 rounded-full transition-colors"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={() => setZoomAt(1)}
          aria-label="Reset zoom to 100 percent"
          className="font-mono text-[11px] text-[#14130E] w-9 text-center font-medium"
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        <button
          type="button"
          onClick={() => setZoomAt(zoomRef.current + 0.15)}
          aria-label="Zoom in"
          className="p-2 text-[#14130E] hover:bg-black/5 rounded-full transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* High-Resolution Detailed Lightbox Viewer */}
      {selectedItemIdx !== null && visibleTiles[selectedItemIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-12 animate-in fade-in duration-200"
          onClick={() => setSelectedItemIdx(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedItemIdx(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
            aria-label="Close"
          >
            <X size={22} />
          </button>

          {/* Prev / Next controls */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItemIdx((idx) =>
                idx! > 0 ? idx! - 1 : visibleTiles.length - 1
              );
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItemIdx((idx) =>
                idx! < visibleTiles.length - 1 ? idx! + 1 : 0
              );
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>

          {/* Lightbox Content Container */}
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-[#14130E] border border-white/10 rounded-sm shadow-2xl p-4 md:p-6 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-h-[72vh] flex items-center justify-center overflow-hidden">
              <img
                src={visibleTiles[selectedItemIdx].image}
                alt={visibleTiles[selectedItemIdx].title}
                className="max-w-full max-h-[70vh] object-contain rounded-sm"
              />
            </div>

            {/* Bottom Caption Bar */}
            <div className="w-full mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-white/90 text-sm font-sans">
              <div>
                <span className="font-mono text-white/60 text-xs mr-2">
                  {visibleTiles[selectedItemIdx].no}
                </span>
                <span className="font-medium text-white">
                  {visibleTiles[selectedItemIdx].title}
                </span>
                <span className="text-white/40 mx-2">·</span>
                <span className="text-white/70 text-xs font-mono">
                  {visibleTiles[selectedItemIdx].location},{" "}
                  {visibleTiles[selectedItemIdx].year}
                </span>
              </div>
              <div className="font-mono text-xs text-white/50 uppercase tracking-wider">
                {visibleTiles[selectedItemIdx].category}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
