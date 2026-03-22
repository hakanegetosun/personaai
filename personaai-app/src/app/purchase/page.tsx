"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { PLANS, PlanId } from "@/config/plans";

function yearlyPriceFromMonthly(monthly: number): number {
  return Math.round(monthly * 12 * 0.8);
}

function getPlanIncludedRows(planId: PlanId): string[] {
  if (planId === "free") {
    return [
      "Basic Reel, Story, and Post generation",
      "Preset persona access",
      "Simple product exploration",
    ];
  }

  if (planId === "pro") {
    return [
      "Visual Look controls",
      "Motion Feel controls",
      "Basic trend-aware generation",
      "More content variety with the same persona",
    ];
  }

  if (planId === "creator") {
    return [
      "Strategy controls",
      "Priority Stack",
      "Advanced viral content analysis",
      "Trend-aware content direction",
      "Custom Notes",
      "Advanced Notes",
      "Brand Direction",
      "Custom persona creation",
    ];
  }

  return [
    "Saved smart presets",
    "Reusable content modes",
    "Advanced viral analysis workflow",
    "Reusable trend-based content systems",
    "Multi-persona production workflow",
  ];
}

function getPurchaseAccent(planId: PlanId) {
  if (planId === "agency") {
    return {
      border: "rgba(251,191,36,.35)",
      glow: "0 24px 70px rgba(251,191,36,.18)",
      gradient: "linear-gradient(135deg,#fbbf24,#a855f7)",
      pillBg: "rgba(251,191,36,.12)",
      pillBorder: "1px solid rgba(251,191,36,.24)",
      pillColor: "#fcd34d",
    };
  }

  if (planId === "creator") {
    return {
      border: "rgba(236,72,153,.35)",
      glow: "0 24px 70px rgba(236,72,153,.18)",
      gradient: "linear-gradient(135deg,#ec4899,#a855f7)",
      pillBg: "rgba(236,72,153,.12)",
      pillBorder: "1px solid rgba(236,72,153,.24)",
      pillColor: "#f9a8d4",
    };
  }

  if (planId === "pro") {
    return {
      border: "rgba(168,85,247,.35)",
      glow: "0 24px 70px rgba(168,85,247,.18)",
      gradient: "linear-gradient(135deg,#a855f7,#ec4899)",
      pillBg: "rgba(168,85,247,.14)",
      pillBorder: "1px solid rgba(168,85,247,.24)",
      pillColor: "#e9d5ff",
    };
  }

  return {
    border: "rgba(255,255,255,.10)",
    glow: "0 20px 60px rgba(0,0,0,.45)",
    gradient: "linear-gradient(135deg,#a855f7,#ec4899)",
    pillBg: "rgba(255,255,255,.08)",
    pillBorder: "1px solid rgba(255,255,255,.12)",
    pillColor: "rgba(255,255,255,.82)",
  };
}

function PurchasePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const kind = searchParams.get("kind");
  const rawPlan = (searchParams.get("plan") || "pro") as PlanId;
  const plan: PlanId = PLANS[rawPlan] ? rawPlan : "pro";
  const rawPack = Number(searchParams.get("pack") || "1");
  const pack: 1 | 5 = rawPack === 5 ? 5 : 1;
  const rawBilling = searchParams.get("billing");
  const billing: "monthly" | "yearly" = rawBilling === "yearly" ? "yearly" : "monthly";

  const selectedPlan = PLANS[plan];
  const isExtraVideo = kind === "extra-video";
  const isPlanPurchase = kind === "plan";

  const accent = getPurchaseAccent(plan);

  const price =
    isExtraVideo && selectedPlan?.onDemand.enabled
      ? pack === 5
        ? selectedPlan.onDemand.extraVideoPack5PriceUsd
        : selectedPlan.onDemand.extraVideoPriceUsd
      : isPlanPurchase
      ? billing === "yearly"
        ? yearlyPriceFromMonthly(selectedPlan.price)
        : selectedPlan.price
      : 0;

  const title = isExtraVideo
    ? pack === 5
      ? "Extra Video Pack"
      : "Extra Video"
    : isPlanPurchase
    ? `${selectedPlan.name} Plan`
    : "Purchase";

  const subtitle = isExtraVideo
    ? "Add more video generation without changing your current plan."
    : "Review your plan details before continuing to checkout.";

  const includedRows = getPlanIncludedRows(plan);
  const yearlyBasePrice = selectedPlan.price * 12;
  const yearlyDiscountedPrice = yearlyPriceFromMonthly(selectedPlan.price);
  const savings =
    billing === "yearly" && isPlanPurchase ? yearlyBasePrice - yearlyDiscountedPrice : 0;

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
            Checkout
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
            Review your
            <br />
            purchase
          </div>

          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.58)",
              marginTop: 12,
              lineHeight: 1.6,
              maxWidth: 700,
            }}
          >
            Confirm your selection, review what is included, and continue to payment.
            This screen is designed to make plan upgrades and extra generation purchases
            feel clear, premium, and predictable.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: 24,
              padding: 20,
              background: "rgba(255,255,255,.04)",
              border: `1px solid ${accent.border}`,
              boxShadow: accent.glow,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg,rgba(168,85,247,.07),rgba(236,72,153,.04),transparent)",
                pointerEvents: "none",
              }}
            />

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
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,.38)",
                      marginBottom: 8,
                    }}
                  >
                    Order summary
                  </div>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: "rgba(255,255,255,.98)",
                      lineHeight: 1,
                    }}
                  >
                    {title}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.54)",
                      marginTop: 8,
                      lineHeight: 1.6,
                      maxWidth: 700,
                    }}
                  >
                    {subtitle}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "5px 9px",
                    borderRadius: 999,
                    background: accent.pillBg,
                    border: accent.pillBorder,
                    color: accent.pillColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isExtraVideo ? "Add-on Purchase" : `${selectedPlan.name} Checkout`}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  marginTop: 16,
                  flexWrap: "wrap",
                }}
              >
                {isPlanPurchase && billing === "yearly" && (
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
                    ${yearlyBasePrice}
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
                  ${price.toFixed(2)}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,.45)",
                    paddingBottom: 5,
                  }}
                >
                  {isPlanPurchase ? (billing === "monthly" ? "/ month" : "/ year") : "one-time"}
                </div>
              </div>

              {isPlanPurchase && billing === "yearly" && savings > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 999,
                    background: "rgba(34,197,94,.12)",
                    border: "1px solid rgba(34,197,94,.22)",
                    color: "#86efac",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  Save ${savings} with yearly billing
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 14,
                  marginTop: 18,
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
                    Purchase details
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.86)", lineHeight: 1.45 }}>
                      • Plan: {selectedPlan?.name ?? "-"}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.86)", lineHeight: 1.45 }}>
                      • Type: {kind ?? "-"}
                    </div>

                    {isExtraVideo && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,.86)",
                          lineHeight: 1.45,
                        }}
                      >
                        • Quantity: {pack} extra {pack === 1 ? "video" : "videos"}
                      </div>
                    )}

                    {isPlanPurchase && (
                      <div
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,.86)",
                          lineHeight: 1.45,
                        }}
                      >
                        • Billing: {billing}
                      </div>
                    )}
                  </div>
                </div>

                {isPlanPurchase && (
                  <>
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
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,.86)", lineHeight: 1.45 }}>
                          • {selectedPlan.limits.video} videos / month
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,.86)", lineHeight: 1.45 }}>
                          • {selectedPlan.limits.story} stories / month
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,.86)", lineHeight: 1.45 }}>
                          • {selectedPlan.limits.post} posts / month
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,.86)", lineHeight: 1.45 }}>
                          •{" "}
                          {selectedPlan.canCreatePersona
                            ? "Custom persona access"
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
                        {includedRows.map((feature) => (
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
                  </>
                )}

                {isExtraVideo && selectedPlan?.onDemand.enabled && (
                  <div
                    style={{
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
                        letterSpacing: 1.2,
                        color: "rgba(255,255,255,.35)",
                        textTransform: "uppercase",
                        marginBottom: 10,
                      }}
                    >
                      Add-on details
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,.84)",
                        lineHeight: 1.6,
                      }}
                    >
                      This is a one-time add-on purchase for extra video generation under
                      your current plan. It does not change your subscription tier.
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 18,
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
                    color: "rgba(255,255,255,.35)",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Before payment
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,.56)",
                    lineHeight: 1.6,
                  }}
                >
                  You will continue to checkout to complete your purchase. Final payment
                  flow, taxes, and billing handling can be connected to Stripe here.
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => alert("Stripe checkout will be connected here.")}
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 14,
                    border: "none",
                    background: accent.gradient,
                    color: "white",
                    fontWeight: 900,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 16px 40px rgba(168,85,247,.22)",
                  }}
                >
                  Continue to Payment
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,.10)",
                    background: "rgba(255,255,255,.04)",
                    color: "rgba(255,255,255,.85)",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function PurchasePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurchasePageInner />
    </Suspense>
  );
}
