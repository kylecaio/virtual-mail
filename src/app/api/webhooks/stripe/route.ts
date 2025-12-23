import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;
    let event: Stripe.Event;

  try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
        switch (event.type) {
          case 'checkout.session.completed':
                    await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
                    break;
          case 'customer.subscription.updated':
                    await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
                    break;
          case 'customer.subscription.deleted':
                    await handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
                    break;
          case 'invoice.paid':
                    await handleInvoicePaid(event.data.object as Stripe.Invoice);
                    break;
          case 'payment_intent.succeeded':
                    await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
                    break;
        }
        return NextResponse.json({ received: true });
  } catch (error) {
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    if (userId && planId && session.subscription) {
          await db.subscription.upsert({
                  where: { userId },
                  update: { planId, stripeSubscriptionId: session.subscription as string, status: 'ACTIVE' },
                  create: { userId, planId, stripeSubscriptionId: session.subscription as string, stripeCustomerId: session.customer as string, status: 'ACTIVE', currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000) },
          });
    }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const status = subscription.status === 'active' ? 'ACTIVE' : subscription.status === 'past_due' ? 'PAST_DUE' : 'CANCELLED';
    await db.subscription.updateMany({ where: { stripeSubscriptionId: subscription.id }, data: { status, currentPeriodEnd: new Date(subscription.current_period_end * 1000) } });
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
    await db.subscription.updateMany({ where: { stripeSubscriptionId: subscription.id }, data: { status: 'CANCELLED' } });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    if (invoice.subscription) {
          await db.subscription.updateMany({ where: { stripeSubscriptionId: invoice.subscription as string }, data: { itemsUsed: 0 } });
    }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const requestId = paymentIntent.metadata?.requestId;
    if (requestId) {
          await db.request.update({ where: { id: requestId }, data: { paidAt: new Date() } });
          await db.transaction.updateMany({ where: { requestId }, data: { status: 'COMPLETED', stripePaymentIntentId: paymentIntent.id } });
    }
}
