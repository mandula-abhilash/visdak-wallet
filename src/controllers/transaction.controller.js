import asyncHandler from "express-async-handler";
import { TransactionModel } from "../models/transaction.model.js";
import { WalletModel } from "../models/wallet.model.js";
import { PlanModel } from "../models/plan.model.js";

/**
 * @desc Get all transactions for the authenticated user
 * @route GET /api/transactions
 * @access Private
 */
export const getTransactions = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const transactions = await TransactionModel.find({ userId }).sort({
    createdAt: -1,
  });

  res.status(200).json(transactions);
});

/**
 * @desc Get a single transaction by ID
 * @route GET /api/transactions/:transactionId
 * @access Private
 */
export const getTransactionById = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const transaction = await TransactionModel.findById(transactionId);

  if (!transaction || transaction.userId.toString() !== req.userId) {
    res.status(404);
    throw new Error("Transaction not found or access denied");
  }

  res.status(200).json(transaction);
});

/**
 * Handle credit transactions (e.g., wallet recharge, subscription purchase)
 */
const handleCreditTransaction = async (
  userId,
  planId,
  amount,
  currency,
  paymentGateway
) => {
  // Validate the plan
  const plan = await PlanModel.findById(planId);
  if (!plan) {
    throw new Error("Invalid plan");
  }

  if (plan.price !== amount || plan.currency !== currency) {
    throw new Error("Mismatched plan price or currency");
  }

  // Create credit transaction
  const transaction = await TransactionModel.create({
    userId,
    planId,
    amount,
    currency,
    type: plan.type,
    flow: "credit",
    paymentGateway,
    status: "pending",
  });

  // Handle wallet recharge
  if (plan.type === "wallet-recharge") {
    const wallet = await WalletModel.findOneAndUpdate(
      { userId },
      {
        $inc: { balance: plan.tokens },
        $push: { transactions: transaction._id },
      },
      { new: true, upsert: true }
    );

    if (!wallet) {
      throw new Error("Failed to update wallet balance");
    }
  }

  // Finalize transaction
  transaction.status = "completed";
  await transaction.save();

  return transaction;
};

/**
 * Handle debit transactions (e.g., app usage or token deduction)
 */
const handleDebitTransaction = async (
  userId,
  amount,
  currency,
  tokensToDeduct,
  paymentGateway
) => {
  const wallet = await WalletModel.findOne({ userId });

  if (!wallet || wallet.balance < (tokensToDeduct || amount)) {
    throw new Error("Insufficient balance in wallet");
  }

  // Deduct tokens or balance
  wallet.balance -= tokensToDeduct || amount;
  await wallet.save();

  // Create debit transaction
  const transaction = await TransactionModel.create({
    userId,
    amount: tokensToDeduct || amount,
    currency,
    type: "debit",
    flow: "debit",
    paymentGateway,
    status: "completed",
  });

  wallet.transactions.push(transaction._id);
  await wallet.save();

  return transaction;
};

/**
 * Create a transaction (entry point)
 * Handles both credit and debit transactions
 */
export const createTransaction = asyncHandler(async (req, res) => {
  const { planId, paymentGateway, amount, currency, flow, tokensToDeduct } =
    req.body;

  let transaction;
  if (flow === "credit") {
    transaction = await handleCreditTransaction(
      req.user.id,
      planId,
      amount,
      currency,
      paymentGateway
    );
  } else if (flow === "debit") {
    transaction = await handleDebitTransaction(
      req.user.id,
      amount,
      currency,
      tokensToDeduct,
      paymentGateway
    );
  } else {
    res.status(400).json({ message: "Invalid flow type" });
    return;
  }

  res.status(201).json(transaction);
});
