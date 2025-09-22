import React, { useState } from "react";
import { X } from "lucide-react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { dollarConversion, euroConversion } from "../hooks/utilityFn";
import { formatDate } from "../hooks/dateFormatter";
import { showToast } from "../utils/toast.util";

interface WhatsAppModalProps {

  newOrderInfo: any;
  onClose: () => void;
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  newOrderInfo,
  onClose,
}) => {
  const [phone, setPhone] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  if (!phone || !isValidPhoneNumber(phone)) {
    setError("Please enter a valid phone number.");
    return;
  }
  const grandTotal = parseFloat(newOrderInfo?.local_total || "0");
  const message = `
    Esaki ta e numbernan ku bo a pidi:
    ----------------------------------------
    🎟️ Numbernan: ${newOrderInfo?.ticket_numbers}
    💰 Loteria: ${newOrderInfo?.selected_lotteries?.join(", ")}
    📅 Fecha: ${formatDate(new Date().toISOString())}
    💵 Total: XCG ${grandTotal.toFixed(2)} / $ ${dollarConversion(
      Number(grandTotal)
    )} / € ${euroConversion(Number(grandTotal))}
   
    Kòrda paga pa bo ta den wega i kontrolá bo bòn.
    Suerte,
    Wega Di Number`;
  const url = `https://wa.me/${phone.replace(
    "+",
    ""
  )}?text=${encodeURIComponent(message)}`;
  try {
    window.open(url, "_blank");
  } catch (err) {
    showToast("Failed to open WhatsApp", "error");
  }
  onClose();
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            Pay with WhatsApp
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Input with flags + codes */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Phone Number
            </label>
            <PhoneInput
              placeholder="Enter phone number"
              value={phone}
              onChange={setPhone}
              defaultCountry="IN" // default India, can be anything
              className="w-full px-3 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
          >
            Continue to WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppModal;
