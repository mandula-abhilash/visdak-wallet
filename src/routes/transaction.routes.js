import express from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
} from "../controllers/transaction.controller.js";

const transactionRoutes = ({ protect }) => {
  const router = express.Router();

  /**
   * @route GET /api/transactions
   * @desc Get all transactions
   * @access Private
   */
  router.get("/", protect, getTransactions);

  /**
   * @route POST /api/transactions
   * @desc Create a new transaction
   * @access Private
   */
  router.post("/", protect, createTransaction);

  /**
   * @route GET /api/transactions/:transactionId
   * @desc Get a transaction by ID
   * @access Private
   */
  router.get("/:transactionId", protect, getTransactionById);

  return router;
};

export default transactionRoutes;
