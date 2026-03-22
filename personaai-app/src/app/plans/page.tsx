"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createBrowserClient } from "@supabase/ssr";
import { PLANS, PlanId } from "@/config/plans";

type Billing = "monthly" | "yearly";

type DisplayPlan = {
  id: PlanId;
  name: string;
  eyebrow?: string;
  badge?: string;
  headline: string;
  description: string;
  accent: string;
  border: string;
  glow: string;
  highlight?: boolean;
  crossedMonthlyPrice?: number;
  idealFor: string;
  included: string[];
  locked?: string[];
};

const DISPLAY_PLANS: DisplayPlan[] = [
  {
    id: "free",
    name: "Free",
    eyebrow: "Starter",
    headline: "Start creating with the essentials",
    description:
      "A lightweight way to try PersonaAI, generate basic content, and explore the product before upgrading.",
    accent: "rgba(255,255,255,.05)",
    border: "rgba(255,255,255,.10)",
    glow: "0 18px 55px rgba(0,0,0,.35)",
    idealFor: "First-time users testing the product",
    included: [
      "Basic Reel, Story, and Post generation",
      "Preset persona access",
      "Entry-level monthly usage",
      "Simple product exploration",
    ],
    locked: [
      "Visual Look controls",
      "Motion Feel controls",
      "Basic trend-aware generation",
      "Strategy controls",
      "Priority Stack",
      "Custom Notes",
      "Advanced viral content analysis",
      "Custom persona creation",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    eyebrow: "Most Popular",
    badge: "Best value for most users",
    headline: "Change the vibe of your content",
    description:
      "Unlock simple but powerful controls for different content moods, styles, and visual directions without adding too much complexity.",
    accent: "linear-gradient(135deg,#a855f7,#ec4899)",
    border: "rgba(168,85,247,.35)",
    glow: "0 24px 70px rgba(168,85,247,.22)",
    highlight: true,
    crossedMonthlyPrice: 39,
    idealFor: "Solo users who want better-looking output and more control",
    included: [
      "Everything in Free",
      "Visual Look controls",
      "Motion Feel controls",
      "Basic trend-aware generation",
      "More monthly output",
      "More content variety with the same persona",
    ],
    locked: [
      "Strategy controls",
      "Priority Stack",
      "Custom Notes",
      "Advanced Notes",
      "Brand Direction",
      "Advanced viral content analysis",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    eyebrow: "Best for AI Creators",
    badge: "Best for premium control",
    headline: "Control how your AI creator performs",
    description:
      "Go beyond simple style changes and shape the output around realism, virality, trend analysis, brand fit, face consistency, and creator-level direction.",
    accent: "linear-gradient(135deg,#ec4899,#a855f7)",
    border: "rgba(236,72,153,.35)",
    glow: "0 24px 70px rgba(236,72,153,.22)",
    crossedMonthlyPrice: 99,
    idealFor: "Serious creators, personal brands, and advanced users",
    included: [
      "Everything in Pro",
      "Strategy controls",
      "Priority Stack",
      "Advanced viral content analysis",
      "Trend-aware content direction",
      "Custom Notes",
      "Advanced Notes",
      "Brand Direction",
      "Custom persona creation",
      "Higher monthly limits",
    ],
    locked: ["Saved smart presets", "Reusable content setups"],
  },
  {
    id: "agency",
    name: "Agency",
    eyebrow: "Scale",
    badge: "Built for systems",
    headline: "Run multiple creators with reusable systems",
    description:
      "Designed for multi-persona workflows, repeatable production systems, and high-volume output across brands, campaigns, or clients.",
    accent: "linear-gradient(135deg,#fbbf24,#a855f7)",
    border: "rgba(251,191,36,.35)",
    glow: "0 24px 70px rgba(251,191,36,.18)",
    crossedMonthlyPrice: 249,
    idealFor: "Studios, teams, power users, and multi-brand workflows",
    included: [
      "Everything in Creator",
      "Saved smart presets",
      "Reusable content modes",
      "Advanced viral analysis workflow",
      "Reusable trend-based content systems",
      "Best workflow for multi-persona production",
      "Highest scale plan",
    ],
  },
];

function yearlyPriceFromMonthly(monthly: number): number {
  return Math.round(monthly * 12 * 0.8);
}

function getButtonLabel(
  planId: PlanId,
  currentPlanId: string | null,
  loadingPlanId: string | null
) {
  if (loadingPlanId === planId) return "Loading...";
  if (currentPlanId === planId) return "Current Plan";
  if (planId === "free") return "Switch to Free";
  if (currentPlanId === "free") return `Start ${PLANS[planId].name}`;
  return `Upgrade to ${PLANS[planId].name}`;
}

function getUsageRows(planId: PlanId) {
  const plan = PLANS[planId];

  return [
    `${plan.limits.video} videos / month`,
    `${plan.limits.story} stories / month`,
    `${plan.limits.post} posts / month`,
  ];
}

function PlansPageInner() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const router = useRouter();
const searchParams = useSearchParams();

  const [billing, setBilling] = useState<Billing>("monthly");
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);
  const [loadingCurrentPlan, setLoadingCurrentPlan] = useState(true);

const planRefs = useRef<Partial<Record<PlanId, HTMLDivElement | null>>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentPlan() {
      setLoadingCurrentPlan(true);
      setPageError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            setCurrentPlanId("free");
          }
          return;
        }

        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("current_plan_id")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (!cancelled) {
          setCurrentPlanId(profile?.current_plan_id ?? "free");
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(error instanceof Error ? error.message : "Failed to load current plan.");
        }
      } finally {
        if (!cancelled) {
          setLoadingCurrentPlan(false);
        }
      }
    }

    void loadCurrentPlan();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

