import express from "express";
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  cancelSubscription,
} from "../controllers/subscription.controller.js";

const subscriptionRoutes = ({ protect }) => {
  const router = express.Router();

  /**
   * @route GET /api/subscriptions
   * @desc Get all subscriptions
   * @access Private
   */
  router.get("/", protect, getSubscriptions);

  /**
   * @route POST /api/subscriptions
   * @desc Create a new subscription
   * @access Private
   */
  router.post("/", protect, createSubscription);

  /**
   * @route GET /api/subscriptions/:subscriptionId
   * @desc Get a subscription by ID
   * @access Private
   */
  router.get("/:subscriptionId", protect, getSubscriptionById);

  /**
   * @route PATCH /api/subscriptions/subscriptionId/cancel
   * @desc Cancel a subscription
   * @access Private
   */
  router.patch("/:subscriptionId/cancel", protect, cancelSubscription);

  /**
   * @route PATCH /api/subscriptions/:subscriptionId
   * @desc Update subscription (e.g., change auto-renew)
   * @access Private
   */
  router.patch("/:subscriptionId", protect, updateSubscription);

  return router;
};

export default subscriptionRoutes;
