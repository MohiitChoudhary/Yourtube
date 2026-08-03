import { useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import SubscriptionPlans from "@/components/SubscriptionPlans";

export default function SubscriptionsPage() {
  const { user } = useUser();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    const loadSummary = async () => {
      try {
        const response = await axiosInstance.get(`/subscription/${user._id}`);
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to load subscription summary", error);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [user?._id]);

  if (!user) {
    return <div className="p-6">Please sign in to view subscriptions.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h1 className="text-2xl font-semibold">Subscription</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your plan, renewal status, and payment history.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          Loading...
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-xl font-semibold">Current plan</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="font-medium">Plan:</span> {summary?.plan || "Free"}</p>
              <p><span className="font-medium">Status:</span> {summary?.subscriptionStatus || "inactive"}</p>
              <p><span className="font-medium">Expiry:</span> {summary?.subscriptionEndDate ? new Date(summary.subscriptionEndDate).toLocaleString() : "Not active"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-xl font-semibold">Upgrade your plan</h2>
            <div className="mt-4">
              <SubscriptionPlans userId={user._id} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-xl font-semibold">Payment history</h2>
            {summary?.payments?.length ? (
              <div className="mt-4 space-y-3">
                {summary.payments.map((payment: any) => (
                  <div key={payment._id} className="rounded-lg border border-gray-200 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{payment.plan}</span>
                      <span>₹{payment.amount}</span>
                    </div>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Status: {payment.status}</p>
                    <p className="text-gray-600 dark:text-gray-400">Paid on: {new Date(payment.paymentDate).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">No payments yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
