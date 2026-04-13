"use client";

import { useMemo, useState, type ReactNode } from "react";

type BoostId = "allure" | "consistency";
type PlanId = "pro" | "creator" | "agency";

type PremiumBoostPanelProps = {
  currentPlan: PlanId;
  freeAllureRemaining: number;
  freeConsistencyRemaining: number;
  selectedBoost: BoostId | null;
  onSelectBoost?: (mode: BoostId) => void;
};

type BoostConfirmationModalProps = {
  boostId: BoostId;
  isFree: boolean;
  freeRemaining: number;
  onConfirm?: () => void;
  onClose: () => void;
};

const MODAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

@keyframes avOverlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes avModalRise {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes avRowIn {
  from { opacity: 0; transform: translateX(-6px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes avPulse {
  0%, 100% { opacity: .65; }
  50% { opacity: 1; }
}

@keyframes avProgressFill {
  from { width: 0%; }
  to { width: 100%; }
}

.av-modal-row {
  transition: background .2s ease, border-color .2s ease;
}

.av-modal-row:hover {
  background: rgba(255,255,255,0.045) !important;
  border-color: rgba(255,255,255,0.11) !important;
}

.av-cancel-btn {
  transition: all .2s ease;
}

.av-cancel-btn:hover {
  background: rgba(255,255,255,0.06) !important;
  color: rgba(255,255,255,0.68) !important;
}

.av-confirm-btn {
  transition: all .22s ease;
  position: relative;
  overflow: hidden;
}

.av-confirm-btn:hover {
  filter: brightness(1.06);
}

.av-confirm-btn:active {
  transform: scale(.985);
}
`;

const BOOSTS: Record<
  BoostId,
  {
    id: BoostId;
    title: string;
    tag: string;
    price: number;
    gradA: string;
    gradB: string;
    rgb: string;
    description: string;
    icon: ReactNode;
    premier?: boolean;
  }
> = {
  allure: {
    id: "allure",
    title: "Allure Boost",
    tag: "UNCENSORED",
    price: 8.99,
    gradA: "#f43f8e",
    gradB: "#a855f7",
    rgb: "244,63,142",
    description: "More expressive, elevated visuals with a bolder premium look.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M5 18l.8 2.5L8 21l-2.2.5L5 24l-.8-2.5L2 21l2.2-.5L5 18z" opacity=".5" />
      </svg>
    ),
  },
  consistency: {
    id: "consistency",
    title: "Extra Consistency",
    tag: "IDENTITY LOCK",
    price: 10.99,
    gradA: "#7c3aed",
    gradB: "#3b82f6",
    rgb: "124,58,237",
    description: "Stronger face identity preservation across scenes, angles, and environments.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    premier: true,
  },
};

function InfoIconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function InfoIconHeart() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function InfoIconVideo() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function InfoIconCard() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function InfoIconGift() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V22H4V12" />
      <path d="M22 7H2v5h20V7z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BoostConfirmationModal({
  boostId,
  isFree,
  freeRemaining,
  onConfirm,
  onClose,
}: BoostConfirmationModalProps) {
  const boost = BOOSTS[boostId];
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const rows = useMemo(
    () => [
      {
        icon: <InfoIconClock />,
        text: "This mode may take longer to generate.",
        accent: false,
      },
      {
        icon: <InfoIconHeart />,
        text: "Face consistency will be significantly stronger.",
        accent: false,
      },
      {
        icon: <InfoIconVideo />,
        text: "Boost reels are generated as premium short-form clips (~8–10s).",
        accent: false,
      },
      {
        icon: isFree ? <InfoIconCard /> : <InfoIconGift />,
        text: isFree
          ? `This will consume 1 of your ${freeRemaining} free monthly boost${freeRemaining !== 1 ? "s" : ""}.`
          : "This is a one-time paid upgrade for this generation.",
        accent: true,
      },
    ],
    [freeRemaining, isFree]
  );

  const handleConfirm = () => {
    setState("loading");
    setTimeout(() => {
      setState("done");
      setTimeout(() => {
        onConfirm?.();
        onClose();
      }, 850);
    }, 1200);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && state === "idle") onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(4,2,12,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation: "avOverlayIn 0.22s ease",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{MODAL_CSS}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "linear-gradient(160deg, #13101f 0%, #0e0b1a 60%, #0a0815 100%)",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.09)",
          animation: "avModalRise 0.38s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.04),
            0 2px 0 0 ${boost.gradA}60,
            0 40px 80px rgba(0,0,0,0.75),
            0 0 120px rgba(${boost.rgb},0.08)
          `,
        }}
      >
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent 0%, ${boost.gradA} 30%, ${boost.gradB} 70%, transparent 100%)`,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 280,
            height: 140,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, rgba(${boost.rgb},0.12) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            padding: "22px 22px 18px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                flexShrink: 0,
                background: `linear-gradient(135deg, ${boost.gradA}, ${boost.gradB})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 24px rgba(${boost.rgb},0.45), inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}
            >
              {boost.icon}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.93)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {boost.title}
                </h2>

                {boost.premier && (
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: 999,
                      background: `rgba(${boost.rgb},0.15)`,
                      border: `1px solid rgba(${boost.rgb},0.3)`,
                      color: "rgba(255,255,255,0.82)",
                    }}
                  >
                    Premier
                  </span>
                )}
              </div>

              <p
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: `rgba(${boost.rgb},0.72)`,
                  margin: "4px 0 0",
                }}
              >
                {boost.tag}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={state !== "idle"}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.35)",
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div
          style={{
            padding: "14px 22px 6px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {rows.map((row, i) => (
            <div
              key={i}
              className="av-modal-row"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "11px 13px",
                borderRadius: 12,
                border: `1px solid ${row.accent ? `rgba(${boost.rgb},0.2)` : "rgba(255,255,255,0.06)"}`,
                background: row.accent ? `rgba(${boost.rgb},0.06)` : "rgba(255,255,255,0.03)",
                animation: `avRowIn 0.3s ${0.05 + i * 0.06}s both ease`,
              }}
            >
              <span
                style={{
                  color: row.accent ? boost.gradA : "rgba(255,255,255,0.28)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {row.icon}
              </span>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 400,
                  lineHeight: 1.55,
                  color: row.accent ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.54)",
                  margin: 0,
                }}
              >
                {row.text}
              </p>
            </div>
          ))}
        </div>

        {!isFree ? (
          <div
            style={{
              margin: "12px 22px 0",
              padding: "13px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "rgba(255,255,255,0.34)",
                letterSpacing: "0.02em",
              }}
            >
              One-time upgrade
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.02em",
              }}
            >
              ${boost.price.toFixed(2)}
            </span>
          </div>
        ) : (
          <div
            style={{
              margin: "10px 22px 0",
              padding: "10px 16px",
              borderRadius: 12,
              border: `1px solid rgba(${boost.rgb},0.18)`,
              background: `rgba(${boost.rgb},0.07)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "rgba(255,255,255,0.36)",
              }}
            >
              Remaining free uses
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.02em",
              }}
            >
              {freeRemaining}
            </span>
          </div>
        )}

        <div style={{ padding: "16px 22px 22px", display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            disabled={state !== "idle"}
            className="av-cancel-btn"
            style={{
              flex: "0 0 100px",
              height: 50,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.38)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Cancel
          </button>

          <button
            onClick={state === "idle" ? handleConfirm : undefined}
            disabled={state !== "idle"}
            className="av-confirm-btn"
            style={{
              flex: 1,
              height: 50,
              borderRadius: 14,
              border: "none",
              background:
                state === "done"
                  ? "rgba(255,255,255,0.06)"
                  : `linear-gradient(135deg, ${boost.gradA} 0%, ${boost.gradB} 100%)`,
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: state === "idle" ? "pointer" : "default",
              fontFamily: "'Outfit', sans-serif",
              boxShadow:
                state === "done"
                  ? "none"
                  : `0 6px 32px rgba(${boost.rgb},0.45), inset 0 1px 0 rgba(255,255,255,0.15)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {state === "loading" && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.12)",
                  animation: "avProgressFill 1.2s ease forwards",
                  pointerEvents: "none",
                }}
              />
            )}

            <span
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {state === "done" ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Confirmed
                </>
              ) : state === "loading" ? (
                <span style={{ animation: "avPulse 0.7s infinite" }}>Processing…</span>
              ) : isFree ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Use Free Boost
                </>
              ) : (
                `Continue for $${boost.price.toFixed(2)}`
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PremiumBoostCard({
  boostId,
  freeRemaining,
  selected,
  onOpen,
}: {
  boostId: BoostId;
  freeRemaining: number;
  selected: boolean;
  onOpen: (boostId: BoostId, isFree: boolean, freeRemaining: number) => void;
}) {
  const boost = BOOSTS[boostId];
  const isFree = freeRemaining > 0;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        borderRadius: 18,
        padding: "14px 14px 13px",
        overflow: "hidden",
        border: selected
          ? `1px solid rgba(${boost.rgb},0.42)`
          : "1px solid rgba(255,255,255,0.08)",
        background: selected
          ? `linear-gradient(145deg, rgba(${boost.rgb},0.11) 0%, rgba(16,12,30,0.95) 100%)`
          : "linear-gradient(145deg, rgba(24,16,44,0.85) 0%, rgba(16,12,30,0.9) 100%)",
        boxShadow: selected
          ? `0 0 0 1px rgba(${boost.rgb},0.18), 0 12px 28px rgba(0,0,0,0.42)`
          : "0 4px 18px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: `rgba(${boost.rgb},0.12)`,
          filter: "blur(32px)",
          transform: "translate(40%,-40%)",
          pointerEvents: "none",
        }}
      />

      {boost.premier && (
        <div
          style={{
            position: "absolute",
            top: 11,
            right: 11,
            padding: "2px 8px",
            borderRadius: 20,
            background: "linear-gradient(90deg, rgba(139,92,246,0.22), rgba(59,130,246,0.22))",
            border: "1px solid rgba(139,92,246,0.3)",
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(196,181,253,0.9)",
          }}
        >
          Premier
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${boost.gradA}, ${boost.gradB})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 18px rgba(${boost.rgb},0.35)`,
          }}
        >
          {boost.icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <p
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {boost.title}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.32)",
              fontSize: 10,
              margin: "5px 0 0",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            {boost.tag}
          </p>
        </div>
      </div>

      <p
        style={{
          color: "rgba(255,255,255,0.58)",
          fontSize: 11.5,
          lineHeight: 1.6,
          margin: "0 0 12px",
        }}
      >
        {boost.description}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 20,
            background: isFree ? `rgba(${boost.rgb},0.10)` : "rgba(255,255,255,0.04)",
            border: `1px solid ${isFree ? `rgba(${boost.rgb},0.22)` : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: isFree ? "rgba(167,243,208,0.95)" : "rgba(255,255,255,0.2)",
              boxShadow: isFree ? "0 0 7px rgba(167,243,208,0.8)" : "none",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              whiteSpace: "nowrap",
              color: isFree ? "rgba(167,243,208,0.92)" : "rgba(255,255,255,0.28)",
            }}
          >
            {isFree ? `${freeRemaining} free left` : "No free uses"}
          </span>
        </div>

        <button
          onClick={() => onOpen(boostId, isFree, freeRemaining)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "0 14px",
            height: 36,
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 700,
            color: "white",
            background: `linear-gradient(135deg, ${boost.gradA}, ${boost.gradB})`,
            boxShadow: `0 6px 18px rgba(${boost.rgb},0.28)`,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          {isFree ? "Use Free" : `$${boost.price.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}

export default function PremiumBoostPanel({
  currentPlan,
  freeAllureRemaining,
  freeConsistencyRemaining,
  selectedBoost,
  onSelectBoost,
}: PremiumBoostPanelProps) {
  const [modal, setModal] = useState<{
    boostId: BoostId;
    isFree: boolean;
    freeRemaining: number;
  } | null>(null);

  return (
    <>
      <div style={{ marginTop: 18, width: "100%", minWidth: 0 }}>
        <style>{MODAL_CSS}</style>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              flexShrink: 0,
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 18px rgba(168,85,247,0.28)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            </svg>
          </div>

          <span
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Premium Boosts
          </span>

          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(255,255,255,0.07)",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", minWidth: 0 }}>
          <PremiumBoostCard
            boostId="allure"
            freeRemaining={freeAllureRemaining}
            selected={selectedBoost === "allure"}
            onOpen={(boostId, isFree, freeRemaining) =>
              setModal({ boostId, isFree, freeRemaining })
            }
          />
          <PremiumBoostCard
            boostId="consistency"
            freeRemaining={freeConsistencyRemaining}
            selected={selectedBoost === "consistency"}
            onOpen={(boostId, isFree, freeRemaining) =>
              setModal({ boostId, isFree, freeRemaining })
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 12px",
            borderRadius: 12,
            marginTop: 10,
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 10.5,
              fontWeight: 600,
            }}
          >
            {currentPlan === "agency"
              ? "Agency Monthly Quota"
              : currentPlan === "creator"
              ? "Creator Monthly Quota"
              : "No free quota on Pro"}
          </span>

          <span
            style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: 10.5,
            }}
          >
            {currentPlan === "agency"
              ? "2 Allure · 2 Consistency"
              : currentPlan === "creator"
              ? "1 Allure · 1 Consistency"
              : "Upgrade to unlock free boosts"}
          </span>
        </div>

        <p
          style={{
            color: "rgba(255,255,255,0.24)",
            fontSize: 10.5,
            lineHeight: 1.6,
            margin: "10px 2px 0",
          }}
        >
          Boost modes may take longer but improve quality and identity consistency.
        </p>
      </div>

      {modal && (
        <BoostConfirmationModal
          boostId={modal.boostId}
          isFree={modal.isFree}
          freeRemaining={modal.freeRemaining}
          onConfirm={() => {
            onSelectBoost?.(modal.boostId);
          }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
