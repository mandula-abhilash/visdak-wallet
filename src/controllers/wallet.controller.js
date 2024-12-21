import asyncHandler from "express-async-handler";
import { WalletModel } from "../models/wallet.model.js";
import { TransactionModel } from "../models/transaction.model.js";
/**
 * @desc Get wallet details for a user
 * @route GET /api/wallet/
 * @access Private
 */
export const getWallet = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const wallet = await WalletModel.findOne({ userId }).populate("transactions");

  if (!wallet) {
    res.status(404);
    throw new Error("Wallet not found");
  }

  res.status(200).json(wallet);
});

/**
 * @desc Credit balance to wallet
 * @route POST /api/wallet/credit
 * @access Private
 */
export const creditWallet = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { amount, transactionId, currency, paymentGateway, type } = req.body;

  if (amount <= 0) {
    res.status(400);
    throw new Error("Invalid credit amount");
  }

  let wallet = await WalletModel.findOne({ userId });

  if (!wallet) {
    // If no wallet exists, create one and a transaction for special case
    wallet = new WalletModel({
      userId,
      balance: 0,
      transactions: [],
    });

    // Create a transaction for the wallet creation
    const transaction = await TransactionModel.create({
      userId,
      amount,
      currency: currency || "INR",
      type: type || "wallet-recharge",
      flow: "credit",
      paymentGateway: paymentGateway || "system",
      status: "completed",
    });

    // Credit the amount to the wallet
    wallet.balance += amount;
    wallet.transactions.push(transaction._id);
    await wallet.save();

    return res.status(200).json({
      message: "Wallet created and credited successfully",
      wallet,
      transaction,
    });
  }

  // If wallet exists, transaction ID is mandatory
  if (!transactionId) {
    res.status(400);
    throw new Error("Transaction ID is required for crediting wallet");
  }

  // Validate the provided transaction
  const transaction = await TransactionModel.findById(transactionId);
  if (!transaction) {
    res.status(400);
    throw new Error("Invalid transaction ID");
  }

  if (transaction.status !== "completed") {
    res.status(400);
    throw new Error("Transaction must be completed before crediting wallet");
  }

  // Credit the wallet
  wallet.balance += amount;
  wallet.transactions.push(transaction._id);
  await wallet.save();

  // Send response
  res.status(200).json({
    message: "Wallet credited successfully",
    wallet,
    transaction,
  });
});

/**
 * @desc Debit balance from wallet
 * @route POST /api/wallet/debit
 * @access Private
 */
export const debitWallet = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { amount, transactionId } = req.body;

  if (amount <= 0) {
    res.status(400);
    throw new Error("Invalid debit amount");
  }

  const wallet = await WalletModel.findOne({ userId });

  if (!wallet) {
    res.status(404);
    throw new Error("Wallet not found");
  }

  if (wallet.balance < amount) {
    res.status(400);
    throw new Error("Insufficient wallet balance");
  }

  wallet.balance -= amount;

  if (transactionId) {
    wallet.transactions.push(transactionId);
  }

  await wallet.save();
  res.status(200).json({ message: "Wallet debited successfully", wallet });
});
