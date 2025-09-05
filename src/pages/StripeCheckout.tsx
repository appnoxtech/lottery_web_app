import React, { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { X } from "lucide-react";

interface StripeCheckoutProps {
  amount: number;
  onClose: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ amount, onClose }) => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // 👉 Call backend to create PaymentIntent
      const res = await fetch(`${API_BASE}/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100 }), // in paise
      });

      const { clientSecret } = await res.json();

      // 👉 Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed.");
      } else if (result.paymentIntent?.status === "succeeded") {
        alert("✅ Payment Successful!");
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Pay with Stripe</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#1D1F27] p-3 rounded-lg border border-gray-600">
            <CardElement className="text-white" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-[#EDB726] text-[#1D1F27] font-semibold py-3 px-6 rounded-lg hover:bg-[#d4a422] transition-colors"
          >
            {loading ? "Processing..." : `Pay ₹${amount}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StripeCheckout;
