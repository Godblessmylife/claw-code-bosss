"use client";

import { useEffect, useRef, useState } from "react";

// Duration constants (ms)
const RAIN_DURATION = 2600;
const FADE_DURATION = 600;
const TOTAL_DURATION = RAIN_DURATION + FADE_DURATION;

// Matrix characters — katakana + digits for authenticity
const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface Column {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
  opacity: number;
  z: number; // 0–1, depth for 3-D perspective scaling
}

function initColumns(canvas: HTMLCanvasElement): Column[] {
  const cols: Column[] = [];
  const baseSize = 16;
  const count = Math.floor(canvas.width / baseSize) * 2;

  for (let i = 0; i < count; i++) {
    const z = 0.2 + Math.random() * 0.8; // depth
    const size = baseSize * z;
    const length = Math.floor(6 + Math.random() * 18);
    cols.push({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height,
      speed: (1.5 + Math.random() * 3) * z,
      length,
      chars: Array.from({ length }, () =>
        CHARS[Math.floor(Math.random() * CHARS.length)]
      ),
      opacity: 0.15 + Math.random() * 0.85,
      z,
    });
  }
  return cols;
}

export function MatrixIntro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"rain" | "fade" | "done">("rain");
  const doneRef = useRef(false);

  // Schedule fade + done
  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fade"), RAIN_DURATION);
    const doneTimer = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        setPhase("done");
        onDone();
      }
    }, TOTAL_DURATION);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas to full screen
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const columns = initColumns(canvas);
    let raf: number;
    let lastTime = 0;

    const draw = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      // Translucent black overlay for trail effect
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const col of columns) {
        const baseSize = 16 * col.z;
        ctx.font = `${baseSize}px "Geist Mono", monospace`;

        col.chars.forEach((ch, idx) => {
          const cy = col.y - idx * baseSize;
          if (cy < -baseSize || cy > canvas.height + baseSize) return;

          const isHead = idx === 0;
          // Perspective: closer cols (high z) brighter
          const brightness = col.z;
          const alpha = isHead ? 1 : col.opacity * (1 - idx / col.length) * brightness;

          if (isHead) {
            // Bright white head with glow
            ctx.shadowBlur = 12 * col.z;
            ctx.shadowColor = "#00ff41";
            ctx.fillStyle = `rgba(220,255,220,${alpha})`;
          } else {
            ctx.shadowBlur = 4 * col.z;
            ctx.shadowColor = "#00ff41";
            ctx.fillStyle = `rgba(0,${Math.floor(180 + 75 * brightness)},${Math.floor(40 * brightness)},${alpha})`;
          }

          ctx.fillText(ch, col.x, cy);

          // Randomly mutate characters
          if (Math.random() < 0.02) {
            col.chars[idx] = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        });

        ctx.shadowBlur = 0;

        // Advance column
        col.y += col.speed * (dt / 16);

        // Reset when off-screen
        if (col.y - col.length * (16 * col.z) > canvas.height) {
          col.y = -Math.random() * 60;
          col.x = Math.random() * canvas.width;
          col.z = 0.2 + Math.random() * 0.8;
          const len = Math.floor(6 + Math.random() * 18);
          col.length = len;
          col.chars = Array.from({ length: len }, () =>
            CHARS[Math.floor(Math.random() * CHARS.length)]
          );
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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: "#000",
        opacity: phase === "fade" ? 0 : 1,
        transition: phase === "fade" ? `opacity ${FADE_DURATION}ms ease-in-out` : "none",
        pointerEvents: "all",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ display: "block" }}
        aria-hidden
      />

      {/* Center logo overlay */}
      <div
        className="relative z-10 flex flex-col items-center gap-3 select-none"
        style={{ textShadow: "0 0 24px #00ff41, 0 0 60px #00ff41" }}
      >
        <div
          className="text-4xl md:text-6xl font-mono font-black tracking-[0.25em]"
          style={{ color: "#00ff41" }}
        >
          JP_CODE
        </div>
        <div
          className="text-xs md:text-sm font-mono tracking-[0.4em] uppercase"
          style={{ color: "rgba(0,255,65,0.7)" }}
        >
          AI Coding Assistant
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#00ff41",
                animation: `matrix-dot 1s ${i * 0.25}s ease-in-out infinite alternate`,
                boxShadow: "0 0 8px #00ff41",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
