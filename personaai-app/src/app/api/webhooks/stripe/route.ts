import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/service";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function mapStripePriceToPlan(priceId: string | null | undefined): {
  planId: "pro" | "creator" | "agency" | "free";
  billingInterval: "monthly" | "yearly" | null;
} {
  switch (priceId) {
    case process.env.STRIPE_PRICE_PRO_MONTHLY:
      return { planId: "pro", billingInterval: "monthly" };
    case process.env.STRIPE_PRICE_PRO_YEARLY:
      return { planId: "pro", billingInterval: "yearly" };

    case process.env.STRIPE_PRICE_CREATOR_MONTHLY:
      return { planId: "creator", billingInterval: "monthly" };
    case process.env.STRIPE_PRICE_CREATOR_YEARLY:
      return { planId: "creator", billingInterval: "yearly" };

    case process.env.STRIPE_PRICE_AGENCY_MONTHLY:
      return { planId: "agency", billingInterval: "monthly" };
    case process.env.STRIPE_PRICE_AGENCY_YEARLY:
      return { planId: "agency", billingInterval: "yearly" };

    default:
      return { planId: "free", billingInterval: null };
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
export async function POST(req: NextRequest): Promise<NextResponse> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });
  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Webhook signature verification failed",
        },
        { status: 400 }
      );
    }

    // Idempotency check
    const { data: existingWebhook } = await supabaseAdmin
      .from("webhook_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existingWebhook) {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    await supabaseAdmin.from("webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
      created_at: new Date().toISOString(),
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

let supabaseUserId = session.metadata?.supabase_user_id ?? null;

if (!supabaseUserId && session.subscription) {
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  supabaseUserId = subscription.metadata?.supabase_user_id ?? null;
}

if (!supabaseUserId) {
  throw new Error("Missing supabase_user_id in checkout session metadata");
}

        // Not enough to activate fully here; subscription events are the source of truth.
        // We still store useful audit metadata if needed.
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const stripeSubscriptionId = subscription.id;
        const stripeCustomerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const firstItem = subscription.items.data[0];
        const priceId = firstItem?.price?.id;

        const { planId, billingInterval } = mapStripePriceToPlan(priceId);

        const supabaseUserId = subscription.metadata?.supabase_user_id;

        if (!supabaseUserId) {
          throw new Error("Missing supabase_user_id in subscription metadata");
        }

        const status =
          subscription.status === "active" ||
          subscription.status === "trialing" ||
          subscription.status === "past_due" ||
          subscription.status === "canceled" ||
          subscription.status === "paused"
            ? subscription.status
            : "active";

const subscriptionItem = subscription.items.data[0];

const periodStart = subscriptionItem?.current_period_start
  ? new Date(subscriptionItem.current_period_start * 1000).toISOString()
  : null;

const periodEnd = subscriptionItem?.current_period_end
  ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
  : null;

        const canceledAt = subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString()
          : null;

        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("stripe_subscription_id", stripeSubscriptionId)
          .maybeSingle();

        if (existingSub) {
          const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .update({
              user_id: supabaseUserId,
              plan_id: planId,
              status,
              billing_interval: billingInterval,
              stripe_customer_id: stripeCustomerId,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              canceled_at: canceledAt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSub.id);

          if (updateError) {
            throw new Error(`Failed to update subscription: ${updateError.message}`);
          }
        } else {
          const { error: insertError } = await supabaseAdmin.from("subscriptions").insert({
            user_id: supabaseUserId,
            plan_id: planId,
            status,
            billing_interval: billingInterval,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: stripeCustomerId,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            canceled_at: canceledAt,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (insertError) {
            throw new Error(`Failed to insert subscription: ${insertError.message}`);
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const stripeSubscriptionId = subscription.id;

        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", stripeSubscriptionId);

        if (updateError) {
          throw new Error(`Failed to cancel subscription: ${updateError.message}`);
        }

        break;
      }

      default:
        break;
    }

    await supabaseAdmin
      .from("webhook_events")
      .update({
        processed_at: new Date().toISOString(),
        error: null,
      })
      .eq("stripe_event_id", event.id);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/webhooks/stripe error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      { error: errorMessage, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
