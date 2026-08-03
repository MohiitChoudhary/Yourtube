import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Auth from "../Modals/Auth.js";
import Subscription from "../Modals/Subscription.js";
import Payment from "../Modals/Payment.js";
import { PLANS } from "../config/plans.js";

export const getUserSubscriptionSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Auth.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentPlan = normalizePlan(user.plan);
    const activeUntil = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const isExpired = activeUntil ? activeUntil < new Date() : false;

    const subscription = await Subscription.findOne({ userId, status: "paid" }).sort({ endDate: -1 });
    const payments = await Payment.find({ userId }).sort({ paymentDate: -1 });

    if (isExpired && currentPlan !== "Free") {
      user.plan = "Free";
      user.subscriptionStatus = "expired";
      await user.save();
    }

    const activePlan = isExpired ? "Free" : currentPlan;
    const planAccess = getPlanAccess(activePlan);

    return res.status(200).json({
      success: true,
      plan: activePlan,
      subscriptionStatus: isExpired ? "expired" : user.subscriptionStatus || "inactive",
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      currentSubscriptionId: user.currentSubscriptionId,
      planAccess,
      subscription,
      payments,
    });
  } catch (error) {
    console.error("Get subscription summary error:", error);
    return res.status(500).json({ message: "Failed to load subscription details" });
  }
};

const normalizePlan = (plan) => (plan && PLANS[plan] ? plan : "Free");

export const getPlanAccess = (plan) => {
  const normalizedPlan = normalizePlan(plan);
  return PLANS[normalizedPlan] || PLANS.Free;
};

const getSubscriptionStatus = (user) => {
  if (!user.subscriptionEndDate) {
    return "inactive";
  }

  if (new Date(user.subscriptionEndDate) < new Date()) {
    return "expired";
  }

  return user.subscriptionStatus || "active";
};


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

export const createSubscriptionOrder = async (req, res) => {
  try {
    const { userId, plan } = req.body;

    if (!userId || !plan) {
      return res.status(400).json({
        message: "userId and plan are required",
      });
    }

    if (!PLANS[plan]) {
      return res.status(400).json({
        message: "Invalid subscription plan",
      });
    }

    if (plan === "Free") {
      return res.status(400).json({
        message: "Free plan does not require payment",
      });
    }

    const user = await Auth.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const amount = PLANS[plan].price * 100;

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        plan,
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      plan,
    });

  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};


// ==========================================
// VERIFY PAYMENT
// ==========================================

export const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      userId,
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !userId ||
      !plan ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing payment details",
      });
    }

    // ==========================================
    // VERIFY SIGNATURE
    // ==========================================

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // ==========================================
    // FIND USER
    // ==========================================

    const user = await Auth.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================================
    // PLAN
    // ==========================================

    const normalizedPlan = normalizePlan(plan);
    const selectedPlan = PLANS[normalizedPlan];

    if (!selectedPlan) {
      return res.status(400).json({
        message: "Invalid plan",
      });
    }

    // ==========================================
    // SUBSCRIPTION DATES
    // ==========================================

    const existingActiveSubscription = await Subscription.findOne({
      userId,
      razorpayPaymentId: razorpay_payment_id,
      status: "paid",
    });

    if (existingActiveSubscription) {
      return res.status(200).json({
        success: true,
        message: "Subscription already verified",
        subscription: existingActiveSubscription,
      });
    }

    const existingPayment = await Payment.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: "Payment already recorded",
        subscription: existingPayment,
      });
    }

    const startDate = new Date();

    const endDate = new Date();

    endDate.setMonth(
      endDate.getMonth() + 1
    );

    // ==========================================
    // TRANSACTION ID
    // ==========================================

    const transactionId = razorpay_payment_id;

    // ==========================================
    // INVOICE NUMBER
    // ==========================================

    const invoiceNumber =
      `INV-${Date.now()}`;

    // ==========================================
    // CREATE SUBSCRIPTION
    // ==========================================

    const subscription =
      await Subscription.create({
        userId,
        plan: normalizedPlan,
        amount: selectedPlan.price,
        currency: "INR",
        razorpayOrderId:
          razorpay_order_id,
        razorpayPaymentId:
          razorpay_payment_id,
        razorpaySignature:
          razorpay_signature,
        transactionId,
        status: "paid",
        startDate,
        endDate,
        invoiceNumber,
      });

    // ==========================================
    // SAVE PAYMENT
    // ==========================================

    await Payment.create({
      userId,
      subscriptionId:
        subscription._id,
      plan: normalizedPlan,
      amount: selectedPlan.price,
      currency: "INR",
      razorpayOrderId:
        razorpay_order_id,
      razorpayPaymentId:
        razorpay_payment_id,
      razorpaySignature:
        razorpay_signature,
      transactionId,
      status: "success",
      paymentDate: new Date(),
    });

    // ==========================================
    // UPDATE USER PLAN
    // ==========================================

    user.plan = normalizedPlan;

    user.subscriptionStatus =
      "active";

    user.subscriptionStartDate =
      startDate;

    user.subscriptionEndDate =
      endDate;

    user.currentSubscriptionId =
      subscription._id;

    await user.save();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message:
        "Subscription activated successfully",

      subscription: {
        plan: normalizedPlan,
        transactionId,
        amount:
          selectedPlan.price,
        startDate,
        endDate,
        invoiceNumber,
      },
    });

  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Payment verification failed",
      error: error.message,
    });
  }
};
