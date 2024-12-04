import planRoutes from "./routes/plan.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import { handleStripeWebhook } from "./controllers/checkout.controller.js";

/**
 * Validate required environment variables
 * @throws {Error} If any required variable is missing
 */
const validateEnvVariables = () => {
  const requiredVariables = [
    "CLIENT_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NODE_ENV",
  ];

  requiredVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`Environment variable ${variable} is not set.`);
    }
  });
};

// Validate environment variables on module load
validateEnvVariables();

/**
 * Exports all the routes in one place
 * @param {Object} middleware - Middleware objects (e.g., protect, admin)
 * @returns {Object} - Object with all route handlers
 */
const visdakWalletRoutes = (middleware) => ({
  planRoutes: planRoutes(middleware),
  walletRoutes: walletRoutes(middleware),
  subscriptionRoutes: subscriptionRoutes(middleware),
  transactionRoutes: transactionRoutes(middleware),
  checkoutRoutes: checkoutRoutes(middleware),
});

// Log success message for debugging (optional)
console.log("Environment variables loaded successfully!");

export { handleStripeWebhook };
export default visdakWalletRoutes;
