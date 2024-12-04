import express from "express";
import {
  verifySession,
  createCheckoutSession,
} from "../controllers/checkout.controller.js";

const checkoutRoutes = ({ protect }) => {
  const router = express.Router();

  /**
   * @route POST /api/checkout/session
   * @desc Create a Stripe checkout session
   * @access Private
   */
  router.post("/session", protect, createCheckoutSession);

  /**
   * @route GET /api/checkout/verify/:sessionId
   * @desc Verify a completed checkout session
   * @access Private
   */
  router.get("/verify/:sessionId", protect, verifySession);

  return router;
};

export default checkoutRoutes;
