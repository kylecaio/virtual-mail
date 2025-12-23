import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
    typescript: true,
});

export const PLAN_PRICE_IDS = {
    starter: process.env.STRIPE_STARTER_PRICE_ID!,
    standard: process.env.STRIPE_STANDARD_PRICE_ID!,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID!,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
};

export async function createCheckoutSession(
    customerId: string, priceId: string, successUrl: string, cancelUrl: string
  ) {
    return stripe.checkout.sessions.create({
          customer: customerId,
          mode: 'subscription',
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: successUrl,
          cancel_url: cancelUrl,
    });
}

export async function createPaymentIntent(
    customerId: string, amount: number, description: string, metadata?: Record<string, string>
  ) {
    return stripe.paymentIntents.create({
          customer: customerId,
          amount,
          currency: 'usd',
          description,
          metadata,
          automatic_payment_methods: { enabled: true },
    });
}

export async function getOrCreateStripeCustomer(email: string, name?: string) {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) return customers.data[0];
    return stripe.customers.create({ email, name });
}

export async function cancelSubscription(subscriptionId: string) {
    return stripe.subscriptions.cancel(subscriptionId);
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
    return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
}
