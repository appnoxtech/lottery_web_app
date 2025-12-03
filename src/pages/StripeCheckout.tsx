// StripeCheckout.tsx — FULL DEBUG VERSION
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { X } from "lucide-react";
import { showToast } from "../utils/toast.util";
import { orderComplete } from "../utils/services/Order.services";

interface StripeCheckoutProps {
  amount: number;
  currency: "XCG" | "USD" | "EUR";
  newOrderInfo: { order_id?: number; client_secret?: string } | null;
  onClose: (success: boolean) => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  amount,
  currency,
  newOrderInfo,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  console.log("StripeCheckout DEBUG:", {
    stripe: !!stripe,
    client_secret: newOrderInfo?.client_secret,
    order_id: newOrderInfo?.order_id,
    currency,
  });

 const handleIdealPayment = async () => {
  if (!stripe || !newOrderInfo?.client_secret) {
    showToast("Stripe not ready", "error");
    return;
  }

  console.log("Starting iDEAL payment with client_secret:", newOrderInfo.client_secret);

  setLoading(true);
  try {
    const { error, paymentIntent } = await stripe.confirmIdealPayment(
      newOrderInfo.client_secret,
      {
        payment_method: {
          ideal: {}, // ← REQUIRED: empty ideal object
          billing_details: {
            name: "Test Customer",
            email: "test@example.com",
          },
        },
        return_url: `${window.location.origin}/tickets?ideal_success=true&order_id=${newOrderInfo.order_id}`,
      }
    );

    if (error) {
      console.error("iDEAL Error:", error);
      showToast(`iDEAL failed: ${error.message}`, "error");
    } else {
      console.log("iDEAL redirecting...", paymentIntent);
      showToast("Redirecting to your bank...", "info");
      // Success → Stripe redirects automatically
    }
  } catch (err: any) {
    console.error("iDEAL Exception:", err);
    showToast(`iDEAL failed: ${err.message || "Unknown error"}`, "error");
  } finally {
    setLoading(false);
  }
};

  const handleCardPayment = async () => {
    if (!stripe || !elements || !newOrderInfo?.client_secret) {
      showToast("Payment setup missing", "error");
      return;
    }

    setLoading(true);
    console.log("Starting card payment...");

    const result = await stripe.confirmCardPayment(newOrderInfo.client_secret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });

    console.log("Card payment result:", result);

    if (result.error) {
      showToast(`Card failed: ${result.error.message}`, "error");
      onClose(false);
    } else {
      await orderComplete(newOrderInfo.order_id!);
      showToast("Card payment successful!", "success");
      onClose(true);
    }
    setLoading(false);
  };

  const symbol = currency === "XCG" ? "ƒ" : currency === "USD" ? "$" : "€";

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1C23] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <div className="bg-gradient-to-b from-[#1A1C23] to-[#14151A] p-4 text-center relative">
          <button onClick={() => onClose(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white mb-3">Complete Payment</h2>
          <p className="text-3xl font-bold text-[#EDB726]">
            {symbol}{amount.toFixed(2)}
          </p>
        </div>

        {/* iDEAL BUTTON — ONLY FOR EUR */}
        {currency === "EUR" && (
          <div className="px-6 pt-4">
            <button
              onClick={handleIdealPayment}
              disabled={loading}
              className="w-full bg-[#00AA4F] hover:bg-[#008837] text-white font-bold text-xl py-3 rounded-2xl transition-all disabled:opacity-70 shadow-lg flex items-center justify-center gap-3"
            >
              <span>iDEAL</span>
            </button>
            <p className="text-center text-sm text-gray-400 mt-3">
              Pay instantly with your Dutch bank
            </p>
          </div>
        )}

        {currency === "EUR" && (
          <div className="px-6 my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[#1A1C23] text-gray-500 text-sm">or pay with card</span>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 pb-8">
          <div className="bg-[#2A2D36] rounded-2xl p-4 border border-[#3A3D46]">
            <CardElement options={{
              style: {
                base: { color: "#fff", fontSize: "18px", "::placeholder": { color: "#888" } },
                invalid: { color: "#fa755a" },
              },
            }} />
          </div>

          <button
            onClick={handleCardPayment}
            disabled={loading}
            className="w-full mt-6 bg-[#EDB726] hover:bg-[#d4a422] text-black font-bold text-xl py-3 rounded-2xl transition-all disabled:opacity-70 shadow-lg"
          >
            {loading ? "Processing..." : `Pay ${symbol}${amount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;