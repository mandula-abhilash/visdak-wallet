import asyncHandler from "express-async-handler";
import { WalletModel } from "../models/wallet.model.js";

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
  const { amount, transactionId } = req.body;

  if (amount <= 0) {
    res.status(400);
    throw new Error("Invalid credit amount");
  }

  const wallet = await WalletModel.findOne({ userId });

  if (!wallet) {
    res.status(404);
    throw new Error("Wallet not found");
  }

  wallet.balance += amount;

  if (transactionId) {
    wallet.transactions.push(transactionId);
  }

  await wallet.save();
  res.status(200).json({ message: "Wallet credited successfully", wallet });
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
