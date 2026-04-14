import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getPeriodEnd(subscription: Stripe.Subscription): string | null {
  const item = subscription.items?.data?.[0];
  if (!item?.current_period_end) return null;
  return new Date(item.current_period_end * 1000).toISOString();
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Retrieve the full subscription — user_id is in its metadata
        // (set via subscription_data.metadata at checkout creation)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = (subscription.metadata as { supabase_user_id?: string })
          ?.supabase_user_id;

        if (!userId) {
          console.error("No supabase_user_id in subscription metadata");
          break;
        }

        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            plan: "pro",
            current_period_end: getPeriodEnd(subscription),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = (subscription.metadata as { supabase_user_id?: string })
          ?.supabase_user_id;

        if (!userId) {
          // Fall back to looking up by stripe_subscription_id
          const { data } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscription.id)
            .maybeSingle();

          if (!data) break;

          await supabase.from("subscriptions").upsert(
            {
              user_id: data.user_id,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan: subscription.status === "active" ? "pro" : "free",
              current_period_end: getPeriodEnd(subscription),
            },
            { onConflict: "user_id" }
          );
          break;
        }

        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan: subscription.status === "active" ? "pro" : "free",
            current_period_end: getPeriodEnd(subscription),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("subscriptions")
          .update({ status: "canceled", plan: "free" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Error handling event ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
