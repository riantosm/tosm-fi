import { useCallback, useEffect, useRef, useState } from "react";
import { hexToHsv, hsvToHex } from "@/utils/color";

interface ColorWheelProps {
  value: string;
  onChange: (hex: string) => void;
}

const RING_SIZE = 200;
const RING_THICKNESS = 20;
const SQUARE_PADDING = 10;
const SQUARE_SIZE = RING_SIZE - (RING_THICKNESS + SQUARE_PADDING) * 2;

export function ColorWheel({ value, onChange }: ColorWheelProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<"ring" | "square" | null>(null);
  // Initialized once from the incoming hex; not resynced on every prop change,
  // since hue can't be recovered once dragging hits pure black/white (s=0 or v=0).
  const [hsv, setHsv] = useState(() => hexToHsv(value));

  const updateFromRing = useCallback(
    (clientX: number, clientY: number) => {
      const rect = ringRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const hue = (angle + 90 + 360) % 360;

      setHsv((prev) => {
        const next = { ...prev, h: hue };
        onChange(hsvToHex(next.h, next.s, next.v));
        return next;
      });
    },
    [onChange],
  );

  const updateFromSquare = useCallback(
    (clientX: number, clientY: number) => {
      const rect = squareRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
      const s = (x / rect.width) * 100;
      const v = 100 - (y / rect.height) * 100;

      setHsv((prev) => {
        const next = { ...prev, s, v };
        onChange(hsvToHex(next.h, next.s, next.v));
        return next;
      });
    },
    [onChange],
  );

  useEffect(() => {
    function handleMove(event: PointerEvent) {
      if (draggingRef.current === "ring") updateFromRing(event.clientX, event.clientY);
      if (draggingRef.current === "square") updateFromSquare(event.clientX, event.clientY);
    }
    function handleUp() {
      draggingRef.current = null;
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [updateFromRing, updateFromSquare]);

  const ringRadius = RING_SIZE / 2 - RING_THICKNESS / 2;
  const thumbAngleRad = ((hsv.h - 90) * Math.PI) / 180;
  const ringThumbX = RING_SIZE / 2 + ringRadius * Math.cos(thumbAngleRad);
  const ringThumbY = RING_SIZE / 2 + ringRadius * Math.sin(thumbAngleRad);

  const squareThumbX = (hsv.s / 100) * SQUARE_SIZE;
  const squareThumbY = (1 - hsv.v / 100) * SQUARE_SIZE;

  return (
    <div
      className="relative mx-auto touch-none select-none"
      style={{ width: RING_SIZE, height: RING_SIZE }}
    >
      <div
        ref={ringRef}
        onPointerDown={(event) => {
          draggingRef.current = "ring";
          updateFromRing(event.clientX, event.clientY);
        }}
        className="absolute inset-0 rounded-full"
        style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
      >
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white shadow"
          style={{
            width: 16,
            height: 16,
            left: ringThumbX - 8,
            top: ringThumbY - 8,
            background: `hsl(${hsv.h}, 100%, 50%)`,
          }}
        />
      </div>

      <div
        ref={squareRef}
        onPointerDown={(event) => {
          draggingRef.current = "square";
          updateFromSquare(event.clientX, event.clientY);
        }}
        className="absolute overflow-hidden rounded-xl"
        style={{
          left: RING_THICKNESS + SQUARE_PADDING,
          top: RING_THICKNESS + SQUARE_PADDING,
          width: SQUARE_SIZE,
          height: SQUARE_SIZE,
          backgroundImage:
            "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
          backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
        }}
      >
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: squareThumbX, top: squareThumbY, background: value }}
        />
      </div>
    </div>
  );
}
