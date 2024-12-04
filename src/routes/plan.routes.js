import express from "express";
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deactivatePlan,
} from "../controllers/plan.controller.js";

const planRoutes = ({ protect, admin }) => {
  const router = express.Router();

  /**
   * @route GET /api/plans
   * @desc Get all plans
   * @access Public
   */
  router.get("/", getPlans);

  /**
   * @route GET /api/plans/:planId
   * @desc Get a plan by ID
   * @access Public
   */
  router.get("/:planId", getPlanById);

  /**
   * @route POST /api/plans
   * @desc Create a new plan
   * @access Admin
   */
  router.post("/", protect, admin, createPlan);

  /**
   * @route PUT /api/plans/:planId
   * @desc Update a plan by ID
   * @access Admin
   */
  router.put("/:planId", protect, admin, updatePlan);

  /**
   * @route PATCH /api/plans/:planId/deactivate
   * @desc Deactivate a plan by ID
   * @access Admin
   */
  router.patch("/:planId/deactivate", protect, admin, deactivatePlan);

  return router;
};

export default planRoutes;
