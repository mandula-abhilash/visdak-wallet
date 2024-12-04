# VISDAK Wallet

# Payment and Subscription Module

This module is designed to handle **wallet management**, **subscription tracking**, **one-time payments**, and **transactions** for projects requiring a comprehensive payment management system. It supports **Stripe** and **Razorpay** as payment gateways and is structured to be reusable across multiple projects.

## Table of Contents

- [Features](#features)
- [Models](#models)
  - [Plan Model](#plan-model)
  - [Wallet Model](#wallet-model)
  - [Transaction Model](#transaction-model)
  - [Subscription Model](#subscription-model)
- [Usage](#usage)
- [Use cases](#use-cases)

## Features

- **Plan Management**: Define pricing plans for tokens, one-time payments, and subscriptions.
- **Wallet System**: Manage user balances and track wallet-related transactions.
- **Transaction Tracking**: Record and monitor payments for plans or wallet recharges.
- **Subscription Management**: Handle recurring plans with auto-renewal options.
- **Region-Specific Pricing**: Support for multi-currency and regional pricing.
- **Payment Gateway Support**: Integration with Stripe and Razorpay.

## Models

### Plan Model

The `Plan` model defines the structure for pricing plans. These plans can be of three types: **one-time**, **subscription**, or **wallet recharge**.

```javascript
const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["one-time", "subscription", "wallet-recharge"],
      required: true,
    },
    tokens: { type: Number, default: 0 },
    price: { type: Number, required: true },
    validityPeriod: { type: Number }, // Days for one-time or subscription plans
    region: { type: String, required: true, index: true },
    currency: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

planSchema.index({ type: 1, region: 1, isActive: 1 });
```

#### Example Document

```json
{
  "name": "Basic Plan",
  "type": "subscription",
  "tokens": 0,
  "price": 10,
  "validityPeriod": 30,
  "region": "US",
  "currency": "USD",
  "isActive": true
}
```

### Wallet Model

The `Wallet` model manages user balances and associated transactions.

```javascript
const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, required: true, default: 0 },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],
  },
  { timestamps: true }
);

walletSchema.index({ userId: 1 });
```

#### Example Document

```json
{
  "userId": "64a2f0a6d8a2c3e5f89b2d1c",
  "balance": 50,
  "transactions": ["64b3g1h7j8k4l5m2n0p1"]
}
```

### Transaction Model

The `Transaction` model tracks payments made by users for plans, wallet recharges, or subscriptions.

```javascript
const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    type: {
      type: String,
      enum: ["one-time", "subscription", "wallet-recharge"],
      required: true,
    },
    flow: { type: String, enum: ["debit", "credit"], required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    paymentGateway: {
      type: String,
      enum: ["stripe", "razorpay"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, status: 1 });
```

#### Example Document

```json
{
  "userId": "64a2f0a6d8a2c3e5f89b2d1c",
  "amount": 10,
  "currency": "USD",
  "type": "subscription",
  "flow": "credit",
  "planId": "64a2f0a6d8a2c3e5f89b2d1d",
  "paymentGateway": "stripe",
  "status": "completed"
}
```

### Subscription Model

The `Subscription` model handles recurring payments and plan tracking for users.

```javascript
const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    autoRenew: { type: Boolean, default: false },
  },
  { timestamps: true }
);

subscriptionSchema.index({ userId: 1, isActive: 1 });
subscriptionSchema.index({ planId: 1 });
```

#### Example Document

```json
{
  "userId": "64a2f0a6d8a2c3e5f89b2d1c",
  "planId": "64a2f0a6d8a2c3e5f89b2d1d",
  "startDate": "2024-12-01T00:00:00.000Z",
  "endDate": "2025-01-01T00:00:00.000Z",
  "isActive": true,
  "autoRenew": true
}
```

## Usage

1. **Create Plans**:

   - Define plans with types (`one-time`, `subscription`, or `wallet-recharge`) in the `Plan` model.

2. **Manage Wallets**:

   - Use the `Wallet` model to track user balances and associate transactions.

3. **Track Transactions**:

   - Record all payments and their statuses using the `Transaction` model.

4. **Handle Subscriptions**:

   - Use the `Subscription` model for recurring payment plans.

5. **Integration**:
   - Integrate payment gateways (Stripe or Razorpay) for seamless user payments.

## Use Cases

### 1. **Digital Art Marketplace** : Wallet

- **Use Case**: Users can purchase tokens and spend them to unlock digital art assets.
- **Model Used**: **Wallet**
- **Workflow**:
  1. A user registers and purchases tokens via wallet recharge plans.
  2. Tokens are deducted from the wallet each time the user unlocks an asset.
  3. If the wallet balance is insufficient, the user recharges their wallet.

### Example:

#### Plans:

```json
[
  {
    "name": "Starter Pack",
    "type": "wallet-recharge",
    "tokens": 10,
    "price": 100,
    "currency": "INR",
    "region": "IN",
    "isActive": true
  },
  {
    "name": "Pro Pack",
    "type": "wallet-recharge",
    "tokens": 50,
    "price": 400,
    "currency": "INR",
    "region": "IN",
    "isActive": true
  }
]
```

#### Wallet:

```json
{
  "userId": "64a2f0a6d8a2c3e5f89b2d1c",
  "balance": 50,
  "transactions": ["64a2f0a6d8a2c3e5f89b2d1d"]
}
```

#### Transaction (Wallet Recharge):

```json
{
  "userId": "64a2f0a6d8a2c3e5f89b2d1c",
  "amount": 400,
  "currency": "INR",
  "type": "wallet-recharge",
  "flow": "credit",
  "planId": "64a2f0a6d8a2c3e5f89b2d1d",
  "paymentGateway": "razorpay",
  "status": "completed"
}
```

#### Deduction Example:

- Unlocking an art asset deducts 10 tokens. Updated wallet balance: `40`.

## 2. **Online Education Platform** : One-Time Payment

- **Use Case**: Users purchase individual courses with a validity period (e.g., 6 months).
- **Model Used**: **One-Time Payment**
- **Workflow**:
  1. A user selects a course and makes a one-time payment.
  2. The course is accessible for the validity period.
  3. After the validity expires, the course is no longer accessible.

### Example:

#### Plans:

```json
[
  {
    "name": "JavaScript Basics",
    "type": "one-time",
    "price": 50,
    "validityPeriod": 180, // in days
    "currency": "USD",
    "region": "US",
    "isActive": true
  },
  {
    "name": "Advanced React",
    "type": "one-time",
    "price": 100,
    "validityPeriod": 365, // in days
    "currency": "USD",
    "region": "US",
    "isActive": true
  }
]
```

#### Transaction:

```json
{
  "userId": "64a2f0a6d8a2c3e5f89b2d1c",
  "amount": 50,
  "currency": "USD",
  "type": "one-time",
  "flow": "credit",
  "planId": "64a2f0a6d8a2c3e5f89b2d1d",
  "paymentGateway": "stripe",
  "status": "completed"
}
```

#### Course Validity:

- Start Date: `2024-12-01`
- End Date: `2025-05-30` (calculated based on validity period).

## 3. **Fitness App** : Subscription

- **Use Case**: Users subscribe to plans (e.g., monthly, yearly) for premium features like personal coaching and advanced analytics.
- **Model Used**: **Subscription**
- **Workflow**:
  1. A user subscribes to a plan.
  2. Features remain active as long as the subscription is active.
  3. The subscription renews automatically unless canceled by the user.

### Example:

#### Plans:

```json
[
  {
    "name": "Monthly Premium",
    "type": "subscription",
    "price": 15,
    "validityPeriod": 30, // in days
    "currency": "USD",
    "region": "US",
    "isActive": true
  },
  {
    "name": "Yearly Premium",
    "type": "subscription",
    "price": 150,
    "validityPeriod": 365, // in days
    "currency": "USD",
    "region": "US",
    "isActive": true
  }
]
```

#### Subscription:

```json
{
  "userId": "64a2f0a6d8a2c3e5f89b2d1c",
  "planId": "64a2f0a6d8a2c3e5f89b2d1d",
  "startDate": "2024-12-01",
  "endDate": "2025-01-01",
  "isActive": true,
  "autoRenew": true
}
```

#### Transaction (Subscription Payment):

```json
{
  "userId": "64a2f0a6d8a2c3e5f89b2d1c",
  "amount": 15,
  "currency": "USD",
  "type": "subscription",
  "flow": "credit",
  "planId": "64a2f0a6d8a2c3e5f89b2d1d",
  "paymentGateway": "stripe",
  "status": "completed"
}
```

## Multi-Type Usage

Some businesses may use a combination:

- **Fitness App**: Offers subscriptions but allows one-time payments for exclusive content.
- **E-Learning Platform**: Uses subscriptions for ongoing access and wallet for purchasing bonus content.
