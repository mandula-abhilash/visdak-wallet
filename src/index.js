import planRoutes from "./routes/plan.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import { handleStripeWebhook } from "./controllers/checkout.controller.js";

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

export { handleStripeWebhook };
export default visdakWalletRoutes;
