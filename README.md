# **VISDAK WALLET**

## Payment and Plan Management Module

A modular and flexible system for managing wallets, subscriptions, and one-time payments with region-specific pricing and integrations for Stripe and Razorpay.

## 🌟 **Features**

- 🎟️ **Unified Plan Management**:  
   Manage plans for wallets, subscriptions, and one-time payments with regional pricing support.

- 💰 **Wallet Management**:  
   Track app usage tokens, deduct tokens, and handle top-ups.

- 📅 **Subscription Management**:  
   Handle recurring payments, enforce expiration rules, and manage downgrades.

- 🛒 **One-Time Payment Support**:  
   For digital products, services, or time-limited app access with optional validity periods.

- 🌍 **Region-Specific Pricing**:  
   Support for global and localized plans (e.g., INR for India, USD for the USA).

- 💳 **Payment Gateway Integration**:  
   Integrate with Stripe and Razorpay with flexibility for customer choices.

- 🛠️ **Modular Design**:  
   Reusable across projects with middleware for authentication and region-specific logic.

---

## 🛠️ **Architecture**

### 📂 **Models**

1. **Plan**:  
   Stores details about reusable plans for wallets, subscriptions, and one-time payments.  
   Includes fields for regional pricing and optional validity periods.

2. **Transaction**:  
   Tracks all transactions (e.g., wallet top-ups, subscriptions, one-time purchases).

3. **Wallet**:  
   Manages token balance, usage, and replenishment.

---

### 📜 **Controllers**

- **PlanController**: Manage plans based on region and type.
- **TransactionController**: Log transactions and handle payment status updates.
- **PaymentController**: Manage payment flows for Stripe and Razorpay.
- **WalletController**: Handle wallet balance and token deduction.

---

### 🛣️ **Routes**

- **Public**:

  - Fetch plans.
  - Initiate payments.

- **Protected**:
  - Wallet token usage.
  - Subscription validation.
  - Plan management.
  - View transaction history.

---

### 🧩 **Middleware**

- **Auth Middleware**: Validates user authentication and roles.
- **Region Middleware**: Determines the user's region for pricing.
- **Plan Enforcement Middleware**: Ensures tokens or valid subscriptions before proceeding.

---

## 🛠️ **Setup Instructions**

### 📝 **Installation**

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/payment-module.git
   cd payment-module
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file:

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   JWT_SECRET=your_jwt_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

4. Start the server:
   ```bash
   npm start
   ```

---

## 🔑 **Usage**

### **Plan Management**

**Fetch Plans**

```
GET /api/plans?region=India
```

Response:

```json
[
  {
    "name": "Plan A",
    "type": "wallet",
    "tokens": 10,
    "validityPeriod": null,
    "price": 1000,
    "currency": "INR",
    "features": ["Feature 1", "Feature 2"],
    "description": "10 tokens for usage."
  }
]
```

---

### **Wallet Management**

**Deduct Tokens**

```
POST /api/wallet/deduct
```

Request:

```json
{
  "amount": 5
}
```

Response:

```json
{
  "status": "success",
  "remainingTokens": 45
}
```

---

### **Subscription Management**

**Validate Subscription**

```
GET /api/subscriptions/validate
```

Response:

```json
{
  "status": "valid",
  "expiresIn": "30 days"
}
```

---

### **One-Time Payment**

**Purchase Access**

```
POST /api/payments/one-time
```

Request:

```json
{
  "planId": "63f2c99b4f1c92b1e245ca47",
  "region": "USA"
}
```

Response:

```json
{
  "status": "success",
  "plan": {
    "name": "Plan A",
    "validUntil": "2025-12-01T00:00:00Z"
  }
}
```

---

### **Payment Integration**

**Initiate Payment**

```
POST /api/payments/initiate
```

Request:

```json
{
  "gateway": "stripe",
  "planId": "63f2c99b4f1c92b1e245ca47",
  "region": "India"
}
```

Response:

```json
{
  "paymentUrl": "https://checkout.stripe.com/pay/cs_test_1234567890"
}
```

---

## 🎯 **Configuration**

- **Middleware Injection**: Add custom authentication or region detection during setup.
- **Custom Payment Gateways**: Extend `PaymentController` to add new gateways.

---

## 🌟 **Future Enhancements**

- Add support for discounts and promotional codes.
- Include usage analytics and subscription trends.
- Simplify multi-currency handling.
