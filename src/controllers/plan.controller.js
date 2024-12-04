import asyncHandler from "express-async-handler";
import { PlanModel } from "../models/plan.model.js";

/**
 * @desc Get all active plans
 * @route GET /api/plans
 * @access Public
 */
export const getPlans = asyncHandler(async (req, res) => {
  const plans = await PlanModel.find({ isActive: true });
  res.status(200).json(plans);
});

/**
 * @desc Get a plan by ID
 * @route GET /api/plans/:planId
 * @access Public
 */
export const getPlanById = asyncHandler(async (req, res) => {
  const { planId } = req.params;
  const plan = await PlanModel.findById(planId);

  if (!plan) {
    res.status(404);
    throw new Error("Plan not found");
  }

  res.status(200).json(plan);
});

/**
 * @desc Create a new plan
 * @route POST /api/plans
 * @access Admin
 */
export const createPlan = asyncHandler(async (req, res) => {
  const { name, type, tokens, price, validityPeriod, region, currency } =
    req.body;

  const plan = new PlanModel({
    name,
    type,
    tokens,
    price,
    validityPeriod,
    region,
    currency,
  });

  const createdPlan = await plan.save();
  res.status(201).json(createdPlan);
});

/**
 * @desc Update a plan by ID
 * @route PUT /api/plans/:planId
 * @access Admin
 */
export const updatePlan = asyncHandler(async (req, res) => {
  const { planId } = req.params;
  const updates = req.body;

  const updatedPlan = await PlanModel.findByIdAndUpdate(planId, updates, {
    new: true,
  });

  if (!updatedPlan) {
    res.status(404);
    throw new Error("Plan not found");
  }

  res.status(200).json(updatedPlan);
});

/**
 * @desc Deactivate a plan by ID
 * @route PATCH /api/plans/:planId/deactivate
 * @access Admin
 */
export const deactivatePlan = asyncHandler(async (req, res) => {
  const { planId } = req.params;

  const plan = await PlanModel.findById(planId);

  if (!plan) {
    res.status(404);
    throw new Error("Plan not found");
  }

  plan.isActive = false;
  await plan.save();

  res.status(200).json({ message: "Plan deactivated successfully" });
});
