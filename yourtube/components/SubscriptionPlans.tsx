"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
} from "@/lib/subscriptionApi";

import { loadRazorpay } from "@/lib/razorpay";

interface Props {
  userId: string;
}

export default function SubscriptionPlans({
  userId,
}: Props) {

  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const handleUpgrade = async (
    plan: string
  ) => {

    try {

      setLoading(true);

      const loaded =
        await loadRazorpay();

      if (!loaded) {
        alert(
          "Razorpay failed to load"
        );
        return;
      }

      // =====================================
      // CREATE ORDER
      // =====================================

      const data =
        await createSubscriptionOrder(
          userId,
          plan
        );

      // =====================================
      // RAZORPAY CHECKOUT
      // =====================================

      const options = {

        key: data.key,

        amount:
          data.order.amount,

        currency:
          data.order.currency,

        name: "YourTube",

        description:
          `${plan} Subscription`,

        order_id:
          data.order.id,

        handler:
          async function (
            response: any
          ) {

            try {

              const result =
                await verifySubscriptionPayment({

                  userId,

                  plan,

                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,

                });

              if (
                result.success
              ) {

                alert(
                  "Subscription activated successfully!"
                );

                router.refresh();

              }

            } catch (error) {

              console.error(
                error
              );

              alert(
                "Payment verification failed"
              );

            }

          },

        prefill: {
          name: "",
          email: "",
        },

        theme: {
          color: "#3399cc",
        },
      };

      const razorpay =
        new (window as any).Razorpay(
          options
        );

      razorpay.open();

    } catch (error) {

      console.error(
        "Subscription error:",
        error
      );

      alert(
        "Unable to start payment"
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="grid gap-6 md:grid-cols-3">

      <div>
        <h2>Bronze</h2>

        <p>₹99 / month</p>

        <button
          onClick={() =>
            handleUpgrade("Bronze")
          }
          disabled={loading}
        >
          Upgrade
        </button>
      </div>


      <div>
        <h2>Silver</h2>

        <p>₹199 / month</p>

        <button
          onClick={() =>
            handleUpgrade("Silver")
          }
          disabled={loading}
        >
          Upgrade
        </button>
      </div>


      <div>
        <h2>Gold</h2>

        <p>₹399 / month</p>

        <button
          onClick={() =>
            handleUpgrade("Gold")
          }
          disabled={loading}
        >
          Upgrade
        </button>
      </div>

    </div>
  );
}