useEffect(() => {
  const focus = searchParams.get("focus") as PlanId | null;
  if (!focus) return;

  const el = planRefs.current[focus];
  if (!el) return;

  const timer = window.setTimeout(() => {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 180);

  return () => window.clearTimeout(timer);
}, [searchParams]);

  async function handleChoosePlan(planId: PlanId) {
    setPageError(null);
    setPageSuccess(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPageError("You must be logged in to continue.");
        return;
      }

      if (planId === "free") {
        setLoadingPlanId(planId);

        const { error } = await supabase
          .from("user_profiles")
          .update({ current_plan_id: "free" })
          .eq("user_id", user.id);

        if (error) throw error;

        setCurrentPlanId("free");
        setPageSuccess("Free plan activated.");
        return;
      }

      router.push(`/purchase?kind=plan&plan=${planId}&billing=${billing}`);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Failed to continue.");
    } finally {
      setLoadingPlanId(null);
    }
  }

  function handleExtraVideoPurchase(planId: PlanId, pack: 1 | 5) {
    router.push(`/purchase?kind=extra-video&plan=${planId}&pack=${pack}`);
  }

  return (
    <AppShell>
      <div
        style={{
          padding: "28px 18px 34px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            borderRadius: 24,
            padding: 20,
            background:
              "linear-gradient(135deg,rgba(168,85,247,.14),rgba(236,72,153,.10),rgba(99,102,241,.08))",
            border: "1px solid rgba(255,255,255,.08)",
            boxShadow: "0 24px 70px rgba(0,0,0,.34)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: "rgba(255,255,255,.42)",
              marginBottom: 10,
            }}
          >
            Pricing
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "rgba(255,255,255,.98)",
              lineHeight: 1.05,
            }}
          >
            Choose your
            <br />
            PersonaAI engine
          </div>

          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.58)",
              marginTop: 12,
              lineHeight: 1.6,
              maxWidth: 680,
            }}
          >
            Start simple, unlock better output control, then scale into reusable creator
            systems. The higher the plan, the more precisely you can shape realism, vibe,
            strategy, persona behavior, and trend-aware content performance.
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            gap: 8,
            background: "rgba(255,255,255,.05)",
            padding: 6,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.08)",
            boxShadow: "0 14px 40px rgba(0,0,0,.22)",
          }}
        >
          <button
            onClick={() => setBilling("monthly")}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 12,
              border: "none",
              background:
                billing === "monthly"
                  ? "linear-gradient(135deg,#a855f7,#ec4899)"
                  : "transparent",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
            }}
          >
            Monthly
          </button>

          <button
            onClick={() => setBilling("yearly")}
            style={{
              flex: 1,
              padding: 11,
              borderRadius: 12,
              border: "none",
              background:
                billing === "yearly"
                  ? "linear-gradient(135deg,#a855f7,#ec4899)"
                  : "transparent",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
            }}
          >
            Yearly
          </button>

          <div
            style={{
              position: "absolute",
              top: -11,
              right: 12,
              fontSize: 10,
              background: "rgba(34,197,94,.15)",
              border: "1px solid rgba(34,197,94,.30)",
              padding: "2px 7px",
              borderRadius: 999,
              color: "#86efac",
              fontWeight: 800,
              letterSpacing: 0.2,
            }}
          >
            Save 20%
          </div>
        </div>

        {pageError && (
          <div
            style={{
              borderRadius: 14,
              padding: 12,
              background: "rgba(239,68,68,.10)",
              border: "1px solid rgba(239,68,68,.22)",
              color: "rgba(255,255,255,.88)",
              fontSize: 12,
            }}
          >
            {pageError}
          </div>
        )}

        {pageSuccess && (
          <div
            style={{
              borderRadius: 14,
              padding: 12,
              background: "rgba(34,197,94,.10)",
              border: "1px solid rgba(34,197,94,.22)",
              color: "rgba(255,255,255,.90)",
              fontSize: 12,
            }}
          >
            {pageSuccess}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {DISPLAY_PLANS.map((displayPlan) => {
            const plan = PLANS[displayPlan.id];
            const monthlyPrice = plan.price;
            const yearlyBasePrice = plan.price * 12;
            const yearlyDiscountedPrice = yearlyPriceFromMonthly(plan.price);

            const price =
              billing === "monthly" ? `$${monthlyPrice}` : `$${yearlyDiscountedPrice}`;

            const crossedPrice =
              billing === "yearly"
                ? `$${yearlyBasePrice}`
                : displayPlan.crossedMonthlyPrice
                ? `$${displayPlan.crossedMonthlyPrice}`
                : null;

            const subtitle = billing === "monthly" ? "/ month" : "/ year";
            const isCurrent = currentPlanId === plan.id;
const isFocused = searchParams.get("focus") === plan.id;
            const usageRows = getUsageRows(plan.id);

            return (
<div
  key={plan.id}
  ref={(el) => {
    planRefs.current[plan.id] = el;
  }}
  style={{
                  borderRadius: 24,
                  padding: 20,
                  background: "rgba(255,255,255,.04)",
border: isFocused
  ? "1px solid rgba(255,255,255,.22)"
  : `1px solid ${displayPlan.border}`,
boxShadow: isFocused
  ? "0 0 0 1px rgba(255,255,255,.08), 0 28px 80px rgba(168,85,247,.28)"
  : displayPlan.glow,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {displayPlan.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg,rgba(168,85,247,.08),rgba(236,72,153,.05),transparent)",
                      pointerEvents: "none",
                    }}
                  />
                )}

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      {displayPlan.eyebrow && (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color:
                              displayPlan.id === "agency"
                                ? "#fcd34d"
                                : displayPlan.id === "creator"
                                ? "#f9a8d4"
                                : displayPlan.id === "pro"
                                ? "#e9d5ff"
                                : "rgba(255,255,255,.44)",
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            marginBottom: 8,
                          }}
                        >
                          {displayPlan.eyebrow}
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 900,
                          color: "rgba(255,255,255,.98)",
                          lineHeight: 1,
                        }}
                      >
                        {displayPlan.name}
                      </div>

                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "rgba(255,255,255,.86)",
                          marginTop: 10,
                          lineHeight: 1.35,
                        }}
                      >
                        {displayPlan.headline}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,.54)",
                          marginTop: 8,
                          lineHeight: 1.6,
                          maxWidth: 760,
                        }}
                      >
                        {displayPlan.description}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        alignItems: "flex-end",
                      }}
                    >
                      {displayPlan.badge && (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "5px 9px",
                            borderRadius: 999,
                            background:
                              displayPlan.id === "agency"
                                ? "rgba(251,191,36,.12)"
                                : "rgba(168,85,247,.14)",
                            border:
                              displayPlan.id === "agency"
                                ? "1px solid rgba(251,191,36,.24)"
                                : "1px solid rgba(168,85,247,.24)",
                            color:
                              displayPlan.id === "agency"
                                ? "#fcd34d"
                                : "#f5d0fe",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {displayPlan.badge}
                        </div>
                      )}

                      {isCurrent && !loadingCurrentPlan && (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "5px 9px",
                            borderRadius: 999,
                            background: "rgba(34,197,94,.12)",
                            border: "1px solid rgba(34,197,94,.22)",
                            color: "#86efac",
                            whiteSpace: "nowrap",
                          }}
                        >
                          CURRENT
                        </div>
                      )}

