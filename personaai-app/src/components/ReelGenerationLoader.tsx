"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type JobStatus = "queued" | "processing" | "completed" | "failed";

interface ReelGenerationLoaderProps {
  jobStatus: JobStatus;
  jobId: string;
  onDismissError?: () => void;
}

interface Stage {
  id: string;
  label: string;
  description: string;
  timeHint: string;
  progressRange: [number, number];
}

const STYLE_ID = "reel-generation-loader-styles";

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    @keyframes reelPulseGlow {
      0%, 100% { opacity: 0.55; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.08); }
    }

    @keyframes reelShimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    @keyframes reelBreathe {
      0%, 100% { box-shadow: 0 0 16px 2px rgba(168,85,247,0.18); }
      50% { box-shadow: 0 0 30px 6px rgba(168,85,247,0.38); }
    }

    @keyframes reelSpin {
      to { transform: rotate(360deg); }
    }

    @keyframes reelFadeUp {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes reelParticleA {
      0% { transform: translateY(0px) translateX(0px); opacity: 0; }
      25% { opacity: 0.6; }
      100% { transform: translateY(-36px) translateX(12px); opacity: 0; }
    }

    @keyframes reelParticleB {
      0% { transform: translateY(0px) translateX(0px); opacity: 0; }
      25% { opacity: 0.45; }
      100% { transform: translateY(-30px) translateX(-10px); opacity: 0; }
    }

    .reel-loader-fade {
      animation: reelFadeUp 0.35s ease both;
    }
  `;
  document.head.appendChild(el);
}

function getProcessingStage(elapsedMs: number): Stage {
  const seconds = Math.floor(elapsedMs / 1000);

  if (seconds < 12) {
    return {
      id: "image",
      label: "Building base image",
      description: "Preparing the visual foundation for your reel.",
      timeHint: "Usually takes 1–3 minutes",
      progressRange: [22, 42],
    };
  }

  if (seconds < 45) {
    return {
      id: "render",
      label: "Rendering reel",
      description: "Frames are being generated in the background.",
      timeHint: "Rendering in progress",
      progressRange: [42, 74],
    };
  }

  return {
    id: "final",
    label: "Finalizing output",
    description: "Applying final render and output checks.",
    timeHint: "Almost there",
    progressRange: [74, 92],
  };
}

function useSimulatedProgress(jobStatus: JobStatus) {
  const [progress, setProgress] = useState(8);
  const [elapsedMs, setElapsedMs] = useState(0);

  const startedAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (jobStatus === "completed") {
      setProgress(100);
      return;
    }

    if (jobStatus === "failed") {
      return;
    }

    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }

    const tick = () => {
      const now = Date.now();
      const elapsed = now - (startedAtRef.current ?? now);
      setElapsedMs(elapsed);

      setProgress((prev) => {
        if (jobStatus === "queued") {
          const target = 16;
          const step = Math.random() * 0.9 + 0.25;
          return Math.min(prev + step, target);
        }

        const stage = getProcessingStage(elapsed);
        const [, max] = stage.progressRange;
        const step = Math.random() * 0.75 + 0.2;
        return Math.min(prev + step, max);
      });
    };

    tick();
    intervalRef.current = setInterval(tick, 350);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobStatus]);

  const stage = useMemo(() => {
    if (jobStatus === "queued") {
      return {
        id: "queued",
        label: "Preparing generation",
        description: "We’re setting up your reel job and loading identity references.",
        timeHint: "Starting soon",
        progressRange: [8, 18] as [number, number],
      };
    }

    if (jobStatus === "processing") {
      return getProcessingStage(elapsedMs);
    }

    if (jobStatus === "completed") {
      return {
        id: "completed",
        label: "Your reel is ready",
        description: "Scroll down to preview the result.",
        timeHint: "Completed",
        progressRange: [100, 100] as [number, number],
      };
    }

    return {
      id: "failed",
      label: "Generation failed",
      description: "Something went wrong. Please try again.",
      timeHint: "Failed",
      progressRange: [0, 0] as [number, number],
    };
  }, [elapsedMs, jobStatus]);

  return {
    progress: Math.round(progress),
    stage,
    elapsedMs,
  };
}

function OrbIndicator({ active }: { active: boolean }) {
  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, #a855f7, #ec4899, #a855f7)",
          animation: active ? "reelSpin 2.2s linear infinite" : "none",
          opacity: active ? 1 : 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 3,
          borderRadius: "50%",
          background: "#0d0d14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            animation: active ? "reelPulseGlow 1.7s ease-in-out infinite" : "none",
          }}
        />
      </div>

      {active && (
        <>
          <div
            style={{
              position: "absolute",
              top: 4,
              right: -2,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#a855f7",
              animation: "reelParticleA 2.5s ease-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 4,
              left: -2,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#ec4899",
              animation: "reelParticleB 2.9s ease-out infinite 0.5s",
            }}
          />
        </>
      )}
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      style={{
        position: "relative",
        height: 6,
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          borderRadius: 999,
          background: "linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)",
          transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "reelShimmer 1.8s linear infinite",
          }}
        />
      </div>
    </div>
  );
}

export default function ReelGenerationLoader({
  jobStatus,
  onDismissError,
}: ReelGenerationLoaderProps) {
  useEffect(() => {
    injectStyles();
  }, []);

  const { progress, stage, elapsedMs } = useSimulatedProgress(jobStatus);

  const isActive = jobStatus === "queued" || jobStatus === "processing";
  const isCompleted = jobStatus === "completed";
  const isFailed = jobStatus === "failed";

  const helperText =
    isCompleted
      ? "Your reel is ready."
      : isFailed
      ? "Please retry generation."
      : elapsedMs > 75_000
      ? "This one is taking a bit longer than usual."
      : "You can stay here while we finish in the background.";

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 22,
        background: "linear-gradient(160deg, #12101c 0%, #0d0d14 100%)",
        border: "1px solid rgba(168,85,247,0.18)",
        padding: "22px 18px",
        boxSizing: "border-box",
        animation: isActive ? "reelBreathe 3s ease-in-out infinite" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -42,
          left: -42,
          width: 170,
          height: 170,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 72%)",
          pointerEvents: "none",
        }}
      />

      {isActive && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <OrbIndicator active />

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                key={stage.label}
                className="reel-loader-fade"
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#f0e6ff",
                  letterSpacing: "-0.01em",
                }}
              >
                {stage.label}
              </p>

              <p
                key={stage.description}
                className="reel-loader-fade"
                style={{
                  margin: "4px 0 0",
                  fontSize: 12,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.46)",
                }}
              >
                {stage.description}
              </p>
            </div>
          </div>

          <ProgressBar progress={progress} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.30)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {stage.timeHint}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "rgba(168,85,247,0.82)",
                fontVariantNumeric: "tabular-nums",
                fontWeight: 700,
              }}
            >
              {progress}%
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#a855f7,#ec4899)",
                boxShadow: "0 0 10px rgba(168,85,247,0.7)",
                animation: "reelPulseGlow 1.4s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.66)",
                lineHeight: 1.45,
              }}
            >
              {helperText}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {[
              "Preparing generation",
              "Building base image",
              "Rendering reel",
              "Finalizing output",
            ].map((label, index) => {
              const activeIndex =
                stage.id === "queued"
                  ? 0
                  : stage.id === "image"
                  ? 1
                  : stage.id === "render"
                  ? 2
                  : 3;

              return (
                <div
                  key={label}
                  style={{
                    width: index === activeIndex ? 20 : 6,
                    height: 6,
                    borderRadius: 999,
                    background:
                      index <= activeIndex
                        ? "linear-gradient(90deg, #a855f7, #ec4899)"
                        : "rgba(255,255,255,0.10)",
                    transition: "all 0.4s ease",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {isCompleted && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>✦</div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#f0e6ff",
            }}
          >
            Your reel is ready
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.48)",
            }}
          >
            Scroll down to preview the result.
          </div>
          <ProgressBar progress={100} />
        </div>
      )}

      {isFailed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              ✕
            </div>

            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fca5a5",
                }}
              >
                Generation failed
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                Something went wrong. Please try again.
              </div>
            </div>
          </div>

          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              style={{
                marginTop: 4,
                padding: "11px 14px",
                borderRadius: 12,
                border: "1px solid rgba(239,68,68,0.28)",
                background: "rgba(239,68,68,0.08)",
                color: "#fca5a5",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
                fontFamily: "inherit",
              }}
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}
