import Stripe from "stripe";
import { PlanModel } from "../models/plan.model.js";
import { WalletModel } from "../models/wallet.model.js";
import { TransactionModel } from "../models/transaction.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;

    // Fetch the plan from the database
    const plan = await PlanModel.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ error: "Plan not found or inactive" });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: `Plan Type: ${plan.type}`,
            },
            unit_amount: plan.price * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: plan.type === "subscription" ? "subscription" : "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId: req.user.userId,
        planId: plan._id.toString(),
        type: plan.type,
        name: plan.name,
        tokens: plan.tokens.toString(),
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Verify a completed checkout session
 */
export const verifySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Check if the session belongs to the current user
    if (session.metadata.userId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Return session status and details
    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      metadata: {
        type: session.metadata.type,
        name: session.metadata.name,
        tokens: session.metadata.tokens,
        planId: session.metadata.planId,
      },
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Handle Stripe Webhook Events
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;

        const { userId, planId, type } = session.metadata;

        const plan = await PlanModel.findById(planId);
        if (!plan) {
          console.error("Plan not found for webhook event");
          return res.status(404).send("Plan not found");
        }

        const transaction = new TransactionModel({
          userId,
          planId,
          amount: session.amount_total / 100, // Convert cents to currency
          currency: session.currency.toUpperCase(),
          type,
          flow: "credit",
          paymentGateway: "stripe",
          status: "completed",
        });

        await transaction.save();

        // Update the user's wallet or subscription based on the plan type
        if (type === "wallet-recharge") {
          const wallet = await WalletModel.findOneAndUpdate(
            { userId },
            {
              $inc: { balance: plan.tokens },
              $push: { transactions: transaction._id },
            },
            { new: true, upsert: true }
          );
          console.log("Wallet updated:", wallet);
        } else if (type === "subscription") {
          console.log("Handle subscription logic here.");
        } else {
          console.log("One-time payment does not involve wallet updates.");
        }
        break;

      default:
        if (process.env.NODE_ENV === "development") {
          console.log(`Unhandled event type ${event.type}`);
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook event:", error);
    res.status(500).send("Internal server error");
  }
};