{isFocused && (
  <div
    style={{
      fontSize: 10,
      fontWeight: 800,
      padding: "5px 9px",
      borderRadius: 999,
      background: "rgba(168,85,247,.14)",
      border: "1px solid rgba(168,85,247,.24)",
      color: "#f5d0fe",
      whiteSpace: "nowrap",
    }}
  >
    RECOMMENDED
  </div>
)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 8,
                      marginTop: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {crossedPrice && (
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "rgba(255,255,255,.32)",
                          textDecoration: "line-through",
                          lineHeight: 1.1,
                          paddingBottom: 5,
                        }}
                      >
                        {crossedPrice}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: 38,
                        fontWeight: 900,
                        color: "rgba(255,255,255,.99)",
                        lineHeight: 1,
                      }}
                    >
                      {price}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,.45)",
                        paddingBottom: 5,
                      }}
                    >
                      {subtitle}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      borderRadius: 16,
                      padding: 13,
                      background: "rgba(255,255,255,.03)",
                      border: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 1.2,
                        color: "rgba(255,255,255,.35)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Ideal for
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,.84)",
                        lineHeight: 1.55,
                      }}
                    >
                      {displayPlan.idealFor}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 14,
                      marginTop: 16,
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 16,
                        padding: 14,
                        background: "rgba(255,255,255,.03)",
                        border: "1px solid rgba(255,255,255,.07)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: 1.2,
                          color: "rgba(255,255,255,.35)",
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        Usage
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {usageRows.map((item) => (
                          <div
                            key={item}
                            style={{
                              fontSize: 13,
                              color: "rgba(255,255,255,.86)",
                              lineHeight: 1.45,
                            }}
                          >
                            • {item}
                          </div>
                        ))}

                        <div
                          style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,.86)",
                            lineHeight: 1.45,
                          }}
                        >
                          •{" "}
                          {plan.canCreatePersona
                            ? "Create custom persona"
                            : "Preset persona access"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 16,
                        padding: 14,
                        background: "rgba(255,255,255,.03)",
                        border: "1px solid rgba(255,255,255,.07)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: 1.2,
                          color: "rgba(255,255,255,.35)",
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        Included
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {displayPlan.included.map((feature) => (
                          <div
                            key={feature}
                            style={{
                              fontSize: 13,
                              color: "rgba(255,255,255,.86)",
                              lineHeight: 1.45,
                            }}
                          >
                            • {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {displayPlan.locked && displayPlan.locked.length > 0 && (
                      <div
                        style={{
                          borderRadius: 16,
                          padding: 14,
                          background: "rgba(255,255,255,.025)",
                          border: "1px solid rgba(255,255,255,.06)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: 1.2,
                            color: "rgba(255,255,255,.30)",
                            textTransform: "uppercase",
                            marginBottom: 10,
                          }}
                        >
                          Not included
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {displayPlan.locked.map((feature) => (
                            <div
                              key={feature}
                              style={{
                                fontSize: 13,
                                color: "rgba(255,255,255,.56)",
                                lineHeight: 1.45,
                              }}
                            >
                              • {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => void handleChoosePlan(plan.id)}
                    disabled={loadingCurrentPlan || loadingPlanId === plan.id || isCurrent}
                    style={{
                      marginTop: 16,
                      width: "100%",
                      height: 48,
                      borderRadius: 14,
                      border: "none",
                      background: displayPlan.accent,
                      fontWeight: 800,
                      color: "white",
                      cursor:
                        loadingCurrentPlan || loadingPlanId === plan.id || isCurrent
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        loadingCurrentPlan || loadingPlanId === plan.id || isCurrent
                          ? 0.7
                          : 1,
                      fontFamily: "inherit",
                      fontSize: 13,
                      boxShadow:
                        displayPlan.highlight && !isCurrent
                          ? "0 16px 40px rgba(168,85,247,.22)"
                          : "none",
                    }}
                  >
                    {getButtonLabel(plan.id, currentPlanId, loadingPlanId)}
                  </button>

                  {plan.onDemand.enabled && (
                    <div
                      style={{
                        marginTop: 14,
                        borderRadius: 16,
                        padding: 14,
                        background:
                          "linear-gradient(135deg,rgba(168,85,247,.06),rgba(236,72,153,.05))",
                        border: "1px solid rgba(255,255,255,.07)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: "rgba(255,255,255,.38)",
                          textTransform: "uppercase",
                          letterSpacing: 1.1,
                          marginBottom: 8,
                        }}
                      >
                        Extra video pricing
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,.54)",
                          lineHeight: 1.5,
                          marginBottom: 10,
                        }}
                      >
                        Need more video output this month? Buy extra generation without
                        changing your plan.
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: 4,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleExtraVideoPurchase(plan.id, 1)}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,.10)",
                            background: "rgba(255,255,255,.05)",
                            color: "rgba(255,255,255,.90)",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Buy 1 · ${plan.onDemand.extraVideoPriceUsd.toFixed(2)}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExtraVideoPurchase(plan.id, 5)}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid rgba(168,85,247,.28)",
                            background:
                              "linear-gradient(135deg,rgba(168,85,247,.16),rgba(236,72,153,.12))",
                            color: "rgba(255,255,255,.95)",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Buy 5 · ${plan.onDemand.extraVideoPack5PriceUsd.toFixed(2)}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlansPageInner />
    </Suspense>
  );
}
