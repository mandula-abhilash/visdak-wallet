import express from "express";
import {
  getWallet,
  debitWallet,
  creditWallet,
} from "../controllers/wallet.controller.js";

const walletRoutes = ({ protect }) => {
  const router = express.Router();

  /**
   * @route GET /api/wallet/
   * @desc Get wallet details for a user
   * @access Private
   */
  router.get("/", protect, getWallet);

  /**
   * @route POST /api/wallet/credit
   * @desc Credit balance to wallet
   * @access Private
   */
  router.post("/credit", protect, creditWallet);

  /**
   * @route POST /api/wallet/debit
   * @desc Debit balance from wallet
   * @access Private
   */
  router.post("/debit", protect, debitWallet);

  return router;
};

export default walletRoutes;
