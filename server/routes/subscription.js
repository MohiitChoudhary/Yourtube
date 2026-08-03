import express from "express";

import {
  createSubscriptionOrder,
  getUserSubscriptionSummary,
  verifySubscriptionPayment,
} from "../controllers/subscription.js";

const router = express.Router();

router.post(
  "/create-order",
  createSubscriptionOrder
);

router.post(
  "/verify-payment",
  verifySubscriptionPayment
);

router.get(
  "/:userId",
  getUserSubscriptionSummary
);

export default router;