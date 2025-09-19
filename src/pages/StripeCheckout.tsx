import React, { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { X } from "lucide-react";
import { createPaymentIntent } from "../utils/services/Payment.services"; // Import new service
import { showToast } from "../utils/toast.util"; // Import for consistent error handling
import { handleApiError } from "../hooks/handleApiError"; // Import for consistent error handling

interface StripeCheckoutProps {
  amount: number;
  lotteryId?: string; // Add lotteryId to associate with a lottery
  onClose: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  amount,
  lotteryId,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: "#ffffff", // Set text color to white
        fontSize: "16px",
        fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
        "::placeholder": {
          color: "#cccccc", // Light gray for placeholder text
        },
      },
      invalid: {
        color: "#fa755a", // Red for invalid state
        iconColor: "#fa755a",
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // Call backend to create PaymentIntent using the service
      const response = await createPaymentIntent({
        amount: amount * 100, // Convert to paise
        lotteryId, // Include lotteryId if provided
      });

      const { clientSecret } = response?.data?.result || {}; // Adjust based on API response structure

      if (!clientSecret) {
        throw new Error("Failed to retrieve client secret from server.");
      }

      // Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        const errorMessage = result.error.message || "Payment failed.";
        setError(errorMessage);
        showToast(errorMessage, "error");
      } else if (result.paymentIntent?.status === "succeeded") {
        showToast("✅ Payment Successful!", "success");
        onClose();
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to process payment.";
      setError(errorMessage);
      handleApiError(err, errorMessage); // Use handleApiError for consistency
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Pay with Stripe</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#1D1F27] p-3 rounded-lg border border-gray-600">
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              className="text-white"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-[#EDB726] text-[#1D1F27] font-semibold py-3 px-6 rounded-lg hover:bg-[#d4a422] transition-colors cursor-pointer"
          >
            {loading ? "Processing..." : `Pay ${amount}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StripeCheckout;
