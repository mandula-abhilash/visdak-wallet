import asyncHandler from "express-async-handler";
import { SubscriptionModel } from "../models/subscription.model.js";
import { PlanModel } from "../models/plan.model.js";

/**
 * @desc Get all subscriptions for the authenticated user
 * @route GET /api/subscriptions
 * @access Private
 */
export const getSubscriptions = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const subscriptions = await SubscriptionModel.find({ userId }).populate(
    "planId",
    "name price type validityPeriod"
  );

  res.status(200).json(subscriptions);
});

/**
 * @desc Get a single subscription by ID
 * @route GET /api/subscriptions/:subscriptionId
 * @access Private
 */
export const getSubscriptionById = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await SubscriptionModel.findById(
    subscriptionId
  ).populate("planId", "name price type validityPeriod");

  if (!subscription || subscription.userId.toString() !== req.userId) {
    res.status(404);
    throw new Error("Subscription not found or access denied");
  }

  res.status(200).json(subscription);
});

/**
 * @desc Create a new subscription
 * @route POST /api/subscriptions
 * @access Private
 */
export const createSubscription = asyncHandler(async (req, res) => {
  const { planId } = req.body;

  const plan = await PlanModel.findById(planId);

  if (!plan || plan.type !== "subscription") {
    res.status(400);
    throw new Error("Invalid subscription plan");
  }

  const existingSubscription = await SubscriptionModel.findOne({
    userId: req.userId,
    planId,
    isActive: true,
  });

  if (existingSubscription) {
    res.status(400);
    throw new Error("You already have an active subscription for this plan");
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  if (plan.validityPeriod) {
    endDate.setDate(startDate.getDate() + plan.validityPeriod);
  }

  const subscription = await SubscriptionModel.create({
    userId: req.userId,
    planId,
    startDate,
    endDate,
    isActive: true,
    autoRenew: false,
  });

  res.status(201).json(subscription);
});

/**
 * @desc Update subscription (e.g., toggle auto-renew)
 * @route PATCH /api/subscriptions/:subscriptionId
 * @access Private
 */
export const updateSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const { autoRenew } = req.body;

  const subscription = await SubscriptionModel.findById(subscriptionId);

  if (!subscription || subscription.userId.toString() !== req.userId) {
    res.status(404);
    throw new Error("Subscription not found or access denied");
  }

  if (autoRenew !== undefined) {
    subscription.autoRenew = autoRenew;
  }

  await subscription.save();

  res.status(200).json(subscription);
});

/**
 * @desc Cancel a subscription
 * @route PATCH /api/subscriptions/:subscriptionId/cancel
 * @access Private
 */
export const cancelSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  const subscription = await SubscriptionModel.findById(subscriptionId);

  if (!subscription || subscription.userId.toString() !== req.userId) {
    res.status(404);
    throw new Error("Subscription not found or access denied");
  }

  subscription.isActive = false;
  subscription.autoRenew = false;

  await subscription.save();

  res.status(200).json({ message: "Subscription cancelled successfully" });
});
