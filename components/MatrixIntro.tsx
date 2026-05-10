"use client";

import { useEffect, useRef, useState } from "react";

// Duration constants (ms)
const RAIN_DURATION = 2800;
const FADE_DURATION = 500;
const TOTAL_DURATION = RAIN_DURATION + FADE_DURATION;

// Katakana + digits + latin for authentic matrix look
const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface Column {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
  opacity: number;
  z: number; // 0.2–1.0 — depth for 3D perspective
}

function makeChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function buildColumns(w: number, h: number): Column[] {
  const BASE = 14;
  // Density: ~1 column per BASE px of width, doubled for depth layers
  const count = Math.max(20, Math.floor((w / BASE) * 2));
  return Array.from({ length: count }, () => {
    const z = 0.2 + Math.random() * 0.8;
    const len = Math.floor(6 + Math.random() * 20);
    return {
      x: Math.random() * w,
      y: -(Math.random() * h),
      speed: (1.2 + Math.random() * 3.5) * z,
      length: len,
      chars: Array.from({ length: len }, makeChar),
      opacity: 0.2 + Math.random() * 0.8,
      z,
    };
  });
}

export function MatrixIntro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"rain" | "fade" | "done">("rain");
  const doneCalledRef = useRef(false);

  // Phase timers
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fade"), RAIN_DURATION);
    const t2 = setTimeout(() => {
      if (!doneCalledRef.current) {
        doneCalledRef.current = true;
        setPhase("done");
        onDone();
      }
    }, TOTAL_DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  // Canvas rain loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let columns: Column[] = [];
    let raf: number;
    let lastTime = 0;

    const resize = () => {
      // Use actual device pixels for crisp rendering on HiDPI mobile screens
      const dpr = window.devicePixelRatio || 1;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      canvas.style.width = vw + "px";
      canvas.style.height = vh + "px";
      ctx.scale(dpr, dpr);
      // Rebuild columns after resize to fill new dimensions
      columns = buildColumns(vw, vh);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const draw = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      const vw = canvas.width / (window.devicePixelRatio || 1);
      const vh = canvas.height / (window.devicePixelRatio || 1);

      // Fading trail — semi-transparent black fill
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(0, 0, vw, vh);

      for (const col of columns) {
        const size = 14 * col.z;
        ctx.font = `${size}px "Geist Mono", "Courier New", monospace`;

        for (let i = 0; i < col.chars.length; i++) {
          const cy = col.y - i * size;
          if (cy < -size * 2 || cy > vh + size) continue;

          const isHead = i === 0;
          const alpha = isHead
            ? 1
            : col.opacity * (1 - i / col.chars.length) * col.z;

          if (isHead) {
            ctx.shadowBlur = 14 * col.z;
            ctx.shadowColor = "#00ff41";
            ctx.fillStyle = `rgba(220,255,220,${alpha.toFixed(2)})`;
          } else {
            const g = Math.floor(160 + 95 * col.z);
            ctx.shadowBlur = 5 * col.z;
            ctx.shadowColor = "#00ff41";
            ctx.fillStyle = `rgba(0,${g},30,${alpha.toFixed(2)})`;
          }

          ctx.fillText(col.chars[i], col.x, cy);

          // Randomly mutate chars for flicker effect
          if (Math.random() < 0.015) col.chars[i] = makeChar();
        }
        ctx.shadowBlur = 0;

        // Advance column
        col.y += col.speed * (dt / 16);

        // Reset when fully off-screen
        if (col.y - col.chars.length * size > vh) {
          col.y = -(Math.random() * 80);
          col.x = Math.random() * vw;
          col.z = 0.2 + Math.random() * 0.8;
          const len = Math.floor(6 + Math.random() * 20);
          col.length = len;
          col.chars = Array.from({ length: len }, makeChar);
          col.speed = (1.2 + Math.random() * 3.5) * col.z;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: phase === "fade" ? 0 : 1,
        transition: phase === "fade" ? `opacity ${FADE_DURATION}ms ease-in-out` : "none",
        pointerEvents: "all",
        // Use dvh so it covers the full dynamic viewport on mobile (above browser chrome)
        height: "100dvh",
        width: "100dvw",
      }}
    >
      {/* Full-screen canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />

      {/* Center overlay — scales with viewport */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(8px, 2vw, 16px)",
          userSelect: "none",
          padding: "0 16px",
          textAlign: "center",
        }}
      >
        {/* App icon */}
        <div
          style={{
            width: "clamp(56px, 14vw, 96px)",
            height: "clamp(56px, 14vw, 96px)",
            borderRadius: "20%",
            overflow: "hidden",
            border: "2px solid #00ff41",
            boxShadow: "0 0 24px rgba(0,255,65,0.6), 0 0 60px rgba(0,255,65,0.2)",
            marginBottom: "4px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.jpg" alt="JP Code" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: '"Geist Mono", "Courier New", monospace',
            fontWeight: 900,
            fontSize: "clamp(28px, 8vw, 56px)",
            letterSpacing: "0.2em",
            color: "#00ff41",
            textShadow: "0 0 20px #00ff41, 0 0 60px rgba(0,255,65,0.5)",
            lineHeight: 1.1,
          }}
        >
          JP_CODE
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: '"Geist Mono", "Courier New", monospace',
            fontSize: "clamp(9px, 2.5vw, 13px)",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(0,255,65,0.65)",
            textShadow: "0 0 10px rgba(0,255,65,0.4)",
          }}
        >
          AI Coding Assistant
        </div>

        {/* Loading dots */}
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#00ff41",
                boxShadow: "0 0 8px #00ff41",
                animation: `matrix-dot 0.9s ${i * 0.22}s ease-in-out infinite alternate`,
                display: "block",
              }}
            />
          ))}
        </div>

        {/* Version */}
        <div
          style={{
            fontFamily: '"Geist Mono", "Courier New", monospace',
            fontSize: "clamp(8px, 2vw, 10px)",
            color: "rgba(0,255,65,0.35)",
            letterSpacing: "0.2em",
            marginTop: "2px",
          }}
        >
          v1.6.1
        </div>
      </div>
    </div>
  );
}
