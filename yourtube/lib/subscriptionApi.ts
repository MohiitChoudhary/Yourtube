import axiosInstance from "./axiosinstance";

export const createSubscriptionOrder = async (
  userId: string,
  plan: string
) => {
  const response =
    await axiosInstance.post(
      "/subscription/create-order",
      {
        userId,
        plan,
      }
    );

  return response.data;
};


export const verifySubscriptionPayment =
  async (data: {
    userId: string;
    plan: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {

    const response =
      await axiosInstance.post(
        "/subscription/verify-payment",
        data
      );

    return response.data;
  